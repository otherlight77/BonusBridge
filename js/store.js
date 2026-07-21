const STORAGE_KEY = 'bonusbridge-v2';

const defaults = { profiles: [], favorites: [], comparison: [], history: [], theme: 'dark', reduceMotion: false };

export function loadState() {
  try { return { ...defaults, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }; }
  catch { return { ...defaults }; }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function addHistory(state, label, type = 'profile') {
  state.history.unshift({ id: crypto.randomUUID?.() || String(Date.now()), label, type, at: new Date().toISOString() });
  state.history = state.history.slice(0, 20);
  saveState(state);
}

export function download(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = filename; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

export function exportExcel(state, countries) {
  const rows = countries.filter(country => state.comparison.includes(country.id));
  const xmlRows = rows.map(country => `<Row><Cell><Data ss:Type="String">${country.name}</Data></Cell><Cell><Data ss:Type="Number">${country.score}</Data></Cell><Cell><Data ss:Type="String">${country.tags.join(', ')}</Data></Cell></Row>`).join('');
  const xml = `<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Comparaison"><Table><Row><Cell><Data ss:Type="String">Pays</Data></Cell><Cell><Data ss:Type="String">Affinité</Data></Cell><Cell><Data ss:Type="String">Atouts</Data></Cell></Row>${xmlRows}</Table></Worksheet></Workbook>`;
  download('bonusbridge-comparaison.xls', xml, 'application/vnd.ms-excel');
}
