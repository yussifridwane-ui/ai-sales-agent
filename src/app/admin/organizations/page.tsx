"use client";

import { useEffect, useState } from "react";

type O = { id: string; name: string; slug: string; status: string; isDemo?: boolean };

export default function AdminOrgs() {
  const [orgs, setOrgs] = useState<O[]>([]);
  async function load() {
    const d = await fetch("/api/admin/overview").then((r) => r.json());
    setOrgs(d.organizations || []);
  }
  useEffect(() => {
    load();
  }, []);
  async function act(action: string, organizationId: string) {
    await fetch("/api/admin/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, organizationId }),
    });
    load();
  }
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold">Entreprises</h1>
      {orgs.map((o) => (
        <div key={o.id} className="card flex items-center justify-between p-4 text-sm">
          <div>
            {o.name} · {o.slug} {o.isDemo ? <span className="demo-ribbon">DEMO</span> : null}
            <div className="text-slate-400">{o.status}</div>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-ghost" onClick={() => act("suspend_org", o.id)}>
              Suspendre
            </button>
            <button className="btn btn-ghost" onClick={() => act("activate_org", o.id)}>
              Activer
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
