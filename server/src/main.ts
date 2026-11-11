import "dotenv/config";
import { createApp } from "./app.js";
import { loadConfig, type Config } from "./config.js";
import { createPrisma } from "./db.js";
import { createLogger } from "./logger.js";
import { deleteExpiredSessions } from "./modules/auth/session.service.js";
import { deleteExpiredPreviewTokens } from "./modules/content/preview.service.js";
import { syncPermissions } from "./modules/permissions/sync.js";

const CLEANUP_INTERVAL_MS = 3600_000;

async function main(config: Config): Promise<void> {
  const logger = createLogger("info");
  const prisma = createPrisma(config.databaseUrl);
  await syncPermissions(prisma);
  const app = createApp({ prisma, config, logger, clock: () => new Date() });

  const server = app.listen(config.port, "127.0.0.1", () => {
    logger.info({ port: config.port }, "server listening");
  });

  const cleanup = setInterval(() => {
    deleteExpiredSessions(prisma, new Date())
      .then((deleted) => logger.info({ deleted }, "expired sessions cleaned"))
      .catch((error: unknown) => logger.error({ err: error }, "session cleanup failed"));
    deleteExpiredPreviewTokens(prisma, new Date())
      .then((deleted) => logger.info({ deleted }, "expired preview tokens cleaned"))
      .catch((error: unknown) => logger.error({ err: error }, "preview token cleanup failed"));
  }, CLEANUP_INTERVAL_MS);
  cleanup.unref();

  let stopping = false;
  const shutdown = (signal: string) => {
    if (stopping) return;
    stopping = true;
    logger.info({ signal }, "shutting down");
    clearInterval(cleanup);
    server.close(() => {
      prisma.$disconnect().finally(() => process.exit(0));
    });
    server.closeIdleConnections();
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

let config: Config;
try {
  config = loadConfig(process.env);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

main(config).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
