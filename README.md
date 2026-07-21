# BonusBridge

BonusBridge est un site statique de comparaison d'assurance internationale. Il aide les personnes qui changent de pays à identifier les assureurs susceptibles de reconnaître leur historique de conduite et leur bonus acquis à l'étranger.

## Fonctionnement local

Aucune installation, dépendance npm ou étape de compilation n'est nécessaire. Pour consulter le site, ouvrez directement `index.html` dans un navigateur, ou servez le dossier avec un serveur HTTP statique local, par exemple :

```powershell
python -m http.server 8000
```

Le site est alors accessible à l'adresse `http://localhost:8000/`.

## Déploiement GitHub Pages

Le workflow `.github/workflows/deploy-pages.yml` publie automatiquement la racine du dépôt avec le mécanisme officiel GitHub Pages à chaque push sur la branche `main`. Il peut également être lancé manuellement depuis l'onglet **Actions** de GitHub grâce à `workflow_dispatch`.

Le fichier `.nojekyll` indique à GitHub Pages de servir directement les fichiers statiques, sans traitement Jekyll.

URL publique prévue : <https://otherlight77.github.io/BonusBridge/>

## Structure des fichiers

```text
BonusBridge/
├── .github/
│   └── workflows/
│       └── deploy-pages.yml  # Déploiement automatique GitHub Pages
├── .nojekyll                 # Désactive le traitement Jekyll
├── index.html                # Structure et contenu de la page
├── style.css                 # Mise en forme responsive
├── script.js                 # Interactions côté navigateur
└── README.md                 # Documentation du projet
```
