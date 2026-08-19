import Link from "next/link";

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#07090f]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-teal-400 text-sm text-teal-950">AI</span>
          Sales Agent
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
          <a href="/#how">Fonctionnement</a>
          <a href="/features">Fonctionnalités</a>
          <a href="/pricing">Tarifs</a>
          <a href="/#security">Sécurité</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="btn btn-ghost px-4 py-2 text-sm">
            Connexion
          </Link>
          <Link href="/register" className="btn btn-primary px-4 py-2 text-sm">
            Start Free
          </Link>
        </div>
      </div>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-white/5 px-4 py-10 text-sm text-slate-500">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>© {new Date().getFullYear()} AI Sales Agent. International SaaS.</div>
        <div className="flex flex-wrap gap-4">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/cookies">Cookies</Link>
          <Link href="/security">Sécurité</Link>
          <Link href="/pricing">Tarifs</Link>
        </div>
      </div>
    </footer>
  );
}
