import { count, findMany, findOne, sum } from "./db";
import type { Agent, Conversation, Invoice, Lead, Order, Organization, Product } from "./db/types";
import { formatMoney } from "./currency";

export function dashboardKpis(org: Organization) {
  const today = new Date().toISOString().slice(0, 10);
  const conversationsToday = count("conversations", { organizationId: org.id }, "createdAt >= ?", [today]);
  const leads = count("leads", { organizationId: org.id });
  const qualified = count("leads", { organizationId: org.id }, "score >= 61", []);
  const orders = count("orders", { organizationId: org.id });
  const revenue = sum("orders", "total", { organizationId: org.id }, "paymentStatus = 'paid'", []);
  const aiRevenue = sum("orders", "total", { organizationId: org.id }, "paymentStatus = 'paid' AND attributedToAi = 1", []);
  const conversations = count("conversations", { organizationId: org.id });
  const abandoned = count("conversations", { organizationId: org.id, status: "abandoned" });
  const followUps = count("analytics_events", { organizationId: org.id, name: "follow_up" });
  const paidOrders = count("orders", { organizationId: org.id }, "paymentStatus = 'paid'", []);
  return {
    conversationsToday,
    leads,
    qualified,
    orders,
    revenue,
    aiRevenue,
    conversion: conversations ? (orders / conversations) * 100 : 0,
    aov: paidOrders ? revenue / paidOrders : 0,
    abandoned,
    followUps,
    revenueLabel: formatMoney(revenue, org.currency, org.locale),
    aiRevenueLabel: formatMoney(aiRevenue, org.currency, org.locale),
    aovLabel: formatMoney(paidOrders ? revenue / paidOrders : 0, org.currency, org.locale),
  };
}

export function listConversations(orgId: string) {
  const conversations = findMany<Conversation>("conversations", { organizationId: orgId }, { orderBy: "lastMessageAt DESC", limit: 200 });
  const leads = findMany<Lead>("leads", { organizationId: orgId });
  const agents = findMany<Agent>("agents", { organizationId: orgId });
  return conversations.map((c) => {
    const lead = leads.find((l) => l.id === c.leadId);
    return {
      ...c,
      leadName: [lead?.firstName, lead?.lastName].filter(Boolean).join(" ") || "Visiteur",
      agentName: agents.find((a) => a.id === c.agentId)?.name || "Agent",
    };
  });
}

export function listProducts(orgId: string) {
  return findMany<Product>("products", { organizationId: orgId }, { orderBy: "createdAt DESC" });
}

export function listLeads(orgId: string) {
  return findMany<Lead>("leads", { organizationId: orgId }, { orderBy: "updatedAt DESC" });
}

export function listOrders(orgId: string) {
  const orders = findMany<Order>("orders", { organizationId: orgId }, { orderBy: "createdAt DESC" });
  const leads = findMany<Lead>("leads", { organizationId: orgId });
  return orders.map((o) => ({
    ...o,
    customer: [leads.find((l) => l.id === o.leadId)?.firstName, leads.find((l) => l.id === o.leadId)?.lastName]
      .filter(Boolean)
      .join(" ") || "—",
  }));
}

export function orgInvoices(orgId: string) {
  return findMany<Invoice>("invoices", { organizationId: orgId }, { orderBy: "createdAt DESC" });
}

export function firstAgent(orgId: string) {
  return findMany<Agent>("agents", { organizationId: orgId }, { limit: 1 })[0];
}

export function getOrgBySlug(slug: string) {
  return findOne<Organization>("organizations", { slug });
}
