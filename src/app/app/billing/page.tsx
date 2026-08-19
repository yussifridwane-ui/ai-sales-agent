"use client";

import { useEffect, useState } from "react";
import { PLANS } from "@/lib/plans";

export default function BillingPage() {
  const [data, setData] = useState<{
    usage: { conversations: number; plan?: { slug: string; conversationLimit: number; name: string } };
    invoices: { id: string; number: string; amount: number; currency: string; status: string }[];
    notice?: string;
  } | null>(null);
  const [notice, setNotice] = useState("");

  async function load() {
    setData(await fetch("/api/billing").then((r) => r.json()));
  }
  useEffect(() => {
    load();
  }, []);

  async function change(plan: string) {
    const d = await fetch("/api/billing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, action: "upgrade" }),
    }).then((r) => r.json());
    setNotice(d.notice || d.error || "Plan mis à jour.");
    load();
  }

  if (!data?.usage) return null;
  const used = data.usage.conversations;
  const limit = data.usage.plan?.conversationLimit || 50;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Facturation</h1>
      <div className="card p-5">
        <div>
          Plan actuel : <strong>{data.usage.plan?.name}</strong>
        </div>
        <div className="mt-2">
          Vous avez utilisé {used} / {limit} conversations.
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full bg-teal-400" style={{ width: `${Math.min(100, (used / limit) * 100)}%` }} />
        </div>
      </div>
      {notice ? <div className="card p-3 text-sm text-amber-200">{notice}</div> : null}
      <div className="grid gap-3 md:grid-cols-4">
        {PLANS.map((p) => (
          <div key={p.slug} className="card p-4">
            <div className="text-sm text-slate-400">{p.name}</div>
            <div className="text-2xl font-semibold">${p.priceMonthly}</div>
            <button className="btn btn-primary mt-4 w-full" onClick={() => change(p.slug)}>
              Choisir
            </button>
          </div>
        ))}
      </div>
      <div className="card p-5">
        <div className="font-medium">Factures</div>
        {data.invoices.map((i) => (
          <div key={i.id} className="mt-2 flex justify-between text-sm text-slate-400">
            <span>{i.number}</span>
            <span>
              {(i.amount / 100).toFixed(2)} {i.currency} · {i.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
