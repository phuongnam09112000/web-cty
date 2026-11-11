import type { Prisma } from "../../generated/prisma/client.js";
import type { PrismaClient } from "../../db.js";
import { toPage, type Page } from "../../http/pagination.js";

export const AUDIT_ACTIONS = [
  "auth.login",
  "auth.login_failed",
  "auth.logout",
  "auth.password_change",
  "user.create",
  "user.update",
  "user.deactivate",
  "user.activate",
  "user.password_reset",
  "role.create",
  "role.update",
  "role.delete",
  "role.permissions_update",
  "content.draft_save",
  "content.publish",
  "content.restore",
  "media.upload",
  "media.update",
  "media.delete",
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export type AuditEntry = {
  actorUserId: bigint | null;
  action: AuditAction;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  ip: string;
};

const SENSITIVE_KEYS = new Set([
  "password",
  "newPassword",
  "currentPassword",
  "temporaryPassword",
  "token",
]);

function scrub(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(scrub);
  if (value !== null && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype) {
    const out: Record<string, unknown> = {};
    for (const [key, inner] of Object.entries(value)) {
      if (!SENSITIVE_KEYS.has(key)) out[key] = scrub(inner);
    }
    return out;
  }
  return value;
}

export async function recordAudit(
  db: PrismaClient | Prisma.TransactionClient,
  entry: AuditEntry,
): Promise<void> {
  await db.auditLog.create({
    data: {
      actorUserId: entry.actorUserId,
      action: entry.action,
      targetType: entry.targetType ?? null,
      targetId: entry.targetId ?? null,
      metadata: entry.metadata ? (scrub(entry.metadata) as Prisma.InputJsonObject) : undefined,
      ip: entry.ip,
    },
  });
}

export type AuditLogDto = {
  id: number;
  action: AuditAction;
  actor: { id: number; email: string; fullName: string } | null;
  targetType: string | null;
  targetId: string | null;
  metadata: unknown;
  ip: string;
  createdAt: string;
};

export type AuditLogQuery = {
  page: number;
  pageSize: number;
  actorUserId?: number;
  action?: AuditAction;
  from?: Date;
  to?: Date;
};

const DAY_MS = 24 * 60 * 60 * 1000;

export async function listAuditLogs(
  prisma: PrismaClient,
  query: AuditLogQuery,
): Promise<Page<AuditLogDto>> {
  const where: Prisma.AuditLogWhereInput = {};
  if (query.actorUserId !== undefined) where.actorUserId = BigInt(query.actorUserId);
  if (query.action !== undefined) where.action = query.action;
  if (query.from || query.to) {
    where.createdAt = {
      ...(query.from ? { gte: query.from } : {}),
      ...(query.to ? { lt: new Date(query.to.getTime() + DAY_MS) } : {}),
    };
  }
  const [total, rows] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      include: { actor: true },
      orderBy: { id: "desc" },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
  ]);
  const items = rows.map((row) => ({
    id: Number(row.id),
    action: row.action as AuditAction,
    actor: row.actor
      ? { id: Number(row.actor.id), email: row.actor.email, fullName: row.actor.fullName }
      : null,
    targetType: row.targetType,
    targetId: row.targetId,
    metadata: row.metadata,
    ip: row.ip,
    createdAt: row.createdAt.toISOString(),
  }));
  return toPage(items, total, query.page, query.pageSize);
}
