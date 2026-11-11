import { existsSync } from "node:fs";
import { deflateSync } from "node:zlib";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { EDITOR_ROLE_NAME } from "../src/modules/permissions/catalog.js";
import { createUser, loginAs, makeTestApp, resetDb } from "./helpers.js";

const { app, prisma, config } = makeTestApp();

afterAll(async () => {
  await resetDb(prisma);
  await prisma.$disconnect();
});

beforeEach(async () => {
  await resetDb(prisma);
});

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff]! ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

function makePng(width: number, height: number, shade = 0): Buffer {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 2;
  const row = Buffer.alloc(1 + width * 3, shade);
  row[0] = 0;
  const raw = Buffer.concat(Array.from({ length: height }, () => row));
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

async function editor() {
  await createUser(prisma, { email: "ed@istt.vn", roleName: EDITOR_ROLE_NAME });
  return loginAs(app, "ed@istt.vn");
}

async function viewer() {
  await prisma.role.create({ data: { name: "Chỉ xem" } });
  await createUser(prisma, { email: "v@istt.vn", roleName: "Chỉ xem" });
  return loginAs(app, "v@istt.vn");
}

async function upload(agent: Awaited<ReturnType<typeof editor>>, buffer: Buffer, name = "a.png") {
  return agent.post("/api/admin/media").attach("file", buffer, name);
}

async function pageUsing(path: string, mediaId: number, where: "draft" | "published") {
  const page = await prisma.page.create({ data: { path, name: `Trang ${path}` } });
  const content = { seo: { title: { vi: "T", en: "" }, description: { vi: "D", en: "" }, image: null }, blocks: [{ data: { image: { mediaId } } }] };
  if (where === "draft") {
    await prisma.pageDraft.create({ data: { pageId: page.id, content } });
  } else {
    const version = await prisma.pageVersion.create({ data: { pageId: page.id, number: 1, content } });
    await prisma.page.update({ where: { id: page.id }, data: { publishedVersionId: version.id } });
  }
  return page;
}

describe("POST /media", () => {
  it("stores a PNG with dimensions and audits it", async () => {
    const agent = await editor();
    const res = await upload(agent, makePng(3, 2));
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      originalName: "a.png",
      mimeType: "image/png",
      width: 3,
      height: 2,
      alt: { vi: "", en: "" },
      sourcePath: null,
    });
    expect(res.body.fileName).toMatch(/^[0-9a-f]{16}\.png$/);
    expect(res.body.url).toBe(`/media/${res.body.fileName}`);
    expect(existsSync(`${config.mediaDir}/${res.body.fileName}`)).toBe(true);
    const audit = await prisma.auditLog.findFirst({ where: { action: "media.upload" } });
    expect(audit?.targetId).toBe(String(res.body.id));
  });

  it("returns the existing record for identical content", async () => {
    const agent = await editor();
    const first = await upload(agent, makePng(3, 2));
    const second = await upload(agent, makePng(3, 2), "other.png");
    expect(second.status).toBe(201);
    expect(second.body.id).toBe(first.body.id);
    expect(await prisma.media.count()).toBe(1);
  });

  it("rejects a text file named .png with 415", async () => {
    const agent = await editor();
    const res = await upload(agent, Buffer.from("hello world, not an image"));
    expect(res.status).toBe(415);
    expect(res.body.error.code).toBe("UNSUPPORTED_MEDIA_TYPE");
    expect(await prisma.media.count()).toBe(0);
  });

  it("rejects files over 5 MB with 413", async () => {
    const agent = await editor();
    const big = Buffer.concat([makePng(2, 2), Buffer.alloc(5 * 1024 * 1024 + 1 - makePng(2, 2).length)]);
    expect(big.length).toBe(5 * 1024 * 1024 + 1);
    const res = await upload(agent, big);
    expect(res.status).toBe(413);
    expect(res.body.error.code).toBe("PAYLOAD_TOO_LARGE");
  });

  it("rejects much larger files with 413", async () => {
    const agent = await editor();
    const res = await upload(agent, Buffer.alloc(6 * 1024 * 1024));
    expect(res.status).toBe(413);
  });

  it("rejects images wider than 8000 px with 400", async () => {
    const agent = await editor();
    const res = await upload(agent, makePng(8001, 10));
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects a request without a file with 400", async () => {
    const agent = await editor();
    const res = await agent.post("/api/admin/media");
    expect(res.status).toBe(400);
  });

  it("stores SVG sanitized", async () => {
    const agent = await editor();
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="20"><script>alert(1)</script><path d="M0 0L5 5"/></svg>';
    const res = await upload(agent, Buffer.from(svg), "logo.svg");
    expect(res.status).toBe(201);
    expect(res.body.mimeType).toBe("image/svg+xml");
    expect(res.body.fileName).toMatch(/\.svg$/);
    const { readFile } = await import("node:fs/promises");
    const stored = await readFile(`${config.mediaDir}/${res.body.fileName}`, "utf8");
    expect(stored).not.toContain("script");
    expect(stored).toContain("<path");
  });

  it("requires media.manage", async () => {
    const agent = await viewer();
    const res = await upload(agent, makePng(2, 2));
    expect(res.status).toBe(403);
  });
});

