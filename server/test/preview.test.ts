import { createHash } from "node:crypto";
import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { EDITOR_ROLE_NAME } from "../src/modules/permissions/catalog.js";
import { createUser, loginAs, makeTestApp, resetDb } from "./helpers.js";

const { app, prisma, config, clock } = makeTestApp();

afterAll(async () => {
  await resetDb(prisma);
  await prisma.$disconnect();
});

beforeEach(async () => {
  await resetDb(prisma);
});

const content = (title: string) => ({
  seo: { title: { vi: title, en: title }, description: { vi: "D", en: "D" }, image: null },
  blocks: [],
});

async function makePage(path: string, title: string) {
  const page = await prisma.page.create({ data: { path, name: path } });
  await prisma.pageDraft.create({ data: { pageId: page.id, content: content(title) } });
  return Number(page.id);
}

async function admin() {
  await createUser(prisma, { email: "ed@istt.vn" });
  return loginAs(app, "ed@istt.vn");
}

function tokenOf(url: string): string {
  return new URL(url).searchParams.get("preview") as string;
}

describe("preview tokens", () => {
  it("requires content.view", async () => {
    const id = await makePage("/a", "A");
    const role = await prisma.role.create({ data: { name: "Không quyền" } });
    await createUser(prisma, { email: "n@istt.vn", roleName: role.name });
    const agent = await loginAs(app, "n@istt.vn");
    expect((await agent.post(`/api/admin/pages/${id}/preview`)).status).toBe(403);
    await createUser(prisma, { email: "e@istt.vn", roleName: EDITOR_ROLE_NAME });
    const editor = await loginAs(app, "e@istt.vn");
    expect((await editor.post(`/api/admin/pages/${id}/preview`)).status).toBe(200);
  });

  it("returns 404 for an unknown page", async () => {
    const agent = await admin();
    expect((await agent.post("/api/admin/pages/99999/preview")).status).toBe(404);
  });

  it("builds a URL on the public site origin and serves the draft", async () => {
    const id = await makePage("/a", "Bản nháp");
    const agent = await admin();
    const res = await agent.post(`/api/admin/pages/${id}/preview`);
    expect(res.status).toBe(200);
    expect(res.body.url.startsWith(`${config.publicSiteOrigin}/a?preview=`)).toBe(true);
    const token = tokenOf(res.body.url);
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    const pub = await request(app).get(`/api/public/preview/${token}`);
    expect(pub.status).toBe(200);
    expect(pub.headers["cache-control"]).toBe("no-store");
    expect(pub.body.path).toBe("/a");
    expect(pub.body.version).toBeNull();
    expect(pub.body.content.seo.title.vi).toBe("Bản nháp");
  });

  it("expires after 30 minutes", async () => {
    const id = await makePage("/a", "A");
    const agent = await admin();
    const token = tokenOf((await agent.post(`/api/admin/pages/${id}/preview`)).body.url);
    clock.advance(30 * 60_000 - 1);
    expect((await request(app).get(`/api/public/preview/${token}`)).status).toBe(200);
    clock.advance(2);
    const res = await request(app).get(`/api/public/preview/${token}`);
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("is bound to its own page", async () => {
    const a = await makePage("/a", "A");
    await makePage("/b", "B");
    const agent = await admin();
    const token = tokenOf((await agent.post(`/api/admin/pages/${a}/preview`)).body.url);
    const res = await request(app).get(`/api/public/preview/${token}`);
    expect(res.body.path).toBe("/a");
    expect(res.body.content.seo.title.vi).toBe("A");
  });

  it("rejects unknown tokens and stores only the hash", async () => {
    const id = await makePage("/a", "A");
    const agent = await admin();
    const token = tokenOf((await agent.post(`/api/admin/pages/${id}/preview`)).body.url);
    expect((await request(app).get("/api/public/preview/nope")).status).toBe(404);
    const rows = await prisma.previewToken.findMany();
    expect(rows).toHaveLength(1);
    expect(rows[0]?.tokenHash).toBe(createHash("sha256").update(token).digest("hex"));
    expect(rows[0]?.tokenHash).not.toBe(token);
  });
});

describe("deleteExpiredPreviewTokens", () => {
  it("removes only expired tokens", async () => {
    const { deleteExpiredPreviewTokens } = await import("../src/modules/content/preview.service.js");
    const id = await makePage("/a", "A");
    const now = new Date("2026-01-01T00:00:00.000Z");
    await prisma.previewToken.create({ data: { tokenHash: "a".repeat(64), pageId: BigInt(id), expiresAt: new Date(now.getTime() - 1) } });
    await prisma.previewToken.create({ data: { tokenHash: "b".repeat(64), pageId: BigInt(id), expiresAt: new Date(now.getTime() + 1000) } });
    expect(await deleteExpiredPreviewTokens(prisma, now)).toBe(1);
    expect(await prisma.previewToken.count()).toBe(1);
  });
});

describe("request logging", () => {
  it("never logs the preview token", async () => {
    const { Writable } = await import("node:stream");
    const { default: pino } = await import("pino");
    const { createApp } = await import("../src/app.js");
    const lines: string[] = [];
    const sink = new Writable({
      write(chunk: Buffer, _enc, cb) {
        lines.push(chunk.toString());
        cb();
      },
    });
    const logged = createApp({ prisma, config, logger: pino({ level: "info" }, sink), clock });
    const id = await makePage("/a", "A");
    await createUser(prisma, { email: "log@istt.vn" });
    const agent = await loginAs(logged, "log@istt.vn");
    const created = await agent.post(`/api/admin/pages/${id}/preview`);
    const token = tokenOf(created.body.url);
    for (const prefix of ["/api/public/preview/", "/API/PUBLIC/PREVIEW/", "/Api/Public/Preview/"]) {
      expect((await request(logged).get(`${prefix}${token}`)).status).toBe(200);
    }
    await new Promise((resolve) => setTimeout(resolve, 20));
    const output = lines.join("");
    expect(output).not.toContain(token);
    expect(output).toContain("/api/public/preview/:token");
  });
});
