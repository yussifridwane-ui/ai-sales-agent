import { MarketingFooter, MarketingNav } from "@/components/marketing-nav";

export default function CookiesPage() {
  return (
    <div className="grid-bg min-h-screen">
      <MarketingNav />
      <main className="mx-auto max-w-3xl px-4 py-16 text-slate-300">
        <h1 className="text-3xl font-semibold">Cookie Policy</h1>
        <p className="mt-4 text-slate-400">
          Cookie de session httpOnly essentiel à l&apos;authentification. Pas de tracking publicitaire tiers dans le produit
          de base.
        </p>
      </main>
      <MarketingFooter />
    </div>
  );
}
