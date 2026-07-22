const $=(selector,root=document)=>root.querySelector(selector);
const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
const storeKey='bonusbridge-passport-v2';
const defaults={origin:'FR',destination:'CA',area:'Québec',insurer:'AXA France',years:8,bonus:50,claims:0,name:'Julien Martin',documents:5,theme:'light',language:'fr'};
let state={...defaults,...readState()};
let wizardStep=0,deferredInstall;

function readState(){try{return JSON.parse(localStorage.getItem(storeKey))||{}}catch{return{}}}
function saveState(){localStorage.setItem(storeKey,JSON.stringify(state))}
function escapeHTML(value=''){const node=document.createElement('div');node.textContent=String(value);return node.innerHTML}
function toast(message){const node=$('#toast');node.textContent=message;node.hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>node.hidden=true,2600)}
function money(value){return new Intl.NumberFormat(state.language==='fr'?'fr-CA':'en-CA',{style:'currency',currency:'CAD',maximumFractionDigits:0}).format(value)}

const countries=[
  {id:'FR',name:'France',en:'France',flag:'🇫🇷',meta:'18 régions',score:72,languages:'Français · Anglais',delay:'3–10 jours',docs:'3 à 5',structure:'Régime national'},
  {id:'CA',name:'Canada',en:'Canada',flag:'🇨🇦',meta:'10 provinces',score:68,languages:'Anglais · Français',delay:'5–15 jours',docs:'3 à 5',structure:'Province par province'},
  {id:'US',name:'États-Unis',en:'United States',flag:'🇺🇸',meta:'50 États',score:48,languages:'Anglais · Espagnol',delay:'7–21 jours',docs:'4 à 6',structure:'État par État'},
  {id:'BE',name:'Belgique',en:'Belgium',flag:'🇧🇪',meta:'3 régions',score:64,languages:'Français · Néerlandais',delay:'3–10 jours',docs:'3 à 5',structure:'Régime national'},
  {id:'LU',name:'Luxembourg',en:'Luxembourg',flag:'🇱🇺',meta:'12 cantons',score:44,languages:'Français · Allemand',delay:'3–10 jours',docs:'3 à 5',structure:'Régime national'},
  {id:'CH',name:'Suisse',en:'Switzerland',flag:'🇨🇭',meta:'26 cantons',score:42,languages:'FR · DE · IT',delay:'5–15 jours',docs:'4 à 6',structure:'Canton et assureur'},
  {id:'AU',name:'Australie',en:'Australia',flag:'🇦🇺',meta:'8 territoires',score:54,languages:'Anglais',delay:'5–18 jours',docs:'4 à 6',structure:'État par État'},
  {id:'NZ',name:'Nouvelle-Zélande',en:'New Zealand',flag:'🇳🇿',meta:'16 régions',score:38,languages:'Anglais',delay:'7–21 jours',docs:'4 à 6',structure:'Régime national'},
  {id:'ES',name:'Espagne',en:'Spain',flag:'🇪🇸',meta:'17 régions',score:58,languages:'Espagnol · Anglais',delay:'4–14 jours',docs:'3 à 5',structure:'Régime national'},
  {id:'PT',name:'Portugal',en:'Portugal',flag:'🇵🇹',meta:'18 districts',score:46,languages:'Portugais · Anglais',delay:'5–15 jours',docs:'3 à 5',structure:'Régime national'},
  {id:'GB',name:'Royaume-Uni',en:'United Kingdom',flag:'🇬🇧',meta:'4 nations',score:55,languages:'Anglais',delay:'5–14 jours',docs:'3 à 5',structure:'Nation et assureur'}
];
const sources=[
  {country:'FR',kind:'AUTORITÉ · FRANCE',initials:'AC',name:'Autorité de contrôle prudentiel et de résolution',description:'Cadre de supervision des organismes d’assurance.',date:'Vérifié · 2026',url:'https://acpr.banque-france.fr/',official:true},
  {country:'CA',kind:'RÉGULATEUR · QUÉBEC',initials:'AM',name:'Autorité des marchés financiers',description:'Information sur l’assurance automobile au Québec.',date:'Vérifié · 2026',url:'https://lautorite.qc.ca/',official:true},
  {country:'CA',kind:'ORGANISME PUBLIC · QUÉBEC',initials:'SAAQ',name:'Société de l’assurance automobile du Québec',description:'Permis, immatriculation et régime public québécois.',date:'Vérifié · 2026',url:'https://saaq.gouv.qc.ca/',official:true},
  {country:'FR',kind:'SERVICE PUBLIC · FRANCE',initials:'SP',name:'Service-Public.fr',description:'Informations administratives sur l’assurance automobile.',date:'Vérifié · 2026',url:'https://www.service-public.fr/particuliers/vosdroits/N32',official:true},
  {country:'CA',kind:'ASSUREUR · CANADA',initials:'TD',name:'TD Insurance',description:'Pages publiques relatives à la souscription automobile.',date:'À confirmer · 2026',url:'https://www.tdinsurance.com/',official:false}
];

