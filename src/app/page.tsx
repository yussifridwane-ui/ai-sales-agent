import Link from "next/link";
import { MarketingFooter, MarketingNav } from "@/components/marketing-nav";
import { PLANS } from "@/lib/plans";
import { Badge } from "@/components/ui";

const faqs = [
  ["Comment fonctionne AI Sales Agent ?", "Il suit un moteur commercial : accueil, qualification, recommandation catalogue, objections, commande, paiement, suivi. Ce n'est pas un chatbot FAQ."],
  ["Quels canaux sont supportés ?", "Le widget site est disponible. WhatsApp et Instagram nécessitent une connexion officielle. Messenger : coming soon."],
  ["Mes données sont-elles sécurisées ?", "Oui. Isolation multi-tenant, RBAC, secrets serveur, audit logs, export et suppression RGPD."],
  ["Puis-je connecter WhatsApp ?", "Oui, via l'API officielle WhatsApp Cloud. Sans credentials : statut « Connexion requise »."],
  ["Puis-je connecter Instagram ?", "Oui, via Meta. Les permissions nécessaires sont expliquées. Rien n'est simulé comme connecté."],
  ["Comment fonctionne le paiement ?", "Prestataires officiels (Stripe, etc.). Le frontend ne peut pas marquer une commande payée."],
  ["Puis-je désactiver l'IA ?", "Oui. Prenez le contrôle d'une conversation : l'IA se met en pause."],
  ["Puis-je transférer une conversation à un humain ?", "Oui, automatiquement (plainte, secret, négociation hors règles) ou manuellement."],
];

