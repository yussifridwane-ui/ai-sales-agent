"use client";

import { useEffect, useState } from "react";
import { Stat } from "@/components/ui";

export default function AdminAnalytics() {
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  useEffect(() => {
    fetch("/api/admin/overview")
      .then((r) => r.json())
      .then((d) => setStats(d.stats));
  }, []);
  if (!stats) return null;
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Stat label="Conversations" value={String(stats.conversations)} />
      <Stat label="Commandes" value={String(stats.orders)} />
      <Stat label="Coût IA" value={`$${Number(stats.aiCost || 0).toFixed(4)}`} />
    </div>
  );
}
