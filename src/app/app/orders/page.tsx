"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/ui";

type Order = {
  id: string;
  number: string;
  customer: string;
  total: number;
  currency: string;
  status: string;
  paymentStatus: string;
  channel: string;
  attributedToAi: boolean;
  isDemo?: boolean;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []));
  }, []);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">Commandes</h1>
      {orders.length === 0 ? (
        <EmptyState title="Vous n'avez pas encore de commandes." text="L'agent peut en créer depuis une conversation d'achat." actionHref="/app/agents" actionLabel="Tester mon agent" />
      ) : (
        <div className="space-y-2">
          {orders.map((o) => (
            <Link key={o.id} href={`/app/orders/${o.id}`} className="card flex items-center justify-between p-4">
              <div>
                <div className="font-medium">
                  {o.number} {o.isDemo ? <span className="demo-ribbon">DEMO</span> : null}
                </div>
                <div className="text-sm text-slate-400">
                  {o.customer} · {o.channel} {o.attributedToAi ? "· IA" : ""}
                </div>
              </div>
              <div className="text-right text-sm">
                <div>
                  {o.total} {o.currency}
                </div>
                <div className="text-slate-400">
                  {o.status} · {o.paymentStatus}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
