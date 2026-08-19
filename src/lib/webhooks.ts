import { createHmac, timingSafeEqual } from "crypto";
import { insert } from "./db";
import { log } from "./logger";
import { securityEvent } from "./security/events";

export function verifyHmacSha256(raw: string, secret: string, signature: string) {
  const digest = createHmac("sha256", secret).update(raw).digest("hex");
  const a = Buffer.from(digest);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function assertFreshTimestamp(ts: string | number | null | undefined, windowSec = 300) {
  if (ts == null || ts === "") return false;
  const n = typeof ts === "number" ? ts : Number(ts);
  if (!Number.isFinite(n)) return false;
  const ms = n > 1e12 ? n : n * 1000;
  return Math.abs(Date.now() - ms) <= windowSec * 1000;
}

export async function claimWebhook(provider: string, externalId: string, payload: unknown, organizationId?: string) {
  try {
    insert("webhook_events", {
      provider,
      externalId,
      payload: JSON.stringify(payload),
      organizationId: organizationId ?? null,
      status: "processed",
      receivedAt: new Date().toISOString(),
    });
    return { duplicate: false };
  } catch {
    log("WEBHOOK", "duplicate_event", { provider, externalId });
    securityEvent({
      type: "webhook.duplicate",
      severity: "LOW",
      message: `Webhook déjà traité (${provider})`,
      organizationId,
    });
    return { duplicate: true };
  }
}

export function rejectWebhook(reason: string, provider: string) {
  securityEvent({ type: "webhook.invalid", severity: "HIGH", message: `${provider}: ${reason}` });
}
