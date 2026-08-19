import { NextRequest, NextResponse } from "next/server";
import { assertFreshTimestamp, claimWebhook, rejectWebhook, verifyHmacSha256 } from "@/lib/webhooks";
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
  const sig = req.headers.get("stripe-signature") || "";
  const ts = /t=(\d+)/.exec(sig)?.[1];
  const v1 = /v1=([a-f0-9]+)/.exec(sig)?.[1];
  if (!ts || !v1 || !assertFreshTimestamp(ts)) {
    rejectWebhook("timestamp/signature manquants", "stripe");
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }
  const signed = `${ts}.${raw}`;
  if (!verifyHmacSha256(signed, process.env.STRIPE_WEBHOOK_SECRET, v1)) {
    rejectWebhook("bad signature", "stripe");
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }
  let event: { id?: string; type?: string; data?: { object?: { id?: string } } };
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
