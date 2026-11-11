import { readFileSync } from "node:fs";
import { describe, expect, expectTypeOf, it } from "vitest";
import { BLOCK_SCHEMAS, BLOCK_TYPES, blockSchema, pageContentSchema, type Block } from "../src/modules/content/blocks/index.js";

const samples = JSON.parse(
  readFileSync(new URL("./fixtures/block-samples.json", import.meta.url), "utf8"),
) as Record<string, Record<string, unknown>>;

const seo = { title: { vi: "Tiêu đề", en: "" }, description: { vi: "Mô tả", en: "" }, image: null };

function block(id: string, type = "vision") {
  return { id, type, hidden: false, data: samples[type] };
}

describe("block schemas", () => {
  it("has 20 types and a sample for each", () => {
    expect(BLOCK_TYPES).toHaveLength(20);
    expect(Object.keys(samples).sort()).toEqual([...BLOCK_TYPES].sort());
  });

  it.each(BLOCK_TYPES)("accepts the sample for %s", (type) => {
    expect(BLOCK_SCHEMAS[type].safeParse(samples[type]).success).toBe(true);
    expect(blockSchema.safeParse(block("abcdef", type)).success).toBe(true);
  });

  it.each(BLOCK_TYPES)("reports the missing field path for %s", (type) => {
    for (const field of Object.keys(samples[type])) {
      const data = { ...samples[type] };
      delete data[field];
      const result = BLOCK_SCHEMAS[type].safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((issue) => issue.path.includes(field))).toBe(true);
      }
    }
  });

  it.each([1, 3])("rejects office-map with %i offices", (count) => {
    const office = (samples["office-map"].offices as unknown[])[0];
    const data = { offices: Array.from({ length: count }, () => office) };
    expect(BLOCK_SCHEMAS["office-map"].safeParse(data).success).toBe(false);
  });

  it("rejects an unknown type", () => {
    expect(blockSchema.safeParse({ ...block("abcdef"), type: "premium" }).success).toBe(false);
  });

  it("rejects a bad block id", () => {
    expect(blockSchema.safeParse(block("AB")).success).toBe(false);
  });
});

describe("pageContentSchema", () => {
  it("accepts a valid page", () => {
    expect(pageContentSchema.safeParse({ seo, blocks: [block("aaaaaa"), block("bbbbbb")] }).success).toBe(true);
  });

  it("rejects duplicate block ids", () => {
    expect(pageContentSchema.safeParse({ seo, blocks: [block("aaaaaa"), block("aaaaaa")] }).success).toBe(false);
  });

  it("rejects 41 blocks", () => {
    const blocks = Array.from({ length: 41 }, (_, index) => block(`blk${String(index).padStart(3, "0")}`));
    expect(pageContentSchema.safeParse({ seo, blocks }).success).toBe(false);
  });

  it("accepts 40 blocks", () => {
    const blocks = Array.from({ length: 40 }, (_, index) => block(`blk${String(index).padStart(3, "0")}`));
    expect(pageContentSchema.safeParse({ seo, blocks }).success).toBe(true);
  });
});

describe("block types", () => {
  it("narrows data by type", () => {
    function firstSlideTagline(value: Block): string | null {
      switch (value.type) {
        case "home-hero":
          return value.data.slides[0].tagline.vi;
        case "office-map":
          return value.data.offices[0].shortName.vi;
        default:
          return null;
      }
    }
    expectTypeOf<Extract<Block, { type: "partners" }>["data"]["initialCount"]>().toEqualTypeOf<number>();
    const parsed = blockSchema.parse(block("abcdef", "home-hero"));
    expect(firstSlideTagline(parsed)).toBe("Chuyển đổi số toàn diện");
  });

  it("rejects an unknown key in block data", () => {
    const data = { ...samples.vision, extra: 1 };
    expect(BLOCK_SCHEMAS.vision.safeParse(data).success).toBe(false);
    expect(blockSchema.safeParse({ ...block("abcdef"), data }).success).toBe(false);
  });
});
