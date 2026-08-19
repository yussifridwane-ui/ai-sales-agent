import { NextRequest } from "next/server";
import { jsonError, jsonOk, requireAuthOrg } from "@/lib/api-guard";
import { findMany, findOne, updateWhere } from "@/lib/db";
import { AppError } from "@/lib/errors";
import type { Lead, Order, OrderItem, Payment } from "@/lib/db/types";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { org } = await requireAuthOrg(req);
    const { id } = await ctx.params;
    const order = findOne<Order>("orders", { id, organizationId: org.id });
    if (!order) throw new AppError("not_found", "Commande introuvable.", 404);
    const items = findMany<OrderItem>("order_items", { orderId: id });
    const payments = findMany<Payment>("payments", { orderId: id });
    const lead = order.leadId ? findOne<Lead>("leads", { id: order.leadId, organizationId: org.id }) : null;
    return jsonOk({ order, items, payments, lead });
  } catch (e) {
    return jsonError(e);
  }
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { org } = await requireAuthOrg(req);
    const { id } = await ctx.params;
    const order = findOne<Order>("orders", { id, organizationId: org.id });
    if (!order) throw new AppError("not_found", "Commande introuvable.", 404);
    const body = (await req.json()) as Partial<Order>;
    const allowed = ["status", "paymentStatus", "notes"];
    const patch: Record<string, unknown> = {};
    for (const k of allowed) if (k in body) patch[k] = (body as Record<string, unknown>)[k];
    updateWhere("orders", { id, organizationId: org.id }, patch);
    return jsonOk({ order: findOne("orders", { id, organizationId: org.id }) });
  } catch (e) {
    return jsonError(e);
  }
}
