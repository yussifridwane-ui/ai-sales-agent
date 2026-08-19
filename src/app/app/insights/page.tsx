"use client";

import { useEffect, useState } from "react";

export default function InsightsPage() {
  const [data, setData] = useState<{
    frequentIntents: { intent: string; pct: number }[];
    lost: number;
    hot: number;
    popular: { name: string; mentions: number }[];
    recs: string[];
  } | null>(null);

  useEffect(() => {
    fetch("/api/insights")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) return <p>Analyse…</p>;
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">AI Insights</h1>
      <div className="grid gap-3 md:grid-cols-3">
        {data.recs.map((r) => (
          <div key={r} className="card p-4 text-sm text-slate-300">
            {r}
          </div>
        ))}
      </div>
      <div className="card p-5">
        <div className="font-medium">Intentions fréquentes</div>
        <ul className="mt-3 space-y-2 text-sm">
          {data.frequentIntents.map((i) => (
            <li key={i.intent} className="flex justify-between">
              <span>{i.intent}</span>
              <span className="text-teal-300">{i.pct}%</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="card p-5 text-sm text-slate-400">
        Prospects perdus : {data.lost} · Leads très chauds : {data.hot}
      </div>
      <div className="card p-5">
        <div className="font-medium">Produits mentionnés</div>
        {data.popular.map((p) => (
          <div key={p.name} className="mt-1 text-sm text-slate-400">
            {p.name} · {p.mentions}
          </div>
        ))}
      </div>
    </div>
  );
}
