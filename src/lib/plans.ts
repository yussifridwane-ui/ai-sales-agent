export type PlanSlug = "free" | "starter" | "business" | "pro";

export type PlanDefinition = {
  slug: PlanSlug;
  name: string;
  priceMonthly: number;
  conversationLimit: number;
  agentLimit: number;
  productLimit: number;
  teamLimit: number;
  automationsEnabled: boolean;
  analyticsEnabled: boolean;
  advancedAnalytics: boolean;
  apiAccess: boolean;
  prioritySupport: boolean;
  widgetEnabled: boolean;
  features: string[];
  sortOrder: number;
};

export const PLANS: PlanDefinition[] = [
  {
    slug: "free",
    name: "Free",
    priceMonthly: 0,
    conversationLimit: 50,
    agentLimit: 1,
    productLimit: 10,
    teamLimit: 1,
    automationsEnabled: false,
    analyticsEnabled: true,
    advancedAnalytics: false,
    apiAccess: false,
    prioritySupport: false,
    widgetEnabled: true,
    features: ["50 conversations/month", "1 AI agent", "10 products", "Website widget", "Demo channels"],
    sortOrder: 0,
  },
  {
    slug: "starter",
    name: "Starter",
    priceMonthly: 9,
    conversationLimit: 500,
    agentLimit: 1,
    productLimit: 100,
    teamLimit: 2,
    automationsEnabled: false,
    analyticsEnabled: true,
    advancedAnalytics: false,
    apiAccess: false,
    prioritySupport: false,
    widgetEnabled: true,
    features: ["500 conversations", "1 agent", "Full catalog", "Lead scoring", "Orders"],
    sortOrder: 1,
  },
  {
    slug: "business",
    name: "Business",
    priceMonthly: 29,
    conversationLimit: 5000,
    agentLimit: 5,
    productLimit: 1000,
    teamLimit: 8,
    automationsEnabled: true,
    analyticsEnabled: true,
    advancedAnalytics: true,
    apiAccess: false,
    prioritySupport: false,
    widgetEnabled: true,
    features: ["5,000 conversations", "Multiple agents", "Automations", "Analytics", "AI Insights"],
    sortOrder: 2,
  },
  {
    slug: "pro",
    name: "Pro",
    priceMonthly: 79,
    conversationLimit: 50000,
    agentLimit: 25,
    productLimit: 10000,
    teamLimit: 50,
    automationsEnabled: true,
    analyticsEnabled: true,
    advancedAnalytics: true,
    apiAccess: true,
    prioritySupport: true,
    widgetEnabled: true,
    features: ["High volume", "Team seats", "Advanced analytics", "API access", "Priority support"],
    sortOrder: 3,
  },
];

export function getPlan(slug: string) {
  return PLANS.find((p) => p.slug === slug) ?? PLANS[0];
}
