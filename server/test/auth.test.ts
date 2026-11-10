import type { Express } from "express";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { SYSTEM_ROLE_NAME } from "../src/modules/permissions/catalog.js";
import {
  DEFAULT_TEST_PASSWORD,
  adminRequest,
  createUser,
  loginAs,
  makeTestApp,
  makeTestConfig,
  resetDb,
} from "./helpers.js";
import pino from "pino";

const { app, prisma, clock } = makeTestApp();
const INVALID = "Email hoặc mật khẩu không đúng";

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  await resetDb(prisma);
});

function login(target: Express, email: string, password: string = DEFAULT_TEST_PASSWORD) {
  return adminRequest(target).post("/api/admin/auth/login").send({ email, password });
}

describe("login", () => {
  it("logs in and sets a hardened cookie", async () => {
    const user = await createUser(prisma, { email: "admin@istt.vn" });
    const res = await login(app, "admin@istt.vn");
    expect(res.status).toBe(200);
    const cookie = (res.headers["set-cookie"] as unknown as string[]).join(";");
    expect(cookie).toContain("istt_admin_session=");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Strict");
    expect(cookie).toContain("Path=/");
    expect(cookie).not.toContain("Secure");
    const row = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(row.lastLoginAt?.getTime()).toBe(clock().getTime());
    const audit = await prisma.auditLog.findFirstOrThrow({ where: { action: "auth.login" } });
    expect(audit.actorUserId).toBe(user.id);
  });

  it("adds Secure when cookieSecure is true", async () => {
    await createUser(prisma, { email: "admin@istt.vn" });
    const secureApp = createApp({
      prisma,
      config: { ...makeTestConfig(), cookieSecure: true },
      logger: pino({ level: "silent" }),
      clock,
    });
    const res = await login(secureApp, "admin@istt.vn");
    expect(res.status).toBe(200);
    expect((res.headers["set-cookie"] as unknown as string[]).join(";")).toContain("Secure");
  });

  it("normalizes the email", async () => {
    await createUser(prisma, { email: "admin@istt.vn" });
    const res = await login(app, " Admin@ISTT.vn ");
    expect(res.status).toBe(200);
  });

  it("returns the same error for wrong password, unknown email and inactive user", async () => {
    await createUser(prisma, { email: "admin@istt.vn" });
    await createUser(prisma, { email: "off@istt.vn", isActive: false });
    const responses = [
      await login(app, "admin@istt.vn", "sai-mat-khau-1"),
      await login(app, "nobody@istt.vn"),
      await login(app, "off@istt.vn"),
    ];
    for (const res of responses) {
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
      expect(res.body.error.message).toBe(INVALID);
    }
    const audits = await prisma.auditLog.findMany({ where: { action: "auth.login_failed" } });
    expect(audits).toHaveLength(3);
    expect(audits.map((a) => (a.metadata as { email: string }).email).sort()).toEqual([
      "admin@istt.vn",
      "nobody@istt.vn",
      "off@istt.vn",
    ]);
  });

  it("rejects malformed bodies with VALIDATION_ERROR", async () => {
    const res = await adminRequest(app).post("/api/admin/auth/login").send({ email: 5 });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("locks after 5 consecutive failures for 15 minutes", async () => {
    const user = await createUser(prisma, { email: "admin@istt.vn" });
    for (let i = 0; i < 5; i++) {
      expect((await login(app, "admin@istt.vn", "sai-mat-khau-1")).status).toBe(401);
    }
    const locked = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(locked.lockedUntil?.getTime()).toBe(clock().getTime() + 15 * 60_000);
    expect(locked.failedLoginCount).toBe(0);
    const stillLocked = await login(app, "admin@istt.vn");
    expect(stillLocked.status).toBe(401);
    expect(stillLocked.body.error.message).toBe(INVALID);
    clock.advance(15 * 60_000);
    const ok = await login(app, "admin@istt.vn");
    expect(ok.status).toBe(200);
    const after = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(after.failedLoginCount).toBe(0);
    expect(after.lockedUntil).toBeNull();
  });

  it("caps guesses under concurrent attempts", async () => {
    const user = await createUser(prisma, { email: "admin@istt.vn" });
    const results = await Promise.all(
      Array.from({ length: 10 }, () => login(app, "admin@istt.vn", "sai-mat-khau-1")),
    );
    for (const res of results) expect(res.status).toBe(401);
    const locked = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(locked.failedLoginCount).toBe(0);
    expect(locked.lockedUntil?.getTime()).toBe(clock().getTime() + 15 * 60_000);
    const right = await login(app, "admin@istt.vn");
    expect(right.status).toBe(401);
    expect(right.body.error.code).toBe("INVALID_CREDENTIALS");
    clock.advance(15 * 60_000);
    expect((await login(app, "admin@istt.vn")).status).toBe(200);
  });

  it("resets the counter after a success", async () => {
    const user = await createUser(prisma, { email: "admin@istt.vn" });
    for (let i = 0; i < 4; i++) await login(app, "admin@istt.vn", "sai-mat-khau-1");
    expect((await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).failedLoginCount).toBe(4);
    expect((await login(app, "admin@istt.vn")).status).toBe(200);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).failedLoginCount).toBe(0);
  });
});

