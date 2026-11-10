import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { EDITOR_ROLE_NAME, SYSTEM_ROLE_NAME } from "../src/modules/permissions/catalog.js";
import {
  DEFAULT_TEST_PASSWORD,
  adminRequest,
  createUser,
  loginAs,
  makeTestApp,
  resetDb,
} from "./helpers.js";

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

async function adminAgent(email = "admin@istt.vn") {
  const user = await createUser(prisma, { email });
  return { user, agent: await loginAs(app, email) };
}

async function roleId(name: string) {
  return Number((await prisma.role.findUniqueOrThrow({ where: { name } })).id);
}

describe("permissions", () => {
  it("rejects every endpoint without permission", async () => {
    await roleWith("Trống", []);
    await createUser(prisma, { email: "none@istt.vn", roleName: "Trống" });
    const target = await createUser(prisma, { email: "t@istt.vn", roleName: EDITOR_ROLE_NAME });
    const agent = await loginAs(app, "none@istt.vn");
    const calls = [
      agent.get("/api/admin/users"),
      agent.get(`/api/admin/users/${target.id}`),
      agent.post("/api/admin/users").send({ email: "x@istt.vn", fullName: "X", roleId: 1 }),
      agent.patch(`/api/admin/users/${target.id}`).send({ fullName: "Y" }),
      agent.post(`/api/admin/users/${target.id}/reset-password`),
    ];
    for (const res of await Promise.all(calls)) {
      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe("FORBIDDEN");
    }
  });

  it("lets users.view read but not write", async () => {
    await roleWith("Xem", ["users.view"]);
    await createUser(prisma, { email: "view@istt.vn", roleName: "Xem" });
    const target = await createUser(prisma, { email: "t@istt.vn", roleName: EDITOR_ROLE_NAME });
    const agent = await loginAs(app, "view@istt.vn");
    expect((await agent.get("/api/admin/users")).status).toBe(200);
    expect((await agent.get(`/api/admin/users/${target.id}`)).status).toBe(200);
    expect(
      (await agent.post("/api/admin/users").send({ email: "x@istt.vn", fullName: "X", roleId: 1 }))
        .status,
    ).toBe(403);
    expect((await agent.patch(`/api/admin/users/${target.id}`).send({ fullName: "Y" })).status).toBe(
      403,
    );
    expect((await agent.post(`/api/admin/users/${target.id}/reset-password`)).status).toBe(403);
  });

  it("lets users.manage do everything", async () => {
    await roleWith("Quản lý", ["users.manage"]);
    await createUser(prisma, { email: "mgr@istt.vn", roleName: "Quản lý" });
    const target = await createUser(prisma, { email: "t@istt.vn", roleName: EDITOR_ROLE_NAME });
    const agent = await loginAs(app, "mgr@istt.vn");
    expect((await agent.get("/api/admin/users")).status).toBe(200);
    expect((await agent.get(`/api/admin/users/${target.id}`)).status).toBe(200);
    const created = await agent
      .post("/api/admin/users")
      .send({ email: "x@istt.vn", fullName: "X", roleId: await roleId(EDITOR_ROLE_NAME) });
    expect(created.status).toBe(201);
    expect((await agent.patch(`/api/admin/users/${target.id}`).send({ fullName: "Y" })).status).toBe(
      200,
    );
    expect((await agent.post(`/api/admin/users/${target.id}/reset-password`)).status).toBe(200);
  });
});

