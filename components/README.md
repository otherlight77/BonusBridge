# Composants d'interface

BonusBridge V2 reste sans framework et utilise des composants DOM pilotés par attributs afin de conserver un chargement immédiat sur GitHub Pages.

## Contrats

- `data-panel` ouvre une vue du tableau de bord liée à `data-dashboard`.
- `data-step` et `data-next` pilotent le configurateur progressif.
- `data-profile-card`, `data-preset` et `data-demo` activent un profil.
- `data-country` représente un marqueur de destination.
- `.reveal` active l'apparition progressive via `IntersectionObserver`.

Les composants partagent les tokens de `css/tokens.css` et doivent conserver des états clavier visibles, des libellés accessibles et une solution fonctionnelle sans animation.
