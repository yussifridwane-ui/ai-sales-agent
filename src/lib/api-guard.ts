import { NextRequest, NextResponse } from "next/server";
import { findOne, findMany } from "./db";
import { SESSION_COOKIE } from "./auth";
import { publicErrorMessage, AppError } from "./errors";
import { log } from "./logger";
import { rateLimit } from "./rate-limit";
import type { Organization, OrganizationMember, Plan, Session, Subscription, User } from "./db/types";
import { assertCan, type Permission } from "./security/rbac";
import { isMutation, originAllowed, requestIdFrom } from "./security/request";
import { securityEvent } from "./security/events";

export async function getAuthFromRequest(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = findOne<Session>("sessions", { token });
  if (!session || new Date(session.expiresAt) < new Date()) return null;
  const user = findOne<User>("users", { id: session.userId });
  if (!user || user.status !== "active") return null;
  return { user, session };
}

export async function requireAuthOrg(req: NextRequest, permission?: Permission) {
  const rid = requestIdFrom(req);
  const ip = clientIp(req);
  const ipLimit = rateLimit(`api:ip:${ip}`, 180, 60_000);
  if (!ipLimit.ok) {
    securityEvent({ type: "rate.limited", severity: "MEDIUM", message: "Rate limit IP", ip });
    throw new AppError("rate_limited", "Trop de requêtes. Réessayez plus tard.", 429);
  }
  if (isMutation(req.method) && !originAllowed(req)) {
    securityEvent({ type: "csrf.blocked", severity: "HIGH", message: "Origin refusée", ip });
    throw new AppError("csrf", "Requête refusée.", 403);
  }
  const length = Number(req.headers.get("content-length") || 0);
  if (length > 1_000_000 && !req.nextUrl.pathname.includes("/upload")) {
    throw new AppError("payload_too_large", "Requête trop volumineuse.", 413);
  }
  const auth = await getAuthFromRequest(req);
  if (!auth) throw new AppError("unauthenticated", "Veuillez vous connecter.", 401);
  const userLimit = rateLimit(`api:user:${auth.user.id}`, 240, 60_000);
  if (!userLimit.ok) throw new AppError("rate_limited", "Trop de requêtes. Réessayez plus tard.", 429);

  const membership = findMany<OrganizationMember>("organization_members", { userId: auth.user.id }, { limit: 1 })[0];
  if (!membership) throw new AppError("no_organization", "Onboarding requis.", 403);
  const organization = findOne<Organization>("organizations", { id: membership.organizationId });
  if (!organization) throw new AppError("no_organization", "Onboarding requis.", 403);
  if (organization.status === "suspended") throw new AppError("org_suspended", "Organisation suspendue.", 403);

  const orgLimit = rateLimit(`api:org:${organization.id}`, 600, 60_000);
  if (!orgLimit.ok) throw new AppError("rate_limited", "Trop de requêtes. Réessayez plus tard.", 429);

  if (permission) {
    try {
      assertCan(membership.role, permission);
    } catch (e) {
      securityEvent({
        type: "access.forbidden",
        severity: "MEDIUM",
        message: `Permission refusée: ${permission}`,
        organizationId: organization.id,
        userId: auth.user.id,
        ip,
      });
      throw e;
    }
  }

  const subscription = findOne<Subscription>("subscriptions", { organizationId: organization.id });
  const plan = subscription ? findOne<Plan>("plans", { id: subscription.planId }) : undefined;
  return {
    user: auth.user,
    session: auth.session,
    membership,
    requestId: rid,
    ip,
    org: {
      ...organization,
      subscription: subscription && plan ? { ...subscription, plan } : null,
    },
  };
}

export function owned<T extends { organizationId?: string | null }>(
  resource: T | undefined,
  organizationId: string,
  message = "Ressource introuvable.",
): T {
  if (!resource || resource.organizationId !== organizationId) {
    throw new AppError("not_found", message, 404);
  }
  return resource;
}

export function jsonOk(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function jsonError(error: unknown, requestId?: string) {
  const pub = publicErrorMessage(error);
  const rid = requestId || (error instanceof AppError ? undefined : undefined);
  if (!(error instanceof AppError)) log("ERROR", "unhandled", { error: String(error), requestId: rid });
  return NextResponse.json(
    { error: pub.message, code: pub.code, requestId: requestId || null },
    { status: pub.status },
  );
}

export function clientIp(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export async function requirePlatformAdmin(req: NextRequest) {
  if (isMutation(req.method) && !originAllowed(req)) {
    throw new AppError("csrf", "Requête refusée.", 403);
  }
  const auth = await getAuthFromRequest(req);
  if (!auth) throw new AppError("unauthenticated", "Veuillez vous connecter.", 401);
  if (auth.user.platformRole !== "admin") {
    securityEvent({
      type: "access.forbidden",
      severity: "HIGH",
      message: "Accès admin refusé",
      userId: auth.user.id,
      ip: clientIp(req),
    });
    throw new AppError("forbidden", "Accès administrateur requis.", 403);
  }
  if (process.env.NODE_ENV === "production" && process.env.ENFORCE_ADMIN_MFA !== "0") {
    if (!auth.user.mfaEnabled || !auth.session.mfaVerifiedAt) {
      throw new AppError("mfa_required", "MFA obligatoire pour l'administration.", 403);
    }
  }
  return auth.user;
}
