import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { requireOrganization } from "@/lib/tenant";
import { dashboardKpis } from "@/lib/queries";
import { getPeriodUsage } from "@/lib/usage";
import { Stat } from "@/components/ui";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ ready?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) return null;
  const { organization } = await requireOrganization(user);
  const k = dashboardKpis(organization);
  const usage = await getPeriodUsage(organization.id);
  const ready = (await searchParams).ready;

  return (
    <div className="space-y-6">
      {ready ? (
        <div className="card border-teal-400/30 p-4 text-teal-200">Votre AI Sales Agent est prêt.</div>
      ) : null}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-slate-400">
            Cette semaine, votre agent IA a contribué à {k.aiRevenueLabel} de ventes.
          </p>
        </div>
        <Link href="/app/agents" className="btn btn-primary">
          Tester mon agent
        </Link>
      </div>
      {organization.isDemo ? <div className="demo-ribbon">Données DEMO — non mélangées à de vraies ventes</div> : null}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Conversations aujourd'hui" value={String(k.conversationsToday)} />
        <Stat label="Prospects" value={String(k.leads)} />
        <Stat label="Qualifiés" value={String(k.qualified)} />
        <Stat label="Commandes" value={String(k.orders)} />
        <Stat label="Chiffre d'affaires" value={k.revenueLabel} />
        <Stat label="Taux de conversion" value={`${k.conversion.toFixed(1)}%`} />
        <Stat label="Panier moyen" value={k.aovLabel} />
        <Stat label="Abandonnées" value={String(k.abandoned)} />
        <Stat label="Relances" value={String(k.followUps)} />
        <Stat label="Ventes IA" value={k.aiRevenueLabel} />
      </div>
      <div className="card p-5">
        <div className="text-sm text-slate-400">Usage période</div>
        <div className="mt-2 text-lg font-medium">
          Vous avez utilisé {usage.conversations} / {usage.plan?.conversationLimit ?? 50} conversations.
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-teal-400"
            style={{
              width: `${Math.min(100, (usage.conversations / (usage.plan?.conversationLimit || 50)) * 100)}%`,
            }}
          />
        </div>
        {usage.conversations >= (usage.plan?.conversationLimit || 50) ? (
          <Link href="/app/billing" className="mt-3 inline-block text-sm text-amber-200">
            Limite atteinte — passer à un plan supérieur
          </Link>
        ) : null}
      </div>
    </div>
  );
}