function country(id){return countries.find(item=>item.id===id)||countries[0]}
function countryName(id){const item=country(id);return state.language==='en'?item.en:item.name}

function setupReveal(){const nodes=$$('.reveal');if(!('IntersectionObserver'in window)){nodes.forEach(n=>n.classList.add('visible'));return}const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.12});nodes.forEach(node=>observer.observe(node))}
function setupNavigation(){const toggle=$('#menu-toggle'),nav=$('#main-nav');toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open))});$$('#main-nav a').forEach(link=>link.addEventListener('click',()=>nav.classList.remove('open')))}

function optionsHTML(selected,exclude=''){return countries.map(item=>`<option value="${item.id}" ${item.id===selected?'selected':''} ${item.id===exclude?'disabled':''}>${item.flag} ${state.language==='en'?item.en:item.name}</option>`).join('')}
function choiceHTML(name,selected){return countries.slice(0,9).map(item=>`<label><input type="radio" name="${name}" value="${item.id}" ${item.id===selected?'checked':''}><span><em>${item.flag}</em>${state.language==='en'?item.en:item.name}</span></label>`).join('')}
function populateCountries(){
  $('#recognition-origin').innerHTML=optionsHTML(state.origin,state.destination);
  $('#recognition-destination').innerHTML=optionsHTML(state.destination,state.origin);
  $('#origin-options').innerHTML=choiceHTML('origin',state.origin);
  $('#destination-options').innerHTML=choiceHTML('destination',state.destination);
}

