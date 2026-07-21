const CACHE = 'bonusbridge-v2.0.0';
const APP_SHELL = [
  './', './index.html', './manifest.webmanifest',
  './css/tokens.css', './css/app.css', './css/responsive.css',
  './js/app.js', './js/data.js', './js/astro.js', './js/store.js', './js/pwa.js',
  './ai/recommendations.js', './ai/scoring.js',
  './assets/icons/app-icon.svg', './assets/icons/gemini.svg', './assets/icons/libra.svg',
  './data/countries.json', './data/profiles.json'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    const copy = response.clone();
    if (new URL(event.request.url).origin === self.location.origin) caches.open(CACHE).then(cache => cache.put(event.request, copy));
    return response;
  }).catch(() => event.request.mode === 'navigate' ? caches.match('./index.html') : Response.error())));
});
