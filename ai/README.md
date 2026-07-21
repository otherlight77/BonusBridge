# BonusBridge recommendation engine

The browser-native recommendation layer is provider-neutral and deterministic:

- `matching.js` selects only explicit local recognition rules; it never invents a fallback insurer result.
- `scoring.js` computes a transparent demonstration score from recognized history, evidence requirements, driver risk and insurer capabilities.
- `recommendations.js` ranks matches and builds comparison summaries.
- `advisor.js` turns the leading result into a clear next action.

The modules accept normalized catalog records and can later run behind an API without changing the interface contract. `config.json` explicitly records that no external service is configured. Any future remote service must expose explanations, version its model and keep personal data behind explicit consent.
