import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFooter, MarketingNav } from "@/components/marketing-nav";
import { PLANS } from "@/lib/plans";

export const metadata: Metadata = { title: "Tarifs" };

export default function PricingPage() {
  return (
    <div className="grid-bg min-h-screen">
      <MarketingNav />
      <main className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-4xl font-semibold">Des plans clairs. Des limites réelles.</h1>
        <p className="mt-3 text-slate-400">Les quotas sont appliqués côté serveur. L&apos;upgrade est proposé à la limite.</p>
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {PLANS.map((p) => (
            <div key={p.slug} className="card p-6">
              <div className="text-sm text-slate-400">{p.name}</div>
              <div className="mt-2 text-3xl font-semibold">
                ${p.priceMonthly}
                <span className="text-sm text-slate-500">/mois</span>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-slate-400">
                {p.features.map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>
              <Link href="/register" className="btn btn-primary mt-6 w-full">
                Choisir {p.name}
              </Link>
            </div>
          ))}
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
