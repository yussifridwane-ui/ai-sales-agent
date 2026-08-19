import { MarketingFooter, MarketingNav } from "@/components/marketing-nav";

export default function TermsPage() {
  return (
    <div className="grid-bg min-h-screen">
      <MarketingNav />
      <main className="mx-auto max-w-3xl px-4 py-16 text-slate-300">
        <h1 className="text-3xl font-semibold">Terms of Service</h1>
        <p className="mt-4 text-slate-400">
          Le service est fourni en l&apos;état. Les limites de plan sont appliquées. Les paiements clients passent par des
          prestataires tiers. Vous restez responsable du contenu commercial et de la conformité locale.
        </p>
      </main>
      <MarketingFooter />
    </div>
  );
}
