import cookieParser from "cookie-parser";
import express from "express";
import type { Config } from "./config.js";
import type { PrismaClient } from "./db.js";
import { errorHandler, AppError } from "./http/errors.js";
import { adminGateway, originCheck } from "./http/guards.js";
import { requestId } from "./http/request-id.js";
import type { Logger } from "./logger.js";
import { auditRouter } from "./modules/audit/audit.routes.js";
import { requireAuth } from "./modules/auth/auth.middleware.js";
import { authRouter, loginRouter } from "./modules/auth/auth.routes.js";
import { createPagesRouter, type PagesHooks } from "./modules/content/pages.routes.js";
import { createPublicContentRouter } from "./modules/content/public.routes.js";
import { mediaRouter } from "./modules/media/media.routes.js";
import { permissionsRouter } from "./modules/permissions/permissions.routes.js";
import { rolesRouter } from "./modules/roles/roles.routes.js";
import { usersRouter } from "./modules/users/users.routes.js";

export type AppDeps = {
  prisma: PrismaClient;
  config: Config;
  logger: Logger;
  clock: () => Date;
};

const PREVIEW_URL = /^(\/api\/public\/preview\/)[^/?#]*/i;

function redactUrl(originalUrl: string): string {
  return (originalUrl.split("?")[0] ?? "").replace(PREVIEW_URL, "$1:token");
}

const notFound = () => new AppError(404, "NOT_FOUND", "Không tìm thấy");

export function createApp(deps: AppDeps, hooks: PagesHooks = { onPublished: () => undefined }): express.Express {
  const { prisma, config, logger } = deps;
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", "loopback");

  app.use(requestId);
  app.use((req, res, next) => {
    const start = process.hrtime.bigint();
    res.on("finish", () => {
      logger.info({
        requestId: req.id,
        method: req.method,
        url: redactUrl(req.originalUrl),
        status: res.statusCode,
        durationMs: Number(process.hrtime.bigint() - start) / 1e6,
      });
    });
    next();
  });

  const publicRouter = express.Router();
  publicRouter.get("/health", async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ status: "ok" });
    } catch {
      res.status(503).json({ status: "error" });
    }
  });
  publicRouter.use(createPublicContentRouter(deps));
  publicRouter.use(() => {
    throw notFound();
  });

  const adminRouter = express.Router();
  adminRouter.use(cookieParser());
  adminRouter.use(loginRouter(deps));
  adminRouter.use(requireAuth(deps));
  adminRouter.use(authRouter(deps));
  adminRouter.use(usersRouter(deps));
  adminRouter.use(rolesRouter(deps));
  adminRouter.use(permissionsRouter());
  adminRouter.use(auditRouter(deps));
  adminRouter.use(mediaRouter(deps));
  adminRouter.use(createPagesRouter(deps, hooks));
  adminRouter.use(() => {
    throw notFound();
  });

  app.use("/api/public", express.json(), publicRouter);
  app.use("/api/admin", adminGateway(config), originCheck(config), express.json({ limit: "1200kb" }), adminRouter);

  if (config.nodeEnv !== "production") {
    app.use("/media", express.static(config.mediaDir, { immutable: true, maxAge: "1y" }));
  }

  app.use(() => {
    throw notFound();
  });
  app.use(errorHandler(logger));

  return app;
}
