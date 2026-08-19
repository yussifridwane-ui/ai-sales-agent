import { NextRequest } from "next/server";
import { jsonError, jsonOk, owned, requireAuthOrg } from "@/lib/api-guard";
import { findMany, findOne, updateWhere } from "@/lib/db";
import { AppError } from "@/lib/errors";
import type { Lead, Order, OrderItem, Payment } from "@/lib/db/types";
import { audit } from "@/lib/audit";

const ALLOWED_STATUS = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { org } = await requireAuthOrg(req, "orders.read");
    const { id } = await ctx.params;
    const order = owned(findOne<Order>("orders", { id }), org.id, "Commande introuvable.");
    const items = findMany<OrderItem>("order_items", { orderId: order.id, organizationId: org.id });
    const payments = findMany<Payment>("payments", { orderId: order.id, organizationId: org.id });
    const lead = order.leadId ? findOne<Lead>("leads", { id: order.leadId, organizationId: org.id }) : null;
    return jsonOk({ order, items, payments, lead });
  } catch (e) {
    return jsonError(e);
  }
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { org, user, ip, requestId } = await requireAuthOrg(req, "orders.write");
    const { id } = await ctx.params;
    const order = owned(findOne<Order>("orders", { id }), org.id, "Commande introuvable.");
    const body = (await req.json()) as Partial<Order>;
    if ("paymentStatus" in body || "total" in body || "subtotal" in body || "organizationId" in body) {
      throw new AppError("forbidden", "Ces champs ne peuvent pas être modifiés depuis le client.", 403);
    }
    const patch: Record<string, unknown> = {};
    if (body.status) {
      if (!ALLOWED_STATUS.includes(body.status)) throw new AppError("invalid_input", "Statut invalide.");
      patch.status = body.status;
    }
    if (typeof body.notes === "string") patch.notes = body.notes.slice(0, 2000);
    updateWhere("orders", { id: order.id, organizationId: org.id }, patch);
    await audit({
      organizationId: org.id,
      userId: user.id,
      action: "order.update",
      entity: "order",
      entityId: order.id,
      ip,
      requestId,
    });
    return jsonOk({ order: findOne("orders", { id: order.id, organizationId: org.id }) });
  } catch (e) {
    return jsonError(e);
  }
}
