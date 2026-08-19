import { NextRequest } from "next/server";
import { jsonError, jsonOk, owned, requireAuthOrg } from "@/lib/api-guard";
import { findOne } from "@/lib/db";
import { getPaymentProvider, markPaymentPaid } from "@/lib/payments/provider";
import { AppError } from "@/lib/errors";
import type { Order, Payment } from "@/lib/db/types";
import { audit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const { org, user, ip, requestId } = await requireAuthOrg(req, "orders.write");
    const body = (await req.json()) as {
      orderId: string;
      provider?: string;
      confirmDemo?: boolean;
      externalId?: string;
    };
    const order = owned(findOne<Order>("orders", { id: body.orderId }), org.id, "Commande introuvable.");

    if (body.confirmDemo && body.externalId) {
      const payment = findOne<Payment>("payments", { externalId: body.externalId, provider: "demo" });
      if (!payment || payment.organizationId !== org.id || payment.orderId !== order.id) {
        throw new AppError("not_found", "Paiement introuvable.", 404);
      }
      if (!payment.isDemo) throw new AppError("forbidden", "Ce paiement n'est pas un paiement DEMO.", 403);
      const paid = await markPaymentPaid(body.externalId, "demo", org.id);
      await audit({
        organizationId: org.id,
        userId: user.id,
        action: "payment.demo_confirm",
        entity: "order",
        entityId: order.id,
        ip,
        requestId,
      });
      return jsonOk({
        demo: true,
        paid: Boolean(paid),
        message: "Paiement DEMO confirmé. Ce n'est pas une transaction réelle.",
      });
    }

    const appUrl = process.env.APP_URL || req.nextUrl.origin;
    const provider = getPaymentProvider(body.provider === "stripe" ? "stripe" : "demo");
    const checkout = await provider.createCheckout({
      organizationId: org.id,
      orderId: order.id,
      successUrl: `${appUrl}/app/orders/${order.id}?paid=1`,
      cancelUrl: `${appUrl}/app/orders/${order.id}?canceled=1`,
    });
    return jsonOk({
      ...checkout,
      notice: checkout.demo
        ? "Mode DEMO : aucun encaissement réel. Configurez Stripe pour des paiements réels."
        : undefined,
    });
  } catch (e) {
    return jsonError(e);
  }
}
