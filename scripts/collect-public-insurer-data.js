import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';

const enabled = String(process.env.BONUSBRIDGE_SCRAPING_ENABLED || 'false').toLowerCase() === 'true';
const userAgent = 'BonusBridgeResearchBot/1.0 (Public insurance information research; https://github.com/otherlight77/BonusBridge)';
const delayMs = Math.max(2000, Math.min(5000, Number(process.env.BONUSBRIDGE_RATE_LIMIT_MS || 3000)));
const timeoutMs = Math.max(3000, Math.min(30000, Number(process.env.BONUSBRIDGE_TIMEOUT_MS || 12000)));
const maxAttempts = Math.max(1, Math.min(2, Number(process.env.BONUSBRIDGE_MAX_ATTEMPTS || 2)));
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const sha256 = value => createHash('sha256').update(value).digest('hex');

if (!enabled) {
  console.log('Collecte désactivée. Définissez BONUSBRIDGE_SCRAPING_ENABLED=true pour une exécution explicite.');
  process.exit(0);
}

const sources = JSON.parse(await readFile('data/insurer-sources.json', 'utf8')).records;
const previous = JSON.parse(await readFile('data/scraping-status.json', 'utf8'));
const previousById = new Map((previous.records || []).map(item => [item.sourceId, item]));
const results = [];
const robotsCache = new Map();

async function fetchWithPolicy(url, attempts = maxAttempts) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {headers: {'User-Agent': userAgent, Accept: 'text/html,application/json,text/plain,application/pdf;q=0.8'}, signal: controller.signal, redirect: 'follow'});
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response;
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await sleep(delayMs);
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError;
}

function robotsAllows(text, pathname) {
  let applies = false;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, '').trim();
    if (!line) continue;
    const [key, ...rest] = line.split(':');
    const value = rest.join(':').trim();
    if (key.toLowerCase() === 'user-agent') applies = value === '*' || value.toLowerCase().includes('bonusbridgeresearchbot');
    if (applies && key.toLowerCase() === 'disallow' && value && pathname.startsWith(value)) return false;
  }
  return true;
}

async function allowedByRobots(url) {
  const parsed = new URL(url);
  const robotsUrl = `${parsed.origin}/robots.txt`;
  if (!robotsCache.has(robotsUrl)) {
    try {
      const response = await fetchWithPolicy(robotsUrl, 1);
      robotsCache.set(robotsUrl, await response.text());
    } catch {
      robotsCache.set(robotsUrl, null);
    }
  }
  const robots = robotsCache.get(robotsUrl);
  if (robots === null) return {allowed: false, reason: 'robots.txt inaccessible — collecte refusée par prudence'};
  return {allowed: robotsAllows(robots, parsed.pathname), reason: 'robots.txt vérifié'};
}

for (const source of sources) {
  const checkedAt = new Date().toISOString();
  const robots = await allowedByRobots(source.url);
  if (!robots.allowed) {
    results.push({sourceId: source.id, url: source.url, checkedAt, accessible: false, robotsAllowed: false, status: 'human-review', error: robots.reason});
    await sleep(delayMs);
    continue;
  }
  try {
    const response = await fetchWithPolicy(source.url);
    const bytes = Buffer.from(await response.arrayBuffer());
    const hash = sha256(bytes);
    const oldHash = previousById.get(source.id)?.contentHash || null;
    results.push({sourceId: source.id, url: response.url, checkedAt, accessible: true, robotsAllowed: true, status: oldHash && oldHash !== hash ? 'changed-human-review' : oldHash ? 'unchanged' : 'collected', contentHash: hash, contentType: response.headers.get('content-type') || 'unknown', byteLength: bytes.length});
  } catch (error) {
    results.push({sourceId: source.id, url: source.url, checkedAt, accessible: false, robotsAllowed: true, status: 'unavailable', error: error.name === 'AbortError' ? 'timeout' : error.message});
  }
  await sleep(delayMs);
}

const summary = {
  accessible: results.filter(item => item.accessible).length,
  unavailable: results.filter(item => !item.accessible).length,
  updated: results.filter(item => item.status === 'changed-human-review').length,
  unchanged: results.filter(item => item.status === 'unchanged').length,
  humanReview: results.filter(item => item.status.includes('human-review')).length
};
await mkdir('reports', {recursive: true});
await writeFile('data/scraping-status.json', `${JSON.stringify({schemaVersion: '1.0.0', enabled: true, lastRunAt: new Date().toISOString(), summary, records: results}, null, 2)}\n`);
console.log(`Collecte terminée sans extraction de données personnelles : ${summary.accessible} accessibles, ${summary.unavailable} indisponibles, ${summary.humanReview} à revoir.`);
