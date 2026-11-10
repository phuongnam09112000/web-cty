import express from "express";
import type { AppDeps } from "../../app.js";
import { requirePermission } from "../auth/auth.middleware.js";
import { listAuditLogsSchema } from "./audit.schemas.js";
import { listAuditLogs } from "./audit.service.js";

export function auditRouter(deps: AppDeps): express.Router {
  const { prisma } = deps;
  const router = express.Router();

  router.get("/audit-logs", requirePermission("audit.view"), async (req, res) => {
    res.json(await listAuditLogs(prisma, listAuditLogsSchema.parse(req.query)));
  });

  return router;
}
