import express from "express";
import type { AppDeps } from "../../app.js";
import { AppError } from "../../http/errors.js";
import { resolveMedia } from "./media-refs.js";
import { findPreviewDraft } from "./preview.service.js";
import type { Renderer } from "./render.service.js";

const PATH_MAX = 191;

const notFound = () => new AppError(404, "NOT_FOUND", "Không tìm thấy");

export function normalizePath(input: string): string | null {
  if (!input.startsWith("/")) return null;
  let path = input.split("#")[0] ?? "";
  path = (path.split("?")[0] ?? "").toLowerCase();
  if (path.length > 1) path = path.replace(/\/+$/, "");
  if (path === "") path = "/";
  if (path === "/home") path = "/";
  if (path.length > PATH_MAX) return null;
  return path;
}

export function createPublicContentRouter(deps: AppDeps, renderer: Renderer): express.Router {
  const { prisma } = deps;
  const router = express.Router();

  router.get("/pages", async (req, res) => {
    const raw = req.query.path;
    const path = typeof raw === "string" ? normalizePath(raw) : null;
    if (path === null) throw notFound();
    const page = await prisma.page.findUnique({ where: { path }, include: { publishedVersion: true } });
    if (!page || !page.publishedVersion) throw notFound();
    const version = page.publishedVersion;
    res.set("Cache-Control", "public, max-age=60");
    res.set("ETag", `W/"${page.id}-${version.number}"`);
    if (req.fresh) {
      res.status(304).end();
      return;
    }
    res.json({ path: page.path, version: version.number, content: await resolveMedia(prisma, version.content) });
  });

  router.get("/preview/:token", async (req, res) => {
    const found = await findPreviewDraft(prisma, String(req.params.token), deps.clock());
    if (!found) throw notFound();
    res.set("Cache-Control", "no-store");
    res.json({ path: found.path, version: null, content: await resolveMedia(prisma, found.content) });
  });

  router.get("/render", async (req, res) => {
    const raw = req.query.path;
    const path = typeof raw === "string" ? normalizePath(raw) : null;
    const lang = req.query.lang === "en" ? "en" : "vi";
    const html = path === null ? await renderer.render("", lang) : await renderer.render(path, lang);
    res.set("Cache-Control", "no-cache");
    res.type("text/html; charset=utf-8").send(html);
  });

  return router;
}
