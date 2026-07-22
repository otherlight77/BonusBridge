# Vérification des données

## Statuts

- `verified-official` : une page officielle de l’assureur énonce clairement l’information concernée.
- `verified-regulator` : publication d’un régulateur ou données réglementaires relayées par une association professionnelle.
- `press-ranking` : classement attribué à un producteur de données identifié, mais publié par un média professionnel.
- `to-confirm` : indice insuffisant ou décision dépendant d’une étude individuelle.
- `unavailable` : information publique non trouvée ou source indisponible.
- `demo` : scénario fictif historique, masqué par le filtre officiel.

Une information devient vérifiée après lecture d’une source applicable au groupe, au produit, à la province ou région et à la date concernée. Une formulation comme « peut être pris en compte » n’est jamais transformée en acceptation automatique. Une durée maximale demeure `null` tant qu’elle n’est pas explicitement publiée.

Les changements détectés par hash sont inscrits dans un rapport et nécessitent une revue humaine. Une source moins fiable ne remplace jamais une donnée déjà vérifiée. L’historique des champs est conservé dans `data/source-history.json`.

Pour signaler une erreur, ouvrir une issue GitHub avec : assureur, champ, valeur observée, URL, date et capture ou citation courte si nécessaire.
