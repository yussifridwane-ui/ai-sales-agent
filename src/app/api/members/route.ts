import { NextRequest } from "next/server";
import { jsonError, jsonOk, requireAuthOrg } from "@/lib/api-guard";
import { findMany, findOne, insert, removeWhere, updateWhere } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { ROLES, normalizeRole } from "@/lib/security/rbac";
import { audit } from "@/lib/audit";
import type { OrganizationMember, User } from "@/lib/db/types";

export async function GET(req: NextRequest) {
  try {
    const { org } = await requireAuthOrg(req, "members.read");
    const members = findMany<OrganizationMember>("organization_members", { organizationId: org.id });
    return jsonOk({
      members: members.map((m) => {
        const user = findOne<User>("users", { id: m.userId });
        return {
          id: m.id,
          role: m.role,
          userId: m.userId,
          email: user?.email,
          name: user?.name,
          status: user?.status,
        };
      }),
    });
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { org, user, ip } = await requireAuthOrg(req, "members.write");
    const body = (await req.json()) as { email?: string; role?: string };
    if (!body.email) throw new AppError("invalid_input", "Email requis.");
    const invitee = findOne<User>("users", { email: body.email.trim().toLowerCase() });
    if (!invitee) throw new AppError("not_found", "Aucun compte avec cet email. La personne doit d'abord s'inscrire.", 404);
    const role = normalizeRole(body.role || "viewer");
    if (role === "owner") throw new AppError("forbidden", "Impossible d'attribuer le rôle owner.", 403);
    if (findOne("organization_members", { organizationId: org.id, userId: invitee.id })) {
      throw new AppError("exists", "Déjà membre.", 400);
    }
    const id = insert("organization_members", { organizationId: org.id, userId: invitee.id, role });
    await audit({
      organizationId: org.id,
      userId: user.id,
      action: "member.add",
      entity: "member",
      entityId: id,
      ip,
      meta: { role },
    });
    return jsonOk({ ok: true, id }, 201);
  } catch (e) {
    return jsonError(e);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { org, user, ip } = await requireAuthOrg(req, "members.write");
    const body = (await req.json()) as { id?: string; role?: string };
    const member = findOne<OrganizationMember>("organization_members", { id: body.id || "", organizationId: org.id });
    if (!member) throw new AppError("not_found", "Membre introuvable.", 404);
    if (member.role === "owner") throw new AppError("forbidden", "Le rôle owner ne peut pas être modifié ici.", 403);
    const role = normalizeRole(body.role || "viewer");
    if (role === "owner") throw new AppError("forbidden", "Impossible d'attribuer le rôle owner.", 403);
    updateWhere("organization_members", { id: member.id, organizationId: org.id }, { role });
    await audit({ organizationId: org.id, userId: user.id, action: "member.role", entity: "member", entityId: member.id, ip, meta: { role } });
    return jsonOk({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { org, user, ip } = await requireAuthOrg(req, "members.write");
    const id = req.nextUrl.searchParams.get("id");
    const member = findOne<OrganizationMember>("organization_members", { id: id || "", organizationId: org.id });
    if (!member) throw new AppError("not_found", "Membre introuvable.", 404);
    if (member.role === "owner") throw new AppError("forbidden", "Impossible de retirer l'owner.", 403);
    removeWhere("organization_members", { id: member.id, organizationId: org.id });
    await audit({ organizationId: org.id, userId: user.id, action: "member.remove", entity: "member", entityId: member.id, ip });
    return jsonOk({ ok: true });
    void ROLES;
  } catch (e) {
    return jsonError(e);
  }
}
