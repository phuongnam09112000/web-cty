import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createPrisma, type PrismaClient } from "../src/db.js";
import { resetDb } from "./helpers.js";

const prisma: PrismaClient = createPrisma(process.env.DATABASE_URL as string);

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  await resetDb(prisma);
});

async function createPage(path = "/about") {
  return prisma.page.create({ data: { path, name: "Giới thiệu" } });
}

describe("content tables", () => {
  it("creates all five tables", async () => {
    const rows = await prisma.$queryRaw<{ name: string }[]>`
      SELECT table_name AS name FROM information_schema.tables
      WHERE table_schema = DATABASE()
      AND table_name IN ('pages', 'page_drafts', 'page_versions', 'media', 'preview_tokens')
      ORDER BY table_name`;
    expect(rows.map((row) => row.name)).toEqual([
      "media",
      "page_drafts",
      "page_versions",
      "pages",
      "preview_tokens",
    ]);
  });

  it("rejects two versions with the same page and number", async () => {
    const page = await createPage();
    const data = { pageId: page.id, number: 1, content: { blocks: [] } };
    await prisma.pageVersion.create({ data });
    await expect(prisma.pageVersion.create({ data })).rejects.toMatchObject({ code: "P2002" });
  });

  it("rejects duplicate page paths, media file names and media hashes", async () => {
    await createPage("/x");
    await expect(createPage("/x")).rejects.toMatchObject({ code: "P2002" });
    const media = {
      fileName: "a.png",
      originalName: "a.png",
      mimeType: "image/png",
      sizeBytes: 10,
      alt: { vi: "a", en: "" },
      sha256: "a".repeat(64),
    };
    await prisma.media.create({ data: media });
    await expect(prisma.media.create({ data: { ...media, sha256: "b".repeat(64) } })).rejects.toMatchObject({
      code: "P2002",
    });
    await expect(prisma.media.create({ data: { ...media, fileName: "b.png" } })).rejects.toMatchObject({
      code: "P2002",
    });
  });

  it("deletes drafts, versions and preview tokens together with the page", async () => {
    const page = await createPage();
    await prisma.pageDraft.create({ data: { pageId: page.id, content: { blocks: [] } } });
    const version = await prisma.pageVersion.create({
      data: { pageId: page.id, number: 1, content: { blocks: [] } },
    });
    await prisma.previewToken.create({
      data: { tokenHash: "c".repeat(64), pageId: page.id, expiresAt: new Date("2026-01-01T00:30:00.000Z") },
    });
    await prisma.page.update({ where: { id: page.id }, data: { publishedVersionId: version.id } });
    await prisma.page.delete({ where: { id: page.id } });
    expect(await prisma.pageDraft.count()).toBe(0);
    expect(await prisma.pageVersion.count()).toBe(0);
    expect(await prisma.previewToken.count()).toBe(0);
  });

  it("clears published_version_id when the version is deleted", async () => {
    const page = await createPage();
    const version = await prisma.pageVersion.create({
      data: { pageId: page.id, number: 1, content: { blocks: [] } },
    });
    await prisma.page.update({ where: { id: page.id }, data: { publishedVersionId: version.id } });
    await prisma.pageVersion.delete({ where: { id: version.id } });
    const reloaded = await prisma.page.findUniqueOrThrow({ where: { id: page.id } });
    expect(reloaded.publishedVersionId).toBeNull();
  });
});
