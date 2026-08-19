import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { nanoid } from "nanoid";
import { assertIdent, assertTable, sanitizeOrderBy } from "../security/identifiers";

const DB_PATH = process.env.SQLITE_PATH || path.join(process.cwd(), "data", "aisales.db");

function ensureDb() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const database = new DatabaseSync(DB_PATH);
  database.exec("PRAGMA foreign_keys = ON;");
  database.exec("PRAGMA journal_mode = WAL;");
  const schemaPath = path.join(process.cwd(), "src/lib/db/schema.sql");
  database.exec(fs.readFileSync(schemaPath, "utf8"));
  migrate(database);
  return database;
}

function migrate(database: DatabaseSync) {
  const add = (table: string, column: string, def: string) => {
    const cols = database.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
    if (!cols.some((c) => c.name === column)) {
      database.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${def}`);
    }
  };
  add("users", "mfaEnabled", "INTEGER NOT NULL DEFAULT 0");
  add("users", "mfaSecret", "TEXT");
  add("users", "failedLoginCount", "INTEGER NOT NULL DEFAULT 0");
  add("users", "lockedUntil", "TEXT");
  add("users", "passwordChangedAt", "TEXT");
  add("sessions", "mfaVerifiedAt", "TEXT");
  add("audit_logs", "requestId", "TEXT");
  add("audit_logs", "result", "TEXT");
  add("webhook_events", "receivedAt", "TEXT");
}

const globalForDb = globalThis as unknown as { __aisDb?: DatabaseSync };
export const sqlite = globalForDb.__aisDb ?? ensureDb();
if (process.env.NODE_ENV !== "production") globalForDb.__aisDb = sqlite;

export function id(prefix = "") {
  return prefix ? `${prefix}_${nanoid(12)}` : nanoid(16);
}

export function nowIso() {
  return new Date().toISOString();
}

export function toBool(v: unknown) {
  return v === 1 || v === true || v === "1";
}

export function fromBool(v: unknown) {
  return v ? 1 : 0;
}

export function rows<T>(sql: string, params: unknown[] = []): T[] {
  return sqlite.prepare(sql).all(...params) as T[];
}

export function row<T>(sql: string, params: unknown[] = []): T | undefined {
  return sqlite.prepare(sql).get(...params) as T | undefined;
}

export function exec(sql: string, params: unknown[] = []) {
  return sqlite.prepare(sql).run(...params);
}

const BOOL_FIELDS = new Set([
  "marketingConsent",
  "isDemo",
  "onboardingDone",
  "automationsEnabled",
  "analyticsEnabled",
  "advancedAnalytics",
  "apiAccess",
  "prioritySupport",
  "widgetEnabled",
  "active",
  "cancelAtPeriodEnd",
  "escalateToHuman",
  "isActive",
  "available",
  "forbiddenForAi",
  "optedOut",
  "humanTakeover",
  "generatedByAi",
  "attributedToAi",
  "enabled",
  "mfaEnabled",
  "restoreTested",
  "success",
]);

export function hydrate<T>(record: Record<string, unknown> | undefined | null): T | undefined {
  if (!record) return undefined;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(record)) {
    if (BOOL_FIELDS.has(k)) out[k] = Boolean(v);
    else out[k] = v;
  }
  return out as T;
}

export function hydrateAll<T>(list: Record<string, unknown>[]): T[] {
  return list.map((r) => hydrate<T>(r)!) ;
}

export function insert(table: string, data: Record<string, unknown>) {
  assertTable(table);
  const payload: Record<string, unknown> = { ...data };
  for (const k of Object.keys(payload)) assertIdent(k);
  if (!payload.id) payload.id = id();
  if (tableHasCreated(table) && !payload.createdAt) payload.createdAt = nowIso();
  if (tableHasUpdated(table) && !payload.updatedAt) payload.updatedAt = nowIso();
  for (const k of Object.keys(payload)) {
    if (BOOL_FIELDS.has(k)) payload[k] = fromBool(payload[k]);
  }
  const keys = Object.keys(payload);
  const sql = `INSERT INTO ${table} (${keys.join(",")}) VALUES (${keys.map(() => "?").join(",")})`;
  exec(sql, keys.map((k) => payload[k] ?? null));
  return payload.id as string;
}

function tableHasCreated(table: string) {
  return !["plans", "product_variants", "order_items", "widget_settings", "commercial_rules"].includes(table);
}

export function updateWhere(table: string, where: Record<string, unknown>, data: Record<string, unknown>) {
  assertTable(table);
  const payload: Record<string, unknown> = { ...data };
  for (const k of Object.keys(payload)) assertIdent(k);
  for (const k of Object.keys(where)) assertIdent(k);
  if ("updatedAt" in Object.keys(data) || tableHasUpdated(table)) payload.updatedAt = nowIso();
  for (const k of Object.keys(payload)) {
    if (BOOL_FIELDS.has(k)) payload[k] = fromBool(payload[k]);
  }
  const sets = Object.keys(payload);
  const wheres = Object.keys(where);
  if (!sets.length || !wheres.length) return;
  const sql = `UPDATE ${table} SET ${sets.map((k) => `${k}=?`).join(",")} WHERE ${wheres.map((k) => `${k}=?`).join(" AND ")}`;
  exec(sql, [...sets.map((k) => payload[k] ?? null), ...wheres.map((k) => where[k])]);
}

function tableHasUpdated(table: string) {
  return ![
    "sessions",
    "password_resets",
    "email_verifications",
    "organization_members",
    "plans",
    "product_variants",
    "knowledge_sources",
    "messages",
    "conversation_events",
    "order_items",
    "automation_runs",
    "integration_credentials",
    "notifications",
    "analytics_events",
    "usage_records",
    "invoices",
    "audit_logs",
    "objections",
    "commercial_rules",
    "widget_settings",
    "webhook_events",
    "login_attempts",
    "security_events",
    "file_assets",
    "backups",
  ].includes(table);
}

export function removeWhere(table: string, where: Record<string, unknown>) {
  assertTable(table);
  const wheres = Object.keys(where);
  for (const k of wheres) assertIdent(k);
  exec(
    `DELETE FROM ${table} WHERE ${wheres.map((k) => `${k}=?`).join(" AND ")}`,
    wheres.map((k) => where[k]),
  );
}

function normalizeWhere(where: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(where)) {
    out[k] = BOOL_FIELDS.has(k) ? fromBool(v) : v;
  }
  return out;
}

export function findMany<T>(
  table: string,
  where: Record<string, unknown> = {},
  opts?: { orderBy?: string; limit?: number; offset?: number; extra?: string; extraParams?: unknown[] },
) {
  assertTable(table);
  where = normalizeWhere(where);
  const keys = Object.keys(where);
  for (const k of keys) assertIdent(k);
  let sql = `SELECT * FROM ${table}`;
  const params: unknown[] = [];
  if (keys.length) {
    sql += ` WHERE ${keys.map((k) => `${k}=?`).join(" AND ")}`;
    params.push(...keys.map((k) => where[k]));
  }
  if (opts?.extra) {
    sql += keys.length ? ` AND ${opts.extra}` : ` WHERE ${opts.extra}`;
    params.push(...(opts.extraParams || []));
  }
  const order = sanitizeOrderBy(opts?.orderBy);
  if (order) sql += ` ORDER BY ${order}`;
  if (opts?.limit) sql += ` LIMIT ${Number(opts.limit)}`;
  if (opts?.offset) sql += ` OFFSET ${Number(opts.offset)}`;
  return hydrateAll<T>(rows(sql, params) as Record<string, unknown>[]);
}

export function findOne<T>(table: string, where: Record<string, unknown>) {
  return findMany<T>(table, where, { limit: 1 })[0];
}

export function count(table: string, where: Record<string, unknown> = {}, extra?: string, extraParams: unknown[] = []) {
  assertTable(table);
  where = normalizeWhere(where);
  const keys = Object.keys(where);
  for (const k of keys) assertIdent(k);
  let sql = `SELECT COUNT(*) as n FROM ${table}`;
  const params: unknown[] = [];
  if (keys.length) {
    sql += ` WHERE ${keys.map((k) => `${k}=?`).join(" AND ")}`;
    params.push(...keys.map((k) => where[k]));
  }
  if (extra) {
    sql += keys.length ? ` AND ${extra}` : ` WHERE ${extra}`;
    params.push(...extraParams);
  }
  const r = row<{ n: number }>(sql, params);
  return Number(r?.n || 0);
}

export function sum(table: string, column: string, where: Record<string, unknown> = {}, extra?: string, extraParams: unknown[] = []) {
  assertTable(table);
  assertIdent(column);
  where = normalizeWhere(where);
  const keys = Object.keys(where);
  for (const k of keys) assertIdent(k);
  let sql = `SELECT COALESCE(SUM(${column}),0) as n FROM ${table}`;
  const params: unknown[] = [];
  if (keys.length) {
    sql += ` WHERE ${keys.map((k) => `${k}=?`).join(" AND ")}`;
    params.push(...keys.map((k) => where[k]));
  }
  if (extra) {
    sql += keys.length ? ` AND ${extra}` : ` WHERE ${extra}`;
    params.push(...extraParams);
  }
  return Number(row<{ n: number }>(sql, params)?.n || 0);
}

export function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 48) || "org"
  );
}

export function uniqueSlug(base: string) {
  let slug = slugify(base);
  let i = 0;
  while (findOne("organizations", { slug })) {
    i += 1;
    slug = `${slugify(base)}-${i}`;
  }
  return slug;
}