describe("me", () => {
  it("requires a session", async () => {
    const res = await adminRequest(app).get("/api/admin/auth/me");
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHENTICATED");
  });

  it("returns the profile with all permissions for the system role", async () => {
    const user = await createUser(prisma, { email: "admin@istt.vn", fullName: "Quản trị" });
    const agent = await loginAs(app, "admin@istt.vn");
    const res = await agent.get("/api/admin/auth/me");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: Number(user.id),
      email: "admin@istt.vn",
      fullName: "Quản trị",
      mustChangePassword: false,
      role: { id: Number(user.roleId), name: SYSTEM_ROLE_NAME, isSystem: true },
      permissions: expect.arrayContaining(["users.view", "users.manage", "roles.manage", "audit.view"]),
    });
    expect(res.body.permissions).toHaveLength(4);
  });

  it("expires after 8 hours of inactivity", async () => {
    await createUser(prisma, { email: "admin@istt.vn" });
    const agent = await loginAs(app, "admin@istt.vn");
    clock.advance(8 * 3600_000 + 1);
    const res = await agent.get("/api/admin/auth/me");
    expect(res.status).toBe(401);
  });

  it("expires 7 days after login even with continuous activity", async () => {
    await createUser(prisma, { email: "admin@istt.vn" });
    const agent = await loginAs(app, "admin@istt.vn");
    for (let i = 0; i < 24; i++) {
      clock.advance(7 * 3600_000);
      expect((await agent.get("/api/admin/auth/me")).status).toBe(200);
    }
    clock.advance(7 * 3600_000);
    expect((await agent.get("/api/admin/auth/me")).status).toBe(401);
  });

  it("updates only fullName via PATCH", async () => {
    const user = await createUser(prisma, { email: "admin@istt.vn" });
    const agent = await loginAs(app, "admin@istt.vn");
    const res = await agent
      .patch("/api/admin/auth/me")
      .send({ fullName: "Nguyễn Thị Ánh", email: "x@istt.vn", roleId: 999 });
    expect(res.status).toBe(200);
    expect(res.body.fullName).toBe("Nguyễn Thị Ánh");
    const row = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(row.fullName).toBe("Nguyễn Thị Ánh");
    expect(row.email).toBe("admin@istt.vn");
    expect(row.roleId).toBe(user.roleId);
  });

  it("derives permissions from the role for non-system roles", async () => {
    await createUser(prisma, { email: "ed@istt.vn", roleName: "Biên tập viên" });
    const agent = await loginAs(app, "ed@istt.vn");
    const res = await agent.get("/api/admin/auth/me");
    expect(res.body.permissions).toEqual([]);
    expect(res.body.role.isSystem).toBe(false);
  });
});

