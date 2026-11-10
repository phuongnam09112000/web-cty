import type { Express } from "express";
import pino from "pino";
import request from "supertest";
import { createApp } from "../src/app.js";
import type { Config } from "../src/config.js";
import { createPrisma, type PrismaClient } from "../src/db.js";
import { EDITOR_ROLE_NAME, SYSTEM_ROLE_NAME } from "../src/modules/permissions/catalog.js";
import { syncPermissions } from "../src/modules/permissions/sync.js";

export async function resetDb(prisma: PrismaClient): Promise<void> {
  await prisma.auditLog.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.role.deleteMany({
    where: { name: { notIn: [SYSTEM_ROLE_NAME, EDITOR_ROLE_NAME] } },
  });
  await prisma.permission.deleteMany();
  await syncPermissions(prisma);
}

export type TestClock = (() => Date) & { advance: (ms: number) => void };

export function createFakeClock(start: Date = new Date("2026-01-01T00:00:00.000Z")): TestClock {
  let current = start.getTime();
  const clock = (() => new Date(current)) as TestClock;
  clock.advance = (ms: number) => {
    current += ms;
  };
  return clock;
}

export const TEST_GATEWAY_SECRET = "test-gateway-secret-0123456789abcdef";
export const TEST_ADMIN_ORIGIN = "http://admin.test";

export function makeTestConfig(): Config {
  return {
    databaseUrl: process.env.DATABASE_URL as string,
    port: 0,
    adminOrigin: TEST_ADMIN_ORIGIN,
    adminGatewaySecret: TEST_GATEWAY_SECRET,
    cookieSecure: false,
    nodeEnv: "test",
  };
}

export function makeTestApp(options: { now?: Date } = {}) {
  const config = makeTestConfig();
  const prisma = createPrisma(config.databaseUrl);
  const clock = createFakeClock(options.now);
  const logger = pino({ level: "silent" });
  const app = createApp({ prisma, config, logger, clock });
  return { app, prisma, config, clock };
}

export function adminRequest(app: Express) {
  return request
    .agent(app)
    .set("X-Admin-Gateway", TEST_GATEWAY_SECRET)
    .set("Origin", TEST_ADMIN_ORIGIN);
}
