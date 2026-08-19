"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge, EmptyState } from "@/components/ui";

const tabs = [
  ["all", "Toutes"],
  ["new", "Nouvelles"],
  ["open", "En cours"],
  ["qualified", "Qualifiées"],
  ["ordered", "Commandées"],
  ["abandoned", "Abandonnées"],
  ["transferred", "Transférées"],
];

type Row = {
  id: string;
  leadName: string;
  channel: string;
  lastMessageAt: string;
  status: string;
  potentialValue: number | null;
  agentName: string;
  lastPreview: string;
  isDemo?: boolean;
};

export default function ConversationsPage() {
  const [status, setStatus] = useState("all");
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    fetch(`/api/conversations?status=${status}`)
      .then((r) => r.json())
      .then((d) => setRows(d.conversations || []));
  }, [status]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Conversations</h1>
        <Link href="/app/agents" className="btn btn-primary">
          Tester
        </Link>
      </div>
      <div className="flex gap-2 overflow-x-auto text-sm">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            onClick={() => setStatus(id)}
            className={`rounded-full px-3 py-1 ${status === id ? "bg-white/10" : "text-slate-400"}`}
          >
            {label}
          </button>
        ))}
      </div>
      {rows.length === 0 ? (
        <EmptyState
          title="Vous n'avez pas encore de conversations."
          text="Testez votre agent ou installez le widget."
          actionHref="/app/agents"
          actionLabel="Tester mon agent"
        />
      ) : (
        <div className="space-y-2">
          {rows.map((c) => (
            <Link key={c.id} href={`/app/conversations/${c.id}`} className="card flex items-center justify-between gap-3 p-4">
              <div>
                <div className="flex items-center gap-2 font-medium">
                  {c.leadName}
                  {c.isDemo ? <span className="demo-ribbon">DEMO</span> : null}
                </div>
                <div className="text-sm text-slate-400">{c.lastPreview}</div>
              </div>
              <div className="text-right text-xs text-slate-400">
                <div>{c.channel}</div>
                <Badge>{c.status}</Badge>
                <div className="mt-1">{c.agentName}</div>
                {c.potentialValue ? <div>{c.potentialValue}</div> : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
