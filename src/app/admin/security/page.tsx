"use client";

import { useEffect, useState } from "react";
import { Badge, Stat } from "@/components/ui";

type Check = { id: string; label: string; status: "pass" | "warn" | "fail"; detail: string };
type Event = { id: string; type: string; severity: string; message: string; createdAt: string };

export default function SecurityCenter() {
  const [data, setData] = useState<{
    status: "SECURE" | "WARNING" | "CRITICAL";
    checks: Check[];
    events: Event[];
    counts: Record<string, number>;
    backups: { id: string; createdAt: string; checksum: string; restoreTested: boolean }[];
  } | null>(null);
  const [notice, setNotice] = useState("");

  async function load() {
    setData(await fetch("/api/admin/security").then((r) => r.json()));
  }
  useEffect(() => {
    load();
  }, []);

  async function backup() {
    const d = await fetch("/api/admin/security", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "backup" }),
    }).then((r) => r.json());
    setNotice(d.backup ? `Sauvegarde ${d.backup.checksum.slice(0, 12)}…` : d.error || "OK");
    load();
  }

  if (!data?.status) return <p>Analyse de sécurité…</p>;
  const tone = data.status === "SECURE" ? "ok" : data.status === "WARNING" ? "warn" : "danger";
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Security Center</h1>
        <Badge tone={tone}>Security Status · {data.status}</Badge>
      </div>
      <p className="text-sm text-slate-400">
        Le statut n&apos;est jamais « Secure » uniquement parce que l&apos;app fonctionne. Il est calculé à partir de contrôles réellement exécutés.
      </p>
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Événements 7j" value={String(data.counts.total || 0)} />
        <Stat label="Auth échouées" value={String(data.counts.authFail || 0)} />
        <Stat label="Accès refusés" value={String(data.counts.forbidden || 0)} />
        <Stat label="Webhooks invalides" value={String(data.counts.webhookInvalid || 0)} />
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        {data.checks.map((c) => (
          <div key={c.id} className="card p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium">{c.label}</span>
              <Badge tone={c.status === "pass" ? "ok" : c.status === "warn" ? "warn" : "danger"}>{c.status}</Badge>
            </div>
            <p className="mt-1 text-slate-400">{c.detail}</p>
          </div>
        ))}
      </div>
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <div className="font-medium">Sauvegardes</div>
          <button className="btn btn-primary" onClick={backup}>
            Lancer une sauvegarde
          </button>
        </div>
        {notice ? <p className="mt-2 text-sm text-amber-200">{notice}</p> : null}
        {data.backups.map((b) => (
          <div key={b.id} className="mt-2 text-xs text-slate-400">
            {b.createdAt} · {b.checksum.slice(0, 16)} · restore tested: {b.restoreTested ? "yes" : "no"}
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <h2 className="font-semibold">Événements récents</h2>
        {data.events.map((e) => (
          <div key={e.id} className="card p-3 text-sm text-slate-400">
            <Badge tone={e.severity === "CRITICAL" || e.severity === "HIGH" ? "danger" : e.severity === "MEDIUM" ? "warn" : "muted"}>
              {e.severity}
            </Badge>{" "}
            {e.createdAt} · {e.type} · {e.message}
          </div>
        ))}
      </div>
    </div>
  );
}
