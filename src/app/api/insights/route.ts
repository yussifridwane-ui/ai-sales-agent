import { NextRequest } from "next/server";
import { jsonError, jsonOk, requireAuthOrg } from "@/lib/api-guard";
import { findMany } from "@/lib/db";
import type { Conversation, Message, Product } from "@/lib/db/types";

export async function GET(req: NextRequest) {
  try {
    const { org } = await requireAuthOrg(req);
    const messages = findMany<Message>("messages", { organizationId: org.id }, { limit: 800, orderBy: "createdAt DESC" });
    const conversations = findMany<Conversation>("conversations", { organizationId: org.id });
    const products = findMany<Product>("products", { organizationId: org.id });

    const intentCount: Record<string, number> = {};
    for (const m of messages) {
      if (m.intent) intentCount[m.intent] = (intentCount[m.intent] || 0) + 1;
    }
    const totalIntent = Object.values(intentCount).reduce((a, b) => a + b, 0) || 1;
    const frequentIntents = Object.entries(intentCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([intent, n]) => ({ intent, n, pct: Math.round((n / totalIntent) * 100) }));

    const lost = conversations.filter((c) => c.status === "abandoned").length;
    const hot = conversations.filter((c) => c.leadScore >= 81).length;
    const popular = products
      .map((p) => ({
        name: p.name,
        mentions: messages.filter((m) => m.content.toLowerCase().includes(p.name.toLowerCase().split(" ")[0])).length,
      }))
      .sort((a, b) => b.mentions - a.mentions)
      .slice(0, 5);

    const recs = [
      frequentIntents[0]?.intent === "price"
        ? `${frequentIntents[0].pct} % des messages concernent le prix. Affichez le tarif plus tôt.`
        : "Ajoutez davantage de FAQ pour réduire les transferts humains.",
      "Les prospects qui reçoivent une réponse en moins de 2 minutes convertissent davantage.",
      lost ? `${lost} conversations abandonnées — activez les relances 2h / 24h / 72h.` : "Peu d'abandons détectés sur la période récente.",
    ];

    return jsonOk({ frequentIntents, lost, hot, popular, recs });
  } catch (e) {
    return jsonError(e);
  }
}
