import { findOne } from "../db";
import { AppError } from "../errors";
import type { Organization, Product } from "../db/types";

export function officialProduct(organizationId: string, productId: string) {
  const product = findOne<Product>("products", { id: productId, organizationId });
  if (!product || product.status !== "active") {
    throw new AppError("product_not_found", "Produit introuvable dans le catalogue.", 404);
  }
  if (product.forbiddenForAi) {
    throw new AppError("product_forbidden", "Ce produit ne peut pas être vendu via l'IA.", 400);
  }
  return product;
}

export function applyDiscountCap(subtotal: number, requestedDiscount: number, maxDiscountPct: number) {
  const maxAmount = Math.max(0, (subtotal * Math.max(0, maxDiscountPct)) / 100);
  return Math.min(Math.max(0, requestedDiscount), maxAmount);
}

export function computeOrderTotals(input: {
  organizationId: string;
  items: { productId: string; quantity: number }[];
  requestedDiscount?: number;
  shipping?: number;
  tax?: number;
}) {
  const org = findOne<Organization>("organizations", { id: input.organizationId });
  if (!org) throw new AppError("not_found", "Organisation introuvable.", 404);
  const lines = input.items.map((item) => {
    const qty = Math.max(1, Math.min(99, Math.floor(Number(item.quantity) || 1)));
    const product = officialProduct(input.organizationId, item.productId);
    if (product.stock < qty) {
      throw new AppError("out_of_stock", `Stock insuffisant pour ${product.name}.`, 400);
    }
    const unitPrice = Number(product.price);
    return {
      productId: product.id,
      name: product.name,
      quantity: qty,
      unitPrice,
      total: unitPrice * qty,
      currency: product.currency || org.currency,
    };
  });
  const subtotal = lines.reduce((s, l) => s + l.total, 0);
  const discount = applyDiscountCap(subtotal, Number(input.requestedDiscount || 0), org.maxDiscountPct);
  const shipping = Math.max(0, Number(input.shipping || 0));
  const tax = Math.max(0, Number(input.tax || 0));
  return {
    lines,
    subtotal,
    discount,
    shipping,
    tax,
    total: Math.max(0, subtotal - discount + shipping + tax),
    currency: org.currency,
    maxDiscountPct: org.maxDiscountPct,
  };
}
