"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme";

const primary = [
  { href: "/app/dashboard", label: "Overview" },
  { href: "/app/conversations", label: "Conversations" },
  { href: "/app/leads", label: "Leads" },
  { href: "/app/orders", label: "Commandes" },
  { href: "/app/products", label: "Produits" },
];

const more = [
  { href: "/app/agents", label: "AI Agent" },
  { href: "/app/knowledge", label: "Connaissances" },
  { href: "/app/automations", label: "Automatisations" },
  { href: "/app/analytics", label: "Analytics" },
  { href: "/app/insights", label: "Insights" },
  { href: "/app/integrations", label: "Integrations" },
  { href: "/app/billing", label: "Billing" },
  { href: "/app/team", label: "Équipe" },
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
  const [moreOpen, setMoreOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const all = [...primary, ...more];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <aside className="fixed inset-y-0 left-0 hidden w-[var(--sidebar)] border-r border-[var(--line)] bg-[var(--bg-elev)] p-4 lg:block">
        <Logo href="/app/dashboard" />
        <div className="mt-3 text-xs text-[var(--muted)]">{orgName}</div>
        {isDemo ? <div className="demo-ribbon mt-2">DEMO</div> : null}
        <nav className="mt-6 space-y-1 text-sm" aria-label="Application">
          {all.map((n) => {
            const active = path === n.href || path.startsWith(n.href + "/");
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`block rounded-xl px-3 py-2 ${active ? "bg-[var(--bg-soft)] font-medium" : "text-[var(--muted)] hover:bg-[var(--bg-soft)]"}`}
              >
                {n.label}
              </Link>
            );
          })}
          {isAdmin ? (
            <Link href="/admin" className="mt-3 block rounded-xl px-3 py-2 text-[var(--warn)]">
              Admin
            </Link>
          ) : null}
        </nav>
        <div className="absolute bottom-4 left-4 right-4 space-y-2">
          <ThemeToggle />
          <button onClick={logout} className="btn btn-ghost w-full text-sm">
            Déconnexion
          </button>
        </div>
      </aside>

      <div className="lg:pl-[var(--sidebar)]">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] px-4 py-3 backdrop-blur lg:hidden">
          <Logo compact href="/app/dashboard" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button onClick={logout} className="text-sm text-[var(--muted)]">
              Sortir
            </button>
          </div>
        </header>
        <main className="px-4 py-6 pb-28 lg:px-8">{children}</main>
        <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t border-[var(--line)] bg-[var(--bg-elev)] text-[11px] lg:hidden" aria-label="Mobile">
          {primary.map((n) => (
            <Link key={n.href} href={n.href} className="min-h-12 py-3 text-center text-[var(--muted)]">
              {n.label.split(" ")[0]}
            </Link>
          ))}
          <button className="min-h-12 py-3 text-[var(--muted)]" onClick={() => setMoreOpen((v) => !v)}>
            Plus
          </button>
        </nav>
        {moreOpen ? (
          <div className="fixed inset-x-0 bottom-14 z-30 mx-3 mb-2 rounded-2xl border border-[var(--line)] bg-[var(--bg-elev)] p-3 shadow-[var(--shadow)] lg:hidden">
            {more.map((n) => (
              <Link key={n.href} href={n.href} className="block rounded-xl px-3 py-2" onClick={() => setMoreOpen(false)}>
                {n.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
