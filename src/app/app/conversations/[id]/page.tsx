"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui";

type Msg = { id: string; role: string; content: string; generatedByAi: boolean; createdAt: string };
type Conv = {
  id: string;
  status: string;
  channel: string;
  leadScore: number;
  humanTakeover: boolean;
  intent: string | null;
  isDemo?: boolean;
};

export default function ConversationDetail() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<{
    conversation: Conv;
    messages: Msg[];
    lead: { firstName?: string; email?: string; phone?: string } | null;
    score: { fr: string };
    explanation?: { reasons: string[] } | null;
  } | null>(null);
  const [text, setText] = useState("");
  const [why, setWhy] = useState<string[] | null>(null);

  async function load() {
    const res = await fetch(`/api/conversations/${id}`);
    setData(await res.json());
  }
  useEffect(() => {
    load();
  }, [id]);

  async function send(asHuman = false) {
    if (!text.trim()) return;
    const content = text;
    setText("");
    const res = await fetch(`/api/conversations/${id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, asHuman }),
    });
    const d = await res.json();
    setWhy(d.explanation?.reasons || null);
    await load();
  }

  async function takeover(on: boolean) {
    await fetch(`/api/conversations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ humanTakeover: on, status: on ? "transferred" : "open" }),
    });
    await load();
  }

  if (!data?.conversation) return <p className="text-slate-400">Chargement…</p>;
  const c = data.conversation;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      <div className="card flex h-[70vh] flex-col">
        <div className="flex items-center justify-between border-b border-white/5 p-4">
          <div>
            <div className="font-medium">
              {data.lead?.firstName || "Visiteur"} · {c.channel}
              {c.isDemo ? <span className="demo-ribbon ml-2">DEMO</span> : null}
            </div>
            <div className="text-xs text-slate-400">
              Lead Score : {c.leadScore}/100 · {data.score?.fr} · {c.intent || "—"}
            </div>
          </div>
          {c.humanTakeover ? (
            <button className="btn btn-ghost text-sm" onClick={() => takeover(false)}>
              Rendre la conversation à l&apos;IA
            </button>
          ) : (
            <button className="btn btn-ghost text-sm" onClick={() => takeover(true)}>
              Prendre le contrôle
            </button>
          )}
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {data.messages.map((m) => (
            <div key={m.id} className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${m.role === "customer" ? "ml-auto bg-teal-400/15" : "bg-white/5"}`}>
              <div className="whitespace-pre-wrap">{m.content}</div>
              {m.generatedByAi ? <div className="mt-1 text-[10px] uppercase tracking-wide text-teal-300">IA</div> : null}
            </div>
          ))}
        </div>
        <div className="flex gap-2 border-t border-white/5 p-3">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Écrire au nom du client…" onKeyDown={(e) => e.key === "Enter" && send(false)} />
          <button className="btn btn-primary" onClick={() => send(false)}>
            Envoyer
          </button>
          {c.humanTakeover ? (
            <button className="btn btn-ghost" onClick={() => send(true)}>
              Humain
            </button>
          ) : null}
        </div>
      </div>
      <aside className="space-y-3">
        <div className="card p-4">
          <div className="text-xs uppercase text-slate-400">Prospect</div>
          <div className="mt-2 text-sm">{data.lead?.email || "Email non collecté"}</div>
          <div className="text-sm">{data.lead?.phone || "Téléphone non collecté"}</div>
          <Badge tone="accent">{c.status}</Badge>
        </div>
        {why ? (
          <div className="card p-4 text-sm text-slate-300">
            <div className="font-medium">Pourquoi l&apos;IA a répondu ainsi</div>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-slate-400">
              {why.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
