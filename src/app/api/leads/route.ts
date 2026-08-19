import { NextRequest } from "next/server";
import { jsonError, jsonOk, requireAuthOrg } from "@/lib/api-guard";
import { findMany, findOne, insert, updateWhere } from "@/lib/db";
import { AppError } from "@/lib/errors";
import type { Lead } from "@/lib/db/types";

export async function GET(req: NextRequest) {
  try {
    const { org } = await requireAuthOrg(req, "leads.read");
    const status = req.nextUrl.searchParams.get("status");
    const leads = findMany<Lead>(
      "leads",
      status && status !== "all" ? { organizationId: org.id, status } : { organizationId: org.id },
      { orderBy: "updatedAt DESC", limit: 300 },
    );
    return jsonOk({ leads });
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { org } = await requireAuthOrg(req, "leads.write");
    const body = (await req.json()) as Partial<Lead>;
    const id = insert("leads", {
      organizationId: org.id,
      firstName: body.firstName || null,
      lastName: body.lastName || null,
      email: body.email || null,
      phone: body.phone || null,
      country: body.country || null,
      company: body.company || null,
      source: body.source || "manual",
      channel: body.channel || "website",
      productInterest: body.productInterest || null,
      budget: body.budget || null,
      notes: body.notes || null,
      status: body.status || "new",
    });
    insert("analytics_events", { organizationId: org.id, name: "lead_created", value: 1 });
    return jsonOk({ lead: findOne("leads", { id, organizationId: org.id }) }, 201);
  } catch (e) {
    return jsonError(e);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { org } = await requireAuthOrg(req, "leads.write");
    const body = (await req.json()) as Partial<Lead> & { id: string };
    const lead = findOne<Lead>("leads", { id: body.id, organizationId: org.id });
    if (!lead) throw new AppError("not_found", "Prospect introuvable.", 404);
    const { id, organizationId: _o, ...rest } = body;
    updateWhere("leads", { id, organizationId: org.id }, rest as Record<string, unknown>);
    return jsonOk({ lead: findOne("leads", { id, organizationId: org.id }) });
  } catch (e) {
    return jsonError(e);
  }
}
