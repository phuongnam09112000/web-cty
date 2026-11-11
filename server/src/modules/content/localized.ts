import { z } from "zod";

const LINE_MAX = 300;
const PARAGRAPH_MAX = 5000;

function textOf(max: number) {
  return z.strictObject({
    vi: z.string().trim().min(1).max(max),
    en: z.string().trim().max(max),
  });
}

export const localizedText = textOf(LINE_MAX);
export const localizedParagraph = textOf(PARAGRAPH_MAX);

const emphasisText = z.strictObject({
  vi: z.string().trim().max(LINE_MAX),
  en: z.string().trim().max(LINE_MAX),
});

export const heading = z.strictObject({
  lead: localizedText,
  emphasis: emphasisText,
});

export const mediaRef = z.strictObject({
  mediaId: z.number().int().positive(),
});

export const href = z.string().regex(/^(\/(?!\/)[^\s]*|#[A-Za-z][\w-]*|https:\/\/[^\s]+)$/);

export const link = z.strictObject({
  label: localizedText,
  href,
});

export type LocalizedText = z.infer<typeof localizedParagraph>;
export type Heading = z.infer<typeof heading>;
export type MediaRef = z.infer<typeof mediaRef>;
export type Link = z.infer<typeof link>;

export function pick(text: LocalizedText, lang: "vi" | "en"): string {
  if (lang === "en" && text.en.trim() !== "") {
    return text.en;
  }
  return text.vi;
}

function isLocalized(value: object): value is { vi: string; en: string } {
  const record = value as Record<string, unknown>;
  return typeof record.vi === "string" && typeof record.en === "string";
}

export function countUntranslated(value: unknown): number {
  if (Array.isArray(value)) {
    return value.reduce<number>((sum, item) => sum + countUntranslated(item), 0);
  }
  if (value !== null && typeof value === "object") {
    if (isLocalized(value)) {
      return value.vi.trim() !== "" && value.en.trim() === "" ? 1 : 0;
    }
    return Object.values(value).reduce<number>((sum, item) => sum + countUntranslated(item), 0);
  }
  return 0;
}
