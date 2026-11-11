import express from "express";
import multer from "multer";
import type { AppDeps } from "../../app.js";
import { AppError } from "../../http/errors.js";
import { parseId } from "../../http/params.js";
import { getAuth, requirePermission } from "../auth/auth.middleware.js";
import { listMediaSchema, updateMediaSchema } from "./media.schemas.js";
import {
  MAX_MEDIA_BYTES,
  deleteMedia,
  getMediaUsage,
  listMedia,
  storeMedia,
  updateMediaAlt,
} from "./media.service.js";

const parser = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_MEDIA_BYTES + 1, files: 1, fields: 5 },
  defParamCharset: "utf8",
}).single("file");

const receiveFile: express.RequestHandler = (req, res, next) => {
  parser(req, res, (err: unknown) => {
    if (!err) {
      next();
      return;
    }
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        next(new AppError(413, "PAYLOAD_TOO_LARGE", "Ảnh vượt quá 5 MB", { file: "Ảnh vượt quá 5 MB" }));
        return;
      }
      next(new AppError(400, "VALIDATION_ERROR", "Dữ liệu không hợp lệ", { file: "File không hợp lệ" }));
      return;
    }
    next(err);
  });
};

export function mediaRouter(deps: AppDeps): express.Router {
  const { prisma, config } = deps;
  const router = express.Router();
  const manage = requirePermission("media.manage");

  router.get("/media", async (req, res) => {
    res.json(await listMedia(prisma, listMediaSchema.parse(req.query)));
  });

  router.post("/media", manage, receiveFile, async (req, res) => {
    if (!req.file) {
      throw new AppError(400, "VALIDATION_ERROR", "Vui lòng chọn ảnh", { file: "Vui lòng chọn ảnh" });
    }
    const { user } = getAuth(res);
    const dto = await storeMedia(
      prisma,
      config,
      { buffer: req.file.buffer, originalName: req.file.originalname },
      user.id,
      undefined,
      req.ip ?? "",
    );
    res.status(201).json(dto);
  });

  router.patch("/media/:id", manage, async (req, res) => {
    const id = parseId(String(req.params.id));
    const input = updateMediaSchema.parse(req.body);
    const { user } = getAuth(res);
    res.json(await updateMediaAlt(prisma, id, input.alt, user.id, req.ip ?? ""));
  });

  router.delete("/media/:id", manage, async (req, res) => {
    const id = parseId(String(req.params.id));
    const { user } = getAuth(res);
    await deleteMedia(prisma, config, id, user.id, req.ip ?? "");
    res.status(204).end();
  });

  router.get("/media/:id/usage", async (req, res) => {
    res.json(await getMediaUsage(prisma, parseId(String(req.params.id))));
  });

  return router;
}
