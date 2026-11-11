import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { EDITOR_ROLE_NAME, SYSTEM_ROLE_NAME } from "../src/modules/permissions/catalog.js";
import { createUser, loginAs, makeTestApp, resetDb } from "./helpers.js";

const { app, prisma } = makeTestApp();

afterAll(async () => {
  await resetDb(prisma);
  await prisma.$disconnect();
});

beforeEach(async () => {
  await resetDb(prisma);
});

async function roleWith(name: string, keys: string[]) {
  const role = await prisma.role.create({ data: { name } });
  for (const key of keys) {
    const permission = await prisma.permission.findUniqueOrThrow({ where: { key } });
    await prisma.rolePermission.create({ data: { roleId: role.id, permissionId: permission.id } });
  }
  return role;
}

async function adminAgent() {
  await createUser(prisma, { email: "admin@istt.vn" });
  return loginAs(app, "admin@istt.vn");
}

async function systemRoleId() {
  return Number((await prisma.role.findUniqueOrThrow({ where: { name: SYSTEM_ROLE_NAME } })).id);
}

describe("GET /roles", () => {
  it("allows roles.manage or users.view and rejects others", async () => {
    await roleWith("Quản lý vai trò", ["roles.manage"]);
    await roleWith("Xem người dùng", ["users.view"]);
    await roleWith("Chỉ nhật ký", ["audit.view"]);
    for (const [email, roleName, status] of [
      ["a@istt.vn", "Quản lý vai trò", 200],
      ["b@istt.vn", "Xem người dùng", 200],
      ["c@istt.vn", "Chỉ nhật ký", 403],
    ] as const) {
      await createUser(prisma, { email, roleName });
      const agent = await loginAs(app, email);
      expect((await agent.get("/api/admin/roles")).status).toBe(status);
    }
  });

  it("allows users.view only on the list", async () => {
    const role = await roleWith("Xem người dùng", ["users.view"]);
    await createUser(prisma, { email: "b@istt.vn", roleName: "Xem người dùng" });
    const agent = await loginAs(app, "b@istt.vn");
    expect((await agent.get(`/api/admin/roles/${role.id}`)).status).toBe(403);
    expect((await agent.post("/api/admin/roles").send({ name: "X" })).status).toBe(403);
    expect((await agent.get("/api/admin/permissions")).status).toBe(403);
  });

  it("lists roles with user counts and permissions", async () => {
    const agent = await adminAgent();
    const res = await agent.get("/api/admin/roles");
    expect(res.status).toBe(200);
    const admin = res.body.find((r: { name: string }) => r.name === SYSTEM_ROLE_NAME);
    const editor = res.body.find((r: { name: string }) => r.name === EDITOR_ROLE_NAME);
    expect(admin).toMatchObject({ isSystem: true, userCount: 1 });
    expect(typeof admin.id).toBe("number");
    expect(admin.permissions).toEqual([
      "users.view",
      "users.manage",
      "roles.manage",
      "audit.view",
      "content.view",
      "content.edit",
      "content.publish",
      "media.manage",
    ]);
    expect(editor).toMatchObject({ isSystem: false, userCount: 0 });
    expect([...editor.permissions].sort()).toEqual([
      "content.edit",
      "content.publish",
      "content.view",
      "media.manage",
    ]);
  });
});

describe("POST /roles", () => {
  it("creates a role keeping the name verbatim and audits it", async () => {
    const agent = await adminAgent();
    const res = await agent
      .post("/api/admin/roles")
      .send({ name: "Biên tập viên nội dung", description: "Mô tả" });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      name: "Biên tập viên nội dung",
      description: "Mô tả",
      isSystem: false,
      userCount: 0,
      permissions: [],
    });
    const audit = await prisma.auditLog.findFirstOrThrow({ where: { action: "role.create" } });
    expect(audit.targetType).toBe("role");
    expect(audit.targetId).toBe(String(res.body.id));
  });

  it("rejects a duplicate name with 409 and fields.name", async () => {
    const agent = await adminAgent();
    const res = await agent.post("/api/admin/roles").send({ name: EDITOR_ROLE_NAME });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("CONFLICT");
    expect(res.body.error.fields.name).toBeTruthy();
  });

  it("rejects an empty name with 400", async () => {
    const agent = await adminAgent();
    const res = await agent.post("/api/admin/roles").send({ name: "  " });
    expect(res.status).toBe(400);
    expect(res.body.error.fields.name).toBeTruthy();
  });
});

describe("GET /roles/:id", () => {
  it("returns a role, 404 for unknown and malformed ids", async () => {
    const agent = await adminAgent();
    const id = await systemRoleId();
    const ok = await agent.get(`/api/admin/roles/${id}`);
    expect(ok.status).toBe(200);
    expect(ok.body.id).toBe(id);
    expect((await agent.get("/api/admin/roles/abc")).status).toBe(404);
    expect((await agent.get("/api/admin/roles/999999")).status).toBe(404);
  });
});

describe("PATCH /roles/:id", () => {
  it("updates name and description and audits changed fields", async () => {
    const agent = await adminAgent();
    const role = await roleWith("Cũ", []);
    const res = await agent
      .patch(`/api/admin/roles/${role.id}`)
      .send({ name: "Mới", description: "Mô tả mới" });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ name: "Mới", description: "Mô tả mới" });
    const audit = await prisma.auditLog.findFirstOrThrow({ where: { action: "role.update" } });
    expect(audit.metadata).toEqual({ changed: ["name", "description"] });
  });

  it("returns 409 on a duplicate name and 400 on an empty body", async () => {
    const agent = await adminAgent();
    const role = await roleWith("Cũ", []);
    const dup = await agent.patch(`/api/admin/roles/${role.id}`).send({ name: EDITOR_ROLE_NAME });
    expect(dup.status).toBe(409);
    expect(dup.body.error.fields.name).toBeTruthy();
    expect((await agent.patch(`/api/admin/roles/${role.id}`).send({})).status).toBe(400);
  });
});

