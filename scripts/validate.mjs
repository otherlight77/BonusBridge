import{readFile,access,readdir}from'node:fs/promises';
const failures=[];
const html=await readFile('index.html','utf8');
const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(match=>match[1]);
const duplicates=ids.filter((id,index)=>ids.indexOf(id)!==index);
if(duplicates.length)failures.push(`Duplicate IDs: ${[...new Set(duplicates)].join(', ')}`);
const references=[...html.matchAll(/(?:href|src)="([^"]+)"/g)].map(match=>match[1]);
const localAssets=references.filter(reference=>!/^(?:https?:|mailto:|#)/.test(reference));
for(const asset of localAssets){try{await access(asset)}catch{failures.push(`Missing resource: ${asset}`)}}
for(const target of references.filter(value=>value.startsWith('#')&&value.length>1).map(value=>value.slice(1)))if(!ids.includes(target))failures.push(`Broken fragment: #${target}`);
for(const required of['accueil','passport','checker','recognition-form','explorer','documents','document-checklist','timeline','savings','sources','source-filters','sourced-insurer-grid','assistant','dashboard','knowledge','journey-assistant','source-history-dialog','admin-dialog','theme-toggle'])if(!ids.includes(required))failures.push(`Missing V2 module: ${required}`);
for(const copy of['International Insurance Passport','Votre historique d’assurance','Recognition Checker','Document Center','Country Explorer','Official Sources','Savings Estimator','BonusBridge AI','Knowledge Base'])if(!html.toLowerCase().includes(copy.toLowerCase()))failures.push(`Missing product copy: ${copy}`);
const code=await readFile('js/v2.js','utf8');
for(const capability of['localStorage','serviceWorker','beforeinstallprompt','recognition-form','assistant-form'])if(!code.includes(capability))failures.push(`Missing application capability: ${capability}`);
const manifest=JSON.parse(await readFile('manifest.webmanifest','utf8'));if(!manifest.name.includes('Passport'))failures.push('Manifest is not positioned as Insurance Passport.');
const guideDirs=await readdir('guides',{withFileTypes:true}).catch(()=>[]);if(guideDirs.filter(item=>item.isDirectory()).length<200)failures.push('SEO generator did not create at least 200 route pages.');
if(failures.length){console.error(failures.map(item=>`✗ ${item}`).join('\n'));process.exitCode=1}else{console.log(`✓ ${ids.length} unique interface IDs`);console.log(`✓ ${localAssets.length} local resources resolved`);console.log('✓ 10 product modules present');console.log(`✓ ${guideDirs.length} static SEO route pages generated`);console.log('✓ PWA, local state and assistant capabilities present')}
