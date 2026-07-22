import {readFile} from 'node:fs/promises';
const names = ['insurers','brands','insurer-sources','recognition-rules','documents','provinces-canada','regions-france','scraping-status','source-history'];
const data = Object.fromEntries(await Promise.all(names.map(async name => [name, JSON.parse(await readFile(`data/${name}.json`, 'utf8'))])));
const failures = [];
const allowed = new Set(['verified-official','verified-regulator','press-ranking','to-confirm','unavailable','demo']);
const required = ['id','legalName','commercialName','groupName','country','provinceOrRegion','website','officialSourceUrl','sourceType','sourceTitle','sourceDate','lastCheckedAt','collectedAt','verificationStatus','autoInsuranceAvailable','acceptsForeignHistory','foreignHistoryDetails','requiredDocuments','translationRequirements','maximumYearsRecognized','contactUrl','quoteUrl','notes','confidenceScore'];
const ids = data.insurers.records.map(item => item.id);
if (new Set(ids).size !== ids.length) failures.push('Doublon d’assureur.');
for (const id of ['covea-fr','axa-fr','aema-fr','groupama-fr','credit-agricole-assurances-fr','intact-ca','desjardins-ca','aviva-ca','td-insurance-ca','cooperators-ca']) if (!ids.includes(id)) failures.push(`Groupe attendu absent : ${id}.`);
for (const insurer of data.insurers.records) {
  for (const field of required) if (!(field in insurer)) failures.push(`${insurer.id || '?'}: champ ${field} absent.`);
  if (!allowed.has(insurer.verificationStatus)) failures.push(`${insurer.id}: verificationStatus invalide.`);
  if ((insurer.verificationStatus === 'verified-official' || insurer.verificationStatus === 'verified-regulator') && !/^https:\/\//.test(insurer.officialSourceUrl)) failures.push(`${insurer.id}: donnée vérifiée sans URL HTTPS.`);
  if (insurer.acceptsForeignHistory === true && insurer.maximumYearsRecognized !== null && (!Number.isFinite(insurer.maximumYearsRecognized) || insurer.maximumYearsRecognized < 0)) failures.push(`${insurer.id}: durée reconnue invalide.`);
  if (!insurer.ranking || !insurer.ranking.metric || !insurer.ranking.sourceUrl || !insurer.ranking.year) failures.push(`${insurer.id}: classement incomplet.`);
}
for (const country of ['FR','CA']) {
  const records = data.insurers.records.filter(item => item.country === country);
  if (records.length < 5) failures.push(`${country}: au moins cinq groupes sont requis.`);
  if (new Set(records.map(item => item.ranking.metric)).size !== 1) failures.push(`${country}: métriques de classement mélangées.`);
  if (new Set(records.map(item => item.ranking.year)).size !== 1) failures.push(`${country}: années de classement mélangées.`);
}
for (const source of data['insurer-sources'].records) if (!source.url || !source.type || !source.lastCheckedAt || !source.dataYear || !Number.isFinite(source.confidenceScore)) failures.push(`${source.id}: source incomplète.`);
for (const brand of data.brands.records) { if (!ids.includes(brand.groupId)) failures.push(`${brand.id}: groupe inconnu.`); for (const field of ['source','sourceUrl','sourceDate','confidenceScore','lastCheckedAt','verificationStatus']) if (!(field in brand) || brand[field] === '') failures.push(`${brand.id}: métadonnée ${field} absente.`); }
if (data.insurers.records.some(item => /Pirez|Jérémy|Julia/.test(`${item.legalName} ${item.commercialName}`))) failures.push('Identité familiale utilisée comme assureur réel.');
const collector = await readFile('scripts/collect-public-insurer-data.js', 'utf8');
for (const token of ['BONUSBRIDGE_SCRAPING_ENABLED','robots.txt','BonusBridgeResearchBot/1.0','Math.max(2000','AbortController','maxAttempts','contentHash','changed-human-review']) if (!collector.includes(token)) failures.push(`Collecteur incomplet : ${token}.`);
const [html, css, logo, worker] = await Promise.all(['index.html','css/beta.css','assets/logos/bonusbridge-dark.svg','sw.js'].map(file => readFile(file, 'utf8')));
for (const token of ['id="source-count"','id="verified-count"','id="confirm-count"','Afficher uniquement les données vérifiées']) if (!html.includes(token)) failures.push(`Interface des sources incomplète : ${token}.`);
if (!css.includes('.brand img{width:392px}') || !css.includes('.brand img{width:240px}')) failures.push('Dimensions responsive du logo absentes.');
if (!logo.includes('PIREZ • JÉRÉMY • JULIA')) failures.push('Signature familiale SVG incorrecte.');
if (!worker.includes("'./data/brands.json'")) failures.push('Registre des marques absent du service worker.');
if (failures.length) { console.error(failures.map(item => `✗ ${item}`).join('\n')); process.exitCode = 1; }
else console.log(`✓ ${ids.length} groupes uniques, sources, classements, robots.txt et rate limit validés ; aucune règle étrangère n’est déduite du rang.`);
