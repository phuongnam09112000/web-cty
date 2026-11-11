import express from "express";
import type { AppDeps } from "../../app.js";
import { AppError } from "../../http/errors.js";
import { parseId } from "../../http/params.js";
import { getAuth, requirePermission } from "../auth/auth.middleware.js";
import { createPreviewUrl } from "./preview.service.js";
import { getPage, listPages, publishPage, saveDraft } from "./pages.service.js";
import { publishSchema, saveDraftSchema } from "./pages.schemas.js";
import { getVersion, listVersions, restoreVersion } from "./versions.service.js";

export type PagesHooks = { onPublished: (path: string) => void | Promise<void> };

function parseVersionNumber(value: string): number {
  if (/^[1-9][0-9]{0,8}$/.test(value)) return Number(value);
  throw new AppError(404, "NOT_FOUND", "Không tìm thấy");
}

export function createPagesRouter(deps: AppDeps, hooks: PagesHooks): express.Router {
  const { prisma } = deps;
  const router = express.Router();
  const view = requirePermission("content.view");
  const edit = requirePermission("content.edit");
  const publish = requirePermission("content.publish");

  router.get("/pages", view, async (_req, res) => {
    res.json(await listPages(prisma));
  });

  router.get("/pages/:id", view, async (req, res) => {
    res.json(await getPage(prisma, parseId(String(req.params.id))));
  });

  router.put("/pages/:id/draft", edit, async (req, res) => {
    const id = parseId(String(req.params.id));
    const input = saveDraftSchema.parse(req.body);
    res.json(await saveDraft(prisma, id, input, getAuth(res).user.id, req.ip ?? ""));
  });

  router.post("/pages/:id/preview", view, async (req, res) => {
    const id = parseId(String(req.params.id));
    res.json({ url: await createPreviewUrl(prisma, deps.config.publicSiteOrigin, id, getAuth(res).user.id, deps.clock()) });
  });

  router.post("/pages/:id/publish", publish, async (req, res) => {
    const id = parseId(String(req.params.id));
    const input = publishSchema.parse(req.body ?? {});
    const result = await publishPage(prisma, id, input.note, getAuth(res).user.id, req.ip ?? "");
    try {
      const outcome: unknown = hooks.onPublished(result.path);
      if (outcome instanceof Promise) {
        outcome.catch((err: unknown) => deps.logger.error({ err }, "onPublished hook failed"));
      }
    } catch (err) {
      deps.logger.error({ err }, "onPublished hook failed");
    }
    res.json({ number: result.number });
  });

  router.get("/pages/:id/versions", view, async (req, res) => {
    res.json(await listVersions(prisma, parseId(String(req.params.id))));
  });

  router.get("/pages/:id/versions/:number", view, async (req, res) => {
    const id = parseId(String(req.params.id));
    res.json(await getVersion(prisma, id, parseVersionNumber(String(req.params.number))));
  });

  router.post("/pages/:id/versions/:number/restore", publish, async (req, res) => {
    const id = parseId(String(req.params.id));
    const number = parseVersionNumber(String(req.params.number));
    res.json(await restoreVersion(prisma, id, number, getAuth(res).user.id, req.ip ?? ""));
  });

  return router;
}
