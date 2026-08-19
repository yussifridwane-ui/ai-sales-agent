"use client";

import { useEffect, useState } from "react";

type U = { id: string; email: string; name: string; status: string; platformRole: string };

export default function AdminUsers() {
  const [users, setUsers] = useState<U[]>([]);
  async function load() {
    const d = await fetch("/api/admin/overview").then((r) => r.json());
    setUsers(d.users || []);
  }
  useEffect(() => {
    load();
  }, []);
  async function act(action: string, userId: string) {
    await fetch("/api/admin/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, userId }),
    });
    load();
  }
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold">Utilisateurs</h1>
      {users.map((u) => (
        <div key={u.id} className="card flex items-center justify-between p-4 text-sm">
          <div>
            <div className="font-medium">{u.name}</div>
            <div className="text-slate-400">
              {u.email} · {u.status} · {u.platformRole}
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-ghost" onClick={() => act("suspend_user", u.id)}>
              Suspendre
            </button>
            <button className="btn btn-ghost" onClick={() => act("activate_user", u.id)}>
              Activer
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
