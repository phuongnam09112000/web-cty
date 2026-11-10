import express from "express";
import type { AppDeps } from "../../app.js";
import { parseId } from "../../http/params.js";
import { getAuth, requirePermission } from "../auth/auth.middleware.js";
import { createRoleSchema, setPermissionsSchema, updateRoleSchema } from "./roles.schemas.js";
import {
  createRole,
  deleteRole,
  getRole,
  listRoles,
  setRolePermissions,
  updateRole,
} from "./roles.service.js";

export function rolesRouter(deps: AppDeps): express.Router {
  const { prisma } = deps;
  const router = express.Router();
  const list = requirePermission("roles.manage", "users.view");
  const manage = requirePermission("roles.manage");

  router.get("/roles", list, async (_req, res) => {
    res.json(await listRoles(prisma));
  });

  router.post("/roles", manage, async (req, res) => {
    const input = createRoleSchema.parse(req.body);
    res.status(201).json(await createRole(prisma, input, getAuth(res).user.id, req.ip ?? ""));
  });

  router.get("/roles/:id", manage, async (req, res) => {
    res.json(await getRole(prisma, parseId(String(req.params.id))));
  });

  router.patch("/roles/:id", manage, async (req, res) => {
    const id = parseId(String(req.params.id));
    const input = updateRoleSchema.parse(req.body);
    res.json(await updateRole(prisma, id, input, getAuth(res).user.id, req.ip ?? ""));
  });

  router.put("/roles/:id/permissions", manage, async (req, res) => {
    const id = parseId(String(req.params.id));
    const { permissions } = setPermissionsSchema.parse(req.body);
    res.json(
      await setRolePermissions(prisma, id, permissions, getAuth(res).user.id, req.ip ?? ""),
    );
  });

  router.delete("/roles/:id", manage, async (req, res) => {
    await deleteRole(prisma, parseId(String(req.params.id)), getAuth(res).user.id, req.ip ?? "");
    res.status(204).end();
  });

  return router;
}
