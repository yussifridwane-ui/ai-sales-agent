"use client";

import { useEffect, useState } from "react";
import { EmptyState } from "@/components/ui";

const pipeline = ["new", "contacted", "qualified", "proposal", "negotiation", "order", "client"];

type Lead = {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  channel?: string;
  score: number;
  status: string;
  productInterest?: string;
  isDemo?: boolean;
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [open, setOpen] = useState(false);

  async function load() {
    const d = await fetch("/api/leads").then((r) => r.json());
    setLeads(d.leads || []);
  }
  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: fd.get("firstName"),
        lastName: fd.get("lastName"),
        email: fd.get("email"),
        phone: fd.get("phone"),
        channel: "manual",
      }),
    });
    setOpen(false);
    load();
  }

  async function move(id: string, status: string) {
    await fetch("/api/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    load();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Prospects</h1>
        <button className="btn btn-primary" onClick={() => setOpen(true)}>
          + Ajouter un prospect
        </button>
      </div>
      {open ? (
        <form onSubmit={create} className="card grid gap-3 p-4 md:grid-cols-2">
          <input name="firstName" placeholder="Prénom" required />
          <input name="lastName" placeholder="Nom" />
          <input name="email" placeholder="Email" />
          <input name="phone" placeholder="Téléphone" />
          <button className="btn btn-primary md:col-span-2">Enregistrer</button>
        </form>
      ) : null}
      {leads.length === 0 ? (
        <EmptyState title="Vous n'avez pas encore de prospects." text="Ils apparaîtront dès qu'un visiteur écrira à l'agent." actionHref="/app/agents" actionLabel="Tester mon agent" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-slate-400">
              <tr>
                <th className="p-2">Nom</th>
                <th className="p-2">Contact</th>
                <th className="p-2">Canal</th>
                <th className="p-2">Score</th>
                <th className="p-2">Statut</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} className="border-t border-white/5">
                  <td className="p-2">
                    {l.firstName} {l.lastName} {l.isDemo ? <span className="demo-ribbon">DEMO</span> : null}
                    <div className="text-xs text-slate-500">{l.productInterest}</div>
                  </td>
                  <td className="p-2 text-slate-400">
                    {l.email}
                    <div>{l.phone}</div>
                  </td>
                  <td className="p-2">{l.channel}</td>
                  <td className="p-2">{l.score}/100</td>
                  <td className="p-2">
                    <select value={l.status} onChange={(e) => move(l.id, e.target.value)} className="w-auto">
                      {pipeline.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
