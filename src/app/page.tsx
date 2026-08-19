import Link from "next/link";
import { MarketingFooter, MarketingNav } from "@/components/marketing-nav";

const flow = ["Client", "Message", "AI Sales Agent", "Réponse intelligente", "Qualification", "Commande", "Paiement"];

const channels = [
  { name: "WhatsApp", status: "Connexion requise" },
  { name: "Instagram", status: "Connexion requise" },
  { name: "Website", status: "Disponible" },
  { name: "Email", status: "Connexion requise" },
  { name: "Messenger", status: "Coming soon" },
];

const features = [
  ["Moteur commercial", "Conversation → qualification → recommandation → conversion, pas un simple chatbot."],
  ["Catalogue & règles", "L'IA ne vend que ce que vous avez configuré. Aucun prix inventé."],
  ["CRM & commandes", "Leads scorés, pipeline, commandes et attribution des ventes IA."],
  ["Relances", "Séquences 2h / 24h / 72h avec opt-out automatique."],
  ["Humain dans la boucle", "Prise de contrôle en un clic. L'IA s'arrête."],
  ["Analytics", "AI Revenue, conversion, insights et coûts tokens."],
];

const faqs = [
  ["Est-ce un chatbot générique ?", "Non. C'est un moteur commercial : qualification, objections, commande, paiement et suivi."],
  ["Dois-je connecter WhatsApp tout de suite ?", "Non. Commencez par le widget site et le chat de test. WhatsApp nécessite les APIs officielles."],
  ["L'IA peut-elle inventer une remise ?", "Non. La remise maximale est une règle serveur. Si l'info manque, l'agent dit qu'il va vérifier."],
  ["Quels moyens de paiement ?", "Architecture modulaire : Stripe, PayPal, prestataires locaux. Rien n'est simulé comme réel."],
  ["Mes données sont-elles isolées ?", "Oui. Multi-tenant strict par organization_id. L'entreprise A ne voit jamais l'entreprise B."],
];

