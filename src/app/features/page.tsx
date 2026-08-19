import type { Metadata } from "next";
import { MarketingFooter, MarketingNav } from "@/components/marketing-nav";

export const metadata: Metadata = { title: "Fonctionnalités" };

export default function FeaturesPage() {
  const items = [
    "Agents IA, ton et langues",
    "Base de connaissances contrôlée",
    "Catalogue + recommandations",
    "Inbox multi-canal",
    "Lead scoring 0–100",
    "Mini CRM",
    "Commandes et statuts",
    "Paiements modulaires",
    "Widget site",
    "WhatsApp officiel",
    "Instagram (connexion requise)",
    "Automatisations",
    "Transfert humain",
    "Analytics & Insights",
    "Billing & quotas",
    "RGPD",
  ];
  return (
    <div className="grid-bg min-h-screen">
      <MarketingNav />
      <main className="mx-auto max-w-6xl px-4 py-16">
        <h1>Un vrai AI Sales Engine</h1>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {items.map((i) => (
            <div key={i} className="card p-4 text-sm">
              {i}
            </div>
          ))}
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