describe("logout", () => {
  it("deletes the session and clears the cookie", async () => {
    const user = await createUser(prisma, { email: "admin@istt.vn" });
    const agent = await loginAs(app, "admin@istt.vn");
    const sessionCookie = (
      await adminRequest(app).post("/api/admin/auth/login").send({ email: "admin@istt.vn", password: DEFAULT_TEST_PASSWORD })
    ).headers["set-cookie"] as unknown as string[];
    expect(await prisma.session.count()).toBe(2);
    const res = await agent.post("/api/admin/auth/logout");
    expect(res.status).toBe(204);
    const cleared = (res.headers["set-cookie"] as unknown as string[]).join(";");
    expect(cleared).toContain("istt_admin_session=;");
    expect(cleared).toContain("Path=/");
    expect(cleared).toContain("HttpOnly");
    expect(cleared).toContain("SameSite=Strict");
    expect(await prisma.session.count()).toBe(1);
    const audit = await prisma.auditLog.findFirstOrThrow({ where: { action: "auth.logout" } });
    expect(audit.actorUserId).toBe(user.id);
    const stale = await adminRequest(app)
      .get("/api/admin/auth/me")
      .set("Cookie", sessionCookie[0].split(";")[0]);
    expect(stale.status).toBe(200);
    expect((await agent.get("/api/admin/auth/me")).status).toBe(401);
  });
});

describe("forced password change", () => {
  it("allows only me, change-password and logout", async () => {
    await createUser(prisma, { email: "new@istt.vn", mustChangePassword: true });
    const agent = await loginAs(app, "new@istt.vn");
    expect((await agent.get("/api/admin/auth/me")).status).toBe(200);
    const blocked = await agent.get("/api/admin/users");
    expect(blocked.status).toBe(403);
    expect(blocked.body.error.code).toBe("PASSWORD_CHANGE_REQUIRED");
    const patch = await agent.patch("/api/admin/auth/me").send({ fullName: "X" });
    expect(patch.status).toBe(403);
    expect(patch.body.error.code).toBe("PASSWORD_CHANGE_REQUIRED");
  });
});

describe("change password", () => {
  it("rejects a wrong current password", async () => {
    await createUser(prisma, { email: "admin@istt.vn" });
    const agent = await loginAs(app, "admin@istt.vn");
    const res = await agent
      .post("/api/admin/auth/change-password")
      .send({ currentPassword: "sai-mat-khau-1", newPassword: "MatKhauMoi@123" });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.fields.currentPassword).toBeTruthy();
  });

  it("rejects a short new password", async () => {
    await createUser(prisma, { email: "admin@istt.vn" });
    const agent = await loginAs(app, "admin@istt.vn");
    const res = await agent
      .post("/api/admin/auth/change-password")
      .send({ currentPassword: DEFAULT_TEST_PASSWORD, newPassword: "123456789" });
    expect(res.status).toBe(400);
    expect(res.body.error.fields.newPassword).toBeTruthy();
  });

  it("changes the password, clears the flag and keeps only the current session", async () => {
    const user = await createUser(prisma, { email: "new@istt.vn", mustChangePassword: true });
    const other = await login(app, "new@istt.vn");
    expect(other.status).toBe(200);
    const agent = await loginAs(app, "new@istt.vn");
    expect(await prisma.session.count({ where: { userId: user.id } })).toBe(2);
    const res = await agent
      .post("/api/admin/auth/change-password")
      .send({ currentPassword: DEFAULT_TEST_PASSWORD, newPassword: "MatKhauMoi@123" });
    expect(res.status).toBe(200);
    const row = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(row.mustChangePassword).toBe(false);
    expect(await prisma.session.count({ where: { userId: user.id } })).toBe(1);
    expect((await agent.get("/api/admin/auth/me")).status).toBe(200);
    const audit = await prisma.auditLog.findFirstOrThrow({ where: { action: "auth.password_change" } });
    expect(audit.actorUserId).toBe(user.id);
    expect(JSON.stringify(audit.metadata)).not.toContain("MatKhauMoi");
    expect((await login(app, "new@istt.vn", "MatKhauMoi@123")).status).toBe(200);
    expect((await login(app, "new@istt.vn")).status).toBe(401);
  });
});
