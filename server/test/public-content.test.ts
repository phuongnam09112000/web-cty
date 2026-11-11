import { readFileSync } from "node:fs";
import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { normalizePath } from "../src/modules/content/public.routes.js";
import { createUser, loginAs, makeTestApp, resetDb } from "./helpers.js";

const { app, prisma } = makeTestApp();

afterAll(async () => {
  await resetDb(prisma);
  await prisma.$disconnect();
});

beforeEach(async () => {
  await resetDb(prisma);
});

const samples = JSON.parse(
  readFileSync(new URL("./fixtures/block-samples.json", import.meta.url), "utf8"),
) as Record<string, Record<string, unknown>>;

function remap(value: unknown, ids: Map<number, number>): unknown {
  if (Array.isArray(value)) return value.map((v) => remap(v, ids));
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [
        k,
        k === "mediaId" && typeof v === "number" ? (ids.get(v) ?? v) : remap(v, ids),
      ]),
    );
  }
  return value;
}

let mediaSeq = 0;

async function makeMedia(): Promise<number> {
  const tag = `a${String(mediaSeq++).padStart(15, "0")}`;
  const row = await prisma.media.create({
    data: {
      fileName: `${tag}.png`,
      originalName: "goc.png",
      mimeType: "image/png",
      sizeBytes: 10,
      width: 640,
      height: 480,
      alt: { vi: "Mô tả", en: "Alt" },
      sha256: tag.padEnd(64, "0"),
      sourcePath: "public/img/goc.png",
    },
  });
  return Number(row.id);
}

async function heroContent(title: string) {
  const a = await makeMedia();
  const b = await makeMedia();
  const data = remap(samples["home-hero"], new Map([[1, a], [2, b]]));
  return {
    seo: { title: { vi: title, en: title }, description: { vi: "D", en: "D" }, image: null },
    blocks: [{ id: "aaaaaa", type: "home-hero", hidden: false, data }],
  };
}

async function makePage(path: string, content: unknown) {
  const page = await prisma.page.create({ data: { path, name: `Trang ${path}` } });
  await prisma.pageDraft.create({ data: { pageId: page.id, content: content as object } });
  return page.id;
}

async function publish(pageId: bigint) {
  const draft = await prisma.pageDraft.findUniqueOrThrow({ where: { pageId } });
  const version = await prisma.pageVersion.create({
    data: { pageId, number: 1, content: draft.content as object },
  });
  await prisma.page.update({ where: { id: pageId }, data: { publishedVersionId: version.id } });
}

describe("normalizePath", () => {
  it("normalizes paths", () => {
    expect(normalizePath("/About/")).toBe("/about");
    expect(normalizePath("/about?x=1#y")).toBe("/about");
    expect(normalizePath("/home")).toBe("/");
    expect(normalizePath("/")).toBe("/");
    expect(normalizePath("about")).toBeNull();
    expect(normalizePath(`/${"a".repeat(191)}`)).toBeNull();
  });
});

describe("GET /api/public/pages", () => {
  it("returns 404 for an unpublished page", async () => {
    await makePage("/about", await heroContent("Nháp"));
    const res = await request(app).get("/api/public/pages").query({ path: "/about" });
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("returns the published content, not later draft edits, with resolved media", async () => {
    const pageId = await makePage("/about", await heroContent("Đã xuất bản"));
    await publish(pageId);
    await prisma.pageDraft.update({
      where: { pageId },
      data: { content: (await heroContent("Sửa sau")) as object },
    });
    const res = await request(app).get("/api/public/pages").query({ path: "/about" });
    expect(res.status).toBe(200);
    expect(res.body.path).toBe("/about");
    expect(res.body.version).toBe(1);
    expect(res.body.content.seo.title.vi).toBe("Đã xuất bản");
    expect(res.headers["cache-control"]).toBe("public, max-age=60");
    const json = JSON.stringify(res.body.content);
    expect(json).not.toContain("mediaId");
    const urls = [...json.matchAll(/"url":"(\/media\/[0-9a-f]{16}\.png)"/g)];
    expect(urls.length).toBeGreaterThan(0);
    expect(json).toContain('"sourcePath":"public/img/goc.png"');
    expect(json).toContain('"width":640');
  });

  it("supports ETag and 304", async () => {
    const pageId = await makePage("/about", await heroContent("X"));
    await publish(pageId);
    const first = await request(app).get("/api/public/pages").query({ path: "/about" });
    const etag = first.headers.etag;
    expect(etag).toBe(`W/"${pageId}-1"`);
    const second = await request(app)
      .get("/api/public/pages")
      .query({ path: "/about" })
      .set("If-None-Match", etag as string);
    expect(second.status).toBe(304);
  });

  it("normalizes the path", async () => {
    const aboutId = await makePage("/about", await heroContent("About"));
    const homeId = await makePage("/", await heroContent("Home"));
    await publish(aboutId);
    await publish(homeId);
    for (const path of ["/about", "/about/", "/About", "/about?x=1"]) {
      const res = await request(app).get("/api/public/pages").query({ path });
      expect(res.status).toBe(200);
      expect(res.body.content.seo.title.vi).toBe("About");
    }
    const home = await request(app).get("/api/public/pages").query({ path: "/home" });
    expect(home.status).toBe(200);
    expect(home.body.path).toBe("/");
    expect(home.body.content.seo.title.vi).toBe("Home");
  });

  it("returns 404 for an invalid or missing path", async () => {
    expect((await request(app).get("/api/public/pages").query({ path: "about" })).status).toBe(404);
    expect((await request(app).get("/api/public/pages")).status).toBe(404);
  });

  it("works without cookies or gateway headers", async () => {
    const pageId = await makePage("/about", await heroContent("X"));
    await publish(pageId);
    await createUser(prisma, { email: "a@istt.vn" });
    await loginAs(app, "a@istt.vn");
    const res = await request(app).get("/api/public/pages?path=/about");
    expect(res.status).toBe(200);
  });

  it("returns null for an image whose media row was deleted", async () => {
    const content = await heroContent("X");
    const pageId = await makePage("/about", content);
    await publish(pageId);
    const refs = [...JSON.stringify(content).matchAll(/"mediaId":(\d+)/g)].map((m) => BigInt(m[1] as string));
    await prisma.media.deleteMany({ where: { id: { in: refs } } });
    const res = await request(app).get("/api/public/pages").query({ path: "/about" });
    expect(res.status).toBe(200);
    expect(res.body.content.blocks[0].data.slides[0].image).toBeNull();
    expect(res.body.content.blocks[0].data.slides[1].image).toBeNull();
    const token = (await adminToken(pageId));
    const preview = await request(app).get(`/api/public/preview/${token}`);
    expect(preview.status).toBe(200);
    expect(preview.body.content.blocks[0].data.slides[0].image).toBeNull();
  });
});

async function adminToken(pageId: bigint): Promise<string> {
  await createUser(prisma, { email: "t@istt.vn" });
  const agent = await loginAs(app, "t@istt.vn");
  const res = await agent.post(`/api/admin/pages/${pageId}/preview`);
  return new URL(res.body.url).searchParams.get("preview") as string;
}
