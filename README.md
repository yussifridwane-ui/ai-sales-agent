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

## Domaines (Togo)

Comme [santeonline.tg](https://santeonline.tg) : **ventesonline.tg**

- Site : `https://ventesonline.tg`
- App : `https://app.ventesonline.tg`
- Admin : `https://admin.ventesonline.tg`

Détail DNS et enregistrement .tg : voir [DOMAINS.md](./DOMAINS.md).

## Production

1. Enregistrer `ventesonline.tg` puis pointer le DNS.
2. PostgreSQL + secrets (`AUTH_SECRET`, `CREDENTIALS_ENCRYPTION_KEY`).
3. `APP_URL=https://app.ventesonline.tg`
4. Stripe / SMTP / MFA admin.
5. `npm run build && npm start`.
