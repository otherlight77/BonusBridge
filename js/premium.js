const $=(selector,scope=document)=>scope.querySelector(selector);
const $$=(selector,scope=document)=>[...scope.querySelectorAll(selector)];
const DRAFT_KEY='bonusbridge-premium-draft';
const DOCUMENT_KEY='bonusbridge-document-checklist';
const form=$('#comparison-form');
let currentStep=0;

const escapeHTML=(value='')=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const selectedText=select=>select?.selectedOptions?.[0]?.textContent?.trim()||'—';

function setStep(index,focus=true){
  const steps=$$('[data-form-step]',form);
  currentStep=Math.max(0,Math.min(steps.length-1,index));
  steps.forEach((step,position)=>step.classList.toggle('active',position===currentStep));
  $$('[data-step-target]',form).forEach((button,position)=>{button.classList.toggle('active',position===currentStep);button.setAttribute('aria-current',position===currentStep?'step':'false')});
  const labels=['YOUR MOVE','DRIVING HISTORY','YOUR VEHICLE','YOUR DOCUMENTS','YOUR PREFERENCES'];
  $('#form-step-number').textContent=String(currentStep+1).padStart(2,'0');
  $('#form-step-kicker').textContent=labels[currentStep];
  $('#form-progress-bar').style.width=`${((currentStep+1)/steps.length)*100}%`;
  $('#form-back').disabled=currentStep===0;
  $('#form-next').hidden=currentStep===steps.length-1;
  $('.submit-compare',form).hidden=currentStep!==steps.length-1;
  if(focus)steps[currentStep].querySelector('select,input,button')?.focus();
}

function validateStep(){
  const fields=$$('[required]',$$('[data-form-step]',form)[currentStep]);
  const invalid=fields.find(field=>!field.checkValidity());
  if(invalid){invalid.reportValidity();$('#form-error').textContent='Complete the required fields in this step before continuing.';return false}
  if(currentStep===0&&form.elements.originCountry.value===form.elements.destinationCountry.value){$('#form-error').textContent='Origin and destination countries must be different.';$('#form-error').focus();return false}
  $('#form-error').textContent='';return true;
}

function saveDraft(){
  const data=Object.fromEntries(new FormData(form));
  ['mainDriver','youngDriver','hasExperienceLetter','hasInformationStatement','hasClaimsHistory'].forEach(name=>data[name]=form.elements[name]?.checked||false);
  try{localStorage.setItem(DRAFT_KEY,JSON.stringify(data))}catch{}
}

function restoreDraft(){
  try{const data=JSON.parse(localStorage.getItem(DRAFT_KEY)||'{}');for(const[name,value]of Object.entries(data)){const field=form.elements[name];if(!field)continue;if(field.type==='checkbox')field.checked=Boolean(value);else if([...field.options||[]].some(option=>option.value===String(value))||field.tagName!=='SELECT')field.value=value}}catch{}
  updateSummary();
}

function updateSummary(){
  const origin=selectedText($('#origin-country')),destination=selectedText($('#destination-country'));
  const years=form.elements.insuredYears?.value||0,coefficient=form.elements.bonusMalus?.value||'—';
  const vehicle=selectedText($('#vehicle-type')),value=Number(form.elements.vehicleValue?.value||0).toLocaleString('en-GB');
  const ready=['hasExperienceLetter','hasInformationStatement','hasClaimsHistory'].filter(name=>form.elements[name]?.checked).length;
  $('#summary-vehicle').textContent=`${vehicle} · €${value}`;
  $('#summary-documents').textContent=`${ready} of 3 available`;
  $('#comparison-review-route').textContent=`${origin} → ${destination}`;
  $('#comparison-review-copy').textContent=`${years} insured years · coefficient ${coefficient} · ${selectedText($('#coverage-type')).toLowerCase()}`;
  $('#passport-origin').textContent=$('#origin-country')?.value||'—';$('#passport-destination').textContent=$('#destination-country')?.value||'—';
  $('#passport-history').textContent=`${years} years insured · coefficient ${coefficient}`;
  saveDraft();
}

function setupStepper(){
  if(!form)return;document.documentElement.classList.add('premium-ready');
  $$('[data-step-target]',form).forEach(button=>button.addEventListener('click',()=>setStep(Number(button.dataset.stepTarget))));
  $('#form-next').addEventListener('click',()=>{if(validateStep())setStep(currentStep+1)});
  $('#form-back').addEventListener('click',()=>setStep(currentStep-1));
  form.addEventListener('input',updateSummary);form.addEventListener('change',updateSummary);
  form.addEventListener('submit',()=>localStorage.removeItem(DRAFT_KEY));
  setStep(0,false);setTimeout(restoreDraft,500);
}

