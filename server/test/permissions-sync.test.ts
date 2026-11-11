import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createPrisma, type PrismaClient } from "../src/db.js";
import {
  EDITOR_ROLE_NAME,
  PERMISSIONS,
  SYSTEM_ROLE_NAME,
} from "../src/modules/permissions/catalog.js";
import { syncPermissions } from "../src/modules/permissions/sync.js";
import { resetDb } from "./helpers.js";

let prisma: PrismaClient;

beforeAll(() => {
  prisma = createPrisma(process.env.DATABASE_URL as string);
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  await prisma.rolePermission.deleteMany();
  await prisma.permission.deleteMany();
});

describe("seed roles", () => {
  it("has exactly two roles and only the administrator is a system role", async () => {
    await resetDb(prisma);
    const roles = await prisma.role.findMany({ orderBy: { id: "asc" } });
    expect(roles.map((role) => role.name)).toEqual([SYSTEM_ROLE_NAME, EDITOR_ROLE_NAME]);
    expect(roles.map((role) => role.isSystem)).toEqual([true, false]);
  });
});

describe("syncPermissions", () => {
  it("creates the catalog permissions on an empty table", async () => {
    await syncPermissions(prisma);
    const rows = await prisma.permission.findMany({ orderBy: { key: "asc" } });
    expect(rows.map(({ key, module, label }) => ({ key, module, label }))).toEqual(
      PERMISSIONS.map(({ key, module, label }) => ({ key, module, label })).sort((a, b) =>
        a.key.localeCompare(b.key),
      ),
    );
    expect(rows).toHaveLength(8);
  });

  it("restores a changed label", async () => {
    await syncPermissions(prisma);
    await prisma.permission.update({ where: { key: "audit.view" }, data: { label: "sai" } });
    await syncPermissions(prisma);
    const row = await prisma.permission.findUniqueOrThrow({ where: { key: "audit.view" } });
    expect(row.label).toBe("Xem nhật ký hoạt động");
  });

  it("removes permissions missing from the catalog together with their role links", async () => {
    await syncPermissions(prisma);
    const editor = await prisma.role.findUniqueOrThrow({ where: { name: EDITOR_ROLE_NAME } });
    const legacy = await prisma.permission.create({
      data: { key: "legacy.old", module: "Cũ", label: "Cũ" },
    });
    await prisma.rolePermission.create({
      data: { roleId: editor.id, permissionId: legacy.id },
    });
    await syncPermissions(prisma);
    expect(await prisma.permission.findUnique({ where: { key: "legacy.old" } })).toBeNull();
    expect(await prisma.rolePermission.count({ where: { permissionId: legacy.id } })).toBe(0);
    expect(await prisma.permission.count()).toBe(8);
  });

  it("is idempotent", async () => {
    await syncPermissions(prisma);
    await syncPermissions(prisma);
    expect(await prisma.permission.count()).toBe(8);
  });
});

describe("default role grants", () => {
  const CONTENT_KEYS = ["content.edit", "content.publish", "content.view", "media.manage"];

  async function editorKeys() {
    const rows = await prisma.rolePermission.findMany({
      where: { role: { name: EDITOR_ROLE_NAME } },
      include: { permission: true },
    });
    return rows.map((row) => row.permission.key).sort();
  }

  it("grants the four content permissions to the editor role on a fresh database", async () => {
    await syncPermissions(prisma);
    expect(await editorKeys()).toEqual(CONTENT_KEYS);
  });

  it("does not grant again a permission that already exists", async () => {
    await syncPermissions(prisma);
    const permission = await prisma.permission.findUniqueOrThrow({ where: { key: "content.edit" } });
    await prisma.rolePermission.deleteMany({ where: { permissionId: permission.id } });
    await syncPermissions(prisma);
    expect(await editorKeys()).toEqual(["content.publish", "content.view", "media.manage"]);
  });
});

describe("resetDb", () => {
  it("keeps the seed roles and restores permissions", async () => {
    await prisma.role.create({ data: { name: "Tạm" } });
    await resetDb(prisma);
    expect(await prisma.role.count()).toBe(2);
    expect(await prisma.permission.count()).toBe(8);
  });
});