describe("GET /users", () => {
  it("paginates, filters and searches", async () => {
    const { agent } = await adminAgent();
    await createUser(prisma, {
      email: "anh@istt.vn",
      fullName: "Nguyễn Thị Ánh",
      roleName: EDITOR_ROLE_NAME,
    });
    await createUser(prisma, {
      email: "off@istt.vn",
      fullName: "Người nghỉ",
      roleName: EDITOR_ROLE_NAME,
      isActive: false,
    });

    const page = await agent.get("/api/admin/users?pageSize=2");
    expect(page.status).toBe(200);
    expect(page.body.total).toBe(3);
    expect(page.body.items).toHaveLength(2);
    expect(page.body.page).toBe(1);
    expect(page.body.pageSize).toBe(2);
    expect(typeof page.body.items[0].id).toBe("number");
    expect(typeof page.body.items[0].role.id).toBe("number");
    expect(page.body.items[0]).not.toHaveProperty("passwordHash");

    expect((await agent.get("/api/admin/users?pageSize=101")).status).toBe(400);
    expect((await agent.get("/api/admin/users?page=0")).status).toBe(400);

    const byRole = await agent.get(`/api/admin/users?roleId=${await roleId(EDITOR_ROLE_NAME)}`);
    expect(byRole.body.total).toBe(2);
    const inactive = await agent.get("/api/admin/users?isActive=false");
    expect(inactive.body.items.map((u: { email: string }) => u.email)).toEqual(["off@istt.vn"]);
    const active = await agent.get("/api/admin/users?isActive=true");
    expect(active.body.total).toBe(2);

    const byName = await agent.get(`/api/admin/users?q=${encodeURIComponent("ánh")}`);
    expect(byName.body.items.map((u: { fullName: string }) => u.fullName)).toEqual([
      "Nguyễn Thị Ánh",
    ]);
    const byEmail = await agent.get("/api/admin/users?q=ISTT");
    expect(byEmail.body.total).toBe(3);
  });

  it("returns a user by id and 404s for bad ids", async () => {
    const { agent, user } = await adminAgent();
    const ok = await agent.get(`/api/admin/users/${user.id}`);
    expect(ok.status).toBe(200);
    expect(ok.body).toMatchObject({
      id: Number(user.id),
      email: "admin@istt.vn",
      isActive: true,
      mustChangePassword: false,
      lastLoginAt: expect.any(String),
      createdAt: expect.any(String),
      role: { name: SYSTEM_ROLE_NAME, isSystem: true },
    });
    for (const id of ["abc", "99999999999999999999", "999999"]) {
      const res = await agent.get(`/api/admin/users/${id}`);
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe("NOT_FOUND");
    }
  });
});

describe("POST /users", () => {
  it("creates a user with a usable temporary password", async () => {
    const { agent, user: admin } = await adminAgent();
    const res = await agent.post("/api/admin/users").send({
      email: " Moi@ISTT.vn ",
      fullName: " Người Mới ",
      roleId: await roleId(EDITOR_ROLE_NAME),
    });
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe("moi@istt.vn");
    expect(res.body.user.fullName).toBe("Người Mới");
    expect(res.body.user.mustChangePassword).toBe(true);
    expect(res.body.user.isActive).toBe(true);
    const temp: string = res.body.temporaryPassword;
    expect(temp).toHaveLength(14);
    expect(temp).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789]{14}$/);

    const login = await adminRequest(app)
      .post("/api/admin/auth/login")
      .send({ email: "moi@istt.vn", password: temp });
    expect(login.status).toBe(200);

    const audit = await prisma.auditLog.findFirstOrThrow({ where: { action: "user.create" } });
    expect(audit.actorUserId).toBe(admin.id);
    expect(audit.targetId).toBe(String(res.body.user.id));
    expect(JSON.stringify(audit.metadata ?? {})).not.toContain(temp);
  });

  it("rejects duplicate emails case-insensitively", async () => {
    const { agent } = await adminAgent();
    const body = { email: "dup@istt.vn", fullName: "A", roleId: await roleId(EDITOR_ROLE_NAME) };
    expect((await agent.post("/api/admin/users").send(body)).status).toBe(201);
    const res = await agent.post("/api/admin/users").send({ ...body, email: "DUP@istt.vn" });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("CONFLICT");
    expect(res.body.error.fields.email).toBeTruthy();
  });

  it("rejects an unknown role and invalid input", async () => {
    const { agent } = await adminAgent();
    const res = await agent
      .post("/api/admin/users")
      .send({ email: "a@istt.vn", fullName: "A", roleId: 987654 });
    expect(res.status).toBe(400);
    expect(res.body.error.fields.roleId).toBeTruthy();
    const bad = await agent.post("/api/admin/users").send({ email: "nope", fullName: "", roleId: "x" });
    expect(bad.status).toBe(400);
    expect(bad.body.error.code).toBe("VALIDATION_ERROR");
  });
});

