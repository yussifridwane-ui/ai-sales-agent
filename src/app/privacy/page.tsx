import { MarketingFooter, MarketingNav } from "@/components/marketing-nav";

export default function PrivacyPage() {
  return (
    <div className="grid-bg min-h-screen">
      <MarketingNav />
      <main className="prose prose-invert mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-3xl font-semibold">Privacy Policy</h1>
        <p className="mt-4 text-slate-400">
          AI Sales Agent traite les données de compte, conversations, commandes et usage pour fournir le service. Chaque
          organisation est isolée. Vous pouvez exporter ou supprimer vos données depuis Settings → Privacy. Les secrets
          d&apos;intégration sont chiffrés côté serveur.
        </p>
      </main>
      <MarketingFooter />
    </div>
  );
}
