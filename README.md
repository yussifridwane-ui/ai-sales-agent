# AI Sales Agent

**Votre commercial IA travaille 24h/24.**

SaaS multi-tenant international : conversation → qualification → recommandation → commande → paiement → suivi.

## Démarrage

```bash
npm install
npm run seed
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

### Comptes de démo

| Rôle | Email | Mot de passe |
| --- | --- | --- |
| Demo Store | `xena.w@example.org` | `Demo123!` |
| Admin plateforme | `nina.v@example.com` | `Admin123!` |

Les données DEMO sont étiquetées et jamais mélangées silencieusement à de vraies ventes.

## Stack

- Next.js 16 (App Router) + TypeScript
- SQLite embarqué (`node:sqlite`) pour le local / la démo
- Schéma prêt à migrer vers PostgreSQL (`prisma/schema.prisma` comme référence)
- Auth session httpOnly + bcrypt
- Moteur commercial IA avec fallback déterministe si `AI_API_KEY` est vide
- Paiements via adaptateur `PaymentProvider` (Stripe si configuré, sinon checkout DEMO explicite)

## Variables d'environnement

Voir `.env.example`. Aucun secret n'est exposé au frontend.

## Tests

```bash
npm test
```

Couvre notamment l'isolation multi-tenant : l'entreprise A ne voit pas les produits / conversations de B.

## Production

1. Pointer `DATABASE_URL` / migrer le schéma SQL vers PostgreSQL.
2. Définir `AUTH_SECRET` et `CREDENTIALS_ENCRYPTION_KEY`.
3. Configurer `AI_API_KEY`, `STRIPE_SECRET_KEY`, WhatsApp Cloud API selon les besoins.
4. `npm run build && npm start`.
