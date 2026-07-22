# BonusBridge — Version bêta

BonusBridge est une application web statique dédiée à la reconnaissance internationale de l’historique d’assurance automobile. Elle aide les expatriés à préparer les bonnes questions, comparer des scénarios et organiser leurs justificatifs avant de contacter un assureur.

> Le comparateur historique reste une démonstration. La section « Données réelles et sources » référence séparément six groupes réels et leur provenance. BonusBridge ne fournit ni devis, ni décision contractuelle, ni conseil réglementé.

[Ouvrir le site bêta](https://otherlight77.github.io/BonusBridge/)

## Fonctionnalités

- comparateur rapide France/international fondé sur des fichiers JSON locaux ;
- score explicable et scénarios d’assureurs clairement qualifiés ;
- six groupes réels sourcés pour la France et le Canada, distincts des scénarios fictifs ;
- neuf identités historiques de démonstration, dont Pirez, Jérémy et Julia présentés uniquement comme profils familiaux ;
- profils locaux Jérémy et Julia, avec création de profils supplémentaires ;
- assistant France–Canada, score de préparation et checklist à sept documents ;
- favoris, historique limité aux cinq dernières analyses et comparaison côte à côte ;
- résumé imprimable, copie du parcours et choix de thème sombre, clair ou système ;
- documents et paramètres stockés dans le navigateur ;
- export et import JSON des données locales ;
- interface responsive, accessible et disponible hors ligne ;
- collecteur public désactivé par défaut, validation et rapport de provenance ;
- aucun framework ni backend obligatoire.

## Développement local

```powershell
node scripts/serve.mjs
```

Ouvrir <http://127.0.0.1:4173/>. Pour contrôler les ressources, les imports et les données :

```powershell
npm test
node scripts/validate-insurer-sources.js
```

## Structure

```text
BonusBridge/
├── .github/workflows/       # Déploiement Pages et collecte mensuelle optionnelle
├── ai/                      # Matching et score local
├── assets/logos/            # Identité BonusBridge et logos fictifs
├── css/beta.css             # Interface bêta compacte
├── data/                    # Catalogues JSON, sources, classements et historique
├── docs/                    # Sources, collecte et règles de vérification
├── js/beta.js               # Contrôleur principal
├── js/data.js               # Chargement du catalogue
├── js/store.js              # Stockage local
├── index.html               # Application accessible sans build
├── manifest.webmanifest     # Installation PWA
├── scripts/                 # Collecte, normalisation, rapport et validation
└── sw.js                    # Cache hors ligne
```

## Données et confidentialité

Les comparaisons et favoris restent dans `localStorage`. Aucun document n’est téléversé et aucune authentification fictive n’est simulée. Une infrastructure réelle reste nécessaire pour les comptes synchronisés, les devis, la transmission de dossiers et les intégrations assureurs. La collecte de métadonnées publiques est désactivée par défaut et ne s’exécute jamais dans GitHub Pages.

Le symbole BonusBridge relie discrètement deux formes familiales protectrices, un pont et les couleurs de la France et du Canada. Il reste conçu comme une identité d’assurance, sans revendiquer de signification contractuelle ou officielle.

## Déploiement

Le workflow GitHub Pages publie directement la racine du dépôt à chaque push sur `main` :

<https://otherlight77.github.io/BonusBridge/>
