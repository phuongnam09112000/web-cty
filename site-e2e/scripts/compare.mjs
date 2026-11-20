import { spawn } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { chromium } from "@playwright/test";
import { LANGS, PATHS, VIEWPORTS, captureAll, shotName, waitForUrl } from "./capture.mjs";

const argv0 = process.argv.slice(2);
const root = fileURLToPath(new URL("..", import.meta.url));
const baselineDir = join(root, ".baseline");
const currentDir = join(root, ".current");
const diffDir = join(root, ".diff");
const portIndex = argv0.indexOf("--port");
const port = portIndex >= 0 ? Number(argv0[portIndex + 1]) : 3100;
const baseUrl = `http://localhost:${port}`;
const MAX_DIFF_RATIO = 0.001;

const argv = process.argv.slice(2);
const pathsIndex = argv.indexOf("--paths");
const paths = pathsIndex >= 0 ? argv[pathsIndex + 1].split(",").filter(Boolean) : PATHS;

function pad(png, width, height) {
  if (png.width === width && png.height === height) return png;
  const out = new PNG({ width, height });
  for (let i = 0; i < out.data.length; i += 4) {
    out.data[i] = 255;
    out.data[i + 1] = 0;
    out.data[i + 2] = 255;
    out.data[i + 3] = 255;
  }
  PNG.bitblt(png, out, 0, 0, png.width, png.height, 0, 0);
  return out;
}

async function assertNoOverride() {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.route("**/api/**", (route) => route.abort());
    await page.goto(`${baseUrl}/`, { waitUntil: "load" });
    const active = await page.evaluate(() => window.__cmsOverrideActive === true);
    if (active) {
      throw new Error(
        `Website ở cổng ${port} đang chạy với REACT_APP_CMS_PATHS_OVERRIDE; hãy tắt nó hoặc dùng --port khác để script tự khởi động website`,
      );
    }
  } finally {
    await browser.close();
  }
}

async function startServerIfNeeded() {
  let running = false;
  try {
    running = (await fetch(`${baseUrl}/`)).ok;
  } catch {
    running = false;
  }
  if (running) {
    await assertNoOverride();
    return () => {};
  }
  const server = spawn("npx", ["react-scripts", "start"], {
    cwd: join(root, ".."),
    env: { ...process.env, BROWSER: "none", PORT: String(port), REACT_APP_CMS_PATHS_OVERRIDE: "" },
    stdio: "ignore",
    detached: true,
  });
  const stop = () => {
    try {
      process.kill(-server.pid);
    } catch {}
  };
  process.on("exit", stop);
  await waitForUrl(`${baseUrl}/`);
  return stop;
}

const stop = await startServerIfNeeded();

let failed = 0;
let maxRatio = 0;
try {
  await rm(currentDir, { recursive: true, force: true });
  await rm(diffDir, { recursive: true, force: true });
  await mkdir(diffDir, { recursive: true });
  await captureAll({ baseUrl, outDir: currentDir, paths, log: () => {} });
  for (const path of paths) {
    for (const { width } of VIEWPORTS) {
      for (const lang of LANGS) {
        const name = shotName(path, width, lang);
        const expected = PNG.sync.read(await readFile(join(baselineDir, name)));
        const actual = PNG.sync.read(await readFile(join(currentDir, name)));
        const w = Math.max(expected.width, actual.width);
        const h = Math.max(expected.height, actual.height);
        const a = pad(expected, w, h);
        const b = pad(actual, w, h);
        const diff = new PNG({ width: w, height: h });
        const count = pixelmatch(a.data, b.data, diff.data, w, h, { threshold: 0.1 });
        const ratio = count / (w * h);
        maxRatio = Math.max(maxRatio, ratio);
        const ok = ratio <= MAX_DIFF_RATIO;
        if (!ok) {
          failed += 1;
          await writeFile(join(diffDir, name), PNG.sync.write(diff));
        }
        console.log(`${ok ? "PASS" : "FAIL"} ${name} ${(ratio * 100).toFixed(4)}%`);
      }
    }
  }
} finally {
  stop();
}
console.log(`Sai khác lớn nhất: ${(maxRatio * 100).toFixed(4)}%`);
if (failed > 0) {
  console.error(`${failed} ảnh vượt ngưỡng 0,1%; xem ${diffDir}`);
  process.exit(1);
}
