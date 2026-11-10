import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import type { Logger } from "../logger.js";

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHENTICATED"
  | "INVALID_CREDENTIALS"
  | "FORBIDDEN"
  | "PASSWORD_CHANGE_REQUIRED"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  readonly status: number;
  readonly code: ErrorCode;
  readonly fields?: Record<string, string>;

  constructor(status: number, code: ErrorCode, message: string, fields?: Record<string, string>) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

function body(code: ErrorCode, message: string, requestId: unknown, fields?: Record<string, string>) {
  return { error: { code, message, ...(fields ? { fields } : {}), requestId } };
}

function isBodyParserError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "type" in err &&
    typeof err.type === "string" &&
    err.type.startsWith("entity.")
  );
}

export function errorHandler(logger?: Logger): ErrorRequestHandler {
  return (err, req, res, next) => {
    if (res.headersSent) {
      next(err);
      return;
    }
    const requestId = req.id;
    if (err instanceof AppError) {
      res.status(err.status).json(body(err.code, err.message, requestId, err.fields));
      return;
    }
    if (err instanceof ZodError) {
      const fields: Record<string, string> = {};
      for (const issue of err.issues) {
        const key = issue.path.join(".");
        if (!(key in fields)) fields[key] = issue.message;
      }
      res.status(400).json(body("VALIDATION_ERROR", "Dữ liệu không hợp lệ", requestId, fields));
      return;
    }
    if (isBodyParserError(err)) {
      res.status(400).json(body("VALIDATION_ERROR", "Dữ liệu không hợp lệ", requestId));
      return;
    }
    logger?.error({ err, requestId }, "unhandled error");
    res
      .status(500)
      .json(body("INTERNAL_ERROR", "Đã xảy ra lỗi, vui lòng thử lại", requestId));
  };
}
