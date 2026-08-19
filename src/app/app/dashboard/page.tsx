import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { requireOrganization } from "@/lib/tenant";
import { dashboardKpis } from "@/lib/queries";
import { getPeriodUsage } from "@/lib/usage";
import { Alert, Stat } from "@/components/ui";

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
  const limit = usage.plan?.conversationLimit || 50;

  return (
    <div className="space-y-6">
      {ready ? (
        <Alert tone="ok" title="Votre AI Sales Agent est prêt.">
          Testez-le, ajoutez des produits, puis installez le widget.
        </Alert>
      ) : null}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl">Overview</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Votre agent IA a contribué à {k.aiRevenueLabel} de ventes (données réelles de votre espace).
          </p>
        </div>
        <Link href="/app/agents" className="btn btn-primary">
          Tester mon agent
        </Link>
      </div>
      {organization.isDemo ? <div className="demo-ribbon">Données DEMO — non mélangées à de vraies ventes</div> : null}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <Stat label="Revenue" value={k.revenueLabel} hint="Période en cours · commandes payées" icon="◈" />
        <Stat label="Orders" value={String(k.orders)} hint="Toutes commandes" icon="▣" />
        <Stat label="Leads" value={String(k.leads)} hint={`${k.qualified} qualifiés`} icon="◉" />
        <Stat label="Conversion" value={`${k.conversion.toFixed(1)}%`} hint="Commandes / conversations" />
        <Stat label="AI conversations" value={String(k.conversationsToday)} hint="Aujourd'hui" />
        <Stat label="Pending / abandonnées" value={String(k.abandoned)} hint="À relancer" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <div className="text-sm text-[var(--muted)]">Usage conversations</div>
          <div className="mt-2 text-lg font-medium">
            Vous avez utilisé {usage.conversations} / {limit} conversations.
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--bg-soft)]">
            <div
              className="h-full bg-[var(--primary)]"
              style={{ width: `${Math.min(100, (usage.conversations / limit) * 100)}%` }}
            />
          </div>
          {usage.conversations >= limit ? (
            <Link href="/app/billing" className="mt-3 inline-block text-sm text-[var(--warn)]">
              Limite atteinte — passer à un plan supérieur
            </Link>
          ) : null}
        </div>
        <div className="card p-5">
          <div className="text-sm text-[var(--muted)]">Ventes IA</div>
          <div className="mt-2 text-2xl font-semibold">{k.aiRevenueLabel}</div>
          <p className="mt-1 text-sm text-[var(--muted)]">Attribuées aux conversations assistées par l&apos;agent.</p>
          <Link href="/app/analytics" className="btn btn-ghost mt-4">
            Voir Analytics
          </Link>
        </div>
      </div>
    </div>
  );
}
