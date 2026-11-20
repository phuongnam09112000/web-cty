import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "@playwright/test";

export const PATHS = [
  "/",
  "/about",
  "/services",
  "/contact",
  "/information-communication-technology",
  "/secure-defense",
  "/digital-transformation",
  "/integration",
  "/software",
  "/support",
];

export const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 834, height: 1112 },
  { width: 390, height: 844 },
];

export const LANGS = ["vi", "en"];

export function shotName(path, width, lang) {
  const slug = path === "/" ? "home" : path.replace(/^\//, "").replace(/\//g, "_");
  return `${slug}-${width}-${lang}.png`;
}

async function settle(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState("networkidle");
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const viewport = page.viewportSize();
  for (let y = 0; y < height; y += Math.floor(viewport.height / 2)) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(120);
  }
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(300);
  await page.waitForLoadState("networkidle");
  await page.evaluate(() =>
    Promise.all(
      Array.from(document.images).map((img) =>
        img.complete ? undefined : new Promise((resolve) => { img.onload = resolve; img.onerror = resolve; }),
      ),
    ),
  );
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
}

export async function captureAll({ baseUrl, outDir, paths = PATHS, log = console.log }) {
  await mkdir(outDir, { recursive: true });
  const browser = await chromium.launch();
  const files = [];
  try {
    for (const viewport of VIEWPORTS) {
      for (const lang of LANGS) {
        const context = await browser.newContext({
          viewport,
          reducedMotion: "reduce",
          deviceScaleFactor: 1,
          locale: lang === "vi" ? "vi-VN" : "en-US",
        });
        await context.addInitScript((value) => {
          localStorage.setItem("i18nextLng", value);
          const nativeSetInterval = window.setInterval.bind(window);
          window.setInterval = (handler, delay, ...args) =>
            nativeSetInterval(handler, delay >= 4000 ? 2147483647 : delay, ...args);
        }, lang);
        await context.route("**/*", (route) => {
          const url = new URL(route.request().url());
          if (url.pathname.startsWith("/api/public/")) return route.abort();
          return url.hostname === "localhost" || url.hostname === "127.0.0.1" ? route.continue() : route.abort();
        });
        for (const path of paths) {
          const page = await context.newPage();
          await page.goto(`${baseUrl}${path}`, { waitUntil: "load" });
          await settle(page);
          const name = shotName(path, viewport.width, lang);
          await page.screenshot({ path: join(outDir, name), fullPage: true, animations: "disabled" });
          log(`captured ${name}`);
          files.push(name);
          await page.close();
        }
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
  return files;
}

export async function waitForUrl(url, timeoutMs = 240000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(`Hết thời gian chờ ${url}`);
}
