import { defaultCountries as countries, presetProfiles, searchIndex, zodiac } from './data.js';
import { buildProfile, buildWheel, getSunSign, estimateAscendant } from './astro.js';
import { loadState, saveState, addHistory, exportExcel } from './store.js';
import { createRecommendation } from '../ai/recommendations.js';
import { setupPWA, installPWA, requestNotifications } from './pwa.js';

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const state = loadState();
let activeProfile = presetProfiles[0];
let activeCountry = countries[0];
let wheelScale = 1;
let wheelRotation = 0;
let installAvailable = false;

const toast = (message, icon = '✓') => {
  const node = document.createElement('div');
  node.className = 'toast';
  node.innerHTML = `<i>${icon}</i><span>${message}</span>`;
  $('#toast-region').append(node);
  setTimeout(() => { node.style.opacity = '0'; node.style.transform = 'translateY(8px)'; }, 3200);
  setTimeout(() => node.remove(), 3550);
};

function setupTheme() {
  const preferred = state.theme || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  document.documentElement.dataset.theme = preferred;
  document.body.classList.toggle('reduce-motion', Boolean(state.reduceMotion));
  const button = $('#theme-toggle');
  const syncLabel = () => button.setAttribute('aria-label', document.documentElement.dataset.theme === 'dark' ? 'Activer le thème clair' : 'Activer le thème sombre');
  syncLabel();
  button.addEventListener('click', () => {
    state.theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = state.theme;
    document.querySelector('meta[name="theme-color"]').content = state.theme === 'dark' ? '#090a12' : '#f5f6fa';
    saveState(state); syncLabel();
  });
}

function setupNavigation() {
  const topbar = $('#topbar');
  const menu = $('#mobile-menu');
  const nav = $('.topnav');
  const updateHeader = () => topbar.classList.toggle('scrolled', scrollY > 30);
  addEventListener('scroll', updateHeader, { passive: true }); updateHeader();
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') === 'true';
    menu.setAttribute('aria-expanded', String(!open)); menu.classList.toggle('open', !open); nav.classList.toggle('open', !open);
  });
  $$('a', nav).forEach(link => link.addEventListener('click', () => { menu.setAttribute('aria-expanded', 'false'); menu.classList.remove('open'); nav.classList.remove('open'); }));
  $('#account-trigger').addEventListener('click', () => $('#dashboard').scrollIntoView({ behavior: 'smooth' }));
  $('#back-to-top').addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
  $$('[data-scroll]').forEach(button => button.addEventListener('click', () => $(button.dataset.scroll)?.scrollIntoView({ behavior: 'smooth' })));
}

