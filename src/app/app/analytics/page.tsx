"use client";

import { useEffect, useState } from "react";
import { Stat } from "@/components/ui";

export default function AnalyticsPage() {
  const [range, setRange] = useState("30");
  const [data, setData] = useState<{
    kpis: Record<string, number>;
    series: { date: string; sales: number; conversations: number; revenue: number }[];
    usage: { model: string; tokensIn: number; tokensOut: number; estimatedCost: number }[];
    currency: string;
  } | null>(null);

  useEffect(() => {
    fetch(`/api/analytics?range=${range}`)
      .then((r) => r.json())
      .then(setData);
  }, [range]);

  if (!data?.kpis) return <p>Chargement…</p>;
  const k = data.kpis;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <select value={range} onChange={(e) => setRange(e.target.value)} className="w-auto">
          <option value="today">Aujourd&apos;hui</option>
          <option value="7">7 jours</option>
          <option value="30">30 jours</option>
          <option value="90">90 jours</option>
        </select>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Conversations" value={String(k.conversations)} />
        <Stat label="Leads" value={String(k.leads)} />
        <Stat label="Qualifiés" value={String(k.qualified)} />
        <Stat label="Commandes" value={String(k.orders)} />
        <Stat label="CA" value={`${k.revenue?.toFixed?.(2) ?? k.revenue} ${data.currency}`} />
        <Stat label="AI Revenue" value={`${k.aiRevenue?.toFixed?.(2) ?? k.aiRevenue} ${data.currency}`} />
        <Stat label="Conversion" value={`${Number(k.conversion || 0).toFixed(1)}%`} />
        <Stat label="Abandons" value={String(k.abandoned)} />
      </div>
      <div className="card p-5">
        <div className="mb-3 text-sm text-slate-400">Ventes / conversations / revenus par jour</div>
        <div className="space-y-2">
          {data.series.map((s) => (
            <div key={s.date} className="grid grid-cols-[90px_1fr_auto] items-center gap-3 text-xs">
              <span className="text-slate-500">{s.date.slice(5)}</span>
              <div className="h-2 overflow-hidden rounded-full bg-white/5">
                <div className="h-full bg-teal-400" style={{ width: `${Math.min(100, s.conversations * 8)}%` }} />
              </div>
              <span>
                {s.conversations} conv · {s.revenue} {data.currency}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="card p-5">
        <div className="font-medium">AI Cost Dashboard</div>
        {data.usage.map((u) => (
          <div key={u.model} className="mt-2 text-sm text-slate-400">
            {u.model} · in {u.tokensIn} / out {u.tokensOut} · ~ ${Number(u.estimatedCost).toFixed(4)}
          </div>
        ))}
      </div>
    </div>
  );
}
