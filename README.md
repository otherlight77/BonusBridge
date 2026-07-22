# BonusBridge V2 — International Insurance Passport

**Your insurance history travels with you.**

BonusBridge aide les expatriés à préparer la reconnaissance de leur historique d’assurance dans un nouveau pays. Le produit rassemble le parcours, les documents, les règles sourcées et un passeport numérique portable. Il ne fournit ni devis, ni décision de souscription, ni garantie de reconnaissance.

[Voir la version publique](https://otherlight77.github.io/BonusBridge/)

## Modules

- Insurance Passport avec expérience, bonus, sinistres, langues, QR visuel, signature locale, sources et confiance ;
- parcours guidé en six étapes et checklist personnalisée ;
- Recognition Checker par pays, zone et assureur ;
- Document Center avec statut, traduction et expiration ;
- Country Explorer et architecture pour 15 pays ;
- catalogue de sources officielles avec date, statut et historique ;
- assistant pédagogique, Smart Timeline et Savings Estimator ;
- dashboard local et Knowledge Base ;
- Back Office de gouvernance présenté en lecture seule ;
- PWA responsive, installable et utilisable hors ligne ;
- 210 guides SEO statiques générés automatiquement.

## Développement

```powershell
npm run build
npm test
node scripts/serve.mjs
```

Ouvrir <http://127.0.0.1:4173/>.

## Architecture

L’application publique reste statique et sans compte : les préférences et réponses sont stockées dans `localStorage`. Le modèle relationnel mondial prévu est documenté dans [`data/schema.sql`](data/schema.sql), et le contrat REST initial dans [`docs/openapi.yaml`](docs/openapi.yaml).

```text
index.html                 # Expérience produit V2
css/v2.css                 # Design system et responsive
js/v2.js                   # État local et interactions
data/                      # Catalogues et schéma mondial
guides/                    # 210 pages SEO générées
scripts/generate-seo-pages.mjs
docs/openapi.yaml          # Contrat API-ready
sw.js                      # Cache PWA
```

## Données et confiance

Une donnée issue d’une simulation est présentée comme telle. Les sources officielles, assureurs et régulateurs sont distingués des scénarios à confirmer. Une future version avec comptes devra ajouter authentification, chiffrement côté serveur, stockage documentaire sécurisé, signature vérifiable par une autorité, journal d’audit et conformité réglementaire par juridiction.

## Déploiement

Le workflow GitHub Pages génère les guides SEO, puis publie la racine à chaque push sur `main`.
