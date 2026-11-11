import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { assertMediaExist, collectMediaIds } from "../src/modules/content/media-refs.js";
import type { PageContent } from "../src/modules/content/blocks/index.js";
import { makeTestApp, resetDb } from "./helpers.js";

const { prisma } = makeTestApp();

afterAll(async () => {
  await resetDb(prisma);
  await prisma.$disconnect();
});

beforeEach(async () => {
  await resetDb(prisma);
});

function content(seoImage: number | null, ids: number[]): PageContent {
  return {
    seo: { title: { vi: "T", en: "" }, description: { vi: "D", en: "" }, image: seoImage === null ? null : { mediaId: seoImage } },
    blocks: [{ id: "abcdef", type: "x", hidden: false, data: { items: ids.map((mediaId) => ({ image: { mediaId } })) } }],
  } as unknown as PageContent;
}

describe("collectMediaIds", () => {
  it("finds ids in seo and nested block data", () => {
    expect([...collectMediaIds(content(5, [7, 9, 7]))].sort()).toEqual([5, 7, 9]);
    expect(collectMediaIds(content(null, [])).size).toBe(0);
  });
});

describe("assertMediaExist", () => {
  it("passes when all exist", async () => {
    const m = await prisma.media.create({
      data: { fileName: "a.png", originalName: "a.png", mimeType: "image/png", sizeBytes: 1, alt: { vi: "", en: "" }, sha256: "a".repeat(64) },
    });
    await expect(assertMediaExist(prisma, content(Number(m.id), [Number(m.id)]))).resolves.toBeUndefined();
  });

  it("reports missing ids with field paths", async () => {
    const error = await assertMediaExist(prisma, content(41, [42])).catch((e: unknown) => e);
    expect(error).toMatchObject({
      status: 400,
      code: "VALIDATION_ERROR",
      fields: {
        "seo.image.mediaId": "Ảnh không tồn tại",
        "blocks.0.data.items.0.image.mediaId": "Ảnh không tồn tại",
      },
    });
  });
});
