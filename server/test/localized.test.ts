import { describe, expect, it } from "vitest";
import { countUntranslated, href, localizedText, pick } from "../src/modules/content/localized.js";

describe("pick", () => {
  it("falls back to vi when en is empty", () => {
    expect(pick({ vi: "A", en: "" }, "en")).toBe("A");
  });

  it("falls back to vi when en is blank", () => {
    expect(pick({ vi: "A", en: "  " }, "en")).toBe("A");
  });

  it("uses en when present", () => {
    expect(pick({ vi: "A", en: "B" }, "en")).toBe("B");
  });

  it("uses vi for vi", () => {
    expect(pick({ vi: "A", en: "B" }, "vi")).toBe("A");
  });
});

describe("countUntranslated", () => {
  it("counts nested missing translations", () => {
    const value = {
      title: { vi: "Một", en: "" },
      items: [{ name: { vi: "Hai", en: "Two" } }, { name: { vi: "Ba", en: "  " } }],
      other: { vi: "", en: "" },
    };
    expect(countUntranslated(value)).toBe(2);
  });
});

describe("localizedText", () => {
  it("rejects blank vi", () => {
    expect(localizedText.safeParse({ vi: " ", en: "" }).success).toBe(false);
  });

  it("rejects text over 300 characters", () => {
    expect(localizedText.safeParse({ vi: "a".repeat(301), en: "" }).success).toBe(false);
  });
});

describe("href", () => {
  it.each(["/about", "#solutions", "https://istt.com.vn"])("accepts %s", (value) => {
    expect(href.safeParse(value).success).toBe(true);
  });

  it.each(["javascript:alert(1)", "http://x", "//evil.com"])("rejects %s", (value) => {
    expect(href.safeParse(value).success).toBe(false);
  });
});
