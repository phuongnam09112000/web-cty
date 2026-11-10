import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_TEST_PASSWORD,
  adminRequest,
  createUser,
  makeTestApp,
  resetDb,
} from "./helpers.js";

const gate = vi.hoisted(() => ({
  hold: null as null | ((plain: string) => Promise<void>),
}));

vi.mock("../src/modules/auth/password.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../src/modules/auth/password.js")>();
  return {
    ...actual,
    verifyPassword: async (hash: string, plain: string) => {
      await gate.hold?.(plain);
      return actual.verifyPassword(hash, plain);
    },
  };
});

const { app, prisma, clock } = makeTestApp();

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  await resetDb(prisma);
});

afterEach(() => {
  gate.hold = null;
});

function login(password: string) {
  return adminRequest(app)
    .post("/api/admin/auth/login")
    .send({ email: "admin@istt.vn", password })
    .then((res) => res);
}

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

describe("concurrent login attempts", () => {
  it("rejects a correct guess that was in flight when the lock was set", async () => {
    const user = await createUser(prisma, { email: "admin@istt.vn" });
    const release = deferred();
    const arrived = deferred();
    gate.hold = async (plain) => {
      if (plain === DEFAULT_TEST_PASSWORD) {
        arrived.resolve();
        await release.promise;
      }
    };
    const correct = login(DEFAULT_TEST_PASSWORD);
    await arrived.promise;
    const wrong = await Promise.all(
      Array.from({ length: 9 }, () => login("sai-mat-khau-1")),
    );
    for (const res of wrong) expect(res.status).toBe(401);
    const locked = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(locked.lockedUntil?.getTime()).toBe(clock().getTime() + 15 * 60_000);
    release.resolve();
    const res = await correct;
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
    expect(await prisma.session.count()).toBe(0);
    expect(await prisma.auditLog.count({ where: { action: "auth.login" } })).toBe(0);
    const after = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(after.lockedUntil?.getTime()).toBe(locked.lockedUntil?.getTime());
    clock.advance(15 * 60_000);
    expect((await login(DEFAULT_TEST_PASSWORD)).status).toBe(200);
  });

  it("allows only the remaining attempts in a parallel burst of correct guesses", async () => {
    const user = await createUser(prisma, { email: "admin@istt.vn" });
    await prisma.user.update({ where: { id: user.id }, data: { failedLoginCount: 4 } });
    const total = 8;
    const barrier = deferred();
    let arrivals = 0;
    gate.hold = async () => {
      arrivals += 1;
      if (arrivals === total) barrier.resolve();
      await barrier.promise;
    };
    const results = await Promise.all(
      Array.from({ length: total }, () => login(DEFAULT_TEST_PASSWORD)),
    );
    expect(results.filter((res) => res.status === 200)).toHaveLength(1);
    expect(results.filter((res) => res.status === 401)).toHaveLength(total - 1);
    expect(await prisma.session.count()).toBe(1);
  });
});
