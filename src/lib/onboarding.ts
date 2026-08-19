import { findOne, insert, uniqueSlug } from "./db";
import { PLANS } from "./plans";
import type { Plan } from "./db/types";
import { AppError } from "./errors";

export function ensurePlans() {
  for (const plan of PLANS) {
    const existing = findOne<Plan>("plans", { slug: plan.slug });
    if (existing) continue;
    insert("plans", {
      slug: plan.slug,
      name: plan.name,
      priceMonthly: plan.priceMonthly,
      conversationLimit: plan.conversationLimit,
      agentLimit: plan.agentLimit,
      productLimit: plan.productLimit,
      teamLimit: plan.teamLimit,
      automationsEnabled: plan.automationsEnabled,
      analyticsEnabled: plan.analyticsEnabled,
      advancedAnalytics: plan.advancedAnalytics,
      apiAccess: plan.apiAccess,
      prioritySupport: plan.prioritySupport,
      widgetEnabled: plan.widgetEnabled,
      features: JSON.stringify(plan.features),
      sortOrder: plan.sortOrder,
      active: true,
    });
  }
}

export function completeOnboarding(input: {
  userId: string;
  companyName: string;
  country: string;
  currency: string;
  industry: string;
  salesGoal: string;
  agentName: string;
  tone: string;
  languages: string[];
}) {
  ensurePlans();
  if (!input.companyName.trim()) throw new AppError("invalid_input", "Nom d'entreprise requis.");
  const slug = uniqueSlug(input.companyName);
  const orgId = insert("organizations", {
    name: input.companyName.trim(),
    slug,
    country: input.country || "US",
    currency: input.currency || "USD",
    industry: input.industry || "other",
    salesGoal: input.salesGoal || "sell",
    locale: input.languages[0] || "fr",
    onboardingDone: true,
    maxDiscountPct: 0,
  });
  insert("organization_members", { organizationId: orgId, userId: input.userId, role: "owner" });
  const free = findOne<Plan>("plans", { slug: "free" });
  if (free) {
    insert("subscriptions", {
      organizationId: orgId,
      planId: free.id,
      status: "trialing",
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 14 * 86400000).toISOString(),
      trialEndsAt: new Date(Date.now() + 14 * 86400000).toISOString(),
    });
  }
  const lang = input.languages[0] || "fr";
  const greeting =
    lang === "fr"
      ? `Bonjour, je suis ${input.agentName}, votre assistant commercial. Comment puis-je vous aider ?`
      : `Hi, I'm ${input.agentName}, your sales assistant. How can I help you today?`;
  const agentId = insert("agents", {
    organizationId: orgId,
    name: input.agentName.trim() || "Alex - Sales Assistant",
    avatar: (input.agentName.trim() || "A")[0].toUpperCase(),
    description: "Commerciale virtuelle",
    language: lang,
    languages: JSON.stringify(input.languages.length ? input.languages : [lang]),
    tone: input.tone || "professional",
    role: "virtual_salesperson",
    objective: "Transformer les prospects en clients.",
    greeting,
    isActive: true,
  });
  insert("agent_instructions", {
    organizationId: orgId,
    agentId,
    roleBlock: "Virtual salesperson",
    restrictions: "Never invent prices. Never exceed max discount.",
  });
  insert("sales_scripts", {
    organizationId: orgId,
    agentId,
    greeting,
    qualificationQuestions: JSON.stringify([
      "Quel besoin souhaitez-vous résoudre ?",
      "Avez-vous un budget en tête ?",
      "Pour quand en avez-vous besoin ?",
    ]),
    arguments: JSON.stringify([]),
    ctas: JSON.stringify(["Je peux préparer une commande et un lien de paiement."]),
  });
  insert("widget_settings", {
    organizationId: orgId,
    agentId,
    greeting,
    allowedDomains: JSON.stringify(["*"]),
    enabled: true,
  });
  const defaultIntegrations = ["whatsapp", "instagram", "website", "email", "stripe", "paypal"];
  for (const provider of defaultIntegrations) {
    insert("integrations", {
      organizationId: orgId,
      provider,
      status: provider === "website" ? "connected" : "not_connected",
      config: JSON.stringify({ mode: provider === "website" ? "widget" : "requires_setup" }),
    });
  }
  insert("objections", {
    organizationId: orgId,
    phrase: "c'est trop cher",
    response:
      "Je comprends. Je m'appuie uniquement sur les tarifs du catalogue. Aucune remise n'est inventée. Si une remise maximale est configurée, je la respecterai.",
  });
  insert("objections", {
    organizationId: orgId,
    phrase: "je vais réfléchir",
    response: "Bien sûr. Je peux vous résumer l'offre du catalogue. Répondez quand vous serez prêt, sans pression.",
  });
  insert("knowledge_documents", {
    organizationId: orgId,
    title: "Entreprise",
    type: "company",
    content: `${input.companyName}. Pays: ${input.country}. Devise: ${input.currency}. Secteur: ${input.industry}.`,
  });
  return { organizationId: orgId, agentId, slug };
}