function openDialog(dialog){dialog.showModal();document.body.classList.add('dialog-open')}
function closeDialog(dialog){dialog.close();document.body.classList.remove('dialog-open')}
function setupDialogs(){
  $$('[data-open-wizard]').forEach(button=>button.addEventListener('click',()=>{wizardStep=0;renderWizard();openDialog($('#journey-assistant'))}));
  $$('[data-close-dialog]').forEach(button=>button.addEventListener('click',()=>closeDialog(button.closest('dialog'))));
  $$('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target===dialog)closeDialog(dialog)}));
  $('#open-source-history').addEventListener('click',()=>openDialog($('#source-history-dialog')));
  $('#open-admin').addEventListener('click',()=>openDialog($('#admin-dialog')));
}

function renderWizard(){
  $$('.wizard-step').forEach((node,index)=>node.classList.toggle('active',index===wizardStep));
  $$('#wizard-nav li').forEach((node,index)=>{node.classList.toggle('active',index===wizardStep);node.classList.toggle('done',index<wizardStep)});
  $('#wizard-progress').style.width=`${((wizardStep+1)/6)*100}%`;
  $('#wizard-back').hidden=wizardStep===0;
  $('#wizard-next').textContent=wizardStep===5?(state.language==='en'?'Open my dashboard →':'Ouvrir mon espace →'):(state.language==='en'?'Continue →':'Continuer →');
  $('#form-error').textContent='';
}
function collectWizard(){
  state.origin=$('input[name=origin]:checked')?.value||state.origin;
  state.destination=$('input[name=destination]:checked')?.value||state.destination;
  state.area=$('[name=area]').value;
  state.insurer=$('[name=insurer]').value.trim()||'Non renseigné';
  state.bonus=Number($('[name=bonus]').value)||0;
  state.claims=Number($('input[name=claimsChoice]:checked')?.value)||0;
  saveState();updatePersonalization();
}
function setupWizard(){
  $('[name=insurer]').value=state.insurer;$('[name=bonus]').value=state.bonus;$('#years-output').textContent=state.years;
  $$('[data-year]').forEach(button=>button.addEventListener('click',()=>{state.years=Math.max(0,Math.min(60,state.years+(button.dataset.year==='plus'?1:-1)));$('#years-output').textContent=state.years}));
  $('#wizard-back').addEventListener('click',()=>{if(wizardStep>0){wizardStep--;renderWizard()}});
  $('#wizard-next').addEventListener('click',()=>{
    if(wizardStep===2&&!$('[name=insurer]').value.trim()){ $('#form-error').textContent='Indiquez un assureur pour continuer.';return }
    collectWizard();
    if(wizardStep<5){wizardStep++;if(wizardStep===5)updateWizardResult();renderWizard()}else{closeDialog($('#journey-assistant'));location.hash='dashboard';toast('Votre espace personnel a été mis à jour.')}
  });
}
function updateWizardResult(){const confidence=Math.max(42,Math.min(94,72+state.years*2-state.claims*12));$('#wizard-result-copy').textContent=`${countryName(state.origin)} → ${countryName(state.destination)} · confiance initiale ${confidence}%`}

function updatePersonalization(){
  const confidence=Math.max(42,Math.min(94,72+state.years*2-state.claims*12));
  $('#passport-route').textContent=`${countryName(state.origin).toUpperCase()} → ${countryName(state.destination).toUpperCase()}`;
  $('#passport-years').textContent=String(state.years).padStart(2,'0')+(state.language==='fr'?' ans':' yrs');
  $('#passport-bonus').textContent=`${state.bonus}%`;$('#passport-claims').textContent=state.claims;$('#passport-confidence').textContent=`${confidence}%`;$('#confidence-bar').style.width=`${confidence}%`;
  $('#recognition-origin').value=state.origin;$('#recognition-destination').value=state.destination;
}

function setupRecognition(){
  $('#recognition-form').addEventListener('submit',event=>{event.preventDefault();const values=Object.fromEntries(new FormData(event.currentTarget));state.origin=values.origin;state.destination=values.destination;state.area=values.area;saveState();updatePersonalization();const score=Math.max(48,Math.min(88,62+state.years*2-state.claims*9));const node=$('#recognition-result');$('strong',node).innerHTML=`${score}<small>/100</small>`;$('h3',node).textContent=score>=70?'Votre historique peut être étudié':'Une étude manuelle sera nécessaire';node.animate([{opacity:.4,transform:'translateY(8px)'},{opacity:1,transform:'none'}],{duration:350});toast('Analyse mise à jour — résultat indicatif.')});
}

function setupExplorer(){
  const profiles={};countries.forEach(item=>profiles[item.id]=item);
  $$('#country-list button').forEach(button=>button.addEventListener('click',()=>{$$('#country-list button').forEach(b=>b.classList.remove('active'));button.classList.add('active');const item=profiles[button.dataset.country],profile=$('#country-profile');$('.country-flag',profile).textContent=item.flag;$('h3',profile).textContent=countryName(item.id);$('.country-meter b',profile).textContent=`${item.score}%`;$('.country-meter i span',profile).style.width=`${item.score}%`;const values=$$('dd',profile);values[0].textContent=item.structure;values[1].textContent=item.languages;values[2].textContent=item.delay;values[3].textContent=item.docs;$('header em',profile).textContent=item.score>=60?'COUVERTURE ACTIVE':'ARCHITECTURE PRÊTE'}));
}

function setupDocuments(){
  $('#add-document').addEventListener('click',()=>{const name=prompt('Nom du document à suivre :');if(!name?.trim())return;const article=document.createElement('article');article.dataset.doc='';article.innerHTML=`<span class="doc-icon blue">＋</span><div><h3>${escapeHTML(name.trim())}</h3><p>Document personnel</p></div><span class="status neutral">○ À ajouter</span><time>Nouvel élément</time><button type="button" aria-label="Options">•••</button>`;$('#document-checklist').append(article);state.documents=Math.min(7,(state.documents||5)+1);saveState();updateDocumentScore();toast('Document ajouté à votre checklist locale.')});
  $('#document-checklist').addEventListener('click',event=>{const button=event.target.closest('button');if(!button)return;const article=button.closest('article'),status=$('.status',article);const valid=status.classList.contains('success');status.className=`status ${valid?'neutral':'success'}`;status.textContent=valid?'○ À vérifier':'✓ Validé';toast(valid?'Document marqué à vérifier.':'Document marqué comme validé.')});
  updateDocumentScore();
}
function updateDocumentScore(){const ready=state.documents||5,score=Math.round(ready/7*100);$('#doc-score').textContent=`${score}%`;$('#doc-ready').textContent=`${ready} sur 7`;$('.progress-ring').style.setProperty('--progress',score)}

function setupEstimator(){const premium=$('#base-premium'),rate=$('#recognition-rate');function render(){const base=Number(premium.value),percent=Number(rate.value),saving=Math.round(base*percent/100),withHistory=base-saving;$('#premium-value').textContent=money(base);$('#rate-value').textContent=`${percent}%`;$('#saving-value').textContent=money(saving);$('#monthly-saving').textContent=money(Math.round(saving/12));$('#without-value').textContent=money(base);$('#with-value').textContent=money(withHistory);$('#with-bar').style.width=`${100-percent}%`}premium.addEventListener('input',render);rate.addEventListener('input',render);render()}

function renderSources(){const form=$('#source-filters'),values=Object.fromEntries(new FormData(form)),query=(values.query||'').toLowerCase();const filtered=sources.filter(item=>(!values.country||item.country===values.country)&&(!values.officialOnly||item.official)&&(!query||`${item.name} ${item.description} ${item.kind}`.toLowerCase().includes(query)));$('#sourced-insurer-grid').innerHTML=filtered.length?filtered.map(item=>`<article><div class="source-logo">${item.initials}</div><div><span>${item.kind}</span><h3>${item.name}</h3><p>${item.description}</p></div><time>${item.date}</time><a href="${item.url}" target="_blank" rel="noopener">Source ↗</a></article>`).join(''):'<article><div class="source-logo">0</div><div><h3>Aucune source correspondante</h3><p>Modifiez les filtres pour élargir la recherche.</p></div></article>'}
function setupSources(){const form=$('#source-filters');form.addEventListener('input',renderSources);form.addEventListener('change',renderSources);$('#source-count').textContent=String(sources.length+13);$('#verified-count').textContent=String(sources.filter(x=>x.official).length+6);$('#confirm-count').textContent=String(sources.filter(x=>!x.official).length+7)}

const answers=[
  {match:/bonus|reduction/i,text:'Le bonus n’est généralement pas transféré comme un coefficient identique. Votre ancienneté et votre historique sans sinistre peuvent toutefois être étudiés. Préparez un relevé d’information et une lettre d’expérience.'},
  {match:/document|axa|lettre/i,text:'Demandez à votre assureur un relevé d’information complet, une attestation de période assurée et, si possible, une lettre d’expérience mentionnant les sinistres. Confirmez ensuite le format accepté à destination.'},
  {match:/td|reconnu|reconnaissance/i,text:'Une étude est possible selon le produit et la province, mais BonusBridge ne peut pas garantir l’acceptation. Contactez le service de souscription avec vos justificatifs et demandez une confirmation écrite.'},
  {match:/économ|econom|prix|tarif/i,text:'L’économie dépend du véhicule, de l’adresse, du profil et de la politique de l’assureur. Utilisez le Savings Estimator pour comparer deux scénarios indicatifs, puis obtenez des devis officiels.'}
];
function askAssistant(question){const list=$('#chat-messages');list.insertAdjacentHTML('beforeend',`<p class="user-message">${escapeHTML(question)}</p>`);const found=answers.find(item=>item.match.test(question));const text=found?.text||'Je peux vous aider à préparer cette question. Indiquez le pays de départ, la destination et l’assureur visé. Toute réponse devra ensuite être confirmée auprès de l’assureur.';setTimeout(()=>{list.insertAdjacentHTML('beforeend',`<div class="ai-message"><span>✦</span><p>${text}<small>Réponse pédagogique · Sources à confirmer selon votre situation</small></p></div>`);list.scrollTop=list.scrollHeight},250);list.scrollTop=list.scrollHeight}
function setupAssistant(){
  $('#assistant-form').addEventListener('submit',event=>{event.preventDefault();const input=$('#assistant-input'),question=input.value.trim();if(!question)return;askAssistant(question);input.value=''});
  $$('.question-chips button').forEach(button=>button.addEventListener('click',()=>askAssistant(button.textContent)));
}

function setupDashboard(){
  const content={overview:null,passport:'<h3>Insurance Passport</h3><p>Votre passeport est prérempli. Finalisez les documents pour augmenter son niveau de confiance.</p>',documents:'<h3>Documents</h3><p>5 documents sur 7 sont prêts. La lettre d’expérience nécessite encore une traduction.</p>',favorites:'<h3>Favoris</h3><p>Vos assureurs et guides enregistrés apparaîtront ici.</p>',notifications:'<h3>Notifications</h3><p>Traduction en attente · Source mise à jour · Départ dans 30 jours.</p>'};
  const original=$('#dash-panel').innerHTML;$$('[data-dash-tab]').forEach(button=>button.addEventListener('click',()=>{$$('[data-dash-tab]').forEach(b=>b.classList.remove('active'));button.classList.add('active');$('#dash-panel').innerHTML=button.dataset.dashTab==='overview'?original:`<div class="dash-progress"><div>${content[button.dataset.dashTab]}</div><button class="button small secondary" type="button">Ouvrir le module</button></div>`}));
}

const copy={en:{title:'Your insurance history travels with you.',cta:'Create my passport',proof:'France ↔ Canada available'},fr:{title:'Votre historique d’assurance vous suit partout.',cta:'Créer mon passeport',proof:'France ↔ Canada disponible'}};
function setupPreferences(){
  document.documentElement.dataset.theme=state.theme;
  $('#theme-toggle').addEventListener('click',()=>{state.theme=state.theme==='light'?'dark':'light';document.documentElement.dataset.theme=state.theme;saveState();toast(state.theme==='light'?'Thème clair activé.':'Thème sombre activé.')});
  $('#language-toggle').addEventListener('click',()=>{state.language=state.language==='fr'?'en':'fr';document.documentElement.lang=state.language;$('#language-toggle').textContent=state.language.toUpperCase();const h1=$('.hero h1');h1.innerHTML=state.language==='en'?'Your insurance history <span>travels<br>with you.</span>':'Votre historique<br>d’assurance <span>vous suit<br>partout.</span>';$$('[data-open-wizard]').forEach(button=>{if(button.closest('.site-header'))button.textContent=copy[state.language].cta});populateCountries();updatePersonalization();setupEstimator();saveState();toast(state.language==='en'?'English interface enabled.':'Interface française activée.')});
}

function setupPWA(){window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferredInstall=event;$('#install-app').hidden=false});$('#install-app').addEventListener('click',async()=>{if(!deferredInstall)return;deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null;$('#install-app').hidden=true});if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{})}
function setupKnowledge(){const input=$('#knowledge-search');document.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();input.focus()}});input.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();const query=input.value.trim();if(query){$('#assistant-input').value=query;location.hash='assistant';toast('Question transférée à Bridge Assistant.')}}})}

function init(){populateCountries();setupReveal();setupNavigation();setupDialogs();setupWizard();setupRecognition();setupExplorer();setupDocuments();setupEstimator();setupSources();setupAssistant();setupDashboard();setupPreferences();setupPWA();setupKnowledge();updatePersonalization();renderSources();$('#passport-date').textContent=new Intl.DateTimeFormat(state.language==='fr'?'fr-FR':'en-GB',{day:'2-digit',month:'short',year:'numeric'}).format(new Date()).toUpperCase()}
init();