function enhanceResults(){
  const grid=$('#result-grid');if(!grid)return;
  const decorate=()=>{
    const cards=$$('.insurer-card',grid);
    cards.forEach((card,index)=>{if(card.dataset.premiumReady)return;card.dataset.premiumReady='true';card.dataset.originalIndex=String(index);const details=$('.result-evidence',card);const company=$('h4',card)?.textContent||`Insurer ${index+1}`;const actions=document.createElement('div');actions.className='premium-result-actions';actions.innerHTML=`<label><input type="checkbox" data-compare-card> Compare</label><button type="button" data-open-detail>View details</button><button type="button" data-prepare-file>Prepare my dossier</button>`;card.append(actions);$('[data-open-detail]',actions).addEventListener('click',()=>{if(details){details.open=true;details.scrollIntoView({behavior:'smooth',block:'center'})}});$('[data-prepare-file]',actions).addEventListener('click',()=>{document.querySelector('[data-app-view="documents"]')?.click();$('#platform')?.scrollIntoView({behavior:'smooth'});announce(`${company} added to your preparation workflow.`)});$('[data-compare-card]',actions).addEventListener('change',event=>{const checked=$$('[data-compare-card]:checked');if(checked.length>3){event.target.checked=false;announce('Select a maximum of three insurers.')}renderComparisonTray()})});
    const scores=cards.map(card=>Number($('.score-badge',card)?.textContent||0));
    $('#insight-best-score').textContent=scores.length?`${Math.max(...scores)}/100`:'—';
    $('#insight-verified').textContent=cards.filter(card=>card.textContent.includes('Verified')).length;
    const ready=['hasExperienceLetter','hasInformationStatement','hasClaimsHistory'].filter(name=>form?.elements[name]?.checked).length;
    $('#insight-missing').textContent=String(3-ready);
    const delays=cards.map(card=>Number(card.textContent.match(/(\d+) days/)?.[1]||0)).filter(Boolean);
    $('#insight-delay').textContent=delays.length?`${Math.round(delays.reduce((a,b)=>a+b,0)/delays.length)} days`:'—';
  };
  new MutationObserver(decorate).observe(grid,{childList:true});decorate();
  $('#result-sort').addEventListener('change',applyResultFilters);$('#filter-no-translation').addEventListener('change',applyResultFilters);$('#filter-verified').addEventListener('change',applyResultFilters);$('#compare-selected').addEventListener('click',renderComparisonTray);
}

function applyResultFilters(){
  const grid=$('#result-grid'),cards=$$('.insurer-card',grid);const sort=$('#result-sort')?.value;
  cards.sort((a,b)=>{if(sort==='speed')return valueFrom(a,/(\d+) days/,999)-valueFrom(b,/(\d+) days/,999);if(sort==='recognition')return valueFrom(b,/(\d+)%/,0)-valueFrom(a,/(\d+)%/,0);if(sort==='simplicity')return difficultyValue(a)-difficultyValue(b);return Number($('.score-badge',b)?.textContent||0)-Number($('.score-badge',a)?.textContent||0)}).forEach(card=>grid.append(card));
  cards.forEach(card=>{const translation=$('#filter-no-translation').checked&&!card.textContent.includes('Not required');const verified=$('#filter-verified').checked&&!card.textContent.includes('Verified');card.hidden=translation||verified});
}
const valueFrom=(node,pattern,fallback)=>Number(node.textContent.match(pattern)?.[1]||fallback);
const difficultyValue=node=>({Easy:1,Moderate:2,Advanced:3,Complex:4}[['Easy','Moderate','Advanced','Complex'].find(value=>node.textContent.includes(value))]||5);

function renderComparisonTray(){
  const cards=$$('[data-compare-card]:checked').map(input=>input.closest('.insurer-card'));const tray=$('#comparison-tray'),grid=$('#comparison-tray-grid');
  grid.innerHTML=cards.map(card=>`<article><h4>${escapeHTML($('h4',card)?.textContent)}</h4><strong>${escapeHTML($('.score-badge',card)?.textContent||'—')}/100</strong><p>${escapeHTML($('.recognition-value',card)?.textContent||'')}</p></article>`).join('');tray.classList.toggle('active',cards.length>1);if(cards.length>1)tray.scrollIntoView({behavior:'smooth',block:'nearest'});
}

const documentDefinitions=[['driving-licence','Driving licence','Required'],['claims-letter','Insurance history letter','Required'],['claims-statement','Claims statement','Required'],['no-claims','No-claims certificate','Optional'],['proof-address','Proof of address','Required'],['registration','Vehicle registration','Required'],['translation','Official translation','Conditional']];
function setupDocuments(){
  const container=$('#document-checklist');if(!container)return;let saved={};try{saved=JSON.parse(localStorage.getItem(DOCUMENT_KEY)||'{}')}catch{}
  container.innerHTML=documentDefinitions.map(([id,name,requirement])=>{const item=saved[id]||{};return`<article data-document="${id}"><div><span>▤</span><p><strong>${name}</strong><small>${requirement}</small></p></div><label>Status<select data-document-field="status"><option>Missing</option><option>Available</option><option>Translation required</option><option>To verify</option></select></label><label>Language<input data-document-field="language" value="${escapeHTML(item.language||'')}"></label><label>Expiry<input type="date" data-document-field="expiry" value="${escapeHTML(item.expiry||'')}"></label><label>Notes<input data-document-field="notes" value="${escapeHTML(item.notes||'')}"></label></article>`}).join('');
  for(const[id,item]of Object.entries(saved)){const card=$(`[data-document="${id}"]`,container);if(card&&item.status)$('[data-document-field="status"]',card).value=item.status}
  const persist=()=>{const data={};$$('[data-document]',container).forEach(card=>{data[card.dataset.document]=Object.fromEntries($$('[data-document-field]',card).map(field=>[field.dataset.documentField,field.value]))});localStorage.setItem(DOCUMENT_KEY,JSON.stringify(data));const available=Object.values(data).filter(item=>item.status==='Available').length;$('#document-progress').textContent=`${available} of ${documentDefinitions.length} available`;$('#passport-status').textContent=`Documents ${available}/${documentDefinitions.length}`};container.addEventListener('input',persist);container.addEventListener('change',persist);persist();
}

