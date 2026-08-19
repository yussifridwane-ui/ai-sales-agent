"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

const nav = [
  { href: "/app/dashboard", label: "Dashboard" },
  { href: "/app/conversations", label: "Conversations" },
  { href: "/app/leads", label: "Leads" },
  { href: "/app/orders", label: "Orders" },
  { href: "/app/products", label: "Products" },
  { href: "/app/agents", label: "Agent" },
  { href: "/app/knowledge", label: "Knowledge" },
  { href: "/app/automations", label: "Automations" },
  { href: "/app/analytics", label: "Analytics" },
  { href: "/app/insights", label: "Insights" },
  { href: "/app/integrations", label: "Integrations" },
  { href: "/app/billing", label: "Billing" },
  { href: "/app/settings", label: "Settings" },
];

export function AppShell({
  children,
  orgName,
  isDemo,
  isAdmin,
}: {
  children: ReactNode;
  orgName: string;
  isDemo?: boolean;
  isAdmin?: boolean;
}) {
  const path = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-[#07090f] text-slate-100">
      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r border-white/5 bg-[#0b1018] p-4 md:block">
        <Link href="/app/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-teal-400 text-sm text-teal-950">AI</span>
          Sales Agent
        </Link>
        <div className="mt-4 text-xs text-slate-500">{orgName}</div>
        {isDemo ? <div className="demo-ribbon mt-2">DEMO</div> : null}
        <nav className="mt-6 space-y-1 text-sm">
          {nav.map((n) => {
            const active = path === n.href || path.startsWith(n.href + "/");
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`block rounded-xl px-3 py-2 ${active ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5"}`}
              >
                {n.label}
              </Link>
            );
          })}
          {isAdmin ? (
            <Link href="/admin" className="mt-4 block rounded-xl px-3 py-2 text-amber-200 hover:bg-white/5">
              Admin
            </Link>
          ) : null}
        </nav>
        <button onClick={logout} className="mt-8 text-sm text-slate-500">
          Déconnexion
        </button>
      </aside>

      <div className="md:pl-60">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/5 bg-[#07090f]/80 px-4 py-3 backdrop-blur md:hidden">
          <span className="font-semibold">AI Sales Agent</span>
          <button onClick={logout} className="text-sm text-slate-400">
            Sortir
          </button>
        </header>
        <main className="px-4 py-6 pb-24 md:px-8">{children}</main>
        <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-white/10 bg-[#0b1018]/95 text-[11px] md:hidden">
          {nav.slice(0, 5).map((n) => (
            <Link key={n.href} href={n.href} className="py-3 text-center text-slate-300">
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
