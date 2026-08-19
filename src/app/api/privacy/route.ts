import { NextRequest } from "next/server";
import { jsonError, jsonOk, requireAuthOrg } from "@/lib/api-guard";
import { findMany, removeWhere, updateWhere } from "@/lib/db";
import { destroyAllSessions } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { assertCan } from "@/lib/security/rbac";

export async function POST(req: NextRequest) {
  try {
    const { org, user, membership } = await requireAuthOrg(req);
    const { action } = (await req.json()) as { action: string };
    if (action === "export") {
      assertCan(membership.role, "privacy.export");
      const payload = {
        exportedAt: new Date().toISOString(),
        user: { id: user.id, email: user.email, name: user.name },
        organization: { id: org.id, name: org.name, slug: org.slug, country: org.country },
        products: findMany("products", { organizationId: org.id }),
        leads: findMany("leads", { organizationId: org.id }),
        conversations: findMany("conversations", { organizationId: org.id }),
        messages: findMany("messages", { organizationId: org.id }),
        orders: findMany("orders", { organizationId: org.id }),
      };
      await audit({ organizationId: org.id, userId: user.id, action: "privacy.export" });
      return jsonOk(payload);
    }
    if (action === "delete_conversations") {
      assertCan(membership.role, "privacy.delete");
      const convos = findMany<{ id: string }>("conversations", { organizationId: org.id });
      for (const c of convos) removeWhere("messages", { conversationId: c.id, organizationId: org.id });
      removeWhere("conversations", { organizationId: org.id });
      await audit({ organizationId: org.id, userId: user.id, action: "privacy.delete_conversations" });
      return jsonOk({ ok: true });
    }
    if (action === "delete_account") {
      assertCan(membership.role, "privacy.delete");
      updateWhere("users", { id: user.id }, { status: "deleted", email: `deleted+${user.id}@invalid.local` });
      await destroyAllSessions(user.id);
      await audit({ organizationId: org.id, userId: user.id, action: "privacy.delete_account" });
      return jsonOk({ ok: true });
    }
    return jsonOk({ ok: false });
  } catch (e) {
    return jsonError(e);
  }
}
