# Architecture IA BonusBridge

Ce dossier prépare l'intégration d'un service de recommandations sans coupler l'interface à un fournisseur précis.

- `api-client.js` expose un client HTTP remplaçable et désactivé par défaut.
- `scoring.js` fournit un scoring local déterministe utilisé comme solution de repli.
- `recommendations.js` transforme un profil et un classement en recommandation affichable.
- `config.json` centralise les capacités prévues et les garde-fous.

La future API devra être appelée par un service serveur afin de ne jamais exposer de clé secrète dans le navigateur. Les données de naissance nécessiteront un consentement explicite et une politique de rétention documentée.
