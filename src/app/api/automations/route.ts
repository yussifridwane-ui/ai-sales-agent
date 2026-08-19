import { NextRequest } from "next/server";
import { jsonError, jsonOk, requireAuthOrg } from "@/lib/api-guard";
import { findMany, findOne, insert, updateWhere } from "@/lib/db";
import { AppError } from "@/lib/errors";
import type { AutomationRule } from "@/lib/db/types";

export async function GET(req: NextRequest) {
  try {
    const { org } = await requireAuthOrg(req, "automations.read");
    const automationsEnabled = Boolean(org.subscription?.plan.automationsEnabled);
    return jsonOk({
      automationsEnabled,
      rules: findMany<AutomationRule>("automation_rules", { organizationId: org.id }, { orderBy: "createdAt DESC" }),
      runs: findMany("automation_runs", { organizationId: org.id }, { orderBy: "createdAt DESC", limit: 30 }),
    });
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { org } = await requireAuthOrg(req, "automations.write");
    if (!org.subscription?.plan.automationsEnabled) {
      throw new AppError("plan_required", "Les automatisations nécessitent le plan Business ou Pro.", 402);
    }
    const body = (await req.json()) as Partial<AutomationRule>;
    if (!body.name || !body.trigger) throw new AppError("invalid_input", "Nom et déclencheur requis.");
    const id = insert("automation_rules", {
      organizationId: org.id,
      name: body.name,
      trigger: body.trigger,
      conditions: body.conditions || "{}",
      actions: typeof body.actions === "string" ? body.actions : JSON.stringify(body.actions || []),
      isActive: body.isActive !== false,
    });
    return jsonOk({ rule: findOne("automation_rules", { id, organizationId: org.id }) }, 201);
  } catch (e) {
    return jsonError(e);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { org } = await requireAuthOrg(req, "automations.write");
    const body = (await req.json()) as Partial<AutomationRule> & { id: string };
    const rule = findOne<AutomationRule>("automation_rules", { id: body.id, organizationId: org.id });
    if (!rule) throw new AppError("not_found", "Règle introuvable.", 404);
    const { id, organizationId: _o, ...rest } = body;
    if (rest.actions && typeof rest.actions !== "string") rest.actions = JSON.stringify(rest.actions);
    updateWhere("automation_rules", { id, organizationId: org.id }, rest as Record<string, unknown>);
    return jsonOk({ rule: findOne("automation_rules", { id }) });
  } catch (e) {
    return jsonError(e);
  }
}
