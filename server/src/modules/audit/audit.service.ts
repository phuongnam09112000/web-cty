import type { Prisma } from "../../generated/prisma/client.js";
import type { PrismaClient } from "../../db.js";

export type AuditAction =
  | "auth.login"
  | "auth.login_failed"
  | "auth.logout"
  | "auth.password_change"
  | "user.create"
  | "user.update"
  | "user.deactivate"
  | "user.activate"
  | "user.password_reset"
  | "role.create"
  | "role.update"
  | "role.delete"
  | "role.permissions_update";

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
