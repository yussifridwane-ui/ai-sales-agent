"use client";

import { useEffect, useState } from "react";
import { EmptyState } from "@/components/ui";

type Agent = {
  id: string;
  name: string;
  tone: string;
  language: string;
  objective?: string;
  greeting?: string;
  instructions?: string;
  isActive: boolean;
};

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [active, setActive] = useState<Agent | null>(null);
  const [convo, setConvo] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ role: string; content: string; generatedByAi?: boolean }[]>([]);
  const [text, setText] = useState("");
  const [why, setWhy] = useState<string[] | null>(null);

  async function load() {
    const d = await fetch("/api/agents").then((r) => r.json());
    setAgents(d.agents || []);
    setActive((a) => a || d.agents?.[0] || null);
  }
  useEffect(() => {
    load();
  }, []);

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!active) return;
    const fd = new FormData(e.currentTarget);
    await fetch("/api/agents", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: active.id,
        name: fd.get("name"),
        tone: fd.get("tone"),
        language: fd.get("language"),
        objective: fd.get("objective"),
        greeting: fd.get("greeting"),
        instructions: fd.get("instructions"),
      }),
    });
    load();
  }

  async function startTest() {
    if (!active) return;
    const d = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentId: active.id, test: true, name: "Test client" }),
    }).then((r) => r.json());
    setConvo(d.conversation.id);
    const full = await fetch(`/api/conversations/${d.conversation.id}`).then((r) => r.json());
    setMessages(full.messages || []);
  }

  async function send() {
    if (!convo || !text.trim()) return;
    const content = text;
    setText("");
    const d = await fetch(`/api/conversations/${convo}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    }).then((r) => r.json());
    setWhy(d.explanation?.reasons || null);
    const full = await fetch(`/api/conversations/${convo}`).then((r) => r.json());
    setMessages(full.messages || []);
  }

  if (agents.length === 0) {
    return <EmptyState title="Vous n'avez pas encore d'agent." text="Créez-en un depuis l'onboarding." actionHref="/onboarding" actionLabel="Configurer" />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">AI Sales Agent</h1>
        <div className="flex gap-2 overflow-x-auto">
          {agents.map((a) => (
            <button key={a.id} onClick={() => setActive(a)} className={`rounded-full px-3 py-1 text-sm ${active?.id === a.id ? "bg-white/10" : "text-slate-400"}`}>
              {a.name}
            </button>
          ))}
        </div>
        {active ? (
          <form onSubmit={save} className="card space-y-3 p-5">
            <input name="name" defaultValue={active.name} key={active.id + "n"} />
            <input name="tone" defaultValue={active.tone} placeholder="tone" />
            <input name="language" defaultValue={active.language} />
            <input name="objective" defaultValue={active.objective} placeholder="Objectif" />
            <textarea name="greeting" defaultValue={active.greeting || ""} rows={2} placeholder="Message d'accueil" />
            <textarea name="instructions" defaultValue={active.instructions || ""} rows={4} placeholder="Instructions" />
            <button className="btn btn-primary">Enregistrer</button>
          </form>
        ) : null}
      </div>
      <div className="card flex h-[70vh] flex-col">
        <div className="flex items-center justify-between border-b border-white/5 p-4">
          <div>
            <div className="font-medium">Tester mon agent</div>
            <div className="text-xs text-slate-400">Jouez le rôle du client</div>
          </div>
          <button className="btn btn-ghost text-sm" onClick={startTest}>
            Nouvelle session
          </button>
        </div>
        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          {messages.map((m, i) => (
            <div key={i} className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${m.role === "customer" ? "ml-auto bg-teal-400/15" : "bg-white/5"}`}>
              {m.content}
              {m.generatedByAi ? <div className="mt-1 text-[10px] uppercase text-teal-300">IA</div> : null}
            </div>
          ))}
        </div>
        {why ? (
          <div className="border-t border-white/5 px-4 py-2 text-xs text-slate-400">
            {why.join(" · ")}
          </div>
        ) : null}
        <div className="flex gap-2 border-t border-white/5 p-3">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder='Ex. "Votre produit coûte combien ?"' onKeyDown={(e) => e.key === "Enter" && send()} />
          <button className="btn btn-primary" onClick={send}>
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}
