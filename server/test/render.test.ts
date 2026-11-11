import { readFileSync, writeFileSync } from "node:fs";
import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createUser, loginAs, makeTestApp, resetDb, TEST_INDEX_HTML } from "./helpers.js";

const { app, prisma, config } = makeTestApp();

afterAll(async () => {
  await resetDb(prisma);
  await prisma.$disconnect();
});

beforeEach(async () => {
  writeFileSync(config.websiteIndexPath, TEST_INDEX_HTML);
  await resetDb(prisma);
  await createUser(prisma, { email: "r@istt.vn" });
});

type Seo = { title: { vi: string; en: string }; description: { vi: string; en: string }; image: { mediaId: number } | null };

function seoOf(title: string, en = "", image: Seo["image"] = null): Seo {
  return { title: { vi: title, en }, description: { vi: "Mô tả & <b>", en: "" }, image };
}

async function makeMedia(): Promise<number> {
  const row = await prisma.media.create({
    data: {
      fileName: "b000000000000001.png",
      originalName: "goc.png",
      mimeType: "image/png",
      sizeBytes: 10,
      width: 10,
      height: 10,
      alt: { vi: "a", en: "a" },
      sha256: "b".repeat(64),
    },
  });
  return Number(row.id);
}

async function publishedPage(path: string, seo: Seo): Promise<number> {
  const page = await prisma.page.create({ data: { path, name: path } });
  const content = { seo, blocks: [] };
  await prisma.pageDraft.create({ data: { pageId: page.id, content } });
  const version = await prisma.pageVersion.create({ data: { pageId: page.id, number: 1, content } });
  await prisma.page.update({ where: { id: page.id }, data: { publishedVersionId: version.id } });
  return Number(page.id);
}

const get = (path: string, lang?: string) =>
  request(app).get("/api/public/render").query(lang === undefined ? { path } : { path, lang });

describe("GET /api/public/render", () => {
  it("injects Vietnamese SEO tags", async () => {
    const mediaId = await makeMedia();
    await publishedPage("/gioi-thieu", seoOf("Giới thiệu", "", { mediaId }));
    const res = await get("/gioi-thieu", "vi");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toBe("text/html; charset=utf-8");
    expect(res.headers["cache-control"]).toBe("no-cache");
    const html = res.text;
    expect(html).toContain("<title>Giới thiệu</title>");
    expect(html).toContain('<meta name="description" content="Mô tả &amp; &lt;b&gt;" />');
    expect(html).toContain('<meta property="og:title" content="Giới thiệu" />');
    expect(html).toContain('<meta property="og:image" content="http://site.test/media/b000000000000001.png" />');
    expect(html).toContain('<meta property="og:url" content="http://site.test/gioi-thieu" />');
    expect(html).toContain('<meta property="og:type" content="website" />');
    expect(html).toContain('<meta property="og:locale" content="vi_VN" />');
    expect(html).toContain('<html lang="vi">');
    expect(html.match(/og:url/g)).toHaveLength(1);
    expect(html.match(/og:locale/g)).toHaveLength(1);
    expect(html.match(/name="description"/g)).toHaveLength(1);
    expect(html).not.toContain("Old");
  });

  it("falls back to Vietnamese text for English with an empty translation", async () => {
    await publishedPage("/gioi-thieu", seoOf("Giới thiệu"));
    const html = (await get("/gioi-thieu", "en")).text;
    expect(html).toContain("<title>Giới thiệu</title>");
    expect(html).toContain('content="http://site.test/gioi-thieu?lang=en"');
    expect(html).toContain('<html lang="en">');
    expect(html).toContain('content="en_US"');
    expect(html).not.toContain("og:image");
  });

  it("uses English text when translated", async () => {
    await publishedPage("/x", seoOf("Việt", "English"));
    expect((await get("/x", "en")).text).toContain("<title>English</title>");
  });

  it("treats an unknown language as Vietnamese", async () => {
    await publishedPage("/gioi-thieu", seoOf("Giới thiệu", "About"));
    const html = (await get("/gioi-thieu", "fr")).text;
    expect(html).toContain("<title>Giới thiệu</title>");
    expect(html).toContain('<html lang="vi">');
    expect(html).not.toContain("?lang=");
  });

  it("escapes injected values", async () => {
    await publishedPage("/xss", seoOf(`"><script>alert('x')</script>`));
    const html = (await get("/xss")).text;
    expect(html).not.toContain("<script>");
    expect(html).toContain("<title>&quot;&gt;&lt;script&gt;alert(&#39;x&#39;)&lt;/script&gt;</title>");
    expect(html).toContain('content="&quot;&gt;&lt;script&gt;');
  });

  it("returns the original file for a page that does not exist", async () => {
    const res = await get("/khong-co");
    expect(res.status).toBe(200);
    expect(res.text).toBe(TEST_INDEX_HTML);
    expect((await get("relative")).text).toBe(TEST_INDEX_HTML);
    expect((await request(app).get("/api/public/render")).text).toBe(TEST_INDEX_HTML);
  });

  it("returns the original file for an unpublished page", async () => {
    const page = await prisma.page.create({ data: { path: "/nhap", name: "n" } });
    await prisma.pageDraft.create({ data: { pageId: page.id, content: { seo: seoOf("Nháp"), blocks: [] } } });
    expect((await get("/nhap")).text).toBe(TEST_INDEX_HTML);
  });

  it("serves a new title after publish and re-reads the file only then", async () => {
    const id = await publishedPage("/a", seoOf("Cũ"));
    expect((await get("/a")).text).toContain("<title>Cũ</title>");
    writeFileSync(config.websiteIndexPath, TEST_INDEX_HTML.replace("<body>", "<body><!--changed-->"));
    expect((await get("/a")).text).not.toContain("changed");
    expect((await get("/other")).text).not.toContain("changed");

    const agent = await loginAs(app, "r@istt.vn");
    const saved = await agent.put(`/api/admin/pages/${id}/draft`).send({ content: { seo: seoOf("Mới"), blocks: [] }, revision: 1 });
    expect(saved.status).toBe(200);
    expect((await get("/a")).text).toContain("<title>Cũ</title>");
    expect((await agent.post(`/api/admin/pages/${id}/publish`).send({})).status).toBe(200);
    const after = (await get("/a")).text;
    expect(after).toContain("<title>Mới</title>");
    expect(after).toContain("changed");
    expect(readFileSync(config.websiteIndexPath, "utf8")).toContain("changed");
  });
});
