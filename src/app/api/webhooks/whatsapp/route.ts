import { NextRequest, NextResponse } from "next/server";
import { claimWebhook, verifyHmacSha256 } from "@/lib/webhooks";
import { findOne, insert, nowIso } from "@/lib/db";
import { processInboundMessage } from "@/lib/ai/sales-engine";
import { log } from "@/lib/logger";
import type { Agent, Conversation, Integration, Organization } from "@/lib/db/types";

export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("hub.mode");
  const token = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");
  if (mode === "subscribe" && token && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge || "", { status: 200 });
  }
  return NextResponse.json({ error: "forbidden" }, { status: 403 });
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const secret = process.env.WHATSAPP_APP_SECRET;
  const sig = req.headers.get("x-hub-signature-256")?.replace("sha256=", "");
  if (secret && sig && !verifyHmacSha256(raw, secret, sig)) {
    log("SECURITY", "whatsapp_bad_signature");
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }
  if (!process.env.WHATSAPP_ACCESS_TOKEN) {
    return NextResponse.json({
      ok: false,
      mode: "demo",
      message: "WhatsApp Cloud API non configuré. Configuration requise.",
    });
  }
  let payload: { entry?: { id?: string; changes?: { value?: { messages?: { id: string; from: string; text?: { body?: string } }[] } }[] }[] };
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const msg = payload.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!msg) return NextResponse.json({ ok: true });
  const claimed = await claimWebhook("whatsapp", msg.id, payload);
  if (claimed.duplicate) return NextResponse.json({ ok: true, duplicate: true });

  const integration = findOne<Integration>("integrations", { provider: "whatsapp" });
  if (!integration) return NextResponse.json({ ok: true, ignored: true });
  const org = findOne<Organization>("organizations", { id: integration.organizationId });
  if (!org) return NextResponse.json({ ok: true });
  const existing = findOne<Conversation>("conversations", { organizationId: org.id, channel: "whatsapp" });
  let conversationId = existing?.id;
  if (!conversationId) {
    const agent = findOne<Agent>("agents", { organizationId: org.id });
    const leadId = insert("leads", {
      organizationId: org.id,
      phone: msg.from,
      source: "whatsapp",
      channel: "whatsapp",
    });
    conversationId = insert("conversations", {
      organizationId: org.id,
      leadId,
      agentId: agent?.id || null,
      channel: "whatsapp",
      lastMessageAt: nowIso(),
    });
  }
  if (msg.text?.body) {
    await processInboundMessage({
      organizationId: org.id,
      conversationId,
      content: msg.text.body,
      from: "customer",
    });
  }
  return NextResponse.json({ ok: true });
}
