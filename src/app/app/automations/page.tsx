"use client";

import { useEffect, useState } from "react";
import { EmptyState } from "@/components/ui";

type Rule = { id: string; name: string; trigger: string; isActive: boolean; isDemo?: boolean };

export default function AutomationsPage() {
  const [data, setData] = useState<{ automationsEnabled: boolean; rules: Rule[] } | null>(null);

  async function load() {
    setData(await fetch("/api/automations").then((r) => r.json()));
  }
  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/automations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        trigger: fd.get("trigger"),
        actions: [{ type: "follow_up", content: fd.get("message") }],
      }),
    });
    if (!res.ok) {
      const d = await res.json();
      alert(d.error);
      return;
    }
    load();
  }

  if (!data) return null;
  if (!data.automationsEnabled) {
    return (
      <EmptyState
        title="Automatisations — plan Business ou Pro"
        text="Les relances et workflows sont contrôlés côté serveur selon votre abonnement."
        actionHref="/app/billing"
        actionLabel="Voir les plans"
      />
    );
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">Automatisations</h1>
      <form onSubmit={create} className="card grid gap-3 p-4 md:grid-cols-2">
        <input name="name" placeholder="Nom" required />
        <select name="trigger" defaultValue="no_reply">
          {["new_lead", "new_conversation", "abandoned_cart", "order_created", "payment_received", "payment_failed", "no_reply", "qualified_lead"].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <input name="message" placeholder="Message de relance" className="md:col-span-2" />
        <button className="btn btn-primary md:col-span-2">Créer</button>
      </form>
      {data.rules.length === 0 ? (
        <EmptyState title="Vous n'avez pas encore d'automatisations." text="Exemple : SI pas de réponse 24h ALORS relancer." />
      ) : (
        data.rules.map((r) => (
          <div key={r.id} className="card p-4">
            <div className="font-medium">
              {r.name} {r.isDemo ? <span className="demo-ribbon">DEMO</span> : null}
            </div>
            <div className="text-sm text-slate-400">
              {r.trigger} · {r.isActive ? "active" : "pause"}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
