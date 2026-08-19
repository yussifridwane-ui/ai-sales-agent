import { insert } from "./db";

export async function audit(input: {
  organizationId?: string | null;
  userId?: string | null;
  action: string;
  entity?: string;
  entityId?: string;
  ip?: string;
  requestId?: string;
  result?: string;
  meta?: Record<string, unknown>;
}) {
  const meta = { ...(input.meta ?? {}) };
  for (const k of Object.keys(meta)) {
    if (/secret|password|token|key|authorization/i.test(k)) delete meta[k];
  }
  insert("audit_logs", {
    organizationId: input.organizationId ?? null,
    userId: input.userId ?? null,
    action: input.action,
    entity: input.entity ?? null,
    entityId: input.entityId ?? null,
    ip: input.ip ?? null,
    requestId: input.requestId ?? null,
    result: input.result ?? "ok",
    meta: JSON.stringify(meta),
  });
}
