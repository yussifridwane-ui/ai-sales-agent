import { findMany, findOne } from "./db";
import { AppError } from "./errors";
import type { Organization, OrganizationMember, Plan, Subscription, User } from "./db/types";

export async function getMembership(userId: string) {
  const membership = findMany<OrganizationMember>("organization_members", { userId }, { orderBy: "createdAt ASC", limit: 1 })[0];
  if (!membership) return null;
  const organization = findOne<Organization>("organizations", { id: membership.organizationId });
  if (!organization) return null;
  const subscription = findOne<Subscription>("subscriptions", { organizationId: organization.id });
  const plan = subscription ? findOne<Plan>("plans", { id: subscription.planId }) : undefined;
  return {
    ...membership,
    organization: {
      ...organization,
      subscription: subscription && plan ? { ...subscription, plan } : null,
    },
  };
}

export async function requireOrganization(user: User) {
  const membership = await getMembership(user.id);
  if (!membership) throw new AppError("no_organization", "Onboarding requis.", 403);
  if (membership.organization.status === "suspended") {
    throw new AppError("org_suspended", "Cette organisation est suspendue.", 403);
  }
  return membership;
}

export function assertOrgId(organizationId: string, resourceOrgId: string | null | undefined) {
  if (!resourceOrgId || resourceOrgId !== organizationId) {
    throw new AppError("forbidden", "Accès refusé.", 403);
  }
}

export function canManage(role: string) {
  return role === "owner" || role === "admin";
}