describe("PATCH /users/:id", () => {
  it("updates profile fields and audits user.update", async () => {
    const { agent } = await adminAgent();
    const target = await createUser(prisma, { email: "t@istt.vn", roleName: EDITOR_ROLE_NAME });
    const res = await agent
      .patch(`/api/admin/users/${target.id}`)
      .send({ fullName: "Tên Mới", email: " T2@ISTT.vn " });
    expect(res.status).toBe(200);
    expect(res.body.fullName).toBe("Tên Mới");
    expect(res.body.email).toBe("t2@istt.vn");
    expect(await prisma.auditLog.count({ where: { action: "user.update" } })).toBe(1);
  });

  it("maps duplicate email to 409", async () => {
    const { agent } = await adminAgent();
    const target = await createUser(prisma, { email: "t@istt.vn", roleName: EDITOR_ROLE_NAME });
    const res = await agent.patch(`/api/admin/users/${target.id}`).send({ email: "ADMIN@istt.vn" });
    expect(res.status).toBe(409);
    expect(res.body.error.fields.email).toBeTruthy();
  });

  it("rejects unknown role and unknown user", async () => {
    const { agent } = await adminAgent();
    const target = await createUser(prisma, { email: "t@istt.vn", roleName: EDITOR_ROLE_NAME });
    const res = await agent.patch(`/api/admin/users/${target.id}`).send({ roleId: 987654 });
    expect(res.status).toBe(400);
    expect(res.body.error.fields.roleId).toBeTruthy();
    expect((await agent.patch("/api/admin/users/999999").send({ fullName: "X" })).status).toBe(404);
  });

  it("revokes sessions on role change", async () => {
    const { agent } = await adminAgent();
    const target = await createUser(prisma, { email: "t@istt.vn", roleName: EDITOR_ROLE_NAME });
    const targetAgent = await loginAs(app, "t@istt.vn");
    expect((await targetAgent.get("/api/admin/auth/me")).status).toBe(200);
    await roleWith("Khác", []);
    const res = await agent
      .patch(`/api/admin/users/${target.id}`)
      .send({ roleId: await roleId("Khác") });
    expect(res.status).toBe(200);
    expect(res.body.role.name).toBe("Khác");
    expect((await targetAgent.get("/api/admin/auth/me")).status).toBe(401);
    expect(await prisma.auditLog.count({ where: { action: "user.update" } })).toBe(1);
  });

  it("deactivates and reactivates, revoking sessions and clearing lockout", async () => {
    const { agent } = await adminAgent();
    const target = await createUser(prisma, { email: "t@istt.vn", roleName: EDITOR_ROLE_NAME });
    const targetAgent = await loginAs(app, "t@istt.vn");
    const off = await agent.patch(`/api/admin/users/${target.id}`).send({ isActive: false });
    expect(off.status).toBe(200);
    expect(off.body.isActive).toBe(false);
    expect((await targetAgent.get("/api/admin/auth/me")).status).toBe(401);
    expect(await prisma.auditLog.count({ where: { action: "user.deactivate" } })).toBe(1);

    await prisma.user.update({
      where: { id: target.id },
      data: { failedLoginCount: 4, lockedUntil: new Date("2099-01-01T00:00:00.000Z") },
    });
    const on = await agent.patch(`/api/admin/users/${target.id}`).send({ isActive: true });
    expect(on.status).toBe(200);
    expect(on.body.isActive).toBe(true);
    const row = await prisma.user.findUniqueOrThrow({ where: { id: target.id } });
    expect(row.failedLoginCount).toBe(0);
    expect(row.lockedUntil).toBeNull();
    expect(await prisma.auditLog.count({ where: { action: "user.activate" } })).toBe(1);
  });
});

