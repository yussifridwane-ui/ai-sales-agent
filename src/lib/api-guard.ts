import { NextRequest, NextResponse } from "next/server";
import { findOne, findMany } from "./db";
import { SESSION_COOKIE } from "./auth";
import { publicErrorMessage, AppError } from "./errors";
import { log } from "./logger";
import { rateLimit } from "./rate-limit";
import type { Organization, OrganizationMember, Plan, Session, Subscription, User } from "./db/types";

export async function getAuthFromRequest(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = findOne<Session>("sessions", { token });
  if (!session || new Date(session.expiresAt) < new Date()) return null;
  const user = findOne<User>("users", { id: session.userId });
  if (!user || user.status !== "active") return null;
  return user;
}

export async function requireAuthOrg(req: NextRequest) {
  const limited = rateLimit(`api:${req.headers.get("x-forwarded-for") || "local"}`, 180, 60_000);
  if (!limited.ok) throw new AppError("rate_limited", "Trop de requêtes. Réessayez plus tard.", 429);
  const user = await getAuthFromRequest(req);
  if (!user) throw new AppError("unauthenticated", "Veuillez vous connecter.", 401);
  const membership = findMany<OrganizationMember>("organization_members", { userId: user.id }, { limit: 1 })[0];
  if (!membership) throw new AppError("no_organization", "Onboarding requis.", 403);
  const organization = findOne<Organization>("organizations", { id: membership.organizationId });
  if (!organization) throw new AppError("no_organization", "Onboarding requis.", 403);
  const subscription = findOne<Subscription>("subscriptions", { organizationId: organization.id });
  const plan = subscription ? findOne<Plan>("plans", { id: subscription.planId }) : undefined;
  return {
    user,
    membership,
    org: {
      ...organization,
      subscription: subscription && plan ? { ...subscription, plan } : null,
    },
  };
}

export function jsonOk(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function jsonError(error: unknown) {
  const pub = publicErrorMessage(error);
  if (!(error instanceof AppError)) log("ERROR", "unhandled", { error: String(error) });
  return NextResponse.json({ error: pub.message, code: pub.code }, { status: pub.status });
}

export function clientIp(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export async function requirePlatformAdmin(req: NextRequest) {
  const user = await getAuthFromRequest(req);
  if (!user) throw new AppError("unauthenticated", "Veuillez vous connecter.", 401);
  if (user.platformRole !== "admin") throw new AppError("forbidden", "Accès administrateur requis.", 403);
  return user;
}
