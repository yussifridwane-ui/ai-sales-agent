import { insert } from "./db";

export async function audit(input: {
  organizationId?: string | null;
  userId?: string | null;
  action: string;
  entity?: string;
  entityId?: string;
  ip?: string;
  meta?: Record<string, unknown>;
}) {
  insert("audit_logs", {
    organizationId: input.organizationId ?? null,
    userId: input.userId ?? null,
    action: input.action,
    entity: input.entity ?? null,
    entityId: input.entityId ?? null,
    ip: input.ip ?? null,
    meta: JSON.stringify(input.meta ?? {}),
  });
}
