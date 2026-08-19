import { NextRequest } from "next/server";
import { jsonError, jsonOk, requireAuthOrg } from "@/lib/api-guard";
import { findMany, nowIso, updateWhere } from "@/lib/db";
import type { Notification } from "@/lib/db/types";

export async function GET(req: NextRequest) {
  try {
    const { org } = await requireAuthOrg(req);
    const items = findMany<Notification>("notifications", { organizationId: org.id }, { orderBy: "createdAt DESC", limit: 40 });
    return jsonOk({ notifications: items });
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { org } = await requireAuthOrg(req);
    const { id } = (await req.json()) as { id?: string };
    if (id) updateWhere("notifications", { id, organizationId: org.id }, { readAt: nowIso() });
    return jsonOk({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}
