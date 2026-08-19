import { NextRequest, NextResponse } from "next/server";
import { requireAuthOrg, jsonError } from "@/lib/api-guard";
import { findMany } from "@/lib/db";
import type { Product } from "@/lib/db/types";

export async function GET(req: NextRequest) {
  try {
    const { org } = await requireAuthOrg(req);
    const products = findMany<Product>("products", { organizationId: org.id });
    const header = ["id", "name", "sku", "price", "currency", "stock", "category", "status"];
    const csv = [
      header.join(","),
      ...products.map((p) => header.map((h) => JSON.stringify((p as Record<string, unknown>)[h] ?? "")).join(",")),
    ].join("\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=products.csv",
      },
    });
  } catch (e) {
    return jsonError(e);
  }
}
