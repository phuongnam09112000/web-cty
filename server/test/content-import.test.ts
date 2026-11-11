import { cpSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { importContent } from "../src/cli/content-import.js";
import { makeTestConfig, makeTestApp, resetDb } from "./helpers.js";

const { prisma } = makeTestApp();
const SEED = resolve(import.meta.dirname, "fixtures/seed-mini");
const PUBLIC = join(SEED, "public");

afterAll(async () => {
  await resetDb(prisma);
  await prisma.$disconnect();
});

beforeEach(async () => {
  await resetDb(prisma);
});

function setup(seedDir = SEED, force = false) {
  const config = makeTestConfig();
  const fallbackOut = join(mkdtempSync(join(tmpdir(), "istt-fallback-")), "cms-fallback.json");
  const run = (overrides: Partial<{ seedDir: string; force: boolean }> = {}) =>
    importContent(
      { prisma, config },
      { seedDir, publicDir: PUBLIC, fallbackOut, force, actorUserId: null, ...overrides },
    );
  return { config, fallbackOut, run };
}

async function snapshot() {
  return {
    pages: await prisma.page.count(),
    drafts: await prisma.pageDraft.count(),
    versions: await prisma.pageVersion.count(),
  };
}

function copySeed(mutate: (dir: string) => void): string {
  const dir = mkdtempSync(join(tmpdir(), "istt-seed-"));
  cpSync(SEED, dir, { recursive: true });
  mutate(dir);
  return dir;
}

describe("importContent", () => {
  it("imports an empty database as published version 1 with media and fallback", async () => {
    const { run, fallbackOut } = setup();
    expect(await run()).toEqual({ pages: 2, media: 2 });
    const pages = await prisma.page.findMany({ orderBy: { path: "asc" }, include: { versions: true, draft: true } });
    expect(pages.map((p) => p.path)).toEqual(["/mini-a", "/mini-b"]);
    for (const page of pages) {
      expect(page.versions.map((v) => v.number)).toEqual([1]);
      expect(page.publishedVersionId).toBe(page.versions[0]?.id);
      expect(page.draft?.content).toEqual(page.versions[0]?.content);
    }
    const media = await prisma.media.findMany({ orderBy: { sourcePath: "asc" } });
    expect(media.map((m) => m.sourcePath)).toEqual(["/img/a.png", "/img/b.png"]);
    const fallback = JSON.parse(readFileSync(fallbackOut, "utf8")) as Record<string, { blocks: { data: { image: unknown } }[] }>;
    expect(Object.keys(fallback)).toEqual(["/mini-a", "/mini-b"]);
    expect(fallback["/mini-a"]?.blocks[0]?.data.image).toEqual({
      url: "/img/a.png",
      width: 4,
      height: 3,
      alt: { vi: "", en: "" },
      sourcePath: "/img/a.png",
    });
  });

  it("writes a deterministic fallback file", async () => {
    const { run, fallbackOut } = setup();
    await run();
    const first = readFileSync(fallbackOut, "utf8");
    await run({ force: true });
    expect(readFileSync(fallbackOut, "utf8")).toBe(first);
    expect(first.endsWith("}\n")).toBe(true);
  });

  it("refuses to run again without force and leaves the database unchanged", async () => {
    const { run } = setup();
    await run();
    const before = await snapshot();
    await expect(run()).rejects.toThrow("Đã có dữ liệu trang; dùng --force để tạo phiên bản mới");
    expect(await snapshot()).toEqual(before);
  });

  it("creates version 2 with force and keeps version 1", async () => {
    const { run } = setup();
    await run();
    await run({ force: true });
    const pages = await prisma.page.findMany({ include: { versions: { orderBy: { number: "asc" } } } });
    expect(pages).toHaveLength(2);
    for (const page of pages) {
      expect(page.versions.map((v) => v.number)).toEqual([1, 2]);
      expect(page.publishedVersionId).toBe(page.versions[1]?.id);
    }
    expect(await prisma.media.count()).toBe(2);
  });

  it("fails naming a missing image and changes nothing", async () => {
    const dir = copySeed((d) => {
      const file = join(d, "mini-b.json");
      writeFileSync(file, readFileSync(file, "utf8").replace("/img/b.png", "/img/missing.png"));
    });
    const { run } = setup(dir);
    await expect(run()).rejects.toThrow("/img/missing.png");
    expect(await snapshot()).toEqual({ pages: 0, drafts: 0, versions: 0 });
    expect(await prisma.media.count()).toBe(0);
  });

  it("fails with the field path for malformed content", async () => {
    const dir = copySeed((d) => {
      const file = join(d, "mini-b.json");
      writeFileSync(file, readFileSync(file, "utf8").replace('"buttonLabel": { "vi": "Xem thêm"', '"buttonLabel": { "vi": ""'));
    });
    const { run } = setup(dir);
    await expect(run()).rejects.toThrow(/mini-b\.json.*blocks\.0\.data\.buttonLabel\.vi/);
    expect(await snapshot()).toEqual({ pages: 0, drafts: 0, versions: 0 });
  });

  it("rejects non-normalized paths and image sources escaping the public dir", async () => {
    const badPath = copySeed((d) => {
      const file = join(d, "mini-a.json");
      writeFileSync(file, readFileSync(file, "utf8").replace('"/mini-a"', '"/Mini-A/"'));
    });
    await expect(setup(badPath).run()).rejects.toThrow("mini-a.json");
    const escape = copySeed((d) => {
      const file = join(d, "mini-a.json");
      writeFileSync(file, readFileSync(file, "utf8").replace('"/img/a.png"', '"/../seed-mini.json"'));
    });
    await expect(setup(escape).run()).rejects.toThrow("mini-a.json");
    expect(await snapshot()).toEqual({ pages: 0, drafts: 0, versions: 0 });
  });
});
