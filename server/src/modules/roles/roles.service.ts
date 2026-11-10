import type { PrismaClient } from "../../db.js";
import { AppError } from "../../http/errors.js";
import { isPrismaError } from "../../http/prisma-errors.js";
import { Prisma, type Role, type RolePermission, type Permission } from "../../generated/prisma/client.js";
import { recordAudit } from "../audit/audit.service.js";
import { PERMISSIONS, type PermissionKey } from "../permissions/catalog.js";
import type { CreateRoleInput, UpdateRoleInput } from "./roles.schemas.js";

export type RoleDto = {
  id: number;
  name: string;
  description: string | null;
  isSystem: boolean;
  userCount: number;
  permissions: PermissionKey[];
};

type RoleRow = Role & {
  permissions: (RolePermission & { permission: Permission })[];
  _count: { users: number };
};

const roleInclude = {
  permissions: { include: { permission: true } },
  _count: { select: { users: true } },
} satisfies Prisma.RoleInclude;

const CATALOG_KEYS = PERMISSIONS.map((permission) => permission.key);

function inCatalogOrder(keys: ReadonlySet<string>): PermissionKey[] {
  return CATALOG_KEYS.filter((key) => keys.has(key));
}

export function toRoleDto(role: RoleRow): RoleDto {
  return {
    id: Number(role.id),
    name: role.name,
    description: role.description,
    isSystem: role.isSystem,
    userCount: role._count.users,
    permissions: role.isSystem
      ? [...CATALOG_KEYS]
      : inCatalogOrder(new Set(role.permissions.map((row) => row.permission.key))),
  };
}

const notFound = () => new AppError(404, "NOT_FOUND", "Không tìm thấy vai trò");
const systemRole = () =>
  new AppError(409, "CONFLICT", "Không thể sửa hoặc xóa vai trò hệ thống");
const duplicateName = () =>
  new AppError(409, "CONFLICT", "Tên vai trò đã được sử dụng", { name: "Tên vai trò đã được sử dụng" });

async function withNameConflict<T>(run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (err) {
    if (isPrismaError(err, "P2002")) throw duplicateName();
    throw err;
  }
}

async function lockRole(tx: Prisma.TransactionClient, id: bigint): Promise<void> {
  await tx.$queryRaw`SELECT id FROM roles WHERE id = ${id} FOR UPDATE`;
}

async function loadRole(tx: Prisma.TransactionClient, id: bigint): Promise<RoleRow> {
  const role = await tx.role.findUnique({ where: { id }, include: roleInclude });
  if (!role) throw notFound();
  return role;
}

export async function listRoles(prisma: PrismaClient): Promise<RoleDto[]> {
  const roles = await prisma.role.findMany({ include: roleInclude, orderBy: { id: "asc" } });
  return roles.map(toRoleDto);
}

export async function getRole(prisma: PrismaClient, id: bigint): Promise<RoleDto> {
  return toRoleDto(await loadRole(prisma, id));
}

export async function createRole(
  prisma: PrismaClient,
  input: CreateRoleInput,
  actorUserId: bigint,
  ip: string,
): Promise<RoleDto> {
  const role = await withNameConflict(() =>
    prisma.$transaction(async (tx) => {
      const created = await tx.role.create({
        data: { name: input.name, description: input.description ?? null },
        include: roleInclude,
      });
      await recordAudit(tx, {
        actorUserId,
        action: "role.create",
        targetType: "role",
        targetId: String(created.id),
        metadata: { name: created.name },
        ip,
      });
      return created;
    }),
  );
  return toRoleDto(role);
}

export async function updateRole(
  prisma: PrismaClient,
  id: bigint,
  input: UpdateRoleInput,
  actorUserId: bigint,
  ip: string,
): Promise<RoleDto> {
  const role = await withNameConflict(() =>
    prisma.$transaction(async (tx) => {
      await lockRole(tx, id);
      const current = await loadRole(tx, id);
      if (current.isSystem) throw systemRole();
      const data: Prisma.RoleUpdateInput = {};
      const changed: string[] = [];
      if (input.name !== undefined && input.name !== current.name) {
        data.name = input.name;
        changed.push("name");
      }
      if (input.description !== undefined && input.description !== current.description) {
        data.description = input.description;
        changed.push("description");
      }
      if (changed.length === 0) return current;
      const updated = await tx.role.update({ where: { id }, data, include: roleInclude });
      await recordAudit(tx, {
        actorUserId,
        action: "role.update",
        targetType: "role",
        targetId: String(id),
        metadata: { changed },
        ip,
      });
      return updated;
    }),
  );
  return toRoleDto(role);
}

export async function setRolePermissions(
  prisma: PrismaClient,
  id: bigint,
  keys: PermissionKey[],
  actorUserId: bigint,
  ip: string,
): Promise<RoleDto> {
  const role = await prisma.$transaction(async (tx) => {
    await lockRole(tx, id);
    const current = await loadRole(tx, id);
    if (current.isSystem) throw systemRole();
    const before = inCatalogOrder(new Set(current.permissions.map((row) => row.permission.key)));
    const next = new Set<string>(keys);
    const rows = await tx.permission.findMany({ where: { key: { in: [...next] } } });
    await tx.rolePermission.deleteMany({ where: { roleId: id } });
    await tx.rolePermission.createMany({
      data: rows.map((row) => ({ roleId: id, permissionId: row.id })),
    });
    await recordAudit(tx, {
      actorUserId,
      action: "role.permissions_update",
      targetType: "role",
      targetId: String(id),
      metadata: {
        added: inCatalogOrder(next).filter((key) => !before.includes(key)),
        removed: before.filter((key) => !next.has(key)),
      },
      ip,
    });
    return loadRole(tx, id);
  });
  return toRoleDto(role);
}

export async function deleteRole(
  prisma: PrismaClient,
  id: bigint,
  actorUserId: bigint,
  ip: string,
): Promise<void> {
  const inUse = () =>
    new AppError(
      409,
      "CONFLICT",
      "Vai trò vẫn còn người dùng, hãy chuyển họ sang vai trò khác trước khi xóa",
    );
  try {
    await prisma.$transaction(async (tx) => {
      await lockRole(tx, id);
      const current = await loadRole(tx, id);
      if (current.isSystem) throw systemRole();
      if (current._count.users > 0) throw inUse();
      await tx.role.delete({ where: { id } });
      await recordAudit(tx, {
        actorUserId,
        action: "role.delete",
        targetType: "role",
        targetId: String(id),
        metadata: { name: current.name },
        ip,
      });
    });
  } catch (err) {
    if (isPrismaError(err, "P2003")) throw inUse();
    throw err;
  }
}
