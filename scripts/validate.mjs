import{readFile,access,readdir}from'node:fs/promises';
import{extname,join,dirname,normalize}from'node:path';
const failures=[];
const html=await readFile('index.html','utf8');
const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(match=>match[1]);
const duplicates=ids.filter((id,index)=>ids.indexOf(id)!==index);
if(duplicates.length)failures.push(`Duplicate IDs: ${[...new Set(duplicates)].join(', ')}`);
const references=[...html.matchAll(/(?:href|src)="([^"]+)"/g)].map(match=>match[1]);
const absolutePaths=references.filter(reference=>reference.startsWith('/'));
if(absolutePaths.length)failures.push(`Pages-incompatible paths: ${absolutePaths.join(', ')}`);
const localAssets=references.filter(reference=>!/^(?:https?:|mailto:|#)/.test(reference));
for(const asset of localAssets){try{await access(asset)}catch{failures.push(`Missing resource: ${asset}`)}}
for(const target of references.filter(value=>value.startsWith('#')&&value.length>1).map(value=>value.slice(1)))if(!ids.includes(target))failures.push(`Broken fragment: #${target}`);
if(/<section\b[^>]*\shidden\b/i.test(html))failures.push('A primary section is hidden in static HTML.');
for(const required of['accueil','comparateur','comparison-form','results-panel','assureurs','documents','fonctionnement','espace','faq','form-error'])if(!ids.includes(required))failures.push(`Missing interface target: ${required}`);

const datasets=['countries','insurance-companies','recognition-rules','required-documents','languages','currencies','sample-comparisons','vehicle-types','coverage-types','country-guides','document-guides','faq'];
const parsed={};
for(const name of datasets){const file=`data/${name}.json`;parsed[name]=JSON.parse(await readFile(file,'utf8'));if(!Array.isArray(parsed[name].records))failures.push(`Invalid records envelope: ${file}`)}
const countryIds=new Set(parsed.countries.records.map(item=>item.id));
for(const id of['FR','BE','CA','US','GB','LU','CH','ES','PT','IT','DE','NL','AU','NZ','IE'])if(!countryIds.has(id))failures.push(`Missing initial country: ${id}`);
const ruleFields=['id','originCountry','destinationCountry','insurerId','recognized','maximumYearsRecognized','retainedBonusPercent','acceptedDocuments','translationRequired','acceptedLanguages','estimatedProcessingDays','officialSourceUrl','verified','status','lastVerified','notes'];
for(const rule of parsed['recognition-rules'].records){for(const field of ruleFields)if(!(field in rule))failures.push(`Rule ${rule.id||'(unknown)'} lacks ${field}`);if(rule.verified!==true&&rule.status!=='demo')failures.push(`Unverified rule ${rule.id} is not marked demo`)}
const ruleIds=parsed['recognition-rules'].records.map(item=>item.id);if(new Set(ruleIds).size!==ruleIds.length)failures.push('Duplicate recognition rule IDs.');
const companyIds=new Set(parsed['insurance-companies'].records.map(item=>item.id));
for(const company of parsed['insurance-companies'].records){for(const field of['id','name','country','logo','description','verified','status'])if(!(field in company))failures.push(`Company ${company.id||'(unknown)'} lacks ${field}`);if(company.verified!==false||company.status!=='demo')failures.push(`Demonstration company ${company.id} has an unsafe status`);try{await access(company.logo.replace(/^\.\//,''))}catch{failures.push(`Missing company logo: ${company.logo}`)}}
for(const rule of parsed['recognition-rules'].records){if(!companyIds.has(rule.insurerId))failures.push(`Rule ${rule.id} references an unknown insurer`);if(!countryIds.has(rule.originCountry)||!countryIds.has(rule.destinationCountry))failures.push(`Rule ${rule.id} references an unknown country`)}

const codeFiles=[];async function collect(directory){for(const entry of await readdir(directory,{withFileTypes:true})){if(['.git','node_modules','casting-automation'].includes(entry.name))continue;const path=join(directory,entry.name);if(entry.isDirectory())await collect(path);else codeFiles.push(path)}}await collect('.');
for(const file of codeFiles.filter(path=>extname(path)==='.js')){const code=await readFile(file,'utf8');for(const match of code.matchAll(/(?:from\s*|import\s*)['"]([^'"]+)['"]/g)){const source=match[1];if(source.startsWith('.')){const resolved=normalize(join(dirname(file),source));try{await access(resolved)}catch{failures.push(`Broken JavaScript import in ${file}: ${source}`)}}}}
for(const file of codeFiles.filter(path=>extname(path)==='.css')){const code=await readFile(file,'utf8');for(const match of code.matchAll(/@import\s+(?:url\()?['"]([^'"]+)['"]/g)){const source=match[1];const resolved=normalize(join(dirname(file),source));try{await access(resolved)}catch{failures.push(`Broken CSS import in ${file}: ${source}`)}}}
for(const file of['manifest.webmanifest','offline.html','robots.txt','sitemap.xml','sw.js','.nojekyll','.github/workflows/deploy-pages.yml','assets/logos/bonusbridge-logo.svg','assets/logos/bonusbridge-symbol.svg','assets/logos/bonusbridge-light.svg','assets/logos/bonusbridge-dark.svg','assets/logos/favicon.svg','assets/social-card.svg'])await access(file);
if(failures.length){console.error(failures.map(item=>`✗ ${item}`).join('\n'));process.exitCode=1}else{console.log(`✓ ${ids.length} unique IDs`);console.log(`✓ ${localAssets.length} HTML resources resolved`);console.log(`✓ ${datasets.length} scalable datasets validated`);console.log(`✓ ${parsed['recognition-rules'].records.length} rules include provenance fields`);console.log('✓ internal links, module imports, progressive content and GitHub Pages paths valid')}
