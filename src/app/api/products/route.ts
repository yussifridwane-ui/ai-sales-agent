import { NextRequest } from "next/server";
import { jsonError, jsonOk, requireAuthOrg } from "@/lib/api-guard";
import { findMany, findOne, insert, removeWhere, updateWhere } from "@/lib/db";
import { assertProductQuota } from "@/lib/usage";
import { audit } from "@/lib/audit";
import type { Product } from "@/lib/db/types";
import { AppError } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const { org } = await requireAuthOrg(req);
    const q = req.nextUrl.searchParams.get("q")?.toLowerCase();
    let products = findMany<Product>("products", { organizationId: org.id }, { orderBy: "createdAt DESC" });
    if (q) {
      products = products.filter((p) => `${p.name} ${p.sku} ${p.category}`.toLowerCase().includes(q));
    }
    return jsonOk({ products });
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { org, user } = await requireAuthOrg(req);
    await assertProductQuota(org.id);
    const body = (await req.json()) as Partial<Product>;
    if (!body.name || body.price == null) throw new AppError("invalid_input", "Nom et prix requis.");
    const id = insert("products", {
      organizationId: org.id,
      name: body.name,
      description: body.description || null,
      category: body.category || null,
      price: Number(body.price),
      compareAtPrice: body.compareAtPrice ?? null,
      currency: body.currency || org.currency,
      stock: Number(body.stock ?? 0),
      sku: body.sku || null,
      images: body.images || "[]",
      sizes: body.sizes || "[]",
      colors: body.colors || "[]",
      features: body.features || "[]",
      shippingInfo: body.shippingInfo || null,
      available: body.available !== false,
      status: body.status || "active",
      forbiddenForAi: Boolean(body.forbiddenForAi),
    });
    await audit({ organizationId: org.id, userId: user.id, action: "product.create", entity: "product", entityId: id });
    return jsonOk({ product: findOne("products", { id, organizationId: org.id }) }, 201);
  } catch (e) {
    return jsonError(e);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { org } = await requireAuthOrg(req);
    const body = (await req.json()) as Partial<Product> & { id: string };
    const product = findOne<Product>("products", { id: body.id, organizationId: org.id });
    if (!product) throw new AppError("not_found", "Produit introuvable.", 404);
    const { id, organizationId: _o, ...rest } = body;
    updateWhere("products", { id, organizationId: org.id }, rest as Record<string, unknown>);
    return jsonOk({ product: findOne("products", { id, organizationId: org.id }) });
  } catch (e) {
    return jsonError(e);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { org, user } = await requireAuthOrg(req);
    const id = req.nextUrl.searchParams.get("id");
    if (!id) throw new AppError("invalid_input", "id requis.");
    const product = findOne<Product>("products", { id, organizationId: org.id });
    if (!product) throw new AppError("not_found", "Produit introuvable.", 404);
    removeWhere("products", { id, organizationId: org.id });
    await audit({ organizationId: org.id, userId: user.id, action: "product.delete", entity: "product", entityId: id });
    return jsonOk({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}
