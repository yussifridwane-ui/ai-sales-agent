"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge, EmptyState, Skeleton } from "@/components/ui";

const tabs = [
  ["all", "Toutes"],
  ["new", "Nouvelles"],
  ["open", "En cours"],
  ["qualified", "Qualifiées"],
  ["ordered", "Commandées"],
  ["abandoned", "Abandonnées"],
  ["transferred", "Humain"],
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
  humanTakeover?: boolean;
};

function statusTone(s: string): "ok" | "warn" | "ai" | "muted" | "danger" {
  if (s === "ordered" || s === "qualified") return "ok";
  if (s === "transferred") return "warn";
  if (s === "abandoned") return "danger";
  if (s === "open" || s === "new") return "ai";
  return "muted";
}

export default function ConversationsPage() {
  const [status, setStatus] = useState("all");
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    setRows(null);
    fetch(`/api/conversations?status=${status}`)
      .then((r) => r.json())
      .then((d) => setRows(d.conversations || []));
  }, [status]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl">Conversations</h1>
        <Link href="/app/agents" className="btn btn-primary">
          Tester
        </Link>
      </div>
      <div className="flex gap-2 overflow-x-auto text-sm">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            onClick={() => setStatus(id)}
            className={`min-h-10 rounded-full px-3 ${status === id ? "bg-[var(--bg-soft)] font-medium" : "text-[var(--muted)]"}`}
          >
            {label}
          </button>
        ))}
      </div>
      {rows === null ? (
        <div className="space-y-2">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          title="Votre agent IA n'a pas encore reçu de conversation."
          text="Testez l'agent ou installez le widget site."
          actionHref="/app/integrations"
          actionLabel="Connecter un canal"
        />
      ) : (
        <div className="space-y-2">
          {rows.map((c) => (
            <Link key={c.id} href={`/app/conversations/${c.id}`} className="card flex items-center gap-3 p-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--bg-soft)] font-semibold">
                {c.leadName.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 font-medium">
                  {c.leadName}
                  {c.isDemo ? <span className="demo-ribbon">DEMO</span> : null}
                  {c.humanTakeover ? <Badge tone="warn">Human</Badge> : <Badge tone="ai">AI</Badge>}
                </div>
                <div className="truncate text-sm text-[var(--muted)]">{c.lastPreview}</div>
              </div>
              <div className="hidden text-right text-xs text-[var(--muted)] sm:block">
                <div>{c.channel}</div>
                <Badge tone={statusTone(c.status)}>{c.status}</Badge>
                <div className="mt-1">{new Date(c.lastMessageAt).toLocaleString()}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
