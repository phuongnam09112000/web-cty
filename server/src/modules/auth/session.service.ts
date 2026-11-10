import { createHash, randomBytes } from "node:crypto";
import type { PrismaClient } from "../../db.js";
import type { Prisma, Role, User } from "../../generated/prisma/client.js";

export const SESSION_IDLE_MS = 8 * 3600_000;
export const SESSION_ABSOLUTE_MS = 7 * 24 * 3600_000;
export const SESSION_REFRESH_MS = 60_000;

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function expiryFor(createdAt: Date, now: Date): Date {
  return new Date(
    Math.min(now.getTime() + SESSION_IDLE_MS, createdAt.getTime() + SESSION_ABSOLUTE_MS),
  );
}

export async function createSession(
  prisma: PrismaClient,
  userId: bigint,
  meta: { ip: string; userAgent: string },
  now: Date,
): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  await prisma.session.create({
    data: {
      id: hashToken(token),
      userId,
      createdAt: now,
      lastSeenAt: now,
      expiresAt: expiryFor(now, now),
      ip: meta.ip.slice(0, 45),
      userAgent: meta.userAgent.slice(0, 255),
    },
  });
  return token;
}

export async function resolveSession(
  prisma: PrismaClient,
  token: string,
  now: Date,
): Promise<{ sessionId: string; user: User & { role: Role } } | null> {
  const sessionId = hashToken(token);
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: { include: { role: true } } },
  });
  if (!session) return null;
  if (session.expiresAt.getTime() < now.getTime()) {
    await prisma.session.deleteMany({ where: { id: sessionId } });
    return null;
  }
  if (now.getTime() - session.lastSeenAt.getTime() >= SESSION_REFRESH_MS) {
    await prisma.session.updateMany({
      where: { id: sessionId },
      data: { lastSeenAt: now, expiresAt: expiryFor(session.createdAt, now) },
    });
  }
  return { sessionId, user: session.user };
}

export async function revokeUserSessions(
  db: PrismaClient | Prisma.TransactionClient,
  userId: bigint,
): Promise<void> {
  await db.session.deleteMany({ where: { userId } });
}

export async function deleteExpiredSessions(prisma: PrismaClient, now: Date): Promise<number> {
  const result = await prisma.session.deleteMany({ where: { expiresAt: { lt: now } } });
  return result.count;
}
