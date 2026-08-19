"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function WidgetPreview() {
  const { slug } = useParams<{ slug: string }>();
  const [boot, setBoot] = useState<{ org: { name: string }; agent?: { name: string; greeting?: string }; widget: { primaryColor: string } } | null>(null);
  const [cid, setCid] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    fetch(`/api/widget/bootstrap?org=${slug}`)
      .then((r) => r.json())
      .then((d) => {
        setBoot(d);
        if (d.agent?.greeting) setMessages([{ role: "assistant", content: d.agent.greeting }]);
      });
  }, [slug]);

  async function send() {
    if (!text.trim()) return;
    const content = text;
    setText("");
    setMessages((m) => [...m, { role: "customer", content }]);
    const d = await fetch("/api/widget/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ org: slug, conversationId: cid, content }),
    }).then((r) => r.json());
    if (d.conversationId) setCid(d.conversationId);
    if (d.reply) setMessages((m) => [...m, { role: "assistant", content: d.reply }]);
  }

  if (!boot?.org) return <p className="p-4 text-sm">Chargement…</p>;
  return (
    <div className="flex h-screen flex-col bg-[#0b1018] text-slate-100">
      <div className="border-b border-white/10 p-3 text-sm font-medium" style={{ color: boot.widget.primaryColor }}>
        {boot.agent?.name || "AI Sales Agent"} · {boot.org.name}
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-3 text-sm">
        {messages.map((m, i) => (
          <div key={i} className={`max-w-[85%] rounded-2xl px-3 py-2 ${m.role === "customer" ? "ml-auto bg-teal-400/20" : "bg-white/5"}`}>
            {m.content}
          </div>
        ))}
      </div>
      <div className="flex gap-2 border-t border-white/10 p-2">
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Votre message" />
        <button className="btn btn-primary" onClick={send}>
          Envoyer
        </button>
      </div>
    </div>
  );
}
