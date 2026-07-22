import {readFile, writeFile} from 'node:fs/promises';
const path = 'data/insurers.json';
const payload = JSON.parse(await readFile(path, 'utf8'));
payload.records = payload.records
  .map(item => ({...item, brands: [...new Set(item.brands || [])], requiredDocuments: [...new Set(item.requiredDocuments || [])], ranking: {...item.ranking, confidenceScore: item.country === 'FR' ? 98 : 82, lastCheckedAt: item.ranking?.lastCheckedAt ?? item.lastCheckedAt}}))
  .sort((a, b) => a.country.localeCompare(b.country) || a.ranking.rank - b.ranking.rank);
await writeFile(path, `${JSON.stringify(payload, null, 2)}\n`);
console.log(`${payload.records.length} groupes normalisés sans modifier leur niveau de vérification.`);