describe("PUT /roles/:id/permissions", () => {
  it("replaces permissions and audits added and removed", async () => {
    const agent = await adminAgent();
    const role = await roleWith("Tùy chỉnh", ["roles.manage"]);
    const res = await agent
      .put(`/api/admin/roles/${role.id}/permissions`)
      .send({ permissions: ["users.view", "audit.view"] });
    expect(res.status).toBe(200);
    expect(res.body.permissions).toEqual(["users.view", "audit.view"]);
    const audit = await prisma.auditLog.findFirstOrThrow({
      where: { action: "role.permissions_update" },
    });
    expect(audit.metadata).toEqual({
      added: ["users.view", "audit.view"],
      removed: ["roles.manage"],
    });
    const stored = await agent.get(`/api/admin/roles/${role.id}`);
    expect(stored.body.permissions).toEqual(["users.view", "audit.view"]);
  });

  it("takes effect immediately for logged-in users", async () => {
    const admin = await adminAgent();
    const role = await roleWith("Tùy chỉnh", []);
    await createUser(prisma, { email: "u@istt.vn", roleName: "Tùy chỉnh" });
    const agent = await loginAs(app, "u@istt.vn");
    expect((await agent.get("/api/admin/users")).status).toBe(403);
    await admin
      .put(`/api/admin/roles/${role.id}/permissions`)
      .send({ permissions: ["users.view"] });
    expect((await agent.get("/api/admin/users")).status).toBe(200);
    await admin.put(`/api/admin/roles/${role.id}/permissions`).send({ permissions: [] });
    expect((await agent.get("/api/admin/users")).status).toBe(403);
  });

  it("rejects keys outside the catalog and malformed bodies with fields.permissions", async () => {
    const agent = await adminAgent();
    const role = await roleWith("Tùy chỉnh", []);
    for (const body of [{ permissions: ["nope.key"] }, { permissions: "users.view" }, {}]) {
      const res = await agent.put(`/api/admin/roles/${role.id}/permissions`).send(body);
      expect(res.status).toBe(400);
      expect(res.body.error.fields.permissions).toBeTruthy();
    }
  });

  it("deduplicates repeated keys", async () => {
    const agent = await adminAgent();
    const role = await roleWith("Tùy chỉnh", []);
    const res = await agent
      .put(`/api/admin/roles/${role.id}/permissions`)
      .send({ permissions: ["users.view", "users.view"] });
    expect(res.status).toBe(200);
    expect(res.body.permissions).toEqual(["users.view"]);
  });

  it("returns 404 for an unknown role", async () => {
    const agent = await adminAgent();
    const res = await agent.put("/api/admin/roles/999999/permissions").send({ permissions: [] });
    expect(res.status).toBe(404);
  });
});

describe("system role", () => {
  it("rejects PATCH, PUT permissions and DELETE with 409 and returns all permissions", async () => {
    const agent = await adminAgent();
    const id = await systemRoleId();
    const patch = await agent.patch(`/api/admin/roles/${id}`).send({ name: "Khác" });
    const put = await agent
      .put(`/api/admin/roles/${id}/permissions`)
      .send({ permissions: ["users.view"] });
    const del = await agent.delete(`/api/admin/roles/${id}`);
    for (const res of [patch, put, del]) {
      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe("CONFLICT");
    }
    const got = await agent.get(`/api/admin/roles/${id}`);
    expect(got.body.permissions).toHaveLength(8);
    expect(got.body.name).toBe(SYSTEM_ROLE_NAME);
  });
});

describe("DELETE /roles/:id", () => {
  it("rejects deleting a role that still has users", async () => {
    const agent = await adminAgent();
    const role = await roleWith("Có người", []);
    await createUser(prisma, { email: "u@istt.vn", roleName: "Có người" });
    const res = await agent.delete(`/api/admin/roles/${role.id}`);
    expect(res.status).toBe(409);
    expect(await prisma.role.count({ where: { id: role.id } })).toBe(1);
  });

  it("deletes an empty role with 204 and audits it", async () => {
    const agent = await adminAgent();
    const role = await roleWith("Trống", ["users.view"]);
    const res = await agent.delete(`/api/admin/roles/${role.id}`);
    expect(res.status).toBe(204);
    expect(await prisma.role.count({ where: { id: role.id } })).toBe(0);
    const audit = await prisma.auditLog.findFirstOrThrow({ where: { action: "role.delete" } });
    expect(audit.targetId).toBe(String(role.id));
    expect((await agent.delete(`/api/admin/roles/${role.id}`)).status).toBe(404);
  });
});

describe("GET /permissions", () => {
  it("groups permissions by module in catalog order", async () => {
    const agent = await adminAgent();
    const res = await agent.get("/api/admin/permissions");
    expect(res.status).toBe(200);
    expect(res.body.modules.map((m: { module: string }) => m.module)).toEqual([
      "Người dùng",
      "Vai trò",
      "Nhật ký",
      "Nội dung",
      "Thư viện ảnh",
    ]);
    expect(res.body.modules[0].permissions.map((p: { key: string }) => p.key)).toEqual([
      "users.view",
      "users.manage",
    ]);
    expect(res.body.modules[2].permissions).toEqual([
      { key: "audit.view", label: "Xem nhật ký hoạt động" },
    ]);
  });
});
