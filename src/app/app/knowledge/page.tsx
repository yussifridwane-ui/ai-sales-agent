"use client";

import { useEffect, useState } from "react";

type Doc = { id: string; title: string; type: string; content: string; isDemo?: boolean };
type Obj = { id: string; phrase: string; response: string };

export default function KnowledgePage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [objs, setObjs] = useState<Obj[]>([]);

  async function load() {
    const d = await fetch("/api/knowledge").then((r) => r.json());
    setDocs(d.documents || []);
    setObjs(d.objections || []);
  }
  useEffect(() => {
    load();
  }, []);

  async function addDoc(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch("/api/knowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: fd.get("title"), type: fd.get("type"), content: fd.get("content") }),
    });
    e.currentTarget.reset();
    load();
  }

  async function addObj(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch("/api/knowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "objection", phrase: fd.get("phrase"), response: fd.get("response") }),
    });
    e.currentTarget.reset();
    load();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <h1 className="text-2xl font-semibold">Base de connaissances</h1>
        <form onSubmit={addDoc} className="card mt-4 space-y-2 p-4">
          <input name="title" placeholder="Titre" required />
          <select name="type" defaultValue="faq">
            {["company", "faq", "shipping", "returns", "pricing", "hours", "url", "file"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <textarea name="content" rows={4} placeholder="Contenu autorisé pour l'IA" required />
          <button className="btn btn-primary">Ajouter</button>
        </form>
        <div className="mt-4 space-y-2">
          {docs.map((d) => (
            <div key={d.id} className="card p-4">
              <div className="font-medium">
                {d.title} <span className="text-xs text-slate-500">{d.type}</span>
                {d.isDemo ? <span className="demo-ribbon ml-2">DEMO</span> : null}
              </div>
              <p className="mt-1 text-sm text-slate-400">{d.content.slice(0, 180)}</p>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-xl font-semibold">Objections</h2>
        <form onSubmit={addObj} className="card mt-4 space-y-2 p-4">
          <input name="phrase" placeholder='Ex. "c&apos;est trop cher"' required />
          <textarea name="response" rows={3} placeholder="Réponse autorisée" required />
          <button className="btn btn-primary">Ajouter l&apos;objection</button>
        </form>
        <div className="mt-4 space-y-2">
          {objs.map((o) => (
            <div key={o.id} className="card p-4 text-sm">
              <div className="font-medium">« {o.phrase} »</div>
              <p className="mt-1 text-slate-400">{o.response}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
