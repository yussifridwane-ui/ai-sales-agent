import { NextRequest } from "next/server";
import { jsonError, jsonOk, requireAuthOrg } from "@/lib/api-guard";
import { findMany, findOne } from "@/lib/db";
import { createManualOrder } from "@/lib/ai/actions";
import type { Lead, Order, OrderItem } from "@/lib/db/types";

export async function GET(req: NextRequest) {
  try {
    const { org } = await requireAuthOrg(req, "orders.read");
    const orders = findMany<Order>("orders", { organizationId: org.id }, { orderBy: "createdAt DESC", limit: 200 });
    const leads = findMany<Lead>("leads", { organizationId: org.id });
    const decorated = orders.map((o) => {
      const lead = leads.find((l) => l.id === o.leadId);
      const items = findMany<OrderItem>("order_items", { orderId: o.id });
      return {
        ...o,
        customer: [lead?.firstName, lead?.lastName].filter(Boolean).join(" ") || "—",
        items,
      };
    });
    return jsonOk({ orders: decorated });
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { org } = await requireAuthOrg(req, "orders.write");
    const body = (await req.json()) as {
      leadId?: string;
      items: { productId: string; quantity: number }[];
      discount?: number;
      shipping?: number;
      tax?: number;
      notes?: string;
    };
    const order = await createManualOrder({ organizationId: org.id, ...body });
    return jsonOk({ order }, 201);
  } catch (e) {
    return jsonError(e);
  }
}
