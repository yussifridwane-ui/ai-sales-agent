"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui";
import Link from "next/link";

type Item = { provider: string; name: string; status: string; comingSoon?: boolean };

const label: Record<string, string> = {
  connected: "Connected",
  not_connected: "Not connected",
  requires_setup: "Requires setup",
  coming_soon: "Coming soon",
};

export default function IntegrationsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [msg, setMsg] = useState("");

  async function load() {
    const d = await fetch("/api/integrations").then((r) => r.json());
    setItems(d.integrations || []);
  }
  useEffect(() => {
    load();
  }, []);

  async function save(provider: string, form: HTMLFormElement) {
    const fd = new FormData(form);
    const credentials: Record<string, string> = {};
    fd.forEach((v, k) => {
      credentials[k] = String(v);
    });
    const d = await fetch("/api/integrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, credentials }),
    }).then((r) => r.json());
    setMsg(d.message || d.error || "Enregistré.");
    load();
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">Integrations</h1>
      <p className="text-sm text-slate-400">Aucune intégration n&apos;est affichée comme connectée sans configuration réelle.</p>
      {msg ? <div className="card p-3 text-sm text-amber-200">{msg}</div> : null}
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((i) => (
          <div key={i.provider} className="card p-5">
            <div className="flex items-center justify-between">
              <div className="font-medium">{i.name}</div>
              <Badge tone={i.status === "connected" ? "ok" : i.status === "coming_soon" ? "warn" : "muted"}>
                {label[i.status] || i.status}
              </Badge>
            </div>
            {i.provider === "website" ? (
              <Link href="/app/widget" className="mt-3 inline-block text-sm text-teal-300">
                Installer mon AI Sales Agent
              </Link>
            ) : null}
            {i.provider === "whatsapp" && i.status !== "coming_soon" ? (
              <form
                className="mt-3 space-y-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  save("whatsapp", e.currentTarget);
                }}
              >
                <input name="accessToken" placeholder="WhatsApp access token" />
                <input name="phoneNumberId" placeholder="Phone number ID" />
                <p className="text-xs text-slate-500">API officielle uniquement. Pas de scraping.</p>
                <button className="btn btn-ghost text-sm">Enregistrer (serveur)</button>
              </form>
            ) : null}
            {i.provider === "instagram" ? (
              <div className="mt-3 text-sm text-slate-400">
                Connecter Instagram — permissions Meta requises : instagram_manage_messages, pages_messaging.
              </div>
            ) : null}
            {i.provider === "stripe" ? (
              <p className="mt-3 text-xs text-slate-500">Clés Stripe uniquement en variables d&apos;environnement serveur.</p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
