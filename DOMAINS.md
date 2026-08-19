# Domaines officiels — comme santeonline.tg

Marque Togo : **ventesonline.tg**

| Usage | Hostname |
| --- | --- |
| Site / landing | https://ventesonline.tg |
| www | https://www.ventesonline.tg |
| Application SaaS | https://app.ventesonline.tg |
| Admin plateforme | https://admin.ventesonline.tg |
| API | https://api.ventesonline.tg |
| Widget chat | https://w.ventesonline.tg |

Emails : `nina.v@example.com` · `olivia.t@example.org` · `laura.c@example.net`

## Enregistrer le .tg

1. Vérifier la dispo chez un registrar agréé ARCEP : [nic.tg](https://nic.tg) · [nom-domaine.tg](https://www.nom-domaine.tg/) (~15 800 F CFA / an).
2. Acheter **ventesonline.tg** (1 à 10 ans).
3. Pointer le DNS vers ton hébergeur (A / CNAME ci-dessous).
4. Activer HTTPS (Let’s Encrypt / Cloudflare).
5. Mettre dans `.env` :

```
APP_URL=https://app.ventesonline.tg
MARKETING_URL=https://ventesonline.tg
ALLOWED_ORIGINS=https://ventesonline.tg,https://www.ventesonline.tg,https://app.ventesonline.tg,https://admin.ventesonline.tg
EMAIL_FROM=VentesOnline <nina.v@example.com>
```

## DNS à créer

```
@       A       <IP serveur>
www     CNAME   ventesonline.tg
app     CNAME   ventesonline.tg
admin   CNAME   ventesonline.tg
api     CNAME   ventesonline.tg
w       CNAME   ventesonline.tg
```

Tous les sous-domaines peuvent viser la même app Next.js.

## Variantes si ventesonline.tg est pris

- `commercialonline.tg`
- `agentia.tg`
- `aisales.tg`
- `monagent.tg`

Change uniquement `BRAND_DOMAIN` dans `src/lib/domains.ts`.
