import { NextRequest } from "next/server";
import { jsonError, jsonOk, requireAuthOrg } from "@/lib/api-guard";
import { findMany, findOne, insert, updateWhere } from "@/lib/db";
import { assertAgentQuota } from "@/lib/usage";
import { audit } from "@/lib/audit";
import type { Agent } from "@/lib/db/types";
import { AppError } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const { org } = await requireAuthOrg(req);
    return jsonOk({ agents: findMany<Agent>("agents", { organizationId: org.id }, { orderBy: "createdAt DESC" }) });
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { org, user } = await requireAuthOrg(req);
    await assertAgentQuota(org.id);
    const body = (await req.json()) as Partial<Agent>;
    if (!body.name) throw new AppError("invalid_input", "Nom requis.");
    const id = insert("agents", {
      organizationId: org.id,
      name: body.name,
      avatar: body.avatar || body.name[0]?.toUpperCase(),
      description: body.description || null,
      language: body.language || org.locale || "fr",
      languages: body.languages || JSON.stringify([body.language || "fr"]),
      tone: body.tone || "professional",
      role: body.role || "virtual_salesperson",
      objective: body.objective || "Transformer les prospects en clients.",
      instructions: body.instructions || null,
      greeting: body.greeting || null,
      isActive: body.isActive !== false,
    });
    await audit({ organizationId: org.id, userId: user.id, action: "agent.create", entity: "agent", entityId: id });
    return jsonOk({ agent: findOne("agents", { id, organizationId: org.id }) }, 201);
  } catch (e) {
    return jsonError(e);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { org, user } = await requireAuthOrg(req);
    const body = (await req.json()) as Partial<Agent> & { id: string };
    const agent = findOne<Agent>("agents", { id: body.id, organizationId: org.id });
    if (!agent) throw new AppError("not_found", "Agent introuvable.", 404);
    const { id, organizationId: _o, ...rest } = body;
    updateWhere("agents", { id, organizationId: org.id }, rest as Record<string, unknown>);
    await audit({ organizationId: org.id, userId: user.id, action: "agent.update", entity: "agent", entityId: id });
    return jsonOk({ agent: findOne("agents", { id, organizationId: org.id }) });
  } catch (e) {
    return jsonError(e);
  }
}
