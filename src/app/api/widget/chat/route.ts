import { NextRequest } from "next/server";
import { findMany, findOne, insert, nowIso } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api-guard";
import { AppError } from "@/lib/errors";
import { assertConversationQuota } from "@/lib/usage";
import { processInboundMessage } from "@/lib/ai/sales-engine";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/api-guard";
import type { Agent, Conversation, Organization, WidgetSettings } from "@/lib/db/types";

export async function POST(req: NextRequest) {
  try {
    const limited = rateLimit(`widget:${clientIp(req)}`, 40, 60_000);
    if (!limited.ok) throw new AppError("rate_limited", "Trop de messages.", 429);
    const body = (await req.json()) as { org?: string; conversationId?: string; content?: string; name?: string };
    if (!body.org) throw new AppError("invalid_input", "Organisation requise.");
    const org = findOne<Organization>("organizations", { slug: body.org });
    if (!org) throw new AppError("not_found", "Organisation introuvable.", 404);
    const widget = findOne<WidgetSettings>("widget_settings", { organizationId: org.id });
    if (widget && !widget.enabled) throw new AppError("disabled", "Widget désactivé.", 403);

    let conversationId = body.conversationId;
    if (conversationId) {
      const existing = findOne<Conversation>("conversations", { id: conversationId, organizationId: org.id });
      if (!existing) conversationId = undefined;
    }
    if (!conversationId) {
      await assertConversationQuota(org.id);
      const agent = widget?.agentId
        ? findOne<Agent>("agents", { id: widget.agentId })
        : findMany<Agent>("agents", { organizationId: org.id, isActive: true }, { limit: 1 })[0];
      const leadId = insert("leads", {
        organizationId: org.id,
        firstName: body.name || "Visiteur",
        source: "widget",
        channel: "website",
        status: "new",
      });
      conversationId = insert("conversations", {
        organizationId: org.id,
        leadId,
        agentId: agent?.id || null,
        channel: "website",
        status: "new",
        lastMessageAt: nowIso(),
      });
      if (agent?.greeting) {
        insert("messages", {
          organizationId: org.id,
          conversationId,
          role: "assistant",
          content: agent.greeting,
          generatedByAi: true,
        });
      }
      insert("analytics_events", { organizationId: org.id, name: "conversation", value: 1 });
    }

    if (body.content?.trim()) {
      const result = await processInboundMessage({
        organizationId: org.id,
        conversationId,
        content: body.content.trim(),
        from: "customer",
      });
      return jsonOk({ conversationId, ...result });
    }
    return jsonOk({ conversationId });
  } catch (e) {
    return jsonError(e);
  }
}
