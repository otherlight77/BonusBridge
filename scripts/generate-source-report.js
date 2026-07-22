import {readFile, writeFile, mkdir} from 'node:fs/promises';
const sources = JSON.parse(await readFile('data/insurer-sources.json', 'utf8')).records;
const status = JSON.parse(await readFile('data/scraping-status.json', 'utf8'));
const byId = new Map((status.records || []).map(item => [item.sourceId, item]));
const rows = sources.map(source => {
  const check = byId.get(source.id);
  return `| ${source.title} | ${source.type} | ${check?.status || 'non exécutée'} | ${check?.checkedAt || source.lastCheckedAt} | ${source.url} |`;
});
const summary = status.summary || {accessible:0, unavailable:0, updated:0, unchanged:0, humanReview:0};
const report = `# Rapport de collecte BonusBridge\n\nGénéré le ${new Date().toISOString()}. La collecte ne modifie jamais automatiquement une règle validée.\n\n- Sources accessibles : ${summary.accessible}\n- Sources indisponibles : ${summary.unavailable}\n- Changements détectés : ${summary.updated}\n- Données inchangées : ${summary.unchanged}\n- Vérifications humaines requises : ${summary.humanReview}\n\n| Source | Type | État | Vérification | URL |\n|---|---|---|---|---|\n${rows.join('\n')}\n`;
await mkdir('reports', {recursive: true});
await writeFile('reports/source-report.md', report);
console.log('Rapport généré : reports/source-report.md');