describe("POST /users/:id/reset-password", () => {
  it("sets a temporary password, revokes sessions and clears lockout", async () => {
    const { agent } = await adminAgent();
    const target = await createUser(prisma, { email: "t@istt.vn", roleName: EDITOR_ROLE_NAME });
    const targetAgent = await loginAs(app, "t@istt.vn");
    await prisma.user.update({
      where: { id: target.id },
      data: { failedLoginCount: 3, lockedUntil: new Date("2099-01-01T00:00:00.000Z") },
    });
    const res = await agent.post(`/api/admin/users/${target.id}/reset-password`);
    expect(res.status).toBe(200);
    const temp: string = res.body.temporaryPassword;
    expect(temp).toHaveLength(14);
    expect((await targetAgent.get("/api/admin/auth/me")).status).toBe(401);
    const row = await prisma.user.findUniqueOrThrow({ where: { id: target.id } });
    expect(row.mustChangePassword).toBe(true);
    expect(row.failedLoginCount).toBe(0);
    expect(row.lockedUntil).toBeNull();
    const login = await adminRequest(app)
      .post("/api/admin/auth/login")
      .send({ email: "t@istt.vn", password: temp });
    expect(login.status).toBe(200);
    const audit = await prisma.auditLog.findFirstOrThrow({ where: { action: "user.password_reset" } });
    expect(JSON.stringify(audit.metadata ?? {})).not.toContain(temp);
    expect(DEFAULT_TEST_PASSWORD).not.toBe(temp);
  });

  it("404s for an unknown user", async () => {
    const { agent } = await adminAgent();
    expect((await agent.post("/api/admin/users/999999/reset-password")).status).toBe(404);
  });
});

describe("protections", () => {
  it("blocks self-deactivation and self role change", async () => {
    await roleWith("Quản lý", ["users.manage"]);
    const me = await createUser(prisma, { email: "mgr@istt.vn", roleName: "Quản lý" });
    const agent = await loginAs(app, "mgr@istt.vn");
    const off = await agent.patch(`/api/admin/users/${me.id}`).send({ isActive: false });
    expect(off.status).toBe(409);
    expect(off.body.error.code).toBe("CONFLICT");
    const role = await agent
      .patch(`/api/admin/users/${me.id}`)
      .send({ roleId: await roleId(EDITOR_ROLE_NAME) });
    expect(role.status).toBe(409);
    expect((await agent.patch(`/api/admin/users/${me.id}`).send({ fullName: "Mới" })).status).toBe(
      200,
    );
  });

  it("protects the last active admin when admins act on each other concurrently", async () => {
    const a = await createUser(prisma, { email: "a@istt.vn" });
    const b = await createUser(prisma, { email: "b@istt.vn" });
    const agentA = await loginAs(app, "a@istt.vn");
    const agentB = await loginAs(app, "b@istt.vn");
    const editorId = await roleId(EDITOR_ROLE_NAME);
    const results = await Promise.all([
      agentA.patch(`/api/admin/users/${b.id}`).send({ roleId: editorId }),
      agentB.patch(`/api/admin/users/${a.id}`).send({ roleId: editorId }),
    ]);
    expect(results.map((r) => r.status).sort()).toEqual([200, 409]);
    const systemRole = await prisma.role.findUniqueOrThrow({ where: { name: SYSTEM_ROLE_NAME } });
    expect(await prisma.user.count({ where: { roleId: systemRole.id, isActive: true } })).toBe(1);
  });

  it("never lets concurrent deactivations remove every admin", async () => {
    const a = await createUser(prisma, { email: "a@istt.vn" });
    const b = await createUser(prisma, { email: "b@istt.vn" });
    const agentA = await loginAs(app, "a@istt.vn");
    const agentB = await loginAs(app, "b@istt.vn");
    const results = await Promise.all([
      agentA.patch(`/api/admin/users/${b.id}`).send({ isActive: false }),
      agentB.patch(`/api/admin/users/${a.id}`).send({ isActive: false }),
    ]);
    expect(results.map((r) => r.status).sort()).toEqual([200, 409]);
    const systemRole = await prisma.role.findUniqueOrThrow({ where: { name: SYSTEM_ROLE_NAME } });
    expect(await prisma.user.count({ where: { roleId: systemRole.id, isActive: true } })).toBe(1);
  });
});

