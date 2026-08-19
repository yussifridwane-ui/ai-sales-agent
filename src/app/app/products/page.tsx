"use client";

import { useEffect, useState } from "react";
import { EmptyState } from "@/components/ui";

type Product = {
  id: string;
  name: string;
  price: number;
  currency: string;
  stock: number;
  sku?: string;
  status: string;
  isDemo?: boolean;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  async function load() {
    const d = await fetch(`/api/products?q=${encodeURIComponent(q)}`).then((r) => r.json());
    setProducts(d.products || []);
  }
  useEffect(() => {
    load();
  }, [q]);

  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        price: Number(fd.get("price")),
        stock: Number(fd.get("stock") || 0),
        sku: fd.get("sku"),
        description: fd.get("description"),
        category: fd.get("category"),
      }),
    });
    if (res.ok) {
      setOpen(false);
      load();
    } else {
      const d = await res.json();
      alert(d.error);
    }
  }

  async function remove(id: string) {
    await fetch(`/api/products?id=${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Produits</h1>
        <div className="flex gap-2">
          <a className="btn btn-ghost" href="/api/products/export">
            Exporter
          </a>
          <button className="btn btn-primary" onClick={() => setOpen(true)}>
            + Ajouter mon premier produit
          </button>
        </div>
      </div>
      <input placeholder="Rechercher…" value={q} onChange={(e) => setQ(e.target.value)} />
      {open ? (
        <form onSubmit={create} className="card grid gap-3 p-4 md:grid-cols-2">
          <input name="name" placeholder="Nom" required />
          <input name="price" type="number" step="0.01" placeholder="Prix" required />
          <input name="stock" type="number" placeholder="Stock" />
          <input name="sku" placeholder="SKU" />
          <input name="category" placeholder="Catégorie" />
          <input name="description" placeholder="Description" className="md:col-span-2" />
          <button className="btn btn-primary md:col-span-2">Enregistrer</button>
        </form>
      ) : null}
      {products.length === 0 ? (
        <EmptyState title="Vous n'avez pas encore de produits." text="Ajoutez votre catalogue pour que l'IA recommande uniquement vos articles." actionLabel="+ Ajouter mon premier produit" actionHref="#add" />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {products.map((p) => (
            <div key={p.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium">
                    {p.name} {p.isDemo ? <span className="demo-ribbon">DEMO</span> : null}
                  </div>
                  <div className="text-sm text-slate-400">
                    {p.sku} · stock {p.stock}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {p.price} {p.currency}
                  </div>
                  <button className="text-xs text-rose-300" onClick={() => remove(p.id)}>
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
