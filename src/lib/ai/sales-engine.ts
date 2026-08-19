import { findMany, findOne, insert, nowIso, updateWhere } from "../db";
import { log } from "../logger";
import { recordAiUsage } from "../usage";
import { buildSystemPrompt } from "./prompt";
import { conversationStatusFromScore, detectIntent, scoreLead, type Intent } from "./intent";
import { demoReply } from "./demo-engine";
import { getAiProvider, type ChatTurn } from "./provider";
import { extractContact, maybeCreateOrderFromIntent } from "./actions";
import { runAutomations } from "../automations/engine";
import type { Agent, Conversation, KnowledgeDocument, Lead, Message, Objection, Organization, Product } from "../db/types";
import { detectPromptInjection, notePromptInjection, promptInjectionReply } from "../security/prompt-injection";
import { looksLikeSecret, sanitizeText, stripSecrets } from "../security/sanitize";

export async function processInboundMessage(input: {
  organizationId: string;
  conversationId: string;
  content: string;
  from: "customer" | "human";
}) {
  const conversation = findOne<Conversation>("conversations", {
    id: input.conversationId,
    organizationId: input.organizationId,
  });
  if (!conversation) throw new Error("conversation_not_found");

  const org = findOne<Organization>("organizations", { id: input.organizationId });
  if (!org) throw new Error("org_not_found");
  const agent = conversation.agentId
    ? findOne<Agent>("agents", { id: conversation.agentId, organizationId: input.organizationId })
    : undefined;
  const lead = conversation.leadId
    ? findOne<Lead>("leads", { id: conversation.leadId, organizationId: input.organizationId })
    : undefined;
  const history = findMany<Message>("messages", { conversationId: conversation.id }, { orderBy: "createdAt ASC", limit: 24 });
  const content = sanitizeText(input.content, 4000);
  if (looksLikeSecret(content)) {
    return {
      reply: "Je ne peux pas traiter de secrets ou de clés. Contactez un conseiller.",
      intent: "human",
      score: conversation.leadScore,
      escalate: true,
      model: "security-filter",
    };
  }
  const intent = detectIntent(content);

  insert("messages", {
    organizationId: input.organizationId,
    conversationId: conversation.id,
    role: input.from === "human" ? "human" : "customer",
    content,
    generatedByAi: false,
    intent,
  });

  if (detectPromptInjection(content)) {
    notePromptInjection({ organizationId: input.organizationId, conversationId: conversation.id });
    const reply = promptInjectionReply(org.locale || agent?.language || "fr");
    insert("messages", {
      organizationId: input.organizationId,
      conversationId: conversation.id,
      role: "assistant",
      content: reply,
      generatedByAi: true,
      intent: "human",
      metadata: JSON.stringify({ blocked: "prompt_injection" }),
    });
    return { reply, intent: "human", score: conversation.leadScore, escalate: false, model: "security-filter" };
  }

  if (/\b(stop|unsubscribe|désabon|ne plus)\b/i.test(content)) {
    updateWhere("conversations", { id: conversation.id }, { optedOut: true });
    if (conversation.leadId) updateWhere("leads", { id: conversation.leadId }, { optedOut: true });
  }

  const contact = extractContact(content);
  if (conversation.leadId && (contact.email || contact.phone || contact.name)) {
    updateWhere("leads", { id: conversation.leadId }, {
      email: contact.email || lead?.email || null,
      phone: contact.phone || lead?.phone || null,
      firstName: contact.name || lead?.firstName || null,
      lastContactAt: nowIso(),
    });
  }

  if (input.from === "human" || conversation.humanTakeover) {
    updateWhere("conversations", { id: conversation.id }, { lastMessageAt: nowIso(), intent });
    return { paused: true, intent };
  }

  const products = findMany<Product>("products", { organizationId: input.organizationId, status: "active" }, { limit: 50 });
  const knowledge = findMany<KnowledgeDocument>("knowledge_documents", { organizationId: input.organizationId }, { limit: 30 });
  const objections = findMany<Objection>("objections", { organizationId: input.organizationId });

  const mentionedProduct = products.some((p) =>
    content.toLowerCase().includes((p.name.toLowerCase().split(" ")[0] || "___")),
  );
  const mentionedBudget = /\d+/.test(content) && /(€|\$|usd|eur|budget|franc)/i.test(content);
  const nextScore = scoreLead({
    previous: conversation.leadScore,
    intent,
    mentionedBudget,
    mentionedProduct,
    messageCount: history.length + 1,
    askedHuman: intent === "human",
  });

  let replyText: string;
  let model = "demo-engine";
  let tokensIn = Math.ceil(input.content.length / 4);
  let tokensOut = 0;
  let estimatedCost = 0;
  let escalate = intent === "human" || intent === "complaint";
  let recommendIds: string[] = [];
  let wantOrder = intent === "purchase";

  const provider = getAiProvider();
  if (provider && agent) {
    try {
      const system = buildSystemPrompt({
        org,
        agent,
        products,
        knowledge,
        objections,
        maxDiscountPct: org.maxDiscountPct,
      });
      const messages: ChatTurn[] = [
        { role: "system", content: system },
        ...history.slice(-12).map((m) => ({
          role: (m.role === "assistant" ? "assistant" : "user") as "assistant" | "user",
          content: m.content,
        })),
        { role: "user", content },
      ];
      const result = await provider.complete(messages);
      replyText = stripSecrets(sanitizeText(result.text, 4000));
      model = result.model;
      tokensIn = result.tokensIn;
      tokensOut = result.tokensOut;
      estimatedCost = result.estimatedCost;
    } catch (err) {
      log("AI", "fallback_demo_engine", { error: String(err) });
      const demo = demoReply({
        text: content,
        language: agent.language,
        tone: agent.tone,
        company: org.name,
        agentName: agent.name,
        products,
        knowledge,
        objections,
        maxDiscountPct: org.maxDiscountPct,
        currency: org.currency,
      });
      replyText = demo.reply;
      escalate = demo.escalate;
      recommendIds = demo.recommendIds;
      wantOrder = demo.wantOrder;
    }
  } else {
    const demo = demoReply({
      text: content,
      language: agent?.language || org.locale || "fr",
      tone: agent?.tone || "professional",
      company: org.name,
      agentName: agent?.name || "Alex",
      products,
      knowledge,
      objections,
      maxDiscountPct: org.maxDiscountPct,
      currency: org.currency,
    });
    replyText = demo.reply;
    escalate = demo.escalate;
    recommendIds = demo.recommendIds;
    wantOrder = demo.wantOrder;
    tokensOut = Math.ceil(replyText.length / 4);
  }

  const purchased = wantOrder
    ? Boolean(
        await maybeCreateOrderFromIntent({
          organizationId: input.organizationId,
          conversationId: conversation.id,
          leadId: conversation.leadId,
          agentId: conversation.agentId,
          channel: conversation.channel,
          productIds: recommendIds,
          products,
        }),
      )
    : false;

  const status = escalate ? "transferred" : conversationStatusFromScore(nextScore, intent as Intent, purchased);

  insert("messages", {
    organizationId: input.organizationId,
    conversationId: conversation.id,
    role: "assistant",
    content: replyText,
    generatedByAi: true,
    intent,
    metadata: JSON.stringify({ model, recommendIds, escalate }),
  });

  updateWhere("conversations", { id: conversation.id }, {
    lastMessageAt: nowIso(),
    intent,
    leadScore: nextScore,
    status,
    humanTakeover: escalate ? true : conversation.humanTakeover,
    potentialValue: recommendIds.length
      ? products.filter((p) => recommendIds.includes(p.id)).reduce((s, p) => s + p.price, 0)
      : conversation.potentialValue,
  });

  if (conversation.leadId) {
    const leadStatus =
      status === "ordered" ? "order" : nextScore >= 61 ? "qualified" : nextScore >= 15 ? "contacted" : "new";
    updateWhere("leads", { id: conversation.leadId }, {
      score: nextScore,
      status: leadStatus,
      lastContactAt: nowIso(),
      productInterest: recommendIds[0]
        ? products.find((p) => p.id === recommendIds[0])?.name
        : lead?.productInterest || null,
    });
  }

  insert("conversation_events", {
    organizationId: input.organizationId,
    conversationId: conversation.id,
    type: escalate ? "escalated" : "ai_reply",
    payload: JSON.stringify({ intent, score: nextScore, model }),
  });

  await recordAiUsage({
    organizationId: input.organizationId,
    agentId: conversation.agentId,
    conversationId: conversation.id,
    model,
    tokensIn,
    tokensOut,
    estimatedCost,
  });

  insert("analytics_events", {
    organizationId: input.organizationId,
    name: "ai_message",
    value: 1,
    meta: JSON.stringify({ intent, score: nextScore }),
  });

  if (nextScore >= 81 && conversation.leadId) {
    insert("notifications", {
      organizationId: input.organizationId,
      type: "hot_lead",
      title: "Lead chaud",
      body: `Lead score ${nextScore}/100`,
      href: `/app/conversations/${conversation.id}`,
    });
  }

  await runAutomations(input.organizationId, escalate ? "human_transfer" : "new_message", {
    conversationId: conversation.id,
    leadId: conversation.leadId,
    score: nextScore,
    intent,
  });

  return { reply: replyText, intent, score: nextScore, escalate, model };
}

export function explainReply(text: string, intent: string) {
  return {
    intent,
    reasons: [
      `Intention détectée : ${intent}`,
      "Réponse limitée au catalogue, à la base de connaissances et aux règles commerciales.",
      "Aucun prix, remise ou délai n'est inventé.",
      text.includes("équipe") || text.toLowerCase().includes("team")
        ? "Information manquante → vérification humaine."
        : "Information issue des données configurées.",
    ],
  };
}
