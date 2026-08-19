"use client";

import { useEffect, useState } from "react";

export default function AdminSubs() {
  const [orgs, setOrgs] = useState<{ id: string; name: string; subscription?: { status: string } | null }[]>([]);
  useEffect(() => {
    fetch("/api/admin/overview")
      .then((r) => r.json())
      .then((d) => setOrgs(d.organizations || []));
  }, []);
  async function change(organizationId: string, plan: string) {
    await fetch("/api/admin/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "change_plan", organizationId, plan }),
    });
  }
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold">Abonnements</h1>
      {orgs.map((o) => (
        <div key={o.id} className="card flex items-center justify-between p-4 text-sm">
          <div>
            {o.name} · {o.subscription?.status}
          </div>
          <select defaultValue="free" onChange={(e) => change(o.id, e.target.value)} className="w-auto">
            <option value="free">free</option>
            <option value="starter">starter</option>
            <option value="business">business</option>
            <option value="pro">pro</option>
          </select>
        </div>
      ))}
    </div>
  );
}
