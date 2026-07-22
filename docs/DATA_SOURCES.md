# Sources de données BonusBridge

BonusBridge sépare trois notions : la taille d’un groupe, sa présence en assurance automobile et l’éventuelle prise en compte d’un historique étranger. Un classement ne prouve jamais une règle de souscription.

## Classements retenus

- France, données 2024 : cotisations d’assurance automobile en France, en millions d’euros, publiées par France Assureurs à partir de données ACPR. Covéa est 1er (4 857 M€, 17,3 %), AXA 2e (4 044 M€, 14,4 %) et Aéma 3e (3 130 M€, 11,2 %). [Publication France Assureurs](https://www.franceassureurs.fr/wp-content/uploads/lassurance-automobile-des-particuliers-en-2024.pdf).
- Canada, données 2024 : part des revenus bruts d’assurance dommages, compilation MSA Research publiée par le Journal de l’assurance. Intact est 1er (14,9 %), Desjardins 2e (9,6 %) et Aviva 3e (8,2 %). [Publication du Journal de l’assurance](https://cdnc.heyzine.com/files/uploaded/v3/b78a903cb0056e1b3278a23611b1b398c439ad63-7.pdf).

La métrique française est propre à l’automobile. La métrique canadienne couvre l’ensemble de l’assurance de dommages ; cette différence est indiquée dans l’interface et les deux pays ne sont pas comparés entre eux.

## Règles étrangères

Au 22 juillet 2026, Desjardins indique officiellement que l’expérience étrangère peut, dans certains cas, aider à réduire la prime et liste des justificatifs possibles. Cela ne garantit ni acceptation ni durée reconnue. Aviva confirme un processus téléphonique de validation de l’expérience hors pays, sans promettre de crédit tarifaire. Aucune règle publique explicite n’a été trouvée pour les autres groupes : ces champs restent `null` ou « à confirmer ».

Une erreur peut être signalée dans une issue du [dépôt BonusBridge](https://github.com/otherlight77/BonusBridge/issues), avec l’URL officielle, la date de consultation et le champ concerné.