describe("GET /media", () => {
  it("lists for any logged-in user", async () => {
    const agent = await editor();
    await upload(agent, makePng(2, 2));
    const res = await (await viewer()).get("/api/admin/media");
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.items[0].url).toMatch(/^\/media\//);
  });

  it("searches originalName and alt.vi ignoring diacritics", async () => {
    const agent = await editor();
    const a = await upload(agent, makePng(2, 2, 1), "Đội ngũ tư vấn.png");
    const b = await upload(agent, makePng(2, 2, 2), "b.png");
    await upload(agent, makePng(2, 2, 3), "c.png");
    await agent.patch(`/api/admin/media/${b.body.id}`).send({ alt: { vi: "Văn phòng Hà Nội", en: "" } });
    const byName = await agent.get("/api/admin/media").query({ q: "ngu tu van" });
    expect(byName.body.items.map((m: { id: number }) => m.id)).toEqual([a.body.id]);
    const byAlt = await agent.get("/api/admin/media").query({ q: "van phong" });
    expect(byAlt.body.items.map((m: { id: number }) => m.id)).toEqual([b.body.id]);
    const none = await agent.get("/api/admin/media").query({ q: "%" });
    expect(none.body.total).toBe(0);
  });
});

describe("PATCH /media/:id", () => {
  it("saves alt and audits", async () => {
    const agent = await editor();
    const created = await upload(agent, makePng(2, 2));
    const res = await agent
      .patch(`/api/admin/media/${created.body.id}`)
      .send({ alt: { vi: "Mô tả", en: "Description" } });
    expect(res.status).toBe(200);
    expect(res.body.alt).toEqual({ vi: "Mô tả", en: "Description" });
    const row = await prisma.media.findUniqueOrThrow({ where: { id: BigInt(created.body.id) } });
    expect(row.alt).toEqual({ vi: "Mô tả", en: "Description" });
    expect(await prisma.auditLog.count({ where: { action: "media.update" } })).toBe(1);
  });

  it("requires media.manage and an existing record", async () => {
    const agent = await editor();
    const created = await upload(agent, makePng(2, 2));
    const denied = await (await viewer()).patch(`/api/admin/media/${created.body.id}`).send({ alt: { vi: "", en: "" } });
    expect(denied.status).toBe(403);
    const missing = await agent.patch("/api/admin/media/99999").send({ alt: { vi: "", en: "" } });
    expect(missing.status).toBe(404);
  });
});

describe("DELETE /media/:id", () => {
  it("deletes an unused image, its file and audits", async () => {
    const agent = await editor();
    const created = await upload(agent, makePng(2, 2));
    const res = await agent.delete(`/api/admin/media/${created.body.id}`);
    expect(res.status).toBe(204);
    expect(existsSync(`${config.mediaDir}/${created.body.fileName}`)).toBe(false);
    expect(await prisma.media.count()).toBe(0);
    expect(await prisma.auditLog.count({ where: { action: "media.delete" } })).toBe(1);
  });

  it("refuses with 409 when used in a draft", async () => {
    const agent = await editor();
    const created = await upload(agent, makePng(2, 2));
    await pageUsing("/gioi-thieu", created.body.id, "draft");
    const res = await agent.delete(`/api/admin/media/${created.body.id}`);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("CONFLICT");
    expect(res.body.error.fields.pages).toContain("/gioi-thieu");
    expect(existsSync(`${config.mediaDir}/${created.body.fileName}`)).toBe(true);
  });

  it("refuses with 409 when used in the published version", async () => {
    const agent = await editor();
    const created = await upload(agent, makePng(2, 2));
    await pageUsing("/lien-he", created.body.id, "published");
    const res = await agent.delete(`/api/admin/media/${created.body.id}`);
    expect(res.status).toBe(409);
  });

  it("requires media.manage", async () => {
    const agent = await editor();
    const created = await upload(agent, makePng(2, 2));
    expect((await (await viewer()).delete(`/api/admin/media/${created.body.id}`)).status).toBe(403);
  });
});

describe("GET /media/:id/usage", () => {
  it("lists pages using the image once each", async () => {
    const agent = await editor();
    const created = await upload(agent, makePng(2, 2));
    const other = await upload(agent, makePng(2, 2, 9));
    const p1 = await pageUsing("/a", created.body.id, "draft");
    const p2 = await pageUsing("/b", created.body.id, "published");
    await pageUsing("/c", other.body.id, "draft");
    const res = await (await viewer()).get(`/api/admin/media/${created.body.id}/usage`);
    expect(res.status).toBe(200);
    expect(res.body.pages.map((p: { id: number }) => p.id).sort()).toEqual([Number(p1.id), Number(p2.id)].sort());
    expect(res.body.pages[0]).toEqual(expect.objectContaining({ path: expect.any(String), name: expect.any(String) }));
  });

  it("returns 404 for unknown image", async () => {
    const agent = await editor();
    expect((await agent.get("/api/admin/media/99999/usage")).status).toBe(404);
  });
});

describe("static serving", () => {
  it("serves stored files at /media outside production", async () => {
    const agent = await editor();
    const created = await upload(agent, makePng(2, 2));
    const res = await (await import("supertest")).default(app).get(created.body.url);
    expect(res.status).toBe(200);
    expect(res.headers["cache-control"]).toContain("immutable");
  });
});
