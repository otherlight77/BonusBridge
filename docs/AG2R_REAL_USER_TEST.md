# Test local avec mon propre document

Ce protocole est destiné au propriétaire du projet qui souhaite tester un vrai document AG2R sur son appareil personnel.

Règles de sécurité :

- ne jamais partager l’identifiant AG2R, le mot de passe, un code 2FA, des cookies, un jeton de session ou le document lui-même avec BonusBridge, GitHub ou un tiers ;
- ne jamais automatiser la connexion à l’espace client AG2R ;
- ne jamais déposer le document brut dans le dépôt GitHub ;
- ne jamais activer la conservation locale sans consentement explicite.

URL locale à ouvrir :

- `http://127.0.0.1:4173/` si vous lancez `node scripts/serve.mjs`
- sinon l’URL locale fournie par votre mode de lancement habituel

Menu à sélectionner :

- section `Test local`
- ou lien `Test local` dans la navigation principale

Formats acceptés :

- PDF texte
- PDF scanné
- image `PNG`, `JPG`, `JPEG`
- texte brut `TXT`
- export de validation `JSON` BonusBridge

Procédure :

1. Ouvrir BonusBridge en local.
2. Aller dans `Test local`.
3. Vérifier les indicateurs visibles :
   - `Traitement local : Activé`
   - `Envoi serveur : Désactivé`
   - `Conservation permanente : Désactivée par défaut`
4. Laisser la case `Conserver temporairement les informations validées dans ce navigateur` décochée au départ.
5. Ouvrir dans un autre onglet le site officiel AG2R.
6. S’authentifier manuellement, sans interaction de BonusBridge.
7. Télécharger manuellement le document depuis l’espace client AG2R.
8. Revenir dans BonusBridge et déposer le document dans la zone d’import local.
9. Vérifier le résumé d’analyse :
   - type de document détecté ;
   - taille du fichier ;
   - nombre de pages si détectable ;
   - extrait justificatif ;
   - statut OCR.
10. Vérifier les champs détectés.
11. Corriger un champ si nécessaire.
12. Confirmer ou ignorer chaque champ.
13. Si vous voulez conserver uniquement la validation structurée dans ce navigateur, cocher `Conserver temporairement les informations validées dans ce navigateur`.
14. Exporter au besoin :
   - `Export privé` pour votre usage personnel ;
   - `Export partageable` pour un assureur, un courtier ou un conseiller.
15. Supprimer immédiatement le document avec `Supprimer ce document`.
16. Effacer totalement la session avec `Effacer toutes mes données`.

Résultats attendus par scénario :

- Test 1, PDF contenant du texte : ouverture réussie, extraction probable, validation manuelle possible.
- Test 2, PDF scanné : absence de texte détectée, OCR local proposé, fiabilité indiquée comme limitée.
- Test 3, document inconnu : aucun classement forcé, statut `document non reconnu` affiché, type modifiable manuellement.
- Test 4, PDF protégé ou illisible : erreur compréhensible, suppression de la mémoire de travail, aucune régression de l’interface.
- Test 5, données sensibles : masquage par défaut, affichage temporaire possible, exclusion du QR code et des exports partageables.
- Test 6, effacement : suppression du document, des validations, des journaux et des caches locaux.
- Test 7, rechargement : aucune donnée personnelle ne revient si la conservation n’a pas été autorisée ; si elle l’a été, seules les validations structurées reviennent, jamais le PDF original.

Journal technique local :

- fichier
- taille
- nombre de pages
- type détecté
- durée de traitement
- nombre de champs détectés
- nombre de champs confirmés
- nombre de champs corrigés
- nombre de champs ignorés
- erreurs techniques anonymisées

Ce qui ne doit jamais apparaître dans les journaux :

- contenu OCR brut
- nom de l’utilisateur
- numéro de contrat
- coordonnées bancaires
- montants
- adresse complète
- identifiants de connexion
- données fiscales
- données médicales

Vérification des logs :

- ouvrir les outils de développement du navigateur ;
- onglet `Console` ;
- vérifier qu’aucun contenu OCR brut, aucune donnée bancaire et aucun identifiant personnel ne sont imprimés ;
- vérifier que les messages d’erreur restent génériques et anonymisés.

Vérification réseau :

- onglet `Network` des outils de développement ;
- recharger la page ;
- déposer le document ;
- confirmer qu’aucune requête ne transmet le fichier vers un serveur externe ;
- BonusBridge doit rester en traitement local dans cette version.

Limites actuelles de l’extraction :

- le PDF texte peut être analysé de façon heuristique ;
- le PDF scanné n’active pas un OCR complet embarqué dans cette version statique ;
- les champs sensibles détectés sont masqués par défaut ;
- les données persistées localement sont limitées aux validations structurées consenties ;
- aucune garantie n’est donnée sur la reprise du bonus, la tarification ou l’acceptation du dossier.

Export des données :

- `Export privé` : peut contenir les champs validés disponibles en session ;
- `Export partageable` : exclut les champs sensibles par défaut et permet de vérifier précisément le contenu avant téléchargement.

Suppression :

- `Supprimer ce document` retire le fichier de la mémoire de travail ;
- `Effacer toutes mes données` supprime le document, les validations, les journaux et les préférences locales associées.
