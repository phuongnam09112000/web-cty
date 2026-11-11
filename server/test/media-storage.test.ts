import { mkdirSync, mkdtempSync, readdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { deleteMediaFile, writeMediaFile } from "../src/modules/media/media.storage.js";

describe("media storage", () => {
  it("writes atomically and leaves no temp files", async () => {
    const dir = join(mkdtempSync(join(tmpdir(), "istt-store-")), "nested");
    await writeMediaFile(dir, "a.png", Buffer.from("abc"));
    expect(readFileSync(join(dir, "a.png"), "utf8")).toBe("abc");
    expect(readdirSync(dir)).toEqual(["a.png"]);
    await deleteMediaFile(dir, "a.png");
    await deleteMediaFile(dir, "a.png");
    expect(readdirSync(dir)).toEqual([]);
  });

  it("removes the temp file when the rename fails", async () => {
    const dir = mkdtempSync(join(tmpdir(), "istt-store-"));
    mkdirSync(join(dir, "blocked.png"));
    await expect(writeMediaFile(dir, "blocked.png", Buffer.from("abc"))).rejects.toThrow();
    expect(readdirSync(dir)).toEqual(["blocked.png"]);
  });
});