describe("administrator accounts are restricted to administrators", () => {
  async function setup() {
    const admin = await createUser(prisma, { email: "admin@istt.vn" });
    await roleWith("Quản lý", ["users.manage"]);
    await createUser(prisma, { email: "mgr@istt.vn", roleName: "Quản lý" });
    const editor = await createUser(prisma, { email: "ed@istt.vn", roleName: EDITOR_ROLE_NAME });
    const adminAgentSession = await loginAs(app, "admin@istt.vn");
    const manager = await loginAs(app, "mgr@istt.vn");
    return { admin, editor, manager, adminAgentSession };
  }

  it("forbids a manager from assigning the system role", async () => {
    const { editor, manager } = await setup();
    const systemId = await roleId(SYSTEM_ROLE_NAME);
    const created = await manager
      .post("/api/admin/users")
      .send({ email: "new@istt.vn", fullName: "Mới", roleId: systemId });
    expect(created.status).toBe(403);
    expect(created.body.error.code).toBe("FORBIDDEN");
    expect(await prisma.user.count({ where: { email: "new@istt.vn" } })).toBe(0);
    const moved = await manager.patch(`/api/admin/users/${editor.id}`).send({ roleId: systemId });
    expect(moved.status).toBe(403);
    const row = await prisma.user.findUniqueOrThrow({ where: { id: editor.id } });
    expect(row.roleId).toBe((await prisma.role.findUniqueOrThrow({ where: { name: EDITOR_ROLE_NAME } })).id);
  });

  it("forbids a manager from changing, deactivating or resetting an administrator", async () => {
    const { admin, manager, adminAgentSession } = await setup();
    const before = await prisma.user.findUniqueOrThrow({ where: { id: admin.id } });
    const patch = await manager.patch(`/api/admin/users/${admin.id}`).send({ fullName: "Hack" });
    const off = await manager.patch(`/api/admin/users/${admin.id}`).send({ isActive: false });
    const on = await manager.patch(`/api/admin/users/${admin.id}`).send({ isActive: true });
    const reset = await manager.post(`/api/admin/users/${admin.id}/reset-password`);
    for (const res of [patch, off, on, reset]) {
      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe("FORBIDDEN");
    }
    const after = await prisma.user.findUniqueOrThrow({ where: { id: admin.id } });
    expect(after.passwordHash).toBe(before.passwordHash);
    expect(after.fullName).toBe(before.fullName);
    expect(after.isActive).toBe(true);
    expect((await adminAgentSession.get("/api/admin/auth/me")).status).toBe(200);
  });

  it("still lets an administrator manage administrators", async () => {
    const { admin, editor, adminAgentSession } = await setup();
    const other = await createUser(prisma, { email: "admin2@istt.vn" });
    const moved = await adminAgentSession
      .patch(`/api/admin/users/${editor.id}`)
      .send({ roleId: await roleId(SYSTEM_ROLE_NAME) });
    expect(moved.status).toBe(200);
    const reset = await adminAgentSession.post(`/api/admin/users/${other.id}/reset-password`);
    expect(reset.status).toBe(200);
    const off = await adminAgentSession.patch(`/api/admin/users/${other.id}`).send({ isActive: false });
    expect(off.status).toBe(200);
    expect(admin.id).not.toBe(other.id);
  });
});
