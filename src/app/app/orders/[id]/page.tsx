"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const search = useSearchParams();
  const [data, setData] = useState<{
    order: { number: string; total: number; currency: string; status: string; paymentStatus: string; isDemo?: boolean };
    items: { name: string; quantity: number; unitPrice: number }[];
    notice?: string;
  } | null>(null);
  const [notice, setNotice] = useState("");

  async function load() {
    setData(await fetch(`/api/orders/${id}`).then((r) => r.json()));
  }
  useEffect(() => {
    load();
  }, [id]);

  async function pay() {
    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: id }),
    });
    const d = await res.json();
    if (d.demo && d.externalId) {
      setNotice(d.notice || "Mode DEMO.");
      await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: id, confirmDemo: true, externalId: d.externalId }),
      });
      await load();
    } else if (d.checkoutUrl && !d.demo) {
      window.location.href = d.checkoutUrl;
    } else {
      setNotice(d.notice || d.error || "");
    }
  }

  if (!data?.order) return <p>Chargement…</p>;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">
        {data.order.number} {data.order.isDemo ? <span className="demo-ribbon">DEMO</span> : null}
      </h1>
      {search.get("checkout") === "demo" ? (
        <div className="card p-3 text-amber-200">Checkout DEMO — aucune transaction bancaire réelle.</div>
      ) : null}
      <div className="card p-5">
        {data.items.map((i) => (
          <div key={i.name} className="flex justify-between py-2 text-sm">
            <span>
              {i.name} × {i.quantity}
            </span>
            <span>{i.unitPrice}</span>
          </div>
        ))}
        <div className="mt-3 flex justify-between font-semibold">
          <span>Total</span>
          <span>
            {data.order.total} {data.order.currency}
          </span>
        </div>
        <div className="mt-2 text-sm text-slate-400">
          {data.order.status} · {data.order.paymentStatus}
        </div>
        {data.order.paymentStatus !== "paid" ? (
          <button className="btn btn-primary mt-4" onClick={pay}>
            Envoyer le paiement
          </button>
        ) : null}
        {notice ? <p className="mt-3 text-sm text-amber-200">{notice}</p> : null}
      </div>
    </div>
  );
}
