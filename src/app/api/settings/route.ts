import { NextRequest } from "next/server";
import { jsonError, jsonOk, requireAuthOrg } from "@/lib/api-guard";
import { findMany, findOne, insert, updateWhere } from "@/lib/db";
import type { CommercialRule, Organization, WidgetSettings } from "@/lib/db/types";

export async function GET(req: NextRequest) {
  try {
    const { org, user, membership } = await requireAuthOrg(req);
    const widget = findOne<WidgetSettings>("widget_settings", { organizationId: org.id });
    const rules = findMany<CommercialRule>("commercial_rules", { organizationId: org.id });
    return jsonOk({
      organization: org,
      user: { id: user.id, email: user.email, name: user.name, locale: user.locale },
      role: membership.role,
      widget,
      rules,
    });
  } catch (e) {
    return jsonError(e);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { org } = await requireAuthOrg(req);
    const body = (await req.json()) as Partial<Organization> & { widget?: Partial<WidgetSettings>; rules?: Record<string, string> };
    const allowed = [
      "name",
      "country",
      "currency",
      "industry",
      "salesGoal",
      "website",
      "phone",
      "email",
      "address",
      "maxDiscountPct",
      "shippingPolicy",
      "refundPolicy",
      "locale",
      "timezone",
    ];
    const patch: Record<string, unknown> = {};
    for (const k of allowed) if (k in body) patch[k] = (body as Record<string, unknown>)[k];
    if (Object.keys(patch).length) updateWhere("organizations", { id: org.id }, patch);
    if (body.widget) {
      const existing = findOne<WidgetSettings>("widget_settings", { organizationId: org.id });
      if (existing) updateWhere("widget_settings", { organizationId: org.id }, body.widget as Record<string, unknown>);
      else insert("widget_settings", { organizationId: org.id, ...body.widget });
    }
    if (body.rules) {
      for (const [key, value] of Object.entries(body.rules)) {
        const rec = findOne<CommercialRule>("commercial_rules", { organizationId: org.id, key });
        if (rec) updateWhere("commercial_rules", { id: rec.id }, { value });
        else insert("commercial_rules", { organizationId: org.id, key, value });
      }
    }
    return jsonOk({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}
