import { createHmac, timingSafeEqual } from "crypto";
import { insert } from "./db";
import { log } from "./logger";

export function verifyHmacSha256(raw: string, secret: string, signature: string) {
  const digest = createHmac("sha256", secret).update(raw).digest("hex");
  const a = Buffer.from(digest);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function claimWebhook(provider: string, externalId: string, payload: unknown, organizationId?: string) {
  try {
    insert("webhook_events", {
      provider,
      externalId,
      payload: JSON.stringify(payload),
      organizationId: organizationId ?? null,
      status: "processed",
    });
    return { duplicate: false };
  } catch {
    log("WEBHOOK", "duplicate_event", { provider, externalId });
    return { duplicate: true };
  }
}
