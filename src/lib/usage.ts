import { count, findOne, insert, sum } from "./db";
import { AppError } from "./errors";
import { getPlan } from "./plans";
import type { Plan, Subscription } from "./db/types";

export async function getPeriodUsage(organizationId: string) {
  const sub = findOne<Subscription>("subscriptions", { organizationId });
  const plan = sub ? findOne<Plan>("plans", { id: sub.planId }) : undefined;
  const start =
    sub?.currentPeriodStart ?? new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const conversations = count("conversations", { organizationId }, "createdAt >= ? AND isDemo = 0", [start]);
  const agents = count("agents", { organizationId });
  const products = count("products", { organizationId });
  const members = count("organization_members", { organizationId });
  const tokensIn = sum("usage_records", "tokensIn", { organizationId }, "createdAt >= ?", [start]);
  const tokensOut = sum("usage_records", "tokensOut", { organizationId }, "createdAt >= ?", [start]);
  const estimatedCost = sum("usage_records", "estimatedCost", { organizationId }, "createdAt >= ?", [start]);
  return {
    conversations,
    agents,
    products,
    members,
    tokensIn,
    tokensOut,
    estimatedCost,
    plan,
    periodStart: start,
    periodEnd: sub?.currentPeriodEnd,
  };
}

export async function assertConversationQuota(organizationId: string) {
  const usage = await getPeriodUsage(organizationId);
  const limit = usage.plan?.conversationLimit ?? getPlan("free").conversationLimit;
  if (usage.conversations >= limit) {
    throw new AppError(
      "quota_conversations",
      `Limite atteinte : ${usage.conversations} / ${limit} conversations. Passez à un plan supérieur.`,
      402,
    );
  }
}

export async function assertAgentQuota(organizationId: string) {
  const usage = await getPeriodUsage(organizationId);
  const limit = usage.plan?.agentLimit ?? 1;
  if (usage.agents >= limit) {
    throw new AppError("quota_agents", `Limite d'agents atteinte (${limit}). Passez à un plan supérieur.`, 402);
  }
}

export async function assertProductQuota(organizationId: string) {
  const usage = await getPeriodUsage(organizationId);
  const limit = usage.plan?.productLimit ?? 10;
  if (usage.products >= limit) {
    throw new AppError("quota_products", `Limite de produits atteinte (${limit}). Passez à un plan supérieur.`, 402);
  }
}

export async function recordAiUsage(input: {
  organizationId: string;
  agentId?: string | null;
  conversationId?: string | null;
  model: string;
  tokensIn: number;
  tokensOut: number;
  estimatedCost: number;
}) {
  insert("usage_records", {
    organizationId: input.organizationId,
    agentId: input.agentId ?? null,
    conversationId: input.conversationId ?? null,
    model: input.model,
    tokensIn: input.tokensIn,
    tokensOut: input.tokensOut,
    estimatedCost: input.estimatedCost,
  });
}
