import type { Product } from "../db/types";
import { findMany, findOne, insert } from "../db";
import { runAutomations } from "../automations/engine";
import type { Organization, Order } from "../db/types";
import { computeOrderTotals, officialProduct } from "../security/pricing";

export function extractContact(text: string) {
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0];
  const phone = text.match(/(\+?\d[\d\s.-]{7,}\d)/)?.[0]?.replace(/\s+/g, "");
  const nameMatch = text.match(/(?:je m'appelle|my name is|i am|je suis)\s+([A-Za-zÀ-ÿ' -]{2,40})/i);
  return { email, phone, name: nameMatch?.[1]?.trim() };
}

export function nextOrderNumber() {
  const n = Math.floor(10000 + Math.random() * 89999);
  return `CMD-${new Date().getFullYear()}-${n}`;
}

export async function maybeCreateOrderFromIntent(input: {
  organizationId: string;
  conversationId: string;
  leadId?: string | null;
  agentId?: string | null;
  channel: string;
  productIds: string[];
  products: Product[];
}) {
  const existing = findMany<Order>(
    "orders",
    { conversationId: input.conversationId },
    { extra: "status IN ('pending','confirmed')", limit: 1 },
  )[0];
  if (existing) return existing;

  const hinted = input.productIds[0];
  let productId = hinted;
  if (productId) {
    try {
      officialProduct(input.organizationId, productId);
    } catch {
      productId = "";
    }
  }
  if (!productId) {
    const fallback = input.products.find((p) => p.status === "active" && !p.forbiddenForAi);
    productId = fallback?.id || "";
  }
  if (!productId) return null;

  const totals = computeOrderTotals({
    organizationId: input.organizationId,
    items: [{ productId, quantity: 1 }],
  });
  const org = findOne<Organization>("organizations", { id: input.organizationId });
  if (!org) return null;

  const orderId = insert("orders", {
    organizationId: input.organizationId,
    number: nextOrderNumber(),
    leadId: input.leadId ?? null,
    conversationId: input.conversationId,
    agentId: input.agentId ?? null,
    channel: input.channel,
    source: "ai_sales_agent",
    subtotal: totals.subtotal,
    discount: totals.discount,
    shipping: totals.shipping,
    tax: totals.tax,
    total: totals.total,
    currency: totals.currency,
    status: "pending",
    paymentStatus: "unpaid",
    attributedToAi: true,
  });
  for (const line of totals.lines) {
    insert("order_items", {
      organizationId: input.organizationId,
      orderId,
      productId: line.productId,
      name: line.name,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      total: line.total,
    });
  }
  insert("analytics_events", {
    organizationId: input.organizationId,
    name: "order_created",
    value: totals.total,
    meta: JSON.stringify({ orderId, ai: true }),
  });
  insert("notifications", {
    organizationId: input.organizationId,
    type: "new_order",
    title: "Nouvelle commande",
    body: `${orderId} · ${totals.total} ${totals.currency}`,
    href: `/app/orders/${orderId}`,
  });
  await runAutomations(input.organizationId, "order_created", { orderId });
  return findOne<Order>("orders", { id: orderId, organizationId: input.organizationId });
}

export async function createManualOrder(input: {
  organizationId: string;
  leadId?: string;
  conversationId?: string;
  items: { productId: string; quantity: number }[];
  discount?: number;
  shipping?: number;
  tax?: number;
  notes?: string;
}) {
  const totals = computeOrderTotals({
    organizationId: input.organizationId,
    items: input.items,
    requestedDiscount: input.discount,
    shipping: input.shipping,
    tax: input.tax,
  });
  const orderId = insert("orders", {
    organizationId: input.organizationId,
    number: nextOrderNumber(),
    leadId: input.leadId ?? null,
    conversationId: input.conversationId ?? null,
    channel: "manual",
    source: "dashboard",
    subtotal: totals.subtotal,
    discount: totals.discount,
    shipping: totals.shipping,
    tax: totals.tax,
    total: totals.total,
    currency: totals.currency,
    notes: input.notes ?? null,
    attributedToAi: false,
    status: "pending",
    paymentStatus: "unpaid",
  });
  for (const line of totals.lines) {
    insert("order_items", {
      organizationId: input.organizationId,
      orderId,
      productId: line.productId,
      name: line.name,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      total: line.total,
    });
  }
  return findOne<Order>("orders", { id: orderId, organizationId: input.organizationId })!;
}
