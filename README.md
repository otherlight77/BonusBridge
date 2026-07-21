# BonusBridge V3 — Global Insurance Recognition

**Take your insurance history with you.**

BonusBridge is a browser-native knowledge platform for cross-border motor insurance history recognition. It is designed for expatriate drivers and brokers who need to understand whether experience earned in one country may be recognized in another. It is not merely a price comparator: its core product is a scalable rule base covering countries, insurers, accepted evidence, translations and recognition limits.

> **Data notice:** every bundled recognition rule is marked `"verified": false` and `"status": "demo"`. Results, processing times and savings are illustrative and must be confirmed directly with an insurer. BonusBridge does not currently provide regulated insurance advice.

[Open the public site](https://otherlight77.github.io/BonusBridge/)

## Core capabilities

- international route selection with origin and destination countries;
- five-step recognition analysis covering the move, driving history, vehicle, documents and preferences;
- at-fault and non-fault claims, vehicle value and usage, annual mileage and translation needs;
- ranked demonstration results with maximum recognized years and retained bonus estimates;
- required document and certified translation guidance;
- estimated savings, process difficulty and a transparent weighted score out of 100;
- interactive SVG market map with search and zoom;
- local comparison history, favorites, detailed document checklist, country explorer and driver settings;
- side-by-side result comparison, sorting and verification filters;
- educational knowledge base with country, document and moving guides;
- local data-review views with filtering, duplicate checking, editing, import and export;
- deterministic local rules advisor with no external service connection;
- installable PWA with offline reference data.

## Local development

No package manager, build step or external library is required.

```powershell
node scripts/serve.mjs
```

Open <http://127.0.0.1:4173/>. An HTTP server is required for ES modules, JSON datasets and service-worker validation.

Run the repository validator with:

```powershell
node scripts/validate.mjs
```

## Data architecture

Every dataset uses a versioned envelope with an entity name and a `records` array. Recognition rules expose explicit indexes so the storage layer can move from static JSON to a database containing thousands of records without changing the matching contract.

| Dataset | Purpose |
|---|---|
| `countries.json` | markets, currencies, languages, readiness and map geometry |
| `insurance-companies.json` | insurer capabilities and available markets |
| `recognition-rules.json` | route-specific recognition policies and evidence |
| `required-documents.json` | normalized document catalog |
| `languages.json` | supported language metadata |
| `currencies.json` | display and calculation metadata |
| `sample-comparisons.json` | reproducible demonstration fixtures |
| `vehicle-types.json` | normalized vehicle categories and estimate factors |
| `coverage-types.json` | normalized requested coverage categories |
| `country-guides.json` | insurance-system orientation and associated routes |
| `document-guides.json` | evidence preparation and moving checklists |
| `faq.json` | reusable educational questions and answers |

## Recommendation architecture

The `/ai` directory remains provider-neutral:

- `matching.js` selects direct policies or conservative fallback routes;
- `scoring.js` calculates an explainable demonstration score and savings estimate;
- `recommendations.js` ranks results and builds summaries;
- `advisor.js` recommends the next evidence action.

No secret, remote model or insurer API is used in the browser. A future service can implement the same input and output contract behind a consent-aware API.

## Repository structure

```text
BonusBridge/
├── .github/workflows/       # GitHub Pages deployment
├── ai/                      # Matching, scoring and advisory logic
├── assets/                  # Logo family, favicon and social card
├── components/              # Framework-free interface contracts
├── css/                     # Tokens, application, premium and responsive styles
├── data/                    # Versioned insurance reference datasets
├── icons/                   # Identity documentation
├── images/                  # Image usage documentation
├── js/                      # Application, premium interactions, catalog, storage and PWA modules
├── scripts/                 # Local server and repository validator
├── index.html               # Semantic application shell
├── manifest.webmanifest     # Installable app metadata
├── sw.js                    # Offline application cache
├── robots.txt               # Search crawler rules
└── sitemap.xml              # Canonical public URL
```

## Privacy and accessibility

Comparisons, favorites, local rule edits and simulation preferences stay in browser storage. Users can export, import or delete that local data. The application does not send personal information to an insurer or third party and does not simulate authentication.

The interface provides semantic landmarks, visible focus states, keyboard-operable controls, accessible names, reduced-motion support and contrast designed for WCAG AA.

## Deployment

The existing GitHub Pages workflow publishes the repository root on pushes to `main`. BonusBridge requires no npm install, framework or production build.

Public URL: <https://otherlight77.github.io/BonusBridge/>

## Roadmap

- [x] V3 global comparison experience and identity system
- [x] Versioned insurance datasets and explainable matching engine
- [x] Interactive map, workspace, administration and offline mode
- [ ] Backend accounts and encrypted cross-device sync
- [ ] Underwriter portal for verified policy maintenance
- [ ] Consent-based quote handoff to insurer APIs
- [ ] Additional markets and localized interfaces

## Features requiring a real backend or API

- verified, continuously maintained insurer recognition policies;
- live quotations, application submission and insurer handoff;
- authenticated accounts and encrypted multi-device synchronization;
- regulated-advice workflows, consent logs and audit trails;
- real administrator security, shared editing, analytics and operational logs;
- transactional notifications and status updates.

## License

BonusBridge. All rights reserved.
