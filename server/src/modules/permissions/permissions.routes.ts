import express from "express";
import { requirePermission } from "../auth/auth.middleware.js";
import { PERMISSIONS, type PermissionKey } from "./catalog.js";

type ModuleGroup = { module: string; permissions: { key: PermissionKey; label: string }[] };

export function permissionsRouter(): express.Router {
  const router = express.Router();

  router.get("/permissions", requirePermission("roles.manage"), (_req, res) => {
    const modules: ModuleGroup[] = [];
    for (const { key, module, label } of PERMISSIONS) {
      let group = modules.find((entry) => entry.module === module);
      if (!group) {
        group = { module, permissions: [] };
        modules.push(group);
      }
      group.permissions.push({ key, label });
    }
    res.json({ modules });
  });

  return router;
}
