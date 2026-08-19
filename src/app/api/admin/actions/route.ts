import { NextRequest } from "next/server";
import { jsonError, jsonOk, requirePlatformAdmin } from "@/lib/api-guard";
import { findOne, updateWhere } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { audit } from "@/lib/audit";
import type { Organization, Plan, User } from "@/lib/db/types";

export async function POST(req: NextRequest) {
  try {
    const admin = await requirePlatformAdmin(req);
    const body = (await req.json()) as { action: string; userId?: string; organizationId?: string; plan?: string };
    if (body.action === "suspend_user" && body.userId) {
      const user = findOne<User>("users", { id: body.userId });
      if (!user) throw new AppError("not_found", "Utilisateur introuvable.", 404);
      updateWhere("users", { id: body.userId }, { status: "suspended" });
    }
    if (body.action === "activate_user" && body.userId) {
      updateWhere("users", { id: body.userId }, { status: "active" });
    }
    if (body.action === "suspend_org" && body.organizationId) {
      updateWhere("organizations", { id: body.organizationId }, { status: "suspended" });
    }
    if (body.action === "activate_org" && body.organizationId) {
      updateWhere("organizations", { id: body.organizationId }, { status: "active" });
    }
    if (body.action === "change_plan" && body.organizationId && body.plan) {
      const plan = findOne<Plan>("plans", { slug: body.plan });
      const org = findOne<Organization>("organizations", { id: body.organizationId });
      if (!plan || !org) throw new AppError("not_found", "Introuvable.", 404);
      updateWhere("subscriptions", { organizationId: org.id }, { planId: plan.id, status: "active" });
    }
    await audit({ userId: admin.id, action: `admin.${body.action}`, meta: body });
    return jsonOk({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}
