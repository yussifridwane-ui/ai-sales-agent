"use client";

import { useEffect, useState } from "react";
import { Stat } from "@/components/ui";

export default function AdminHome() {
  const [data, setData] = useState<{ stats: Record<string, number> } | null>(null);
  useEffect(() => {
    fetch("/api/admin/overview")
      .then((r) => r.json())
      .then(setData);
  }, []);
  if (!data?.stats) return <p>Chargement…</p>;
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Stat label="Utilisateurs" value={String(data.stats.users)} />
      <Stat label="Entreprises" value={String(data.stats.organizations)} />
      <Stat label="Conversations" value={String(data.stats.conversations)} />
      <Stat label="Commandes" value={String(data.stats.orders)} />
      <Stat label="Coût IA" value={`$${Number(data.stats.aiCost || 0).toFixed(4)}`} />
      <Stat label="Revenus factures" value={`$${(Number(data.stats.revenueCents || 0) / 100).toFixed(2)}`} />
    </div>
  );
}
