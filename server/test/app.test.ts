import express from "express";
import pino from "pino";
import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { createPrisma } from "../src/db.js";
import { AppError, errorHandler } from "../src/http/errors.js";
import { parseId } from "../src/http/params.js";
import { paginationSchema, toPage } from "../src/http/pagination.js";
import {
  TEST_GATEWAY_SECRET,
  adminRequest,
  createUser,
  loginAs,
  makeTestApp,
  makeTestConfig,
  resetDb,
} from "./helpers.js";

const { app, prisma } = makeTestApp();

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  await resetDb(prisma);
});

describe("health", () => {
  it("returns ok with a request id", async () => {
    const res = await request(app).get("/api/public/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
    expect(res.headers["x-request-id"]).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("returns 503 when the database is unreachable", async () => {
    const dead = createPrisma("mysql://root:x@127.0.0.1:1/none", { connectTimeoutMs: 1000 });
    const deadApp = createApp({
      prisma: dead,
      config: makeTestConfig(),
      logger: pino({ level: "silent" }),
      clock: () => new Date(),
    });
    const res = await request(deadApp).get("/api/public/health");
    await dead.$disconnect();
    expect(res.status).toBe(503);
    expect(res.body).toEqual({ status: "error" });
  }, 15000);
});

describe("admin guards", () => {
  it("rejects a missing gateway header", async () => {
    const res = await request(app).get("/api/admin/anything");
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  it("rejects a wrong gateway header", async () => {
    const res = await request(app).get("/api/admin/anything").set("X-Admin-Gateway", "nope");
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  it("rejects POST with a foreign Origin", async () => {
    const res = await request(app)
      .post("/api/admin/anything")
      .set("X-Admin-Gateway", TEST_GATEWAY_SECRET)
      .set("Origin", "http://evil.test");
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  it("rejects POST without Origin", async () => {
    const res = await request(app)
      .post("/api/admin/anything")
      .set("X-Admin-Gateway", TEST_GATEWAY_SECRET);
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  it("does not require Origin for GET", async () => {
    const res = await request(app)
      .get("/api/admin/anything")
      .set("X-Admin-Gateway", TEST_GATEWAY_SECRET);
    expect(res.status).toBe(401);
  });

  it("returns 404 in the common format for unknown admin paths when authenticated", async () => {
    await createUser(prisma, { email: "admin@istt.vn" });
    const agent = await loginAs(app, "admin@istt.vn");
    const res = await agent.get("/api/admin/anything");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
    expect(res.body.error.requestId).toBe(res.headers["x-request-id"]);
  });

  it("returns 401 for unknown admin paths without a session", async () => {
    const res = await adminRequest(app).get("/api/admin/anything");
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHENTICATED");
  });

  it("returns 400 VALIDATION_ERROR for malformed JSON", async () => {
    const res = await adminRequest(app)
      .post("/api/admin/anything")
      .set("Content-Type", "application/json")
      .send("{bad");
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});

describe("errorHandler", () => {
  const mini = express();
  mini.get("/boom", () => {
    throw new Error("secret detail");
  });
  mini.get("/app", () => {
    throw new AppError(409, "CONFLICT", "Trùng", { name: "Đã tồn tại" });
  });
  mini.get("/zod", () => {
    paginationSchema.parse({ page: "0" });
  });
  mini.use(errorHandler(pino({ level: "silent" })));

  it("maps unexpected errors to 500 without a stack", async () => {
    const res = await request(mini).get("/boom");
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe("INTERNAL_ERROR");
    expect(res.body.error.message).toBe("Đã xảy ra lỗi, vui lòng thử lại");
    expect(JSON.stringify(res.body)).not.toContain("secret detail");
    expect(JSON.stringify(res.body)).not.toContain("at ");
  });

  it("maps AppError with fields", async () => {
    const res = await request(mini).get("/app");
    expect(res.status).toBe(409);
    expect(res.body.error).toMatchObject({ code: "CONFLICT", fields: { name: "Đã tồn tại" } });
  });

  it("maps ZodError to 400 with field paths", async () => {
    const res = await request(mini).get("/zod");
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(Object.keys(res.body.error.fields)).toEqual(["page"]);
  });
});

describe("parseId", () => {
  it("parses valid ids", () => {
    expect(parseId("42")).toBe(42n);
    expect(parseId("18446744073709551615")).toBe(18446744073709551615n);
  });

  it.each(["abc", "99999999999999999999", "0", "-1", "1.5", ""])("rejects %s", (value) => {
    expect(() => parseId(value)).toThrow(AppError);
    try {
      parseId(value);
    } catch (e) {
      expect((e as AppError).status).toBe(404);
      expect((e as AppError).code).toBe("NOT_FOUND");
    }
  });
});

describe("pagination", () => {
  it("applies defaults and bounds", () => {
    expect(paginationSchema.parse({})).toEqual({ page: 1, pageSize: 20 });
    expect(paginationSchema.parse({ page: "3", pageSize: "100" })).toEqual({ page: 3, pageSize: 100 });
    expect(() => paginationSchema.parse({ pageSize: "101" })).toThrow();
    expect(() => paginationSchema.parse({ page: "0" })).toThrow();
  });

  it("builds a page", () => {
    expect(toPage(["a"], 5, 2, 1)).toEqual({ items: ["a"], total: 5, page: 2, pageSize: 1 });
  });
});

