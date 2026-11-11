import { randomBytes } from "node:crypto";
import type { PrismaClient } from "../../db.js";
import { AppError } from "../../http/errors.js";
import { hashToken } from "../auth/session.service.js";

export const PREVIEW_TTL_MS = 30 * 60_000;

export async function createPreviewUrl(
  db: PrismaClient,
  origin: string,
  pageId: bigint,
  userId: bigint,
  now: Date,
): Promise<string> {
  const page = await db.page.findUnique({ where: { id: pageId }, select: { path: true } });
  if (!page) throw new AppError(404, "NOT_FOUND", "Không tìm thấy");
  const token = randomBytes(32).toString("base64url");
  await db.previewToken.create({
    data: {
      tokenHash: hashToken(token),
      pageId,
      expiresAt: new Date(now.getTime() + PREVIEW_TTL_MS),
      createdByUserId: userId,
      createdAt: now,
    },
  });
  return `${origin}${page.path}?preview=${token}`;
}

export async function findPreviewDraft(
  db: PrismaClient,
  token: string,
  now: Date,
): Promise<{ path: string; content: unknown } | null> {
  const row = await db.previewToken.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { page: { include: { draft: true } } },
  });
  if (!row || row.expiresAt.getTime() <= now.getTime() || !row.page.draft) return null;
  return { path: row.page.path, content: row.page.draft.content };
}

export async function deleteExpiredPreviewTokens(db: PrismaClient, now: Date): Promise<number> {
  const result = await db.previewToken.deleteMany({ where: { expiresAt: { lte: now } } });
  return result.count;
}
