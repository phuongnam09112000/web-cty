import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { test } from "@playwright/test";

const root = fileURLToPath(new URL("..", import.meta.url));
const source = readFileSync(fileURLToPath(new URL("../../src/cms/cmsPaths.ts", import.meta.url)), "utf8");
const paths = Array.from(source.matchAll(/"(\/[^"]*)"/g), (match) => match[1]);

test("ảnh chụp các trang đã chuyển khớp với ảnh gốc", async () => {
  test.skip(paths.length === 0, "CMS_PATHS đang rỗng");
  test.setTimeout(30 * 60_000);
  execFileSync("node", ["scripts/compare.mjs", "--paths", paths.join(",")], { cwd: root, stdio: "inherit" });
});
