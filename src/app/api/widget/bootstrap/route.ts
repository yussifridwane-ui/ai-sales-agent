import { NextRequest } from "next/server";
import { findOne } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api-guard";
import { AppError } from "@/lib/errors";
import type { Agent, Organization, WidgetSettings } from "@/lib/db/types";

export async function GET(req: NextRequest) {
  try {
    const slug = req.nextUrl.searchParams.get("org");
    if (!slug) throw new AppError("invalid_input", "Organisation requise.");
    const org = findOne<Organization>("organizations", { slug });
    if (!org || org.status !== "active") throw new AppError("not_found", "Organisation introuvable.", 404);
    const widget = findOne<WidgetSettings>("widget_settings", { organizationId: org.id });
    if (widget && !widget.enabled) throw new AppError("disabled", "Widget désactivé.", 403);
    const agent = widget?.agentId
      ? findOne<Agent>("agents", { id: widget.agentId })
      : findOne<Agent>("agents", { organizationId: org.id });
    return jsonOk({
      org: { name: org.name, slug: org.slug, currency: org.currency },
      widget: widget || { primaryColor: "#14B8A6", position: "right" },
      agent: agent ? { name: agent.name, greeting: agent.greeting, avatar: agent.avatar } : null,
    });
  } catch (e) {
    return jsonError(e);
  }
}
