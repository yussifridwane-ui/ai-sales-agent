import { NextRequest } from "next/server";
import { jsonError, jsonOk, requireAuthOrg } from "@/lib/api-guard";
import { findMany, findOne, insert, nowIso } from "@/lib/db";
import { assertConversationQuota } from "@/lib/usage";
import { AppError } from "@/lib/errors";
import type { Agent, Conversation, Lead, Message } from "@/lib/db/types";

export async function GET(req: NextRequest) {
  try {
    const { org } = await requireAuthOrg(req);
    const status = req.nextUrl.searchParams.get("status");
    const conversations = findMany<Conversation>(
      "conversations",
      status && status !== "all" ? { organizationId: org.id, status } : { organizationId: org.id },
      { orderBy: "lastMessageAt DESC", limit: 200 },
    );
    const leads = findMany<Lead>("leads", { organizationId: org.id });
    const agents = findMany<Agent>("agents", { organizationId: org.id });
    const decorated = conversations.map((c) => {
      const lead = leads.find((l) => l.id === c.leadId);
      const agent = agents.find((a) => a.id === c.agentId);
      const last = findMany<Message>("messages", { conversationId: c.id }, { orderBy: "createdAt DESC", limit: 1 })[0];
      return {
        ...c,
        leadName: [lead?.firstName, lead?.lastName].filter(Boolean).join(" ") || "Visiteur",
        agentName: agent?.name || "Agent",
        lastPreview: last?.content?.slice(0, 90) || "",
      };
    });
    return jsonOk({ conversations: decorated });
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { org } = await requireAuthOrg(req);
    await assertConversationQuota(org.id);
    const body = (await req.json()) as { agentId?: string; channel?: string; name?: string; test?: boolean };
    const agent = body.agentId
      ? findOne<Agent>("agents", { id: body.agentId, organizationId: org.id })
      : findMany<Agent>("agents", { organizationId: org.id, isActive: true }, { limit: 1 })[0];
    if (!agent) throw new AppError("not_found", "Aucun agent actif.", 404);
    const leadId = insert("leads", {
      organizationId: org.id,
      firstName: body.name || (body.test ? "Test" : "Visiteur"),
      source: body.test ? "test_chat" : "website",
      channel: body.channel || "website",
      status: "new",
    });
    const id = insert("conversations", {
      organizationId: org.id,
      leadId,
      agentId: agent.id,
      channel: body.channel || "website",
      status: "new",
      lastMessageAt: nowIso(),
    });
    if (agent.greeting) {
      insert("messages", {
        organizationId: org.id,
        conversationId: id,
        role: "assistant",
        content: agent.greeting,
        generatedByAi: true,
      });
    }
    insert("analytics_events", { organizationId: org.id, name: "conversation", value: 1 });
    return jsonOk({ conversation: findOne("conversations", { id, organizationId: org.id }) }, 201);
  } catch (e) {
    return jsonError(e);
  }
}
