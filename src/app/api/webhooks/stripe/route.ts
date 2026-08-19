import { NextRequest, NextResponse } from "next/server";
import { claimWebhook } from "@/lib/webhooks";
import { markPaymentPaid } from "@/lib/payments/provider";
import { log } from "@/lib/logger";

export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({
      ok: false,
      mode: "demo",
      message: "STRIPE_WEBHOOK_SECRET manquant. Configuration requise. Aucun paiement réel traité.",
    });
  }
  let event: { id?: string; type?: string; data?: { object?: { id?: string; client_reference_id?: string } } };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  if (!event.id) return NextResponse.json({ error: "missing id" }, { status: 400 });
  const claimed = await claimWebhook("stripe", event.id, event);
  if (claimed.duplicate) return NextResponse.json({ ok: true, duplicate: true });
  if (event.type === "checkout.session.completed" && event.data?.object?.id) {
    await markPaymentPaid(event.data.object.id, "stripe");
    log("BILLING", "stripe_paid", { id: event.data.object.id });
  }
  return NextResponse.json({ ok: true });
}
