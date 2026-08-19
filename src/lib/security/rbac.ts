import { AppError } from "../errors";

export const ROLES = ["owner", "admin", "manager", "sales", "support", "viewer"] as const;
export type Role = (typeof ROLES)[number];

export type Permission =
  | "analytics.read"
  | "orders.read"
  | "orders.write"
  | "conversations.read"
  | "conversations.write"
  | "leads.read"
  | "leads.write"
  | "products.read"
  | "products.write"
  | "agents.read"
  | "agents.write"
  | "knowledge.read"
  | "knowledge.write"
  | "automations.read"
  | "automations.write"
  | "integrations.read"
  | "integrations.write"
  | "billing.read"
  | "billing.write"
  | "settings.write"
  | "members.read"
  | "members.write"
  | "privacy.export"
  | "privacy.delete"
  | "org.delete";

const ALL: Permission[] = [
  "analytics.read",
  "orders.read",
  "orders.write",
  "conversations.read",
  "conversations.write",
  "leads.read",
  "leads.write",
  "products.read",
  "products.write",
  "agents.read",
  "agents.write",
  "knowledge.read",
  "knowledge.write",
  "automations.read",
  "automations.write",
  "integrations.read",
  "integrations.write",
  "billing.read",
  "billing.write",
  "settings.write",
  "members.read",
  "members.write",
  "privacy.export",
  "privacy.delete",
  "org.delete",
];

const MATRIX: Record<Role, Permission[]> = {
  owner: ALL,
  admin: ALL.filter((p) => p !== "org.delete" && p !== "billing.write"),
  manager: [
    "analytics.read",
    "orders.read",
    "orders.write",
    "conversations.read",
    "conversations.write",
    "leads.read",
    "leads.write",
    "products.read",
    "products.write",
    "agents.read",
    "agents.write",
    "knowledge.read",
    "knowledge.write",
    "automations.read",
    "automations.write",
    "members.read",
  ],
  sales: [
    "analytics.read",
    "orders.read",
    "orders.write",
    "conversations.read",
    "conversations.write",
    "leads.read",
    "leads.write",
    "products.read",
    "agents.read",
  ],
  support: [
    "conversations.read",
    "conversations.write",
    "leads.read",
    "orders.read",
    "products.read",
    "agents.read",
  ],
  viewer: ["analytics.read", "orders.read", "conversations.read", "leads.read", "products.read", "agents.read"],
};

export function normalizeRole(role: string): Role {
  const r = role.toLowerCase();
  if (r === "member") return "sales";
  if ((ROLES as readonly string[]).includes(r)) return r as Role;
  return "viewer";
}

export function can(role: string, permission: Permission) {
  return MATRIX[normalizeRole(role)].includes(permission);
}

export function assertCan(role: string, permission: Permission) {
  if (!can(role, permission)) {
    throw new AppError("forbidden", "Vous n'avez pas la permission d'effectuer cette action.", 403);
  }
}

export function permissionsFor(role: string) {
  return MATRIX[normalizeRole(role)];
}
