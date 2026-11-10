import express from "express";
import type { AppDeps } from "../../app.js";
import { parseId } from "../../http/params.js";
import { getAuth, requirePermission } from "../auth/auth.middleware.js";
import { createUserSchema, listUsersSchema, updateUserSchema } from "./users.schemas.js";
import {
  createUser,
  getUser,
  listUsers,
  resetPassword,
  updateUser,
} from "./users.service.js";

export function usersRouter(deps: AppDeps): express.Router {
  const { prisma } = deps;
  const router = express.Router();
  const view = requirePermission("users.view", "users.manage");
  const manage = requirePermission("users.manage");

  router.get("/users", view, async (req, res) => {
    res.json(await listUsers(prisma, listUsersSchema.parse(req.query)));
  });

  router.post("/users", manage, async (req, res) => {
    const input = createUserSchema.parse(req.body);
    const result = await createUser(prisma, input, getAuth(res).user.id, req.ip ?? "");
    res.status(201).json(result);
  });

  router.get("/users/:id", view, async (req, res) => {
    res.json(await getUser(prisma, parseId(String(req.params.id))));
  });

  router.patch("/users/:id", manage, async (req, res) => {
    const id = parseId(String(req.params.id));
    const input = updateUserSchema.parse(req.body);
    res.json(await updateUser(prisma, id, input, getAuth(res).user.id, req.ip ?? ""));
  });

  router.post("/users/:id/reset-password", manage, async (req, res) => {
    const id = parseId(String(req.params.id));
    const temporaryPassword = await resetPassword(prisma, id, getAuth(res).user.id, req.ip ?? "");
    res.json({ temporaryPassword });
  });

  return router;
}
