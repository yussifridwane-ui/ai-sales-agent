"use client";

import { useEffect, useState } from "react";

type Member = { id: string; email?: string; name?: string; role: string };

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [error, setError] = useState("");

  async function load() {
    const d = await fetch("/api/members").then((r) => r.json());
    if (d.error) setError(d.error);
    setMembers(d.members || []);
  }
  useEffect(() => {
    load();
  }, []);

  async function invite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const d = await fetch("/api/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: fd.get("email"), role: fd.get("role") }),
    }).then((r) => r.json());
    if (d.error) setError(d.error);
    else {
      setError("");
      load();
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">Équipe & rôles</h1>
      <p className="text-sm text-slate-400">OWNER · ADMIN · MANAGER · SALES · SUPPORT · VIEWER — vérifiés côté serveur.</p>
      <form onSubmit={invite} className="card grid gap-3 p-4 md:grid-cols-3">
        <input name="email" type="email" placeholder="email@entreprise.com" required />
        <select name="role" defaultValue="viewer">
          <option value="admin">admin</option>
          <option value="manager">manager</option>
          <option value="sales">sales</option>
          <option value="support">support</option>
          <option value="viewer">viewer</option>
        </select>
        <button className="btn btn-primary">Inviter</button>
      </form>
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      {members.map((m) => (
        <div key={m.id} className="card flex justify-between p-4 text-sm">
          <div>
            {m.name} · {m.email}
          </div>
          <div className="text-slate-400">{m.role}</div>
        </div>
      ))}
    </div>
  );
}
