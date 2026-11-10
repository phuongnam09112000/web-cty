import type { RequestHandler } from "express";
import type { AppDeps } from "../../app.js";
import { AppError } from "../../http/errors.js";
import type { Role, User } from "../../generated/prisma/client.js";
import { PERMISSIONS, type PermissionKey } from "../permissions/catalog.js";
import { resolveSession } from "./session.service.js";

export const SESSION_COOKIE = "istt_admin_session";

export type AuthContext = {
  user: User & { role: Role };
  permissions: ReadonlySet<PermissionKey>;
  sessionId: string;
};

const PASSWORD_CHANGE_ALLOWED = new Set(["GET /auth/me", "POST /auth/change-password", "POST /auth/logout"]);

export function getAuth(res: { locals: Record<string, unknown> }): AuthContext {
  return res.locals.auth as AuthContext;
}

async function loadPermissions(
  deps: AppDeps,
  role: Role,
): Promise<ReadonlySet<PermissionKey>> {
  if (role.isSystem) return new Set(PERMISSIONS.map((p) => p.key));
  const rows = await deps.prisma.rolePermission.findMany({
    where: { roleId: role.id },
    include: { permission: true },
  });
  const keys = new Set(rows.map((row) => row.permission.key as PermissionKey));
  if (keys.has("users.manage")) keys.add("users.view");
  return keys;
}

export function requireAuth(deps: AppDeps): RequestHandler {
  return async (req, res, next) => {
    try {
      const token: unknown = req.cookies?.[SESSION_COOKIE];
      if (typeof token !== "string" || token.length === 0) {
        throw new AppError(401, "UNAUTHENTICATED", "Vui lòng đăng nhập");
      }
      const resolved = await resolveSession(deps.prisma, token, deps.clock());
      if (!resolved || !resolved.user.isActive) {
        throw new AppError(401, "UNAUTHENTICATED", "Vui lòng đăng nhập");
      }
      const context: AuthContext = {
        user: resolved.user,
        permissions: await loadPermissions(deps, resolved.user.role),
        sessionId: resolved.sessionId,
      };
      res.locals.auth = context;
      if (
        resolved.user.mustChangePassword &&
        !PASSWORD_CHANGE_ALLOWED.has(`${req.method} ${req.path}`)
      ) {
        throw new AppError(403, "PASSWORD_CHANGE_REQUIRED", "Vui lòng đổi mật khẩu trước khi tiếp tục");
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}

export function requirePermission(...keys: PermissionKey[]): RequestHandler {
  return (_req, res, next) => {
    const { permissions, user } = getAuth(res);
    if (user.role.isSystem || keys.some((key) => permissions.has(key))) {
      next();
      return;
    }
    next(new AppError(403, "FORBIDDEN", "Bạn không có quyền thực hiện thao tác này"));
  };
}
