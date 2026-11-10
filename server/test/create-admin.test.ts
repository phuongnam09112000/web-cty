import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createAdmin } from "../src/cli/create-admin.js";
import { loginAs, makeTestApp, resetDb } from "./helpers.js";

const { app, prisma } = makeTestApp();

beforeEach(async () => {
  await resetDb(prisma);
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("createAdmin", () => {
  it("creates an administrator who can log in", async () => {
    const user = await createAdmin(prisma, {
      email: "  Admin@Example.COM ",
      fullName: "Quản trị",
      password: "Matkhau@12345",
    });
    expect(user.email).toBe("admin@example.com");
    expect(user.mustChangePassword).toBe(false);

    const agent = await loginAs(app, "admin@example.com", "Matkhau@12345");
    const me = await agent.get("/api/admin/auth/me");
    expect(me.status).toBe(200);
    expect(me.body.role.isSystem).toBe(true);
  });

  it("rejects a duplicate email", async () => {
    await createAdmin(prisma, { email: "a@example.com", fullName: "A", password: "Matkhau@12345" });
    await expect(
      createAdmin(prisma, { email: "A@example.com", fullName: "B", password: "Matkhau@12345" }),
    ).rejects.toThrow();
    expect(await prisma.user.count()).toBe(1);
  });

  it("rejects a 9 character password", async () => {
    await expect(
      createAdmin(prisma, { email: "a@example.com", fullName: "A", password: "123456789" }),
    ).rejects.toThrow();
    expect(await prisma.user.count()).toBe(0);
  });
});
