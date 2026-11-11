import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { storeMedia } from "../src/modules/media/media.service.js";
import { makeTestApp, resetDb } from "./helpers.js";

const { prisma, config } = makeTestApp();
const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "public", "img");

function svgFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return svgFiles(full);
    return entry.name.endsWith(".svg") ? [full] : [];
  });
}

afterAll(async () => {
  await resetDb(prisma);
  await prisma.$disconnect();
});

beforeEach(async () => {
  await resetDb(prisma);
});

describe("repository SVG files", () => {
  const files = svgFiles(root);

  it("finds the SVG files", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(files.map((file) => [file.slice(root.length + 1), file]))("stores %s as well-formed svg", async (_name, file) => {
    const dto = await storeMedia(prisma, config, { buffer: readFileSync(file), originalName: "x.svg" }, null).catch(
      (error: { status?: number }) => error,
    );
    if (!("fileName" in dto)) {
      expect(dto.status).not.toBe(415);
      return;
    }
    const stored = readFileSync(join(config.mediaDir, dto.fileName), "utf8");
    const doc = new JSDOM(stored, { contentType: "image/svg+xml" }).window.document;
    expect(doc.getElementsByTagName("parsererror").length).toBe(0);
  });
});
