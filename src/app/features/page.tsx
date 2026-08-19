import type { Metadata } from "next";
import { MarketingFooter, MarketingNav } from "@/components/marketing-nav";

export const metadata: Metadata = { title: "Fonctionnalités" };

const items = [
  "Agents IA multiples, ton et langues",
  "Base de connaissances contrôlée",
  "Catalogue produits + variantes",
  "Inbox conversations multi-canal",
  "Lead scoring 0–100",
  "Bibliothèque d'objections",
  "Mini CRM & pipeline",
  "Commandes et statuts",
  "Paiements modulaires",
  "Widget site",
  "WhatsApp Cloud API (officiel)",
  "Instagram / Meta (connexion requise)",
  "Automatisations & relances",
  "Transfert humain",
  "Analytics & AI Insights",
  "Billing SaaS & quotas",
  "Admin plateforme",
  "RGPD : export / suppression",
];

export default function FeaturesPage() {
  return (
    <div className="grid-bg min-h-screen">
      <MarketingNav />
      <main className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-4xl font-semibold">Un vrai AI Sales Engine</h1>
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
