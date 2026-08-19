import { NextRequest } from "next/server";
import { jsonError, jsonOk, requireAuthOrg } from "@/lib/api-guard";
import { findOne } from "@/lib/db";
import { getPaymentProvider, markPaymentPaid } from "@/lib/payments/provider";
import { AppError } from "@/lib/errors";
import type { Order } from "@/lib/db/types";

export async function POST(req: NextRequest) {
  try {
    const { org } = await requireAuthOrg(req);
    const body = (await req.json()) as { orderId: string; provider?: string; confirmDemo?: boolean; externalId?: string };
    const order = findOne<Order>("orders", { id: body.orderId, organizationId: org.id });
    if (!order) throw new AppError("not_found", "Commande introuvable.", 404);

    if (body.confirmDemo && body.externalId) {
      const paid = await markPaymentPaid(body.externalId, "demo");
      return jsonOk({ demo: true, paid: Boolean(paid), message: "Paiement DEMO confirmé. Ce n'est pas une transaction réelle." });
    }

    const appUrl = process.env.APP_URL || req.nextUrl.origin;
    const provider = getPaymentProvider(body.provider);
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
