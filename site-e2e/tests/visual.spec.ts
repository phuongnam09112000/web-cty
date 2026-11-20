import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { test } from "@playwright/test";

const root = fileURLToPath(new URL("..", import.meta.url));
const source = readFileSync(fileURLToPath(new URL("../../src/cms/cmsPaths.ts", import.meta.url)), "utf8");

function readMigratedPaths(text: string): string[] {
  const match = /MIGRATED_PATHS\s*(?::[^=]+)?=\s*\[([^\]]*)\]/.exec(text);
  if (!match) throw new Error("Không tìm thấy mảng MIGRATED_PATHS trong src/cms/cmsPaths.ts");
  const inner = match[1];
  const paths = Array.from(inner.matchAll(/(['"])(\/[^'"]*)\1/g), (item) => item[2]);
  const leftover = inner.replace(/(['"])(\/[^'"]*)\1/g, "").replace(/[\s,]/g, "");
  if (leftover !== "") throw new Error(`Không đọc được MIGRATED_PATHS: còn lại "${leftover}"`);
  return paths;
}

const paths = readMigratedPaths(source);

test("ảnh chụp các trang đã chuyển khớp với ảnh gốc", async () => {
  test.skip(paths.length === 0, "MIGRATED_PATHS đang rỗng");
  test.setTimeout(45 * 60_000);
  execFileSync("node", ["scripts/compare.mjs", "--port", "3102", "--paths", paths.join(",")], {
    cwd: root,
    stdio: "inherit",
  });
});
