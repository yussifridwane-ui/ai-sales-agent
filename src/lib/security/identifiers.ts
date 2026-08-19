const TABLES = new Set([
  "users",
  "sessions",
  "password_resets",
  "email_verifications",
  "organizations",
  "organization_members",
  "plans",
  "subscriptions",
  "agents",
  "agent_instructions",
  "products",
  "product_variants",
  "knowledge_documents",
  "knowledge_sources",
  "leads",
  "conversations",
  "messages",
  "conversation_events",
  "orders",
  "order_items",
  "payments",
  "automation_rules",
  "automation_runs",
  "integrations",
  "integration_credentials",
  "notifications",
  "analytics_events",
  "usage_records",
  "invoices",
  "support_tickets",
  "audit_logs",
  "objections",
  "sales_scripts",
  "commercial_rules",
  "widget_settings",
  "webhook_events",
  "processed_jobs",
  "login_attempts",
  "security_events",
  "file_assets",
  "backups",
  "security_check_runs",
]);

const IDENT = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

export function assertTable(table: string) {
  if (!TABLES.has(table)) throw new Error("invalid_table");
  return table;
}

export function assertIdent(name: string) {
  if (!IDENT.test(name)) throw new Error("invalid_identifier");
  return name;
}

export function sanitizeOrderBy(orderBy?: string) {
  if (!orderBy) return undefined;
  const parts = orderBy.trim().split(/\s+/);
  if (parts.length < 1 || parts.length > 2) throw new Error("invalid_order");
  assertIdent(parts[0]);
  if (parts[1] && !["ASC", "DESC", "asc", "desc"].includes(parts[1])) throw new Error("invalid_order");
  return `${parts[0]} ${parts[1] ? parts[1].toUpperCase() : "ASC"}`;
}
