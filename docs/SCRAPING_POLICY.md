# Politique de collecte publique

La collecte est désactivée par défaut (`BONUSBRIDGE_SCRAPING_ENABLED=false`). Elle s’exécute localement ou mensuellement via GitHub Actions, jamais dans GitHub Pages.

Le collecteur :

- consulte `robots.txt` avant chaque source et refuse la collecte si ce fichier est inaccessible ou interdit le chemin ;
- utilise un User-Agent identifiable et attend par défaut trois secondes entre les requêtes ;
- applique un délai maximal, deux tentatives au plus et tolère les indisponibilités ;
- visite uniquement les URL présélectionnées de pages officielles, régulateurs, associations ou publications publiques ;
- stocke l’URL, la date, le statut HTTP indirect et un hash SHA-256, jamais le contenu complet ni des données personnelles ;
- signale les changements pour examen humain au lieu de réécrire une règle métier.

Sont exclus : CAPTCHA, authentification, espaces clients, contournement Cloudflare, proxies rotatifs, données personnelles et collecte massive de contenu. Une source inaccessible ne produit aucune donnée inventée.
