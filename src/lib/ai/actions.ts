import type { Product } from "../db/types";
import { findMany, findOne, insert, nowIso } from "../db";
import { runAutomations } from "../automations/engine";
import type { Organization, Order } from "../db/types";

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

  const chosen =
    input.products.filter((p) => input.productIds.includes(p.id))[0] ||
    input.products.find((p) => p.status === "active" && !p.forbiddenForAi);
  if (!chosen) return null;

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
    subtotal: chosen.price,
    discount: 0,
    shipping: 0,
    tax: 0,
    total: chosen.price,
    currency: chosen.currency || org.currency,
    status: "pending",
    paymentStatus: "unpaid",
    attributedToAi: true,
  });
  insert("order_items", {
    organizationId: input.organizationId,
    orderId,
    productId: chosen.id,
    name: chosen.name,
    quantity: 1,
    unitPrice: chosen.price,
    total: chosen.price,
  });
  insert("analytics_events", {
    organizationId: input.organizationId,
    name: "order_created",
    value: chosen.price,
    meta: JSON.stringify({ orderId, ai: true }),
  });
  insert("notifications", {
    organizationId: input.organizationId,
    type: "new_order",
    title: "Nouvelle commande",
    body: `${orderId} · ${chosen.price} ${chosen.currency}`,
    href: `/app/orders/${orderId}`,
  });
  await runAutomations(input.organizationId, "order_created", { orderId });
  return findOne<Order>("orders", { id: orderId });
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
  const org = findOne<Organization>("organizations", { id: input.organizationId });
  if (!org) throw new Error("org_not_found");
  const products = findMany<Product>("products", { organizationId: input.organizationId });
  const lines = input.items.map((i) => {
    const p = products.find((x) => x.id === i.productId);
    if (!p) throw new Error("product_not_found");
    return {
      productId: p.id,
      name: p.name,
      quantity: i.quantity,
      unitPrice: p.price,
      total: p.price * i.quantity,
    };
  });
  const subtotal = lines.reduce((s, l) => s + l.total, 0);
  const discount = Math.max(0, input.discount ?? 0);
  const shipping = Math.max(0, input.shipping ?? 0);
  const tax = Math.max(0, input.tax ?? 0);
  const orderId = insert("orders", {
    organizationId: input.organizationId,
    number: nextOrderNumber(),
    leadId: input.leadId ?? null,
    conversationId: input.conversationId ?? null,
    channel: "manual",
    source: "dashboard",
    subtotal,
    discount,
    shipping,
    tax,
    total: Math.max(0, subtotal - discount + shipping + tax),
    currency: org.currency,
    notes: input.notes ?? null,
    attributedToAi: false,
    status: "pending",
    paymentStatus: "unpaid",
  });
  for (const line of lines) {
    insert("order_items", { organizationId: input.organizationId, orderId, ...line });
  }
  void nowIso;
  return findOne<Order>("orders", { id: orderId })!;
}
