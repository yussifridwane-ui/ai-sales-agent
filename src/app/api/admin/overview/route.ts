import { NextRequest } from "next/server";
import { jsonError, jsonOk, requirePlatformAdmin } from "@/lib/api-guard";
import { count, findMany, sum } from "@/lib/db";
import type { Organization, Subscription, User } from "@/lib/db/types";

export async function GET(req: NextRequest) {
  try {
    await requirePlatformAdmin(req);
    const users = findMany<User>("users", {}, { orderBy: "createdAt DESC", limit: 100 });
    const orgs = findMany<Organization>("organizations", {}, { orderBy: "createdAt DESC", limit: 100 });
    const subs = findMany<Subscription>("subscriptions");
    return jsonOk({
      stats: {
        users: count("users"),
        organizations: count("organizations"),
        conversations: count("conversations"),
        orders: count("orders"),
        aiCost: sum("usage_records", "estimatedCost"),
        revenueCents: sum("invoices", "amount", { status: "paid" }),
      },
      users: users.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        status: u.status,
        platformRole: u.platformRole,
        createdAt: u.createdAt,
      })),
      organizations: orgs.map((o) => ({
        ...o,
        subscription: subs.find((s) => s.organizationId === o.id) || null,
      })),
      tickets: findMany("support_tickets", {}, { orderBy: "createdAt DESC", limit: 50 }),
      logs: findMany("audit_logs", {}, { orderBy: "createdAt DESC", limit: 80 }),
    });
  } catch (e) {
    return jsonError(e);
  }
}
