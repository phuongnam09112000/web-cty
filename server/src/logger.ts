import pino, { type Logger } from "pino";

export type { Logger };

export function createLogger(level: string = "info"): Logger {
  return pino({
    level,
    redact: {
      paths: ["req.headers.cookie", 'req.headers["x-admin-gateway"]', 'res.headers["set-cookie"]'],
      censor: "[redacted]",
    },
  });
}
