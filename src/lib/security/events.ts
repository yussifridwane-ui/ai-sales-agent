import { insert, findMany, count } from "../db";
import { log } from "../logger";

export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export function securityEvent(input: {
  type: string;
  severity: Severity;
  message: string;
  organizationId?: string | null;
  userId?: string | null;
  ip?: string | null;
  meta?: Record<string, unknown>;
}) {
  insert("security_events", {
    type: input.type,
    severity: input.severity,
    message: input.message.slice(0, 500),
    organizationId: input.organizationId ?? null,
    userId: input.userId ?? null,
    ip: input.ip ?? null,
    meta: JSON.stringify(input.meta ?? {}),
  });
  log("SECURITY", input.type, {
    severity: input.severity,
    organizationId: input.organizationId,
    userId: input.userId,
  });
}

export function recentSecurityEvents(limit = 80) {
  return findMany("security_events", {}, { orderBy: "createdAt DESC", limit });
}

export function securityEventCounts(sinceIso: string) {
  return {
    total: count("security_events", {}, "createdAt >= ?", [sinceIso]),
    high: count("security_events", {}, "createdAt >= ? AND severity IN ('HIGH','CRITICAL')", [sinceIso]),
    authFail: count("security_events", { type: "auth.failed" }, "createdAt >= ?", [sinceIso]),
    forbidden: count("security_events", { type: "access.forbidden" }, "createdAt >= ?", [sinceIso]),
    webhookInvalid: count("security_events", { type: "webhook.invalid" }, "createdAt >= ?", [sinceIso]),
    promptInjection: count("security_events", { type: "ai.prompt_injection" }, "createdAt >= ?", [sinceIso]),
    rateLimited: count("security_events", { type: "rate.limited" }, "createdAt >= ?", [sinceIso]),
  };
}