function setupMotion() {
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), { threshold: .1, rootMargin: '0px 0px -45px' });
    reveals.forEach(element => observer.observe(element));
  } else reveals.forEach(element => element.classList.add('visible'));

  const counters = $$('[data-counter]');
  const animate = element => {
    const target = Number(element.dataset.counter);
    const started = performance.now();
    const tick = now => {
      const progress = Math.min((now - started) / 1300, 1);
      element.textContent = Math.floor(target * (1 - Math.pow(1 - progress, 4)));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const counterObserver = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { animate(entry.target); counterObserver.unobserve(entry.target); } }), { threshold: .7 });
  counters.forEach(counter => counterObserver.observe(counter));

  const tilt = $('[data-tilt]');
  const stage = $('.orbital-stage');
  if (matchMedia('(pointer:fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    stage.addEventListener('pointermove', event => {
      const rect = stage.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      tilt.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`;
    });
    stage.addEventListener('pointerleave', () => tilt.style.transform = '');
  }
}

function fillFormOptions() {
  const country = $('#birth-country');
  const sign = $('#sun-sign');
  const ascendant = $('#ascendant');
  const cities = $('#city-list');
  countries.forEach(item => {
    country.add(new Option(`${item.flag}  ${item.name}`, item.name));
    item.cities.forEach(city => { const option = document.createElement('option'); option.value = city; cities.append(option); });
  });
  zodiac.forEach(item => {
    sign.add(new Option(`${item.symbol}  ${item.name}`, item.name));
    ascendant.add(new Option(`${item.symbol}  ${item.name}`, item.name));
  });
}

function showFormStep(step) {
  $$('.form-step').forEach(panel => { const active = Number(panel.dataset.step) === step; panel.hidden = !active; panel.classList.toggle('active', active); });
  $$('[data-form-step]').forEach(button => button.classList.toggle('active', Number(button.dataset.formStep) <= step));
}

function validateStep(step) {
  const panel = $(`.form-step[data-step="${step}"]`);
  const fields = $$('input[required],select[required]', panel);
  const invalid = fields.find(field => !field.checkValidity());
  if (invalid) { invalid.reportValidity(); invalid.focus(); return false; }
  return true;
}

function applyPreset(name, open = false) {
  const profile = presetProfiles.find(item => item.firstName === name);
  if (!profile) return;
  activeProfile = profile;
  const form = $('#astro-form');
  form.elements.firstName.value = profile.firstName;
  form.elements.lastName.value = profile.lastName;
  form.elements.birthDate.value = profile.birthDate;
  form.elements.birthTime.value = profile.birthTime;
  form.elements.country.value = profile.country;
  form.elements.city.value = profile.city;
  form.elements.sign.value = profile.sign;
  form.elements.ascendant.value = profile.ascendant;
  $$('input[name="preferences"]', form).forEach(input => input.checked = profile.preferences.includes(input.value));
  updatePreview(profile);
  updateDashboard(profile);
  if (open) { $('#configurator').scrollIntoView({ behavior: 'smooth' }); showFormStep(2); }
  toast(`Profil ${name} chargé`, profile.symbol);
}

function updatePreview(profile) {
  $('#preview-sign').textContent = `${profile.symbol} ${profile.sign}`;
  $('#preview-ascendant').textContent = profile.ascendant;
  $('#preview-element').textContent = profile.element;
  $('#wheel-sign').textContent = profile.symbol;
  $('#wheel-name').textContent = profile.firstName.toUpperCase();
  const index = zodiac.findIndex(item => item.name === profile.sign);
  wheelRotation = index >= 0 ? -index * 30 : 0;
  applyWheelTransform();
}

function setupConfigurator() {
  buildWheel($('#zodiac-wheel'));
  fillFormOptions();
  $$('[data-next]').forEach(button => button.addEventListener('click', () => { const current = Number(button.closest('.form-step').dataset.step); if (validateStep(current)) showFormStep(Number(button.dataset.next)); }));
  $$('[data-back]').forEach(button => button.addEventListener('click', () => showFormStep(Number(button.dataset.back))));
  $$('[data-form-step]').forEach(button => button.addEventListener('click', () => showFormStep(Number(button.dataset.formStep))));
  $$('[data-preset]').forEach(button => button.addEventListener('click', () => applyPreset(button.dataset.preset)));
  $$('[data-demo]').forEach(button => button.addEventListener('click', () => applyPreset(button.dataset.demo, true)));

  $('#detail-range').addEventListener('input', event => $('#detail-output').value = ['Essentiel','Équilibré','Approfondi'][event.target.value - 1]);
  const liveCalculation = () => {
    const sign = $('#sun-sign').value === 'auto' ? getSunSign($('#birth-date').value) : zodiac.find(item => item.name === $('#sun-sign').value);
    const rising = $('#ascendant').value === 'auto' ? estimateAscendant($('#birth-date').value, $('#birth-time').value, $('#birth-city').value) : zodiac.find(item => item.name === $('#ascendant').value);
    if (sign && rising) updatePreview({ firstName: $('#first-name').value || 'Votre profil', sign: sign.name, symbol: sign.symbol, element: sign.element, ascendant: rising.name });
  };
  ['birth-date','birth-time','birth-city','sun-sign','ascendant'].forEach(id => $(`#${id}`).addEventListener('input', liveCalculation));

  $('#astro-form').addEventListener('submit', event => {
    event.preventDefault();
    if (!event.currentTarget.checkValidity()) return event.currentTarget.reportValidity();
    const button = $('.generate-button'); button.classList.add('loading'); button.disabled = true;
    setTimeout(() => {
      const profile = buildProfile(event.currentTarget);
      activeProfile = profile;
      state.profiles.unshift(profile); state.profiles = state.profiles.slice(0, 12);
      addHistory(state, `Signature de ${profile.firstName} générée`, 'profile');
      updatePreview(profile); updateDashboard(profile); renderProfiles(); renderHistory();
      button.classList.remove('loading'); button.disabled = false;
      toast(`Signature de ${profile.firstName} créée`, profile.symbol);
      $('#dashboard').scrollIntoView({ behavior: 'smooth' });
    }, 650);
  });
}

function applyWheelTransform() { $('#zodiac-wheel').style.transform = `scale(${wheelScale}) rotate(${wheelRotation}deg)`; }
function setupWheelControls() {
  $('#wheel-zoom-in').addEventListener('click', () => { wheelScale = Math.min(1.35, wheelScale + .1); applyWheelTransform(); });
  $('#wheel-zoom-out').addEventListener('click', () => { wheelScale = Math.max(.72, wheelScale - .1); applyWheelTransform(); });
  $('#wheel-reset').addEventListener('click', () => { wheelScale = 1; wheelRotation = 0; applyWheelTransform(); });
  const wrap = $('#wheel-wrap'); let dragging = false; let startX = 0; let startRotation = 0;
  wrap.addEventListener('pointerdown', event => { dragging = true; startX = event.clientX; startRotation = wheelRotation; wrap.setPointerCapture(event.pointerId); });
  wrap.addEventListener('pointermove', event => { if (dragging) { wheelRotation = startRotation + (event.clientX - startX) * .45; applyWheelTransform(); } });
  wrap.addEventListener('pointerup', () => dragging = false);
  wrap.addEventListener('wheel', event => { event.preventDefault(); wheelScale = Math.max(.72, Math.min(1.35, wheelScale + (event.deltaY < 0 ? .05 : -.05))); applyWheelTransform(); }, { passive: false });
}

function renderMap() {
  const markers = $('#map-markers');
  markers.innerHTML = countries.map(country => `<button class="map-marker ${country.id === activeCountry.id ? 'active' : ''}" style="left:${country.x}%;top:${country.y}%" type="button" data-country="${country.id}" aria-label="Sélectionner ${country.name}"><i></i><span>${country.name}</span></button>`).join('');
  $$('[data-country]', markers).forEach(button => button.addEventListener('click', () => selectCountry(button.dataset.country)));
}

function selectCountry(id) {
  activeCountry = countries.find(country => country.id === id) || countries[0];
  $('#destination-flag').textContent = activeCountry.flag;
  $('#destination-name').textContent = activeCountry.name;
  $('#destination-score').textContent = `${activeCountry.score}%`;
  $('#score-value').textContent = activeCountry.score;
  $('#score-progress').style.strokeDashoffset = 326.7 * (1 - activeCountry.score / 100);
  $('#destination-copy').textContent = activeCountry.copy;
  $('#destination-tags').innerHTML = activeCountry.tags.map(tag => `<span>${tag}</span>`).join('');
  $$('.map-marker').forEach(marker => marker.classList.toggle('active', marker.dataset.country === id));
}

function setupMap() {
  renderMap(); selectCountry('france');
  $('#map-reset').addEventListener('click', () => selectCountry('france'));
  $('#compare-destination').addEventListener('click', () => {
    if (!state.comparison.includes(activeCountry.id)) state.comparison.push(activeCountry.id);
    saveState(state); renderComparison();
    toast(`${activeCountry.name} ajoutée à la comparaison`, activeCountry.flag);
  });
}

function updateDashboard(profile) {
  $('#dash-name').textContent = profile.firstName;
  $('#dash-sign').textContent = `${profile.symbol} ${profile.sign} · Ascendant ${profile.ascendant}`;
  const recommendation = createRecommendation(profile, countries);
  $('#recommendation-title').textContent = recommendation.title;
  $('#recommendation-copy').textContent = recommendation.copy;
  $('#admin-profile-count').textContent = presetProfiles.length + state.profiles.length;
}

function renderActivity() {
  const entries = state.history.slice(0, 5);
  const fallback = [{label:'Profil Julia consulté',at:new Date().toISOString()},{label:'Canada ajouté aux favoris',at:new Date(Date.now()-3600000).toISOString()},{label:'Comparaison exportée',at:new Date(Date.now()-86400000).toISOString()}];
  $('#activity-list').innerHTML = (entries.length ? entries : fallback).map(item => `<div class="activity-item"><strong>${item.label}</strong><span>${new Date(item.at).toLocaleDateString('fr-FR',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</span></div>`).join('');
}

function iconForProfile(profile) {
  if (profile.icon) return `<img src="${profile.icon}" alt="">`;
  return `<span style="font-size:30px;text-align:center">${profile.symbol}</span>`;
}

function renderProfiles() {
  const all = [...state.profiles, ...presetProfiles];
  $('#profile-list').innerHTML = all.map(profile => `<article class="saved-profile">${iconForProfile(profile)}<div><h4>${profile.firstName} ${profile.lastName || ''}</h4><p>${profile.symbol} ${profile.sign} · ${profile.city || profile.country}</p></div><button type="button" data-open-profile="${profile.id}" aria-label="Ouvrir ${profile.firstName}">↗</button></article>`).join('');
  $$('[data-open-profile]').forEach(button => button.addEventListener('click', () => {
    const profile = all.find(item => item.id === button.dataset.openProfile); if (profile) { activeProfile = profile; updatePreview(profile); updateDashboard(profile); toast(`${profile.firstName} est maintenant actif`, profile.symbol); }
  }));
}

function renderComparison() {
  const query = ($('#country-search')?.value || '').toLowerCase();
  const minimum = Number($('#score-filter')?.value || 0);
  const visible = countries.filter(country => country.name.toLowerCase().includes(query) && country.score >= minimum);
  $('#comparison-grid').innerHTML = visible.map(country => `<label class="compare-card ${state.comparison.includes(country.id) ? 'selected' : ''}"><header><span>${country.flag}</span><input type="checkbox" value="${country.id}" ${state.comparison.includes(country.id) ? 'checked' : ''} aria-label="Comparer ${country.name}"></header><h4>${country.name}</h4><p>${country.tags.join(' · ')}</p><strong>${country.score}%</strong></label>`).join('');
  $('#compare-count').textContent = `${state.comparison.length} sélection${state.comparison.length > 1 ? 's' : ''}`;
  $$('#comparison-grid input').forEach(input => input.addEventListener('change', () => {
    state.comparison = input.checked ? [...new Set([...state.comparison,input.value])] : state.comparison.filter(id => id !== input.value);
    saveState(state); renderComparison();
  }));
}

function renderHistory() {
  $('#history-list').innerHTML = state.history.length ? state.history.map(item => `<article class="history-entry"><i>${item.type === 'profile' ? '✦' : '⌖'}</i><p>${item.label}<small>Action enregistrée localement</small></p><time datetime="${item.at}">${new Date(item.at).toLocaleString('fr-FR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}</time></article>`).join('') : '<p class="empty-state">Aucune activité enregistrée pour le moment.</p>';
  renderActivity();
}

function renderFavorites() {
  const items = state.favorites.map(id => id === 'Julia' || id === 'Sacha' ? { icon: id === 'Julia' ? '♊' : '♎', name:id,meta:'Profil astral' } : (() => { const country = countries.find(item => item.id === id); return country ? {icon:country.flag,name:country.name,meta:`Affinité ${country.score}%`} : null; })()).filter(Boolean);
  $('#favorites-list').innerHTML = items.length ? items.map(item => `<article class="favorite-item"><span>${item.icon}</span><p>${item.name}<small>${item.meta}</small></p></article>`).join('') : '<p class="empty-state">Utilisez le cœur sur un profil pour le retrouver ici.</p>';
}

function openPanel(name) {
  $$('[data-panel]').forEach(button => { if (button.closest('.dash-sidebar')) button.classList.toggle('active', button.dataset.panel === name); });
  $$('[data-dashboard]').forEach(panel => { const active = panel.dataset.dashboard === name; panel.hidden = !active; panel.classList.toggle('active', active); });
  if (name === 'profiles') renderProfiles(); if (name === 'compare') renderComparison(); if (name === 'history') renderHistory(); if (name === 'favorites') renderFavorites();
}

function setupDashboard() {
  $$('[data-panel]').forEach(button => button.addEventListener('click', () => openPanel(button.dataset.panel)));
  $('#country-search').addEventListener('input', renderComparison); $('#score-filter').addEventListener('change', renderComparison);
  $('#clear-history').addEventListener('click', () => { state.history = []; saveState(state); renderHistory(); toast('Historique effacé'); });
  $('#export-pdf').addEventListener('click', () => { addHistory(state,'Rapport PDF préparé','export'); toast('Fenêtre d’impression ouverte — choisissez “Enregistrer en PDF”','↓'); setTimeout(() => print(),300); });
  $('#export-excel').addEventListener('click', () => { exportExcel(state,countries); addHistory(state,'Comparaison Excel exportée','export'); toast('Export Excel téléchargé','↓'); });
  $('#import-json').addEventListener('click', () => $('#json-file').click());
  $('#json-file').addEventListener('change', event => {
    const file = event.target.files[0]; if (!file) return;
    const reader = new FileReader(); reader.onload = () => { try { const imported = JSON.parse(reader.result); const profiles = Array.isArray(imported) ? imported : imported.profiles; if (!Array.isArray(profiles)) throw new Error(); state.profiles = [...profiles,...state.profiles].slice(0,20); saveState(state); renderProfiles(); toast(`${profiles.length} profil(s) importé(s)`); } catch { toast('Fichier JSON non valide','!'); } }; reader.readAsText(file);
  });
  $('#motion-setting').checked = Boolean(state.reduceMotion);
  $('#motion-setting').addEventListener('change', event => { state.reduceMotion = event.target.checked; document.body.classList.toggle('reduce-motion',state.reduceMotion); saveState(state); });
  $('#notification-setting').addEventListener('change', async event => { if (!event.target.checked) return; const result = await requestNotifications(); if (result === 'granted') toast('Notifications activées'); else { event.target.checked = false; toast(result === 'unsupported' ? 'Notifications non prises en charge' : 'Autorisation non accordée','!'); } });
  $('#install-app').addEventListener('click', async () => { if (!installAvailable) return toast('Utilisez le menu du navigateur pour installer l’application','↗'); const installed = await installPWA(); toast(installed ? 'BonusBridge installé' : 'Installation annulée', installed ? '✓' : '!'); });
  renderProfiles(); renderComparison(); renderHistory(); renderFavorites(); updateDashboard(activeProfile);
}

function setupFavorites() {
  $$('.favorite').forEach(button => {
    const name = button.closest('[data-profile-card]').dataset.profileCard;
    button.classList.toggle('active', state.favorites.includes(name)); button.textContent = state.favorites.includes(name) ? '♥' : '♡';
    button.addEventListener('click', event => {
      event.stopPropagation(); const exists = state.favorites.includes(name);
      state.favorites = exists ? state.favorites.filter(item => item !== name) : [...state.favorites,name];
      saveState(state); button.classList.toggle('active',!exists); button.textContent = exists ? '♡' : '♥'; renderFavorites(); toast(exists ? `${name} retiré des favoris` : `${name} ajouté aux favoris`,exists ? '−' : '♥');
    });
  });
}

function setupFAQ() {
  $$('.faq-list button').forEach(button => button.addEventListener('click', () => {
    const article = button.closest('article'); const open = article.classList.contains('open');
    $$('.faq-list article').forEach(item => { item.classList.remove('open'); const control = $('button',item); control.setAttribute('aria-expanded','false'); $('span',control).textContent='+'; });
    if (!open) { article.classList.add('open'); button.setAttribute('aria-expanded','true'); $('span',button).textContent='−'; }
  }));
}

function setupSearch() {
  const dialog = $('#search-dialog'); const input = $('#global-search');
  const render = query => {
    const filtered = searchIndex.filter(item => `${item.title} ${item.description}`.toLowerCase().includes(query.toLowerCase()));
    $('#search-results').innerHTML = filtered.length ? filtered.map((item,index) => `<div class="search-result ${index===0?'active':''}" tabindex="0" data-search-index="${searchIndex.indexOf(item)}"><span>${item.icon}</span><p>${item.title}<small>${item.description}</small></p></div>`).join('') : '<div class="search-result"><p>Aucun résultat<small>Essayez “profil”, “destination” ou “admin”.</small></p></div>';
    $$('[data-search-index]').forEach(result => result.addEventListener('click', () => activateSearch(searchIndex[Number(result.dataset.searchIndex)])));
  };
  const open = () => { dialog.showModal(); input.value=''; render(''); setTimeout(() => input.focus(),20); };
  const activateSearch = item => { dialog.close(); if (item.target) $(item.target)?.scrollIntoView({behavior:'smooth'}); if (item.action) applyPreset(item.action,true); if (item.panel) { $('#dashboard').scrollIntoView({behavior:'smooth'}); openPanel(item.panel); } };
  $('#search-trigger').addEventListener('click',open); input.addEventListener('input',event=>render(event.target.value));
  addEventListener('keydown',event=>{ if ((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k') { event.preventDefault(); open(); } });
  dialog.addEventListener('click',event=>{ if(event.target===dialog) dialog.close(); });
}

function setupOffline() {
  setupPWA({ onOfflineChange: offline => { $('#offline-badge').hidden=!offline; if (offline) toast('Mode hors ligne activé','◌'); }, onInstallAvailable: available => installAvailable=available });
}

setupTheme();
setupNavigation();
setupMotion();
setupConfigurator();
setupWheelControls();
setupMap();
setupDashboard();
setupFavorites();
setupFAQ();
setupSearch();
setupOffline();
updatePreview(activeProfile);
