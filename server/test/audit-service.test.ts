import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createPrisma, type PrismaClient } from "../src/db.js";
import { recordAudit } from "../src/modules/audit/audit.service.js";
import { resetDb } from "./helpers.js";

let prisma: PrismaClient;

beforeAll(() => {
  prisma = createPrisma(process.env.DATABASE_URL as string);
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  await resetDb(prisma);
});

describe("recordAudit", () => {
  it("stores the fields", async () => {
    await recordAudit(prisma, {
      actorUserId: null,
      action: "auth.login_failed",
      targetType: "user",
      targetId: "7",
      metadata: { email: "a@b.vn" },
      ip: "10.0.0.1",
    });
    const rows = await prisma.auditLog.findMany();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      actorUserId: null,
      action: "auth.login_failed",
      targetType: "user",
      targetId: "7",
      metadata: { email: "a@b.vn" },
      ip: "10.0.0.1",
    });
  });

  it("strips sensitive keys at every level", async () => {
    await recordAudit(prisma, {
      actorUserId: null,
      action: "user.create",
      metadata: {
        email: "a@b.vn",
        password: "x",
        nested: { token: "y", ok: 1, list: [{ newPassword: "z", keep: true }] },
      },
      ip: "10.0.0.1",
    });
    const row = await prisma.auditLog.findFirstOrThrow();
    expect(row.metadata).toEqual({ email: "a@b.vn", nested: { ok: 1, list: [{ keep: true }] } });
  });

  it("works inside a transaction", async () => {
    await prisma.$transaction(async (tx) => {
      await recordAudit(tx, { actorUserId: null, action: "auth.logout", ip: "1.1.1.1" });
    });
    expect(await prisma.auditLog.count()).toBe(1);
  });
});
