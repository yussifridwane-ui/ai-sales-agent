import { MarketingFooter, MarketingNav } from "@/components/marketing-nav";

export default function SecurityPage() {
  return (
    <div className="grid-bg min-h-screen">
      <MarketingNav />
      <main className="mx-auto max-w-3xl px-4 py-16 text-slate-300">
        <h1 className="text-3xl font-semibold">Sécurité</h1>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-400">
          <li>Isolation multi-tenant par organization_id</li>
          <li>Mots de passe hashés (bcrypt)</li>
          <li>Sessions httpOnly</li>
          <li>Rate limiting</li>
          <li>Secrets uniquement serveur</li>
          <li>Webhooks signés + idempotence</li>
          <li>Audit logs</li>
        </ul>
      </main>
      <MarketingFooter />
    </div>
  );
}
