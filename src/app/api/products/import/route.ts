import { NextRequest } from "next/server";
import { jsonError, jsonOk, requireAuthOrg } from "@/lib/api-guard";
import { insert } from "@/lib/db";
import { assertProductQuota } from "@/lib/usage";
import { AppError } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const { org } = await requireAuthOrg(req);
    const body = (await req.json()) as { rows?: { name: string; price: number; sku?: string; stock?: number; category?: string }[] };
    if (!body.rows?.length) throw new AppError("invalid_input", "Aucune ligne à importer.");
    let created = 0;
    for (const row of body.rows.slice(0, 200)) {
      if (!row.name || row.price == null) continue;
      await assertProductQuota(org.id);
      insert("products", {
        organizationId: org.id,
        name: row.name,
        price: Number(row.price),
        sku: row.sku || null,
        stock: Number(row.stock ?? 0),
        category: row.category || null,
        currency: org.currency,
        status: "active",
        available: true,
      });
      created += 1;
    }
    return jsonOk({ created });
  } catch (e) {
    return jsonError(e);
  }
}
