import { cookies } from "next/headers";
import { count, findOne, insert, removeWhere, updateWhere, nowIso, id as makeId } from "./db";
import type { Session, User } from "./db/types";
import { hashPassword, randomToken, verifyPassword } from "./crypto";
import { AppError } from "./errors";
import { log } from "./logger";
import { sendEmail } from "./email";
import { assertNotLocked, findUserByEmail, onLoginFailure, onLoginSuccess } from "./security/brute-force";
import { audit } from "./audit";
import { publicOrigin } from "./domains";

export const SESSION_COOKIE = "ais_session";
const SESSION_DAYS = 14;

export async function createSession(userId: string, ip?: string, userAgent?: string, mfaVerified = false) {
  const token = randomToken(32);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  insert("sessions", {
    userId,
    token,
    expiresAt,
    ip: ip || null,
    userAgent: userAgent || null,
    mfaVerifiedAt: mfaVerified ? nowIso() : null,
  });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiresAt),
  });
  return token;
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) removeWhere("sessions", { token });
  jar.delete(SESSION_COOKIE);
}

export async function destroyAllSessions(userId: string, keepToken?: string) {
  if (keepToken) {
    const sessions = (await import("./db")).findMany<Session>("sessions", { userId });
    for (const s of sessions) {
      if (s.token !== keepToken) removeWhere("sessions", { id: s.id });
    }
    return;
  }
  removeWhere("sessions", { userId });
}

export async function getSessionRecord() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = findOne<Session>("sessions", { token });
  if (!session || new Date(session.expiresAt) < new Date()) {
    if (session) removeWhere("sessions", { id: session.id });
    return null;
  }
  return session;
}

export async function getSessionUser() {
  const session = await getSessionRecord();
  if (!session) return null;
  const user = findOne<User>("users", { id: session.userId });
  if (!user || user.status !== "active") return null;
  return user;
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) throw new AppError("unauthenticated", "Veuillez vous connecter.", 401);
  return user;
}

export async function registerUser(input: {
  email: string;
  password: string;
  name: string;
  marketingConsent?: boolean;
  locale?: string;
}) {
  const email = input.email.trim().toLowerCase();
  if (!email.includes("@") || input.password.length < 8) {
    throw new AppError("invalid_input", "Email ou mot de passe invalide (8 caractères min.).");
  }
  if (findOne<User>("users", { email })) {
    throw new AppError("email_taken", "Impossible de créer ce compte. Essayez de vous connecter.");
  }
  const userId = makeId("usr");
  insert("users", {
    id: userId,
    email,
    passwordHash: await hashPassword(input.password),
    name: input.name.trim() || email.split("@")[0],
    marketingConsent: Boolean(input.marketingConsent),
    locale: input.locale || "fr",
    platformRole: "user",
    status: "active",
    failedLoginCount: 0,
    mfaEnabled: false,
  });
  const token = randomToken(24);
  insert("email_verifications", {
    userId,
    token,
    expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
  });
  const verifyUrl = `${publicOrigin()}/verify-email?token=${token}`;
  await sendEmail({
    to: email,
    subject: "Vérifiez votre email — VentesOnline",
    text: `Bienvenue. Vérifiez votre email : ${verifyUrl}`,
    html: `<p>Bienvenue sur VentesOnline (AI Sales Agent).</p><p><a href="${verifyUrl}">Vérifier mon email</a></p>`,
  });
  log("SECURITY", "user_registered", { userId });
  const user = findOne<User>("users", { id: userId })!;
  return { user, verifyToken: token };
}

export async function loginUser(email: string, password: string, ip?: string, ua?: string) {
  const normalized = email.trim().toLowerCase();
  const user = findUserByEmail(normalized);
  assertNotLocked(user, normalized, ip);
  if (!user || user.status === "deleted") {
    onLoginFailure(undefined, normalized, ip);
    throw new AppError("invalid_credentials", "Email ou mot de passe incorrect.", 401);
  }
  if (user.status === "suspended") {
    throw new AppError("suspended", "Ce compte a été suspendu. Contactez le support.", 403);
  }
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    onLoginFailure(user, normalized, ip);
    throw new AppError("invalid_credentials", "Email ou mot de passe incorrect.", 401);
  }
  onLoginSuccess(user, ip);
  await createSession(user.id, ip, ua, false);
  log("SECURITY", "user_login", { userId: user.id });
  await audit({ userId: user.id, action: "auth.login", ip, result: "ok" });
  return user;
}

export async function verifyEmailToken(token: string) {
  const rec = findOne<{ id: string; userId: string; expiresAt: string; usedAt: string | null }>(
    "email_verifications",
    { token },
  );
  if (!rec || rec.usedAt || new Date(rec.expiresAt) < new Date()) {
    throw new AppError("invalid_token", "Lien de vérification invalide ou expiré.");
  }
  updateWhere("email_verifications", { id: rec.id }, { usedAt: nowIso() });
  updateWhere("users", { id: rec.userId }, { emailVerified: nowIso() });
  return rec.userId;
}

export async function requestPasswordReset(email: string) {
  const user = findOne<User>("users", { email: email.trim().toLowerCase() });
  if (!user) return;
  const token = randomToken(24);
  insert("password_resets", {
    userId: user.id,
    token,
    expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  });
  const url = `${publicOrigin()}/reset-password?token=${token}`;
  await sendEmail({
    to: user.email,
    subject: "Réinitialisation du mot de passe",
    text: `Réinitialisez votre mot de passe : ${url}`,
    html: `<p><a href="${url}">Réinitialiser mon mot de passe</a></p>`,
  });
  log("SECURITY", "password_reset_requested", { userId: user.id });
  return process.env.NODE_ENV === "production" ? undefined : token;
}

export async function resetPassword(token: string, password: string) {
  if (password.length < 8) throw new AppError("invalid_input", "Mot de passe trop court.");
  const rec = findOne<{ id: string; userId: string; expiresAt: string; usedAt: string | null }>(
    "password_resets",
    { token },
  );
  if (!rec || rec.usedAt || new Date(rec.expiresAt) < new Date()) {
    throw new AppError("invalid_token", "Lien de réinitialisation invalide ou expiré.");
  }
  updateWhere("password_resets", { id: rec.id }, { usedAt: nowIso() });
  updateWhere("users", { id: rec.userId }, {
    passwordHash: await hashPassword(password),
    passwordChangedAt: nowIso(),
    failedLoginCount: 0,
    lockedUntil: null,
  });
  removeWhere("sessions", { userId: rec.userId });
  log("SECURITY", "password_reset_completed", { userId: rec.userId });
  await audit({ userId: rec.userId, action: "auth.password_reset", result: "ok" });
}

export function userExistsCount() {
  return count("users");
}

export async function markSessionMfa(token: string) {
  updateWhere("sessions", { token }, { mfaVerifiedAt: nowIso() });
}
