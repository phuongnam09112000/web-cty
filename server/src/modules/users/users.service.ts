import { randomInt } from "node:crypto";
import type { PrismaClient } from "../../db.js";
import { AppError } from "../../http/errors.js";
import { toPage, type Page } from "../../http/pagination.js";
import { Prisma, type Role, type User } from "../../generated/prisma/client.js";
import { recordAudit, type AuditAction } from "../audit/audit.service.js";
import { hashPassword } from "../auth/password.js";
import { revokeUserSessions } from "../auth/session.service.js";
import type { CreateUserInput, UpdateUserInput } from "./users.schemas.js";

const PASSWORD_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
const PASSWORD_LENGTH = 14;

export type UserDto = {
  id: number;
  email: string;
  fullName: string;
  isActive: boolean;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  role: { id: number; name: string; isSystem: boolean };
};

type UserWithRole = User & { role: Role };

export function toUserDto(user: UserWithRole): UserDto {
  return {
    id: Number(user.id),
    email: user.email,
    fullName: user.fullName,
    isActive: user.isActive,
    mustChangePassword: user.mustChangePassword,
    lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
    createdAt: user.createdAt.toISOString(),
    role: { id: Number(user.role.id), name: user.role.name, isSystem: user.role.isSystem },
  };
}

export function generateTemporaryPassword(): string {
  let out = "";
  for (let i = 0; i < PASSWORD_LENGTH; i++) {
    out += PASSWORD_ALPHABET[randomInt(PASSWORD_ALPHABET.length)];
  }
  return out;
}

const notFound = () => new AppError(404, "NOT_FOUND", "Không tìm thấy người dùng");
const unknownRole = () =>
  new AppError(400, "VALIDATION_ERROR", "Dữ liệu không hợp lệ", { roleId: "Vai trò không tồn tại" });
const duplicateEmail = () =>
  new AppError(409, "CONFLICT", "Email đã được sử dụng", { email: "Email đã được sử dụng" });

function isEmailConflict(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
}

async function withEmailConflict<T>(run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (err) {
    if (isEmailConflict(err)) throw duplicateEmail();
    throw err;
  }
}

export async function listUsers(
  prisma: PrismaClient,
  query: { page: number; pageSize: number; q?: string; roleId?: number; isActive?: "true" | "false" },
): Promise<Page<UserDto>> {
  const where: Prisma.UserWhereInput = {};
  if (query.q) {
    where.OR = [{ fullName: { contains: query.q } }, { email: { contains: query.q } }];
  }
  if (query.roleId !== undefined) where.roleId = BigInt(query.roleId);
  if (query.isActive !== undefined) where.isActive = query.isActive === "true";
  const [total, rows] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      include: { role: true },
      orderBy: { id: "asc" },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
  ]);
  return toPage(rows.map(toUserDto), total, query.page, query.pageSize);
}

export async function getUser(prisma: PrismaClient, id: bigint): Promise<UserDto> {
  const user = await prisma.user.findUnique({ where: { id }, include: { role: true } });
  if (!user) throw notFound();
  return toUserDto(user);
}

export async function createUser(
  prisma: PrismaClient,
  input: CreateUserInput,
  actorUserId: bigint,
  ip: string,
): Promise<{ user: UserDto; temporaryPassword: string }> {
  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = await hashPassword(temporaryPassword);
  const user = await withEmailConflict(() =>
    prisma.$transaction(async (tx) => {
      const role = await tx.role.findUnique({ where: { id: BigInt(input.roleId) } });
      if (!role) throw unknownRole();
      const created = await tx.user.create({
        data: {
          email: input.email,
          fullName: input.fullName,
          passwordHash,
          roleId: role.id,
          mustChangePassword: true,
        },
        include: { role: true },
      });
      await recordAudit(tx, {
        actorUserId,
        action: "user.create",
        targetType: "user",
        targetId: String(created.id),
        metadata: { email: created.email, roleId: Number(role.id) },
        ip,
      });
      return created;
    }),
  );
  return { user: toUserDto(user), temporaryPassword };
}

