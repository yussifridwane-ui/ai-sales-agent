import { NextRequest } from "next/server";
import { jsonError, jsonOk, requireAuthOrg } from "@/lib/api-guard";
import { findMany, findOne, updateWhere } from "@/lib/db";
import { AppError } from "@/lib/errors";
import type { Conversation, Lead, Message, Order } from "@/lib/db/types";
import { scoreLabel } from "@/lib/ai/intent";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { org } = await requireAuthOrg(req, "conversations.read");
    const { id } = await ctx.params;
    const conversation = findOne<Conversation>("conversations", { id, organizationId: org.id });
    if (!conversation) throw new AppError("not_found", "Conversation introuvable.", 404);
    const messages = findMany<Message>("messages", { conversationId: id, organizationId: org.id }, { orderBy: "createdAt ASC" });
    const lead = conversation.leadId ? findOne<Lead>("leads", { id: conversation.leadId, organizationId: org.id }) : null;
    const orders = findMany<Order>("orders", { conversationId: id, organizationId: org.id });
    return jsonOk({ conversation, messages, lead, orders, score: scoreLabel(conversation.leadScore) });
  } catch (e) {
    return jsonError(e);
  }
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { org } = await requireAuthOrg(req, "conversations.write");
    const { id } = await ctx.params;
    const conversation = findOne<Conversation>("conversations", { id, organizationId: org.id });
    if (!conversation) throw new AppError("not_found", "Conversation introuvable.", 404);
    const body = (await req.json()) as { humanTakeover?: boolean; status?: string };
    const patch: Record<string, unknown> = {};
    if (typeof body.humanTakeover === "boolean") patch.humanTakeover = body.humanTakeover;
    if (body.status && ["new", "open", "qualified", "ordered", "abandoned", "transferred"].includes(body.status)) {
      patch.status = body.status;
    }
    updateWhere("conversations", { id, organizationId: org.id }, patch);
    return jsonOk({ conversation: findOne("conversations", { id, organizationId: org.id }) });
  } catch (e) {
    return jsonError(e);
  }
}
