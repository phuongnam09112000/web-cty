import { createHash } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import {
  createSession,
  deleteExpiredSessions,
  resolveSession,
  revokeUserSessions,
} from "../src/modules/auth/session.service.js";
import { createFakeClock, createUser, makeTestApp, resetDb } from "./helpers.js";

const { prisma } = makeTestApp();
const meta = { ip: "10.0.0.1", userAgent: "vitest" };

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  await resetDb(prisma);
});

describe("session service", () => {
  it("stores only the SHA-256 hex of the token", async () => {
    const user = await createUser(prisma, { email: "a@istt.vn" });
    const clock = createFakeClock();
    const token = await createSession(prisma, user.id, meta, clock());
    const rows = await prisma.session.findMany();
    expect(rows).toHaveLength(1);
    expect(rows[0].id).toMatch(/^[0-9a-f]{64}$/);
    expect(rows[0].id).not.toBe(token);
    expect(rows[0].id).toBe(createHash("sha256").update(token).digest("hex"));
    expect(Buffer.from(token, "base64url")).toHaveLength(32);
    expect(rows[0].expiresAt.getTime()).toBe(clock().getTime() + 8 * 3600_000);
  });

  it("resolves a session and returns the user with role", async () => {
    const user = await createUser(prisma, { email: "a@istt.vn" });
    const clock = createFakeClock();
    const token = await createSession(prisma, user.id, meta, clock());
    const resolved = await resolveSession(prisma, token, clock());
    expect(resolved?.user.id).toBe(user.id);
    expect(resolved?.user.role.isSystem).toBe(true);
    expect(await resolveSession(prisma, "unknown", clock())).toBeNull();
  });

  it("refreshes last_seen only after 60 seconds", async () => {
    const user = await createUser(prisma, { email: "a@istt.vn" });
    const clock = createFakeClock();
    const token = await createSession(prisma, user.id, meta, clock());
    const first = await prisma.session.findFirstOrThrow();
    clock.advance(59_000);
    await resolveSession(prisma, token, clock());
    const same = await prisma.session.findFirstOrThrow();
    expect(same.lastSeenAt.getTime()).toBe(first.lastSeenAt.getTime());
    clock.advance(1_000);
    await resolveSession(prisma, token, clock());
    const moved = await prisma.session.findFirstOrThrow();
    expect(moved.lastSeenAt.getTime()).toBe(clock().getTime());
    expect(moved.expiresAt.getTime()).toBe(clock().getTime() + 8 * 3600_000);
  });

  it("deletes and rejects an idle-expired session", async () => {
    const user = await createUser(prisma, { email: "a@istt.vn" });
    const clock = createFakeClock();
    const token = await createSession(prisma, user.id, meta, clock());
    clock.advance(8 * 3600_000 + 1);
    expect(await resolveSession(prisma, token, clock())).toBeNull();
    expect(await prisma.session.count()).toBe(0);
  });

  it("caps expiry at 7 days from creation", async () => {
    const user = await createUser(prisma, { email: "a@istt.vn" });
    const clock = createFakeClock();
    const token = await createSession(prisma, user.id, meta, clock());
    for (let i = 0; i < 23; i++) {
      clock.advance(7 * 3600_000);
      expect(await resolveSession(prisma, token, clock())).not.toBeNull();
    }
    clock.advance(7 * 3600_000 - 1000);
    expect(await resolveSession(prisma, token, clock())).not.toBeNull();
    const row = await prisma.session.findFirstOrThrow();
    expect(row.expiresAt.getTime()).toBe(row.createdAt.getTime() + 7 * 24 * 3600_000);
    clock.advance(1001);
    expect(await resolveSession(prisma, token, clock())).toBeNull();
  });

  it("revokes all sessions of a user", async () => {
    const a = await createUser(prisma, { email: "a@istt.vn" });
    const b = await createUser(prisma, { email: "b@istt.vn" });
    const now = new Date();
    await createSession(prisma, a.id, meta, now);
    await createSession(prisma, a.id, meta, now);
    await createSession(prisma, b.id, meta, now);
    await revokeUserSessions(prisma, a.id);
    expect(await prisma.session.count({ where: { userId: a.id } })).toBe(0);
    expect(await prisma.session.count({ where: { userId: b.id } })).toBe(1);
  });

  it("deleteExpiredSessions removes only sessions with expires_at < now", async () => {
    const user = await createUser(prisma, { email: "a@istt.vn" });
    const clock = createFakeClock();
    await createSession(prisma, user.id, meta, clock());
    clock.advance(3600_000);
    await createSession(prisma, user.id, meta, clock());
    const boundary = new Date(createFakeClock()().getTime() + 8 * 3600_000);
    expect(await deleteExpiredSessions(prisma, boundary)).toBe(0);
    expect(await deleteExpiredSessions(prisma, new Date(boundary.getTime() + 1))).toBe(1);
    expect(await prisma.session.count()).toBe(1);
  });
});
