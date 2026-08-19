import { NextRequest } from "next/server";
import { jsonError, jsonOk, requireAuthOrg } from "@/lib/api-guard";
import { findMany, findOne, insert, removeWhere, updateWhere } from "@/lib/db";
import { AppError } from "@/lib/errors";
import type { KnowledgeDocument, Objection } from "@/lib/db/types";

export async function GET(req: NextRequest) {
  try {
    const { org } = await requireAuthOrg(req);
    return jsonOk({
      documents: findMany<KnowledgeDocument>("knowledge_documents", { organizationId: org.id }, { orderBy: "createdAt DESC" }),
      objections: findMany<Objection>("objections", { organizationId: org.id }),
    });
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { org } = await requireAuthOrg(req);
    const body = (await req.json()) as { kind?: "doc" | "objection"; title?: string; type?: string; content?: string; phrase?: string; response?: string; sourceUrl?: string };
    if (body.kind === "objection") {
      if (!body.phrase || !body.response) throw new AppError("invalid_input", "Phrase et réponse requises.");
      const id = insert("objections", { organizationId: org.id, phrase: body.phrase, response: body.response });
      return jsonOk({ objection: findOne("objections", { id }) }, 201);
    }
    if (!body.title || !body.content) throw new AppError("invalid_input", "Titre et contenu requis.");
    const id = insert("knowledge_documents", {
      organizationId: org.id,
      title: body.title,
      type: body.type || "note",
      content: body.content,
      sourceUrl: body.sourceUrl || null,
    });
    return jsonOk({ document: findOne("knowledge_documents", { id, organizationId: org.id }) }, 201);
  } catch (e) {
    return jsonError(e);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { org } = await requireAuthOrg(req);
    const body = (await req.json()) as { id: string; title?: string; content?: string; type?: string };
    const doc = findOne<KnowledgeDocument>("knowledge_documents", { id: body.id, organizationId: org.id });
    if (!doc) throw new AppError("not_found", "Document introuvable.", 404);
    updateWhere("knowledge_documents", { id: body.id, organizationId: org.id }, {
      title: body.title ?? doc.title,
      content: body.content ?? doc.content,
      type: body.type ?? doc.type,
    });
    return jsonOk({ document: findOne("knowledge_documents", { id: body.id }) });
  } catch (e) {
    return jsonError(e);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { org } = await requireAuthOrg(req);
    const id = req.nextUrl.searchParams.get("id");
    const kind = req.nextUrl.searchParams.get("kind") || "doc";
    if (!id) throw new AppError("invalid_input", "id requis.");
    if (kind === "objection") removeWhere("objections", { id, organizationId: org.id });
    else removeWhere("knowledge_documents", { id, organizationId: org.id });
    return jsonOk({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}
