import { NextRequest } from "next/server";
import { jsonError, jsonOk, requireAuthOrg } from "@/lib/api-guard";
import { findMany, findOne, insert, updateWhere } from "@/lib/db";
import { encryptSecret } from "@/lib/crypto";
import type { Integration } from "@/lib/db/types";
import { AppError } from "@/lib/errors";

const CATALOG = [
  { provider: "whatsapp", name: "WhatsApp", official: true },
  { provider: "instagram", name: "Instagram", official: true },
  { provider: "website", name: "Website widget", official: true },
  { provider: "email", name: "Email", official: true },
  { provider: "messenger", name: "Messenger", official: true, comingSoon: true },
  { provider: "stripe", name: "Stripe", official: true },
  { provider: "paypal", name: "PayPal", official: true, comingSoon: !process.env.PAYPAL_CLIENT_ID },
];

export async function GET(req: NextRequest) {
  try {
    const { org } = await requireAuthOrg(req);
    const rows = findMany<Integration>("integrations", { organizationId: org.id });
    const items = CATALOG.map((c) => {
      const rec = rows.find((r) => r.provider === c.provider);
      let status = rec?.status || "not_connected";
      if (c.comingSoon) status = "coming_soon";
      if (c.provider === "website") status = "connected";
      if (c.provider === "whatsapp" && !process.env.WHATSAPP_ACCESS_TOKEN && status === "connected") {
        status = "requires_setup";
      }
      return { ...c, status, id: rec?.id };
    });
    return jsonOk({ integrations: items });
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { org } = await requireAuthOrg(req);
    const body = (await req.json()) as { provider: string; credentials?: Record<string, string>; action?: string };
    if (body.provider === "messenger") {
      throw new AppError("coming_soon", "Messenger : Coming soon. Connexion requise via Meta.", 400);
    }
    let rec = findOne<Integration>("integrations", { organizationId: org.id, provider: body.provider });
    if (!rec) {
      const id = insert("integrations", {
        organizationId: org.id,
        provider: body.provider,
        status: "requires_setup",
        config: "{}",
      });
      rec = findOne<Integration>("integrations", { id })!;
    }
    if (body.action === "disconnect") {
      updateWhere("integrations", { id: rec.id }, { status: "not_connected" });
      return jsonOk({ ok: true, status: "not_connected" });
    }
    if (body.credentials) {
      for (const [keyName, value] of Object.entries(body.credentials)) {
        if (!value) continue;
        insert("integration_credentials", {
          organizationId: org.id,
          integrationId: rec.id,
          keyName,
          encryptedValue: encryptSecret(value),
        });
      }
      updateWhere("integrations", { id: rec.id }, { status: "requires_setup", config: JSON.stringify({ saved: true }) });
      return jsonOk({
        ok: true,
        status: "requires_setup",
        message: "Identifiants enregistrés côté serveur. Validation du fournisseur requise avant activation.",
      });
    }
    return jsonOk({ ok: true, status: rec.status });
  } catch (e) {
    return jsonError(e);
  }
}
