import { findOne, insert, updateWhere } from "../db";
import { AppError } from "../errors";
import { log } from "../logger";
import { runAutomations } from "../automations/engine";
import type { Order, Payment } from "../db/types";

export type CheckoutInput = {
  organizationId: string;
  orderId: string;
  successUrl: string;
  cancelUrl: string;
};

export type CheckoutResult = {
  provider: string;
  checkoutUrl: string;
  externalId: string;
  demo: boolean;
};

export interface PaymentProviderAdapter {
  name: string;
  available(): boolean;
  createCheckout(input: CheckoutInput): Promise<CheckoutResult>;
}

class DemoPaymentProvider implements PaymentProviderAdapter {
  name = "demo";
  available() {
    return true;
  }
  async createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
    const order = findOne<Order>("orders", { id: input.orderId, organizationId: input.organizationId });
    if (!order) throw new AppError("not_found", "Commande introuvable.", 404);
    const externalId = `demo_${order.id}`;
    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const checkoutUrl = `${appUrl}/app/orders/${order.id}?checkout=demo&ext=${externalId}`;
    insert("payments", {
      organizationId: input.organizationId,
      orderId: order.id,
      provider: "demo",
      amount: order.total,
      currency: order.currency,
      status: "pending",
      externalId,
      checkoutUrl,
      isDemo: true,
    });
    return { provider: "demo", checkoutUrl, externalId, demo: true };
  }
}

class StripePaymentProvider implements PaymentProviderAdapter {
  name = "stripe";
  available() {
    return Boolean(process.env.STRIPE_SECRET_KEY);
  }
  async createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
    if (!this.available()) throw new AppError("not_configured", "Stripe n'est pas configuré.", 400);
    const order = findOne<Order>("orders", { id: input.orderId, organizationId: input.organizationId });
    if (!order) throw new AppError("not_found", "Commande introuvable.", 404);
    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        mode: "payment",
        success_url: input.successUrl,
        cancel_url: input.cancelUrl,
        client_reference_id: order.id,
        "line_items[0][quantity]": "1",
        "line_items[0][price_data][currency]": order.currency.toLowerCase(),
        "line_items[0][price_data][unit_amount]": String(Math.round(order.total * 100)),
        "line_items[0][price_data][product_data][name]": `Order ${order.number}`,
      }),
    });
    if (!res.ok) {
      log("BILLING", "stripe_checkout_failed", { status: res.status });
      throw new AppError("payment_error", "Impossible de créer le paiement Stripe.", 502);
    }
    const data = (await res.json()) as { id: string; url: string };
    insert("payments", {
      organizationId: input.organizationId,
      orderId: order.id,
      provider: "stripe",
      amount: order.total,
      currency: order.currency,
      status: "pending",
      externalId: data.id,
      checkoutUrl: data.url,
      isDemo: false,
    });
    return { provider: "stripe", checkoutUrl: data.url, externalId: data.id, demo: false };
  }
}

export function getPaymentProvider(preferred?: string): PaymentProviderAdapter {
  const stripe = new StripePaymentProvider();
  if (preferred === "stripe" && stripe.available()) return stripe;
  if (preferred === "demo") return new DemoPaymentProvider();
  if (stripe.available()) return stripe;
  return new DemoPaymentProvider();
}

export async function markPaymentPaid(externalId: string, provider: string) {
  const payment = findOne<Payment>("payments", { externalId, provider });
  if (!payment) return null;
  if (payment.status === "paid") return payment;
  updateWhere("payments", { id: payment.id }, { status: "paid" });
  if (payment.orderId) {
    updateWhere("orders", { id: payment.orderId }, { status: "paid", paymentStatus: "paid" });
    insert("analytics_events", {
      organizationId: payment.organizationId,
      name: "payment_received",
      value: payment.amount,
      meta: JSON.stringify({ orderId: payment.orderId, provider }),
    });
    await runAutomations(payment.organizationId, "payment_received", { orderId: payment.orderId });
  }
  return payment;
}
