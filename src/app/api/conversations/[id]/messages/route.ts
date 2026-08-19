import { NextRequest } from "next/server";
import { jsonError, jsonOk, requireAuthOrg } from "@/lib/api-guard";
import { findOne } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { processInboundMessage } from "@/lib/ai/sales-engine";
import { explainReply } from "@/lib/ai/sales-engine";
import type { Conversation } from "@/lib/db/types";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { org } = await requireAuthOrg(req);
    const { id } = await ctx.params;
    const conversation = findOne<Conversation>("conversations", { id, organizationId: org.id });
    if (!conversation) throw new AppError("not_found", "Conversation introuvable.", 404);
    const body = (await req.json()) as { content?: string; asHuman?: boolean };
    if (!body.content?.trim()) throw new AppError("invalid_input", "Message vide.");
    const result = await processInboundMessage({
      organizationId: org.id,
      conversationId: id,
      content: body.content.trim(),
      from: body.asHuman ? "human" : "customer",
    });
    return jsonOk({
      ...result,
      explanation: result && "reply" in result && result.reply ? explainReply(result.reply, result.intent) : null,
    });
  } catch (e) {
    return jsonError(e);
  }
}
