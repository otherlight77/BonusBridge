import { readFile, access } from 'node:fs/promises';
import { extname } from 'node:path';

const html = await readFile('index.html', 'utf8');
const failures = [];
const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
if (duplicates.length) failures.push(`IDs dupliqués : ${[...new Set(duplicates)].join(', ')}`);

const references = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map(match => match[1]);
const absolutePaths = references.filter(reference => reference.startsWith('/'));
if (absolutePaths.length) failures.push(`Chemins absolus incompatibles Pages : ${absolutePaths.join(', ')}`);

const localAssets = references.filter(reference => !/^(?:https?:|mailto:|#)/.test(reference));
for (const asset of localAssets) {
  try { await access(asset); } catch { failures.push(`Ressource introuvable : ${asset}`); }
}

const scripts = references.filter(reference => extname(reference) === '.js');
if (scripts.some(reference => /^https?:/.test(reference))) failures.push('Dépendance JavaScript externe détectée');

for (const required of ['configurator','world','dashboard','faq','search-dialog','zodiac-wheel']) {
  if (!ids.includes(required)) failures.push(`Section requise absente : ${required}`);
}

const manifest = JSON.parse(await readFile('manifest.webmanifest','utf8'));
if (manifest.start_url !== './' || manifest.display !== 'standalone') failures.push('Manifest PWA incomplet');

for (const file of ['data/countries.json','data/profiles.json','ai/config.json']) JSON.parse(await readFile(file,'utf8'));
for (const file of ['robots.txt','sitemap.xml','sw.js','.nojekyll','.github/workflows/deploy-pages.yml']) await access(file);

if (failures.length) {
  console.error(failures.map(failure => `✗ ${failure}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log(`✓ ${ids.length} identifiants uniques`);
  console.log(`✓ ${localAssets.length} ressources locales présentes`);
  console.log('✓ chemins GitHub Pages, PWA, SEO et données valides');
}
