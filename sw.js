const CACHE='bonusbridge-beta-v5.1';
const SHELL=[
  './','./index.html','./offline.html','./manifest.webmanifest','./css/tokens.css','./css/beta.css',
  './js/beta.js','./js/data.js','./js/store.js','./js/export.js','./ai/matching.js','./ai/scoring.js',
  './assets/logos/bonusbridge-logo.svg','./assets/logos/bonusbridge-dark.svg','./assets/logos/bonusbridge-light.svg','./assets/logos/bonusbridge-symbol.svg','./assets/logos/favicon.svg','./assets/social-card.svg',
  './assets/logos/insurers/pirez-assurance.svg','./assets/logos/insurers/jeremy-assurance.svg','./assets/logos/insurers/julia-assurance.svg','./assets/logos/insurers/horizon-assurance.svg','./assets/logos/insurers/nova-insurance.svg','./assets/logos/insurers/global-cover.svg','./assets/logos/insurers/bridge-protect.svg','./assets/logos/insurers/atlas-assurance.svg','./assets/logos/insurers/europa-insurance.svg',
  './data/countries.json','./data/insurance-companies.json','./data/recognition-rules.json','./data/required-documents.json','./data/languages.json','./data/currencies.json','./data/sample-comparisons.json','./data/vehicle-types.json','./data/coverage-types.json','./data/country-guides.json','./data/document-guides.json','./data/faq.json',
  './data/insurers.json','./data/insurer-sources.json','./data/brands.json','./data/documents.json','./data/provinces-canada.json','./data/regions-france.json','./data/scraping-status.json','./data/source-history.json'
];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;event.respondWith(caches.match(event.request).then(cached=>{const network=fetch(event.request).then(response=>{if(response.ok&&new URL(event.request.url).origin===self.location.origin)caches.open(CACHE).then(cache=>cache.put(event.request,response.clone()));return response});return cached||network}).catch(()=>event.request.mode==='navigate'?caches.match('./offline.html'):Response.error()))});
