import { count, findOne, insert, nowIso, updateWhere } from "../db";
import { AppError } from "../errors";
import { securityEvent } from "./events";
import type { User } from "../db/types";

const MAX_FAILS = 8;
const LOCK_MINUTES = 15;

export function recordLoginAttempt(input: {
  email: string;
  ip?: string;
  success: boolean;
  userId?: string;
}) {
  insert("login_attempts", {
    email: input.email.toLowerCase(),
    ip: input.ip || null,
    success: input.success ? 1 : 0,
    createdAt: nowIso(),
  });
}

export function assertNotLocked(user: User | undefined, email: string, ip?: string) {
  if (user?.lockedUntil && new Date(user.lockedUntil) > new Date()) {
    securityEvent({
      type: "auth.locked",
      severity: "HIGH",
      message: "Tentative sur compte verrouillé",
      userId: user.id,
      ip,
    });
    throw new AppError("locked", "Trop de tentatives. Réessayez plus tard.", 429);
  }
  const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const failsIp = count("login_attempts", {}, "ip = ? AND success = 0 AND createdAt >= ?", [ip || "unknown", since]);
  if (failsIp >= 25) {
    securityEvent({ type: "auth.bruteforce_ip", severity: "CRITICAL", message: "Brute-force IP", ip });
    throw new AppError("locked", "Trop de tentatives. Réessayez plus tard.", 429);
  }
  void email;
}

export function onLoginFailure(user: User | undefined, email: string, ip?: string) {
  recordLoginAttempt({ email, ip, success: false, userId: user?.id });
  if (user) {
    const fails = Number(user.failedLoginCount || 0) + 1;
    const patch: Record<string, unknown> = { failedLoginCount: fails };
    if (fails >= MAX_FAILS) {
      patch.lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000).toISOString();
      securityEvent({
        type: "auth.lockout",
        severity: "HIGH",
        message: "Compte temporairement verrouillé",
        userId: user.id,
        ip,
      });
    }
    updateWhere("users", { id: user.id }, patch);
  }
  securityEvent({
    type: "auth.failed",
    severity: "MEDIUM",
    message: "Échec d'authentification",
    userId: user?.id,
    ip,
  });
}

export function onLoginSuccess(user: User, ip?: string) {
  recordLoginAttempt({ email: user.email, ip, success: true, userId: user.id });
  updateWhere("users", { id: user.id }, { failedLoginCount: 0, lockedUntil: null, lastLoginAt: nowIso() });
}

export function findUserByEmail(email: string) {
  return findOne<User>("users", { email: email.trim().toLowerCase() });
}
