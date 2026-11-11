import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { pageContentSchema } from "../src/modules/content/blocks/index.js";
import { normalizePath } from "../src/modules/content/public.routes.js";

const SEED_DIR = resolve(import.meta.dirname, "../content-seed");
const PUBLIC_DIR = resolve(import.meta.dirname, "../../public");
const VN_FILE = resolve(import.meta.dirname, "../../src/locales/vn/translation.json");

const EXPECTED_PATHS = [
  "/",
  "/about",
  "/contact",
  "/digital-transformation",
  "/information-communication-technology",
  "/integration",
  "/secure-defense",
  "/services",
  "/software",
  "/support",
];

type SeedFile = { file: string; path: string; name: string; content: unknown };

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isSrcRef(value: unknown): value is { src: string } {
  return isRecord(value) && Object.keys(value).length === 1 && typeof value.src === "string";
}

function mapRefs(value: unknown, fn: (src: string) => unknown): unknown {
  if (Array.isArray(value)) return value.map((item) => mapRefs(item, fn));
  if (isSrcRef(value)) return fn(value.src);
  if (isRecord(value)) return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, mapRefs(v, fn)]));
  return value;
}

function collectSources(value: unknown, out: Set<string>): void {
  mapRefs(value, (src) => {
    out.add(src);
    return null;
  });
}

function collectLocalized(value: unknown, out: { vi: string; en: string }[]): void {
  if (Array.isArray(value)) {
    for (const item of value) collectLocalized(item, out);
    return;
  }
  if (!isRecord(value)) return;
  if (typeof value.vi === "string" && typeof value.en === "string") {
    out.push({ vi: value.vi, en: value.en });
    return;
  }
  for (const item of Object.values(value)) collectLocalized(item, out);
}

function loadSeeds(): SeedFile[] {
  if (!existsSync(SEED_DIR)) return [];
  return readdirSync(SEED_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((file) => {
      const raw = JSON.parse(readFileSync(join(SEED_DIR, file), "utf8")) as Record<string, unknown>;
      return { file, path: raw.path as string, name: raw.name as string, content: raw.content };
    });
}

const seeds = loadSeeds();

describe("content seed", () => {
  it("has exactly the 10 expected pages with unique normalized paths", () => {
    expect(seeds.map((s) => s.path).sort()).toEqual([...EXPECTED_PATHS].sort());
    expect(new Set(seeds.map((s) => s.path)).size).toBe(seeds.length);
    for (const seed of seeds) {
      expect(normalizePath(seed.path), seed.file).toBe(seed.path);
      expect(seed.name.trim(), seed.file).not.toBe("");
    }
  });

  it("has content that satisfies the page schema once src is swapped for a media id", () => {
    expect(seeds.length).toBeGreaterThan(0);
    for (const seed of seeds) {
      const probe = mapRefs(seed.content, () => ({ mediaId: 1 }));
      const result = pageContentSchema.safeParse(probe);
      expect(result.success, `${seed.file}: ${result.success ? "" : JSON.stringify(result.error.issues)}`).toBe(true);
    }
  });

  it("references only images that exist in public", () => {
    const sources = new Set<string>();
    for (const seed of seeds) collectSources(seed.content, sources);
    expect(sources.size).toBeGreaterThan(0);
    for (const src of sources) {
      expect(src.startsWith("/"), src).toBe(true);
      expect(existsSync(join(PUBLIC_DIR, src)), src).toBe(true);
    }
  });

  it("never leaves an English translation key as the Vietnamese text when a Vietnamese translation exists", () => {
    const vn = JSON.parse(readFileSync(VN_FILE, "utf8")) as Record<string, string>;
    const texts: { vi: string; en: string }[] = [];
    for (const seed of seeds) collectLocalized(seed.content, texts);
    expect(texts.length).toBeGreaterThan(0);
    for (const { vi, en } of texts) {
      const translated = Object.prototype.hasOwnProperty.call(vn, en) ? vn[en] : undefined;
      if (translated !== undefined && translated !== en) {
        expect(vi, `"${en}" has a Vietnamese translation`).not.toBe(en);
      }
    }
  });
});