export default function HomePage() {
  const displayPlans = PLANS.filter((p) => p.slug !== "free");
  return (
    <div className="grid-bg min-h-screen">
      <MarketingNav />
      <main>
        <section id="produit" className="mx-auto max-w-6xl px-4 pb-12 pt-14 md:pt-20">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <div className="ai-chip mb-4">AI Sales Engine</div>
              <h1>Transformez automatiquement vos conversations en ventes.</h1>
              <p className="mt-4 max-w-xl text-lg text-[var(--muted)]">
                AI Sales Agent répond à vos clients, recommande vos produits, qualifie les prospects et transforme les
                conversations en commandes — 24h/24.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href="/register" className="btn btn-primary">
                  Commencer gratuitement
                </Link>
                <a href="#how" className="btn btn-ghost">
                  Voir comment ça marche
                </a>
              </div>
              <p className="mt-3 text-xs text-[var(--muted)]">ventesonline.tg · Plan Free · Isolation multi-tenant</p>
            </div>
            <DemoConversation />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["Disponibilité", "24h/24 — l'agent ne dort pas"],
              ["Prix", "Toujours issus du catalogue"],
              ["Sécurité", "Isolation entreprise + audit"],
            ].map(([t, d]) => (
              <div key={t} className="card p-5">
                <div className="font-medium">{t}</div>
                <p className="mt-1 text-sm text-[var(--muted)]">{d}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-4 py-16">
          <h2>Conçu pour vendre, pas pour discuter.</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["AI Sales Agent", "Ton, langues, règles et escalade humaine."],
              ["WhatsApp", "API officielle. Connexion requise."],
              ["Instagram", "Meta. Permissions à accorder."],
              ["Commandes", "Créées côté serveur, jamais au feeling."],
              ["Catalogue intelligent", "Recommandations limitées à vos produits."],
              ["Paiement", "Stripe ou DEMO explicite. Jamais simulé."],
              ["Analytics", "AI Revenue à partir des commandes réelles."],
              ["Automatisation", "Relances 2h / 24h / 72h avec opt-out."],
            ].map(([t, d]) => (
              <article key={t} className="card p-5 transition hover:-translate-y-0.5">
                <div className="text-[var(--ai)]" aria-hidden>
                  ◆
                </div>
                <h3 className="mt-3">{t}</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">{d}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="how" className="mx-auto max-w-6xl px-4 py-16">
          <h2>Comment ça marche</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ["1. Connectez vos canaux", "Widget site immédiat. WhatsApp / Instagram après connexion officielle."],
              ["2. Configurez votre agent IA", "Catalogue, ton, langues, remise max, escalade."],
              ["3. Laissez-le vendre", "Qualification, commande, paiement, suivi — ou transfert humain."],
            ].map(([t, d]) => (
              <div key={t} className="card p-6">
                <div className="text-sm font-semibold text-[var(--primary)]">{t}</div>
                <p className="mt-2 text-sm text-[var(--muted)]">{d}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="demo" className="mx-auto max-w-6xl px-4 py-16">
          <h2>Voyez votre agent vendre en temps réel</h2>
          <p className="mt-2 text-[var(--muted)]">Démonstration visuelle. Aucun paiement réel n&apos;est déclenché.</p>
          <div className="mt-6">
            <DemoConversation extended />
          </div>
        </section>

        <section id="security" className="mx-auto max-w-6xl px-4 py-16">
          <div className="card p-8 md:p-10">
            <h2>Vos données sont protégées.</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {["Chiffrement", "Isolation des entreprises", "Contrôle d'accès", "Protection API", "Audit logs"].map((s) => (
                <div key={s} className="rounded-2xl bg-[var(--bg-soft)] p-4 text-sm font-medium">
                  {s}
                </div>
              ))}
            </div>
            <Link href="/security" className="btn btn-ghost mt-6">
              Découvrir notre sécurité
            </Link>
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-6xl px-4 py-16">
          <h2>Tarifs clairs. Limites réelles.</h2>
          <p className="mt-2 text-[var(--muted)]">Mensuel. L&apos;annuel est disponible au checkout (2 mois offerts si Stripe est configuré).</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {displayPlans.map((p) => (
              <div key={p.slug} className={`card p-6 ${p.slug === "business" ? "ring-2 ring-[var(--primary)]" : ""}`}>
                <div className="text-sm text-[var(--muted)]">{p.name}</div>
                <div className="mt-2 text-3xl font-semibold">
                  ${p.priceMonthly}
                  <span className="text-sm font-normal text-[var(--muted)]"> / mois</span>
                </div>
                <div className="mt-1 text-xs text-[var(--muted)]">${p.priceMonthly * 10} / an</div>
                <ul className="mt-4 space-y-2 text-sm text-[var(--muted)]">
                  {p.features.map((f) => (
                    <li key={f}>• {f}</li>
                  ))}
                </ul>
                <Link href="/register" className="btn btn-primary mt-6 w-full">
                  Commencer gratuitement
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-6xl px-4 py-16">
          <h2>FAQ</h2>
          <div className="mt-8 space-y-3">
            {faqs.map(([q, a]) => (
              <details key={q} className="card p-5">
                <summary className="cursor-pointer font-medium">{q}</summary>
                <p className="mt-2 text-sm text-[var(--muted)]">{a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20">
          <div className="card p-10 text-center">
            <h2>Créez votre commercial IA en 3 minutes.</h2>
            <p className="mt-2 text-[var(--muted)]">Aucun canal externe requis pour commencer.</p>
            <Link href="/register" className="btn btn-primary mt-6">
              Commencer gratuitement
            </Link>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}

function DemoConversation({ extended = false }: { extended?: boolean }) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
        <div className="font-medium">Sarah · Demo Store</div>
        <Badge tone="ai">IA</Badge>
      </div>
      <div className="space-y-3 p-4 text-sm">
        <Bubble who="client">Bonjour, combien coûte ce produit ?</Bubble>
        <Bubble who="ai">Bonjour. Le Premium T-Shirt est à 25 $ (prix catalogue). Voulez-vous que je vous aide à passer commande ?</Bubble>
        {extended ? (
          <>
            <Bubble who="client">Oui.</Bubble>
            <Bubble who="ai">Parfait. Quelle quantité souhaitez-vous ?</Bubble>
            <div className="rounded-xl bg-[var(--ok-bg)] px-3 py-2 text-[var(--ok)]">Commande créée ✓ — paiement non débité (démo visuelle)</div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function Bubble({ who, children }: { who: "client" | "ai"; children: React.ReactNode }) {
  const mine = who === "client";
  return (
    <div className={`max-w-[88%] rounded-2xl px-3 py-2 ${mine ? "ml-auto bg-[var(--bg-soft)]" : "bg-[color-mix(in_srgb,var(--ai)_10%,var(--bg-elev))]"}`}>
      {!mine ? <span className="ai-chip mb-1">IA</span> : null}
      <div>{children}</div>
    </div>
  );
}