export default function HomePage() {
  return (
    <div className="grid-bg min-h-screen">
      <MarketingNav />
      <main>
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-16 text-center md:pt-24">
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-teal-200">
            AI Sales Engine · International · Mobile-first
          </div>
          <h1 className="mx-auto max-w-4xl text-4xl font-semibold tracking-tight md:text-6xl">
            Votre commercial IA
            <span className="block bg-gradient-to-r from-teal-300 to-sky-300 bg-clip-text text-transparent">
              travaille 24h/24.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-400">
            Transformez automatiquement vos conversations en prospects qualifiés et en ventes.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/register" className="btn btn-primary min-w-52">
              Commencer gratuitement
            </Link>
            <a href="#how" className="btn btn-ghost min-w-52">
              Voir comment ça marche
            </a>
          </div>
          <p className="mt-4 text-xs text-slate-500">14 jours d&apos;essai · Carte non requise · Plan Free inclus</p>

          <div className="mx-auto mt-14 max-w-5xl overflow-x-auto">
            <div className="flex min-w-[720px] items-center justify-between gap-2">
              {flow.map((step, i) => (
                <div key={step} className="flex flex-1 items-center gap-2">
                  <div className="card flex-1 px-3 py-4 text-sm font-medium">{step}</div>
                  {i < flow.length - 1 ? <span className="text-teal-400">↓</span> : null}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="card p-8">
              <h2 className="text-2xl font-semibold">Le problème</h2>
              <p className="mt-3 text-slate-400">
                Les messages arrivent la nuit. Les prospects refroidissent. Les équipes répètent les mêmes réponses. Les
                paniers sont abandonnés. Un chatbot FAQ ne vend pas.
              </p>
            </div>
            <div className="card p-8">
              <h2 className="text-2xl font-semibold">La solution</h2>
              <p className="mt-3 text-slate-400">
                Un agent commercial qui comprend l&apos;intention, qualifie, recommande depuis votre catalogue, traite les
                objections selon vos règles, crée la commande et propose le paiement — puis transmet à un humain si
                besoin.
              </p>
            </div>
          </div>
        </section>

        <section id="how" className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-3xl font-semibold">Fonctionnement</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {[
              ["1. Configurez", "Entreprise, produits, ton, langues, règles de remise."],
              ["2. Testez", "Jouez le client. Voyez pourquoi l'IA a répondu ainsi."],
              ["3. Publiez", "Widget site immédiat. WhatsApp / Instagram après connexion officielle."],
              ["4. Encaissez", "Commandes, paiements modulaires, suivi et AI Revenue."],
            ].map(([t, d]) => (
              <div key={t} className="card p-6">
                <div className="text-teal-300">{t}</div>
                <p className="mt-2 text-sm text-slate-400">{d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-3xl font-semibold">Fonctionnalités</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {features.map(([t, d]) => (
              <div key={t} className="card p-6">
                <h3 className="font-semibold">{t}</h3>
                <p className="mt-2 text-sm text-slate-400">{d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-3xl font-semibold">Compatible avec vos canaux de vente</h2>
          <p className="mt-2 text-slate-400">Aucune intégration n&apos;est présentée comme connectée sans configuration réelle.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-5">
            {channels.map((c) => (
              <div key={c.name} className="card p-5 text-center">
                <div className="font-medium">{c.name}</div>
                <div className="mt-2 text-xs text-slate-400">{c.status}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="grid gap-4 md:grid-cols-4">
            {[
              ["24/7", "Disponibilité"],
              ["< 2 min", "Temps de réponse cible"],
              ["+ conversion", "Réponses immédiates"],
              ["0 invention", "Prix & remises"],
            ].map(([n, l]) => (
              <div key={l} className="card p-6 text-center">
                <div className="text-3xl font-semibold text-teal-300">{n}</div>
                <div className="mt-1 text-sm text-slate-400">{l}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-3xl font-semibold">Témoignages</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ["Studio North", "On qualifie la nuit. Le matin, l'équipe ne reprend que les leads chauds."],
              ["Atelier Lumen", "Les prix viennent du catalogue. Plus de mauvaises surprises en caisse."],
              ["Harbor SaaS", "Le score de lead nous dit enfin qui rappeler en premier."],
            ].map(([who, quote]) => (
              <blockquote key={who} className="card p-6">
                <p className="text-slate-300">“{quote}”</p>
                <footer className="mt-4 text-sm text-slate-500">{who}</footer>
              </blockquote>
            ))}
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-3xl font-semibold">Tarifs</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {[
              ["Free", "$0", "50 conversations · 1 agent · 10 produits"],
              ["Starter", "$9", "500 conversations · catalogue · commandes"],
              ["Business", "$29", "5 000 conversations · automations · analytics"],
              ["Pro", "$79", "Volume élevé · équipe · API · priorité"],
            ].map(([n, p, d]) => (
              <div key={n} className="card p-6">
                <div className="text-sm text-slate-400">{n}</div>
                <div className="mt-2 text-3xl font-semibold">{p}<span className="text-sm text-slate-500">/mois</span></div>
                <p className="mt-3 text-sm text-slate-400">{d}</p>
                <Link href="/register" className="btn btn-primary mt-6 w-full">
                  Start Free
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-3xl font-semibold">FAQ</h2>
          <div className="mt-8 space-y-3">
            {faqs.map(([q, a]) => (
              <details key={q} className="card p-5">
                <summary className="cursor-pointer font-medium">{q}</summary>
                <p className="mt-2 text-sm text-slate-400">{a}</p>
              </details>
            ))}
          </div>
        </section>

        <section id="security" className="mx-auto max-w-6xl px-4 py-16">
          <div className="card p-8">
            <h2 className="text-2xl font-semibold">Sécurité & conformité</h2>
            <p className="mt-3 max-w-3xl text-slate-400">
              Isolation multi-tenant, mots de passe hashés, secrets uniquement serveur, rate limiting, audit logs, webhooks
              signés, export et suppression RGPD. Les clés API ne sont jamais exposées au frontend.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-24">
          <div className="card grid gap-6 p-10 text-center md:p-14">
            <h2 className="text-3xl font-semibold">Créez votre commercial IA en 3 minutes.</h2>
            <p className="text-slate-400">Aucun canal externe requis pour commencer. Testez, puis connectez.</p>
            <div>
              <Link href="/register" className="btn btn-primary">
                Commencer gratuitement
              </Link>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "AI Sales Agent",
            applicationCategory: "BusinessApplication",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            description: "AI sales engine that turns conversations into qualified leads and sales.",
          }),
        }}
      />
    </div>
  );
}
