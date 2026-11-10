import express from "express";
import type { AppDeps } from "../../app.js";
import { AppError } from "../../http/errors.js";
import { recordAudit } from "../audit/audit.service.js";
import { getAuth, SESSION_COOKIE } from "./auth.middleware.js";
import { changePasswordSchema, loginSchema, updateProfileSchema } from "./auth.schemas.js";
import { hashPassword, verifyDummyPassword, verifyPassword } from "./password.js";
import { createSession } from "./session.service.js";

const LOCK_AFTER_FAILURES = 5;
const LOCK_MS = 15 * 60_000;

function cookieOptions(deps: AppDeps) {
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: deps.config.cookieSecure,
    path: "/",
  };
}

function invalidCredentials() {
  return new AppError(401, "INVALID_CREDENTIALS", "Email hoặc mật khẩu không đúng");
}

export function loginRouter(deps: AppDeps): express.Router {
  const { prisma, clock } = deps;
  const router = express.Router();

  router.post("/auth/login", async (req, res) => {
    const input = loginSchema.parse(req.body);
    const email = input.email.trim().toLowerCase();
    const now = clock();
    const ip = req.ip ?? "";
    const user = await prisma.user.findUnique({ where: { email } });

    const fail = async (actorUserId: bigint | null): Promise<never> => {
      await recordAudit(prisma, {
        actorUserId,
        action: "auth.login_failed",
        metadata: { email },
        ip,
      });
      throw invalidCredentials();
    };

    if (!user || !user.isActive) {
      await verifyDummyPassword(input.password);
      return fail(user?.id ?? null);
    }

    const available = { OR: [{ lockedUntil: null }, { lockedUntil: { lte: now } }] };
    const claimed = await prisma.user.updateMany({
      where: {
        id: user.id,
        AND: [available, { failedLoginCount: { lt: LOCK_AFTER_FAILURES } }],
      },
      data: { failedLoginCount: { increment: 1 } },
    });
    const valid = await verifyPassword(user.passwordHash, input.password);
    if (claimed.count === 0) return fail(user.id);

    if (!valid) {
      await prisma.user.updateMany({
        where: { id: user.id, failedLoginCount: { gte: LOCK_AFTER_FAILURES } },
        data: { failedLoginCount: 0, lockedUntil: new Date(now.getTime() + LOCK_MS) },
      });
      return fail(user.id);
    }

    const cleared = await prisma.user.updateMany({
      where: { id: user.id, ...available },
      data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: now },
    });
    if (cleared.count === 0) return fail(user.id);
    const token = await createSession(
      prisma,
      user.id,
      { ip, userAgent: req.get("user-agent") ?? "" },
      now,
    );
    await recordAudit(prisma, { actorUserId: user.id, action: "auth.login", ip });
    res.cookie(SESSION_COOKIE, token, cookieOptions(deps));
    res.json({ ok: true });
  });

  return router;
}

export function authRouter(deps: AppDeps): express.Router {
  const { prisma } = deps;
  const router = express.Router();

  function profile(res: express.Response) {
    const { user, permissions } = getAuth(res);
    return {
      id: Number(user.id),
      email: user.email,
      fullName: user.fullName,
      mustChangePassword: user.mustChangePassword,
      role: { id: Number(user.role.id), name: user.role.name, isSystem: user.role.isSystem },
      permissions: [...permissions],
    };
  }

  router.get("/auth/me", (_req, res) => {
    res.json(profile(res));
  });

  router.patch("/auth/me", async (req, res) => {
    const input = updateProfileSchema.parse(req.body);
    const auth = getAuth(res);
    const updated = await prisma.user.update({
      where: { id: auth.user.id },
      data: { fullName: input.fullName },
    });
    auth.user.fullName = updated.fullName;
    res.json(profile(res));
  });

  router.post("/auth/logout", async (req, res) => {
    const auth = getAuth(res);
    await prisma.session.deleteMany({ where: { id: auth.sessionId } });
    await recordAudit(prisma, { actorUserId: auth.user.id, action: "auth.logout", ip: req.ip ?? "" });
    res.clearCookie(SESSION_COOKIE, cookieOptions(deps));
    res.status(204).end();
  });

  router.post("/auth/change-password", async (req, res) => {
    const input = changePasswordSchema.parse(req.body);
    const auth = getAuth(res);
    const ok = await verifyPassword(auth.user.passwordHash, input.currentPassword);
    if (!ok) {
      throw new AppError(400, "VALIDATION_ERROR", "Dữ liệu không hợp lệ", {
        currentPassword: "Mật khẩu hiện tại không đúng",
      });
    }
    const passwordHash = await hashPassword(input.newPassword);
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: auth.user.id },
        data: { passwordHash, mustChangePassword: false },
      });
      await tx.session.deleteMany({
        where: { userId: auth.user.id, id: { not: auth.sessionId } },
      });
      await recordAudit(tx, {
        actorUserId: auth.user.id,
        action: "auth.password_change",
        ip: req.ip ?? "",
      });
    });
    res.json({ ok: true });
  });

  return router;
}
