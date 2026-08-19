"use client";

import { useEffect, useState } from "react";
import { CURRENCIES } from "@/lib/currency";

export default function SettingsPage() {
  const [org, setOrg] = useState<{
    name: string;
    currency: string;
    maxDiscountPct: number;
    shippingPolicy?: string;
    refundPolicy?: string;
    email?: string;
    phone?: string;
  } | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setOrg(d.organization));
  }, []);

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        currency: fd.get("currency"),
        maxDiscountPct: Number(fd.get("maxDiscountPct")),
        shippingPolicy: fd.get("shippingPolicy"),
        refundPolicy: fd.get("refundPolicy"),
        email: fd.get("email"),
        phone: fd.get("phone"),
      }),
    });
    setMsg("Enregistré.");
  }

  async function privacy(action: string) {
    const res = await fetch("/api/privacy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (action === "export") {
      const blob = new Blob([JSON.stringify(await res.json(), null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "aisales-export.json";
      a.click();
    }
    if (action === "delete_account") window.location.href = "/";
    setMsg("Action effectuée.");
  }

  if (!org) return null;
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Paramètres</h1>
      <form onSubmit={save} className="card grid gap-3 p-5 md:grid-cols-2">
        <input name="name" defaultValue={org.name} />
        <select name="currency" defaultValue={org.currency}>
          {CURRENCIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <input name="email" defaultValue={org.email || ""} placeholder="Email" />
        <input name="phone" defaultValue={org.phone || ""} placeholder="Téléphone" />
        <input name="maxDiscountPct" type="number" defaultValue={org.maxDiscountPct} placeholder="Remise max %" />
        <textarea name="shippingPolicy" defaultValue={org.shippingPolicy || ""} placeholder="Livraison" className="md:col-span-2" />
        <textarea name="refundPolicy" defaultValue={org.refundPolicy || ""} placeholder="Retours" className="md:col-span-2" />
        <button className="btn btn-primary md:col-span-2">Enregistrer</button>
      </form>
      <div className="card space-y-3 p-5">
        <h2 className="font-semibold">Privacy</h2>
        <button className="btn btn-ghost" onClick={() => privacy("export")}>
          Exporter mes données
        </button>
        <button className="btn btn-ghost" onClick={() => privacy("delete_conversations")}>
          Supprimer mes conversations
        </button>
        <button className="btn btn-ghost text-rose-300" onClick={() => privacy("delete_account")}>
          Supprimer mon compte
        </button>
      </div>
      {msg ? <p className="text-sm text-teal-300">{msg}</p> : null}
    </div>
  );
}
