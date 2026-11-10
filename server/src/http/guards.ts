import { createHash, timingSafeEqual } from "node:crypto";
import type { RequestHandler } from "express";
import type { Config } from "../config.js";
import { AppError } from "./errors.js";

const forbidden = () => new AppError(403, "FORBIDDEN", "Bạn không có quyền thực hiện thao tác này");

function digest(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

export function adminGateway(config: Config): RequestHandler {
  const expected = digest(config.adminGatewaySecret);
  return (req, _res, next) => {
    const provided = req.get("x-admin-gateway");
    if (typeof provided !== "string" || !timingSafeEqual(digest(provided), expected)) {
      next(forbidden());
      return;
    }
    next();
  };
}

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function originCheck(config: Config): RequestHandler {
  const allowed = new URL(config.adminOrigin).origin;
  return (req, _res, next) => {
    if (SAFE_METHODS.has(req.method)) {
      next();
      return;
    }
    if (req.get("origin") !== allowed) {
      next(forbidden());
      return;
    }
    next();
  };
}
