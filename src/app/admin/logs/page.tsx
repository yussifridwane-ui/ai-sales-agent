"use client";

import { useEffect, useState } from "react";

export default function AdminLogs() {
  const [logs, setLogs] = useState<{ id: string; action: string; createdAt: string; entity?: string }[]>([]);
  useEffect(() => {
    fetch("/api/admin/overview")
      .then((r) => r.json())
      .then((d) => setLogs(d.logs || []));
  }, []);
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">Audit logs</h1>
      {logs.map((l) => (
        <div key={l.id} className="card p-3 text-sm text-slate-400">
          {l.createdAt} · {l.action} · {l.entity}
        </div>
      ))}
    </div>
  );
}
