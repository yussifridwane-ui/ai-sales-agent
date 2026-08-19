import { NextRequest } from "next/server";
import { jsonError, jsonOk, requireAuthOrg } from "@/lib/api-guard";
import { findMany, findOne, insert, nowIso, updateWhere } from "@/lib/db";
import { PLANS } from "@/lib/plans";
import { getPeriodUsage } from "@/lib/usage";
import { AppError } from "@/lib/errors";
import { audit } from "@/lib/audit";
import type { Invoice, Plan } from "@/lib/db/types";

export async function GET(req: NextRequest) {
  try {
    const { org } = await requireAuthOrg(req, "billing.read");
    const usage = await getPeriodUsage(org.id);
    const invoices = findMany<Invoice>("invoices", { organizationId: org.id }, { orderBy: "createdAt DESC" });
    return jsonOk({
      plans: PLANS,
      subscription: org.subscription,
      usage,
      invoices,
    });
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { org, user } = await requireAuthOrg(req, "billing.write");
    const body = (await req.json()) as { plan?: string; action?: "upgrade" | "downgrade" | "cancel" | "resume" };
    if (body.action === "cancel" && org.subscription) {
      updateWhere("subscriptions", { organizationId: org.id }, { cancelAtPeriodEnd: true });
      await audit({ organizationId: org.id, userId: user.id, action: "billing.cancel" });
      return jsonOk({ ok: true });
    }
    if (body.action === "resume" && org.subscription) {
      updateWhere("subscriptions", { organizationId: org.id }, { cancelAtPeriodEnd: false });
      return jsonOk({ ok: true });
    }
    if (!body.plan) throw new AppError("invalid_input", "Plan requis.");
    const plan = findOne<Plan>("plans", { slug: body.plan });
    if (!plan) throw new AppError("not_found", "Plan introuvable.", 404);
    if (!org.subscription) {
      insert("subscriptions", {
        organizationId: org.id,
        planId: plan.id,
        status: "active",
        currentPeriodStart: nowIso(),
        currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
      });
    } else {
      updateWhere("subscriptions", { organizationId: org.id }, {
        planId: plan.id,
        status: "active",
        cancelAtPeriodEnd: false,
      });
    }
    if (plan.priceMonthly > 0) {
      insert("invoices", {
        organizationId: org.id,
        number: `INV-${Date.now()}`,
        amount: plan.priceMonthly * 100,
        currency: "USD",
        status: process.env.STRIPE_SECRET_KEY ? "open" : "demo",
        periodStart: nowIso(),
        periodEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
      });
    }
    await audit({ organizationId: org.id, userId: user.id, action: "billing.change_plan", meta: { plan: body.plan } });
    return jsonOk({
      ok: true,
      notice: process.env.STRIPE_SECRET_KEY
        ? undefined
        : "Changement de plan enregistré. Le paiement Stripe n'est pas configuré — aucun débit réel.",
    });
  } catch (e) {
    return jsonError(e);
  }
}