async function setupCountries(){
  try{const[countriesPayload,rulesPayload,companiesPayload,guidesPayload]=await Promise.all(['countries','recognition-rules','insurance-companies','country-guides'].map(name=>fetch(`./data/${name}.json`).then(response=>{if(!response.ok)throw new Error(name);return response.json()})));const rules=rulesPayload.records,companies=companiesPayload.records,guides=guidesPayload.records;$('#dashboard-country-grid').innerHTML=countriesPayload.records.map(country=>{const guide=guides.find(item=>item.countryId===country.id);const countryRules=rules.filter(rule=>rule.originCountry===country.id||rule.destinationCountry===country.id);const insurers=companies.filter(company=>company.countries.includes(country.id));return`<article><span>${country.flag}</span><div><small>${country.id} · ${escapeHTML(country.region)}</small><h4>${escapeHTML(country.name)}</h4><p>${escapeHTML(guide?.insuranceSystem||'System needs verification')}</p></div><dl><div><dt>Language</dt><dd>${country.languages.map(value=>value.toUpperCase()).join(', ')}</dd></div><div><dt>Currency</dt><dd>${country.currency}</dd></div><div><dt>Rules</dt><dd>${countryRules.length}</dd></div><div><dt>Insurers</dt><dd>${insurers.length}</dd></div></dl><em>${escapeHTML(guide?.status||'pending')}</em></article>`}).join('')}catch{$('#dashboard-country-grid').innerHTML='<p class="empty">Country knowledge could not be loaded. The rest of the workspace remains available.</p>'}
}

async function setupMapKnowledge(){
  try{
    const[countriesPayload,guidesPayload,documentsPayload]=await Promise.all(['countries','country-guides','required-documents'].map(name=>fetch(`./data/${name}.json`).then(response=>response.json())));
    const update=id=>{const country=countriesPayload.records.find(item=>item.id===id),guide=guidesPayload.records.find(item=>item.countryId===id);if(!country)return;$('#inspector-system').textContent=guide?.insuranceSystem||'Needs verification';$('#inspector-currency').textContent=country.currency;$('#inspector-documents').textContent=(guide?.commonDocuments||[]).map(documentId=>documentsPayload.records.find(item=>item.id===documentId)?.name||documentId).join(' · ')||'Needs verification';$('#inspector-destinations').textContent=(guide?.associatedDestinations||[]).join(' · ')||'None mapped'};
    document.addEventListener('click',event=>{const control=event.target.closest('[data-map-country]');if(control)update(control.dataset.mapCountry)});update('FR');
  }catch{}
}

function setupFavoriteNotes(){
  const list=$('#favorite-list');if(!list)return;const key='bonusbridge-favorite-notes';let notes={};try{notes=JSON.parse(localStorage.getItem(key)||'{}')}catch{}
  const decorate=()=>$$('.favorite-tile',list).forEach(tile=>{if(tile.dataset.notesReady)return;tile.dataset.notesReady='true';const name=$('h4',tile)?.textContent||'insurer',saved=notes[name]||{};const block=document.createElement('div');block.className='favorite-notes';block.innerHTML=`<small>Added ${escapeHTML(saved.at||new Date().toLocaleDateString('en-GB'))} · ${escapeHTML(saved.route||'route to confirm')}</small><label>Why this favorite?<input value="${escapeHTML(saved.reason||'Strong compatibility candidate')}"></label><label>Notes<textarea>${escapeHTML(saved.notes||'')}</textarea></label>`;tile.append(block);const persist=()=>{notes[name]={at:saved.at||new Date().toLocaleDateString('en-GB'),route:`${$('#origin-country')?.value||'—'} → ${$('#destination-country')?.value||'—'}`,reason:$('input',block).value,notes:$('textarea',block).value};localStorage.setItem(key,JSON.stringify(notes))};block.addEventListener('input',persist);persist()});new MutationObserver(decorate).observe(list,{childList:true});decorate();
}

function announce(message){const region=$('#toast-region');if(!region)return;const node=document.createElement('div');node.className='toast';node.textContent=message;region.append(node);setTimeout(()=>node.remove(),3200)}

setupStepper();enhanceResults();setupDocuments();setupCountries();setupMapKnowledge();setupFavoriteNotes();
