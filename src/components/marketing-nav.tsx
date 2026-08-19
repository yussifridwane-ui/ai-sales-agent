"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme";

export function MarketingNav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--bg)_86%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Logo />
        <nav className="hidden items-center gap-6 text-sm text-[var(--muted)] md:flex" aria-label="Principal">
          <a href="/#produit">Produit</a>
          <a href="/#features">Fonctionnalités</a>
          <a href="/#how">Comment ça marche</a>
          <a href="/#pricing">Tarifs</a>
          <a href="/#security">Sécurité</a>
          <a href="/#faq">FAQ</a>
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <Link href="/login" className="btn btn-ghost px-4 py-2 text-sm">
            Se connecter
          </Link>
          <Link href="/register" className="btn btn-primary px-4 py-2 text-sm">
            Commencer gratuitement
          </Link>
        </div>
        <button className="btn btn-ghost md:hidden" aria-expanded={open} onClick={() => setOpen(!open)}>
          Menu
        </button>
      </div>
      {open ? (
        <div className="space-y-2 border-t border-[var(--line)] px-4 py-4 md:hidden">
          <a className="block py-2" href="/#features">
            Fonctionnalités
          </a>
          <a className="block py-2" href="/#pricing">
            Tarifs
          </a>
          <a className="block py-2" href="/#security">
            Sécurité
          </a>
          <ThemeToggle />
          <Link href="/login" className="btn btn-ghost w-full">
            Se connecter
          </Link>
          <Link href="/register" className="btn btn-primary w-full">
            Commencer gratuitement
          </Link>
        </div>
      ) : null}
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-[var(--line)] px-4 py-12 text-sm text-[var(--muted)]">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs">Votre commercial IA travaille 24h/24.</p>
          <p className="mt-2 text-xs">ventesonline.tg</p>
        </div>
        <div className="space-y-2">
          <div className="font-medium text-[var(--ink)]">Produit</div>
          <Link href="/features" className="block">
            Fonctionnalités
          </Link>
          <Link href="/pricing" className="block">
            Tarifs
          </Link>
          <Link href="/#how" className="block">
            Documentation
          </Link>
        </div>
        <div className="space-y-2">
          <div className="font-medium text-[var(--ink)]">Entreprise</div>
          <Link href="/security" className="block">
            Sécurité
          </Link>
          <Link href="/privacy" className="block">
            Confidentialité
          </Link>
          <Link href="/terms" className="block">
            Conditions
          </Link>
        </div>
        <div className="space-y-2">
          <div className="font-medium text-[var(--ink)]">Support</div>
          <Link href="/#faq" className="block">
            FAQ
          </Link>
          <a href="mailto:olivia.t@example.org" className="block">
            olivia.t@example.org
          </a>
        </div>
      </div>
    </footer>
  );
}
