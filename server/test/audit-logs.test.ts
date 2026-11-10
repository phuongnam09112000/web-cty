import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createUser, loginAs, makeTestApp, resetDb } from "./helpers.js";

const { app, prisma } = makeTestApp();

afterAll(async () => {
  await resetDb(prisma);
  await prisma.$disconnect();
});

beforeEach(async () => {
  await resetDb(prisma);
});

async function adminAgent(email = "admin@istt.vn") {
  const user = await createUser(prisma, { email });
  return { user, agent: await loginAs(app, email) };
}

describe("GET /audit-logs", () => {
  it("requires audit.view", async () => {
    await prisma.role.create({ data: { name: "Trống" } });
    await createUser(prisma, { email: "none@istt.vn", roleName: "Trống" });
    const agent = await loginAs(app, "none@istt.vn");
    const res = await agent.get("/api/admin/audit-logs");
    expect(res.status).toBe(403);
  });

  it("returns newest first with the documented shape", async () => {
    const { user, agent } = await adminAgent();
    const res = await agent.get("/api/admin/audit-logs");
    expect(res.status).toBe(200);
    expect(res.body.page).toBe(1);
    expect(res.body.pageSize).toBe(20);
    expect(res.body.total).toBe(1);
    const entry = res.body.items[0];
    expect(entry).toMatchObject({
      action: "auth.login",
      actor: { id: Number(user.id), email: "admin@istt.vn", fullName: user.fullName },
      targetType: null,
      targetId: null,
    });
    expect(typeof entry.id).toBe("number");
    expect(typeof entry.ip).toBe("string");
    expect(new Date(entry.createdAt).toISOString()).toBe(entry.createdAt);
    const ids = (await agent.get("/api/admin/audit-logs")).body.items.map(
      (i: { id: number }) => i.id,
    );
    expect(ids).toEqual([...ids].sort((a: number, b: number) => b - a));
  });

  it("filters by actorUserId and action", async () => {
    const { user, agent } = await adminAgent();
    const other = await createUser(prisma, { email: "o@istt.vn" });
    await loginAs(app, "o@istt.vn");
    await agent.post("/api/admin/roles").send({ name: "Vai trò mới" });
    const byActor = await agent.get(`/api/admin/audit-logs?actorUserId=${user.id}`);
    expect(byActor.body.items.length).toBe(2);
    expect(byActor.body.items.every((i: { actor: { id: number } }) => i.actor.id === Number(user.id))).toBe(true);
    const byOther = await agent.get(`/api/admin/audit-logs?actorUserId=${other.id}`);
    expect(byOther.body.total).toBe(1);
    const byAction = await agent.get("/api/admin/audit-logs?action=role.create");
    expect(byAction.body.total).toBe(1);
    expect(byAction.body.items[0].action).toBe("role.create");
  });

  it("filters by inclusive from and to dates in UTC", async () => {
    const { agent } = await adminAgent();
    const actor = await prisma.user.findFirstOrThrow();
    await prisma.auditLog.deleteMany();
    const times = [
      "2026-03-09T23:59:59.999Z",
      "2026-03-10T00:00:00.000Z",
      "2026-03-10T23:59:59.999Z",
      "2026-03-11T00:00:00.000Z",
    ];
    for (const at of times) {
      await prisma.auditLog.create({
        data: { actorUserId: actor.id, action: "auth.logout", ip: "1.1.1.1", createdAt: new Date(at) },
      });
    }
    const both = await agent.get("/api/admin/audit-logs?from=2026-03-10&to=2026-03-10");
    expect(both.body.items.map((i: { createdAt: string }) => i.createdAt)).toEqual([
      "2026-03-10T23:59:59.999Z",
      "2026-03-10T00:00:00.000Z",
    ]);
    const fromOnly = await agent.get("/api/admin/audit-logs?from=2026-03-11");
    expect(fromOnly.body.total).toBe(1);
    const toOnly = await agent.get("/api/admin/audit-logs?to=2026-03-09");
    expect(toOnly.body.total).toBe(1);
  });

  it("rejects invalid dates and filters with 400", async () => {
    const { agent } = await adminAgent();
    for (const query of [
      "from=abc",
      "to=2026-13-40",
      "from=2026-02-30",
      "from=2026-03-10T00:00:00Z",
      "actorUserId=abc",
      "action=nope",
    ]) {
      const res = await agent.get(`/api/admin/audit-logs?${query}`);
      expect(res.status, query).toBe(400);
    }
  });

  it("paginates", async () => {
    const { agent } = await adminAgent();
    for (let i = 0; i < 5; i++) await agent.post("/api/admin/roles").send({ name: `Vai trò ${i}` });
    const first = await agent.get("/api/admin/audit-logs?page=1&pageSize=4");
    const second = await agent.get("/api/admin/audit-logs?page=2&pageSize=4");
    expect(first.body).toMatchObject({ total: 6, page: 1, pageSize: 4 });
    expect(first.body.items).toHaveLength(4);
    expect(second.body.items).toHaveLength(2);
    expect((await agent.get("/api/admin/audit-logs?pageSize=101")).status).toBe(400);
    expect((await agent.get("/api/admin/audit-logs?page=0")).status).toBe(400);
  });

  it("never stores a temporary or new password", async () => {
    const { agent } = await adminAgent();
    const created = await agent
      .post("/api/admin/users")
      .send({ email: "n@istt.vn", fullName: "Người mới", roleId: Number((await prisma.role.findUniqueOrThrow({ where: { name: "Biên tập viên" } })).id) });
    expect(created.status).toBe(201);
    const reset = await agent.post(`/api/admin/users/${created.body.user.id}/reset-password`);
    expect(reset.status).toBe(200);
    const newPassword = "MatKhauMoi#98765";
    const change = await agent
      .post("/api/admin/auth/change-password")
      .send({ currentPassword: "Matkhau@12345", newPassword });
    expect(change.status).toBe(200);
    const dump = JSON.stringify(await prisma.auditLog.findMany(), (_key, value) =>
      typeof value === "bigint" ? String(value) : value,
    );
    for (const secret of [
      created.body.temporaryPassword,
      reset.body.temporaryPassword,
      newPassword,
      "Matkhau@12345",
    ]) {
      expect(dump).not.toContain(secret);
    }
    expect(dump).toContain("user.password_reset");
    expect(dump).toContain("auth.password_change");
  });
});