async function lockActiveAdmins(tx: Prisma.TransactionClient): Promise<bigint[]> {
  const rows = await tx.$queryRaw<{ id: bigint }[]>`
    SELECT id FROM users
    WHERE role_id IN (SELECT id FROM roles WHERE is_system = 1) AND is_active = 1
    ORDER BY id
    FOR UPDATE`;
  return rows.map((row) => BigInt(row.id));
}

export async function updateUser(
  prisma: PrismaClient,
  id: bigint,
  input: UpdateUserInput,
  actorUserId: bigint,
  ip: string,
): Promise<UserDto> {
  const sensitive = input.roleId !== undefined || input.isActive === false;
  const updated = await withEmailConflict(() =>
    prisma.$transaction(async (tx) => {
      const activeAdmins = sensitive ? await lockActiveAdmins(tx) : [];
      const current = await tx.user.findUnique({ where: { id }, include: { role: true } });
      if (!current) throw notFound();

      let roleChanged = false;
      if (input.roleId !== undefined) {
        const role = await tx.role.findUnique({ where: { id: BigInt(input.roleId) } });
        if (!role) throw unknownRole();
        roleChanged = role.id !== current.roleId;
      }
      const deactivating = input.isActive === false && current.isActive;
      const activating = input.isActive === true && !current.isActive;

      if (id === actorUserId && (deactivating || roleChanged)) {
        throw new AppError(
          409,
          "CONFLICT",
          "Bạn không thể tự vô hiệu hóa hoặc tự đổi vai trò của mình",
        );
      }
      if (
        (deactivating || roleChanged) &&
        activeAdmins.includes(id) &&
        activeAdmins.every((adminId) => adminId === id)
      ) {
        throw new AppError(
          409,
          "CONFLICT",
          "Không thể vô hiệu hóa hoặc đổi vai trò của quản trị viên đang hoạt động cuối cùng",
        );
      }

      const data: Prisma.UserUncheckedUpdateInput = {};
      const changed: string[] = [];
      if (input.email !== undefined && input.email !== current.email) {
        data.email = input.email;
        changed.push("email");
      }
      if (input.fullName !== undefined && input.fullName !== current.fullName) {
        data.fullName = input.fullName;
        changed.push("fullName");
      }
      if (roleChanged && input.roleId !== undefined) {
        data.roleId = BigInt(input.roleId);
        changed.push("roleId");
      }
      if (input.isActive !== undefined) {
        data.isActive = input.isActive;
        if (input.isActive) {
          data.failedLoginCount = 0;
          data.lockedUntil = null;
        }
      }

      const next =
        Object.keys(data).length > 0
          ? await tx.user.update({ where: { id }, data, include: { role: true } })
          : current;

      if (deactivating || roleChanged) await revokeUserSessions(tx, id);

      const audits: { action: AuditAction; metadata: Record<string, unknown> }[] = [];
      if (changed.length > 0) audits.push({ action: "user.update", metadata: { changed } });
      if (deactivating) audits.push({ action: "user.deactivate", metadata: {} });
      if (activating) audits.push({ action: "user.activate", metadata: {} });
      for (const audit of audits) {
        await recordAudit(tx, {
          actorUserId,
          action: audit.action,
          targetType: "user",
          targetId: String(id),
          metadata: audit.metadata,
          ip,
        });
      }
      return next;
    }),
  );
  return toUserDto(updated);
}

export async function resetPassword(
  prisma: PrismaClient,
  id: bigint,
  actorUserId: bigint,
  ip: string,
): Promise<string> {
  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = await hashPassword(temporaryPassword);
  await prisma.$transaction(async (tx) => {
    const current = await tx.user.findUnique({ where: { id } });
    if (!current) throw notFound();
    await tx.user.update({
      where: { id },
      data: { passwordHash, mustChangePassword: true, failedLoginCount: 0, lockedUntil: null },
    });
    await revokeUserSessions(tx, id);
    await recordAudit(tx, {
      actorUserId,
      action: "user.password_reset",
      targetType: "user",
      targetId: String(id),
      ip,
    });
  });
  return temporaryPassword;
}
