/* BonusBridge — interactions, progressive enhancement and accessibility */
(() => {
  'use strict';

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Sticky navigation and scroll state.
  const header = $('#header');
  const backToTop = $('.back-to-top');
  const updateScrollState = () => {
    const scrolled = window.scrollY > 24;
    header.classList.toggle('scrolled', scrolled);
    backToTop.classList.toggle('visible', window.scrollY > 700);
  };
  updateScrollState();
  window.addEventListener('scroll', updateScrollState, { passive: true });
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' }));

  // Mobile menu with proper focus/escape behavior.
  const menuButton = $('.menu-toggle');
  const mobileMenu = $('#mobile-menu');
  const closeMenu = () => {
    menuButton.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Ouvrir le menu');
    mobileMenu.hidden = true;
  };
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    if (open) closeMenu();
    else {
      menuButton.classList.add('open');
      menuButton.setAttribute('aria-expanded', 'true');
      menuButton.setAttribute('aria-label', 'Fermer le menu');
      mobileMenu.hidden = false;
      $('a', mobileMenu).focus();
    }
  });
  $$('a', mobileMenu).forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !mobileMenu.hidden) {
      closeMenu();
      menuButton.focus();
    }
  });

  // Entrance reveals.
  const revealElements = $$('.reveal');
  if ('IntersectionObserver' in window && !reducedMotion) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -45px' });
    revealElements.forEach(element => revealObserver.observe(element));
  } else revealElements.forEach(element => element.classList.add('in-view'));

  // Navigation section highlighting.
  const navLinks = $$('.desktop-nav a');
  const linkedSections = navLinks.map(link => $(link.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
        }
      });
    }, { rootMargin: '-35% 0px -55%', threshold: 0 });
    linkedSections.forEach(section => sectionObserver.observe(section));
  }

  // Subtle hero parallax, disabled for touch and reduced motion.
  const parallaxCard = $('[data-parallax]');
  const heroVisual = $('.hero-visual');
  if (parallaxCard && matchMedia('(pointer:fine)').matches && !reducedMotion) {
    heroVisual.addEventListener('mousemove', event => {
      const rect = heroVisual.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      parallaxCard.style.transform = `perspective(1000px) rotateY(${x * 3.5}deg) rotateX(${y * -3.5}deg) translateY(-2px)`;
    });
    heroVisual.addEventListener('mouseleave', () => { parallaxCard.style.transform = ''; });
  }

  // Animated numeric counters.
  const counters = $$('.counter');
  const animateCounter = element => {
    const target = Number(element.dataset.target);
    const duration = 1700;
    const start = performance.now();
    const format = value => target >= 10000 ? Math.floor(value).toLocaleString('fr-FR') : Math.floor(value).toString();
    const tick = now => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      element.textContent = format(target * eased);
      if (progress < 1) requestAnimationFrame(tick);
      else element.textContent = target.toLocaleString('fr-FR');
    };
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window && !reducedMotion) {
    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: .6 });
    counters.forEach(counter => counterObserver.observe(counter));
  } else counters.forEach(counter => { counter.textContent = Number(counter.dataset.target).toLocaleString('fr-FR'); });

  // Accessible accordion: one answer open at a time.
  $$('.faq-item button').forEach(button => {
    button.addEventListener('click', () => {
      const item = button.closest('.faq-item');
      const willOpen = !item.classList.contains('open');
      $$('.faq-item').forEach(otherItem => {
        otherItem.classList.remove('open');
        const otherButton = $('button', otherItem);
        otherButton.setAttribute('aria-expanded', 'false');
        $('span', otherButton).textContent = '+';
      });
      if (willOpen) {
        item.classList.add('open');
        button.setAttribute('aria-expanded', 'true');
        $('span', button).textContent = '−';
      }
    });
  });

  // Demo comparison simulator.
  const form = $('#comparison-form');
  const compareButton = $('.compare-button');
  const results = $('#results');
  const resultsGrid = $('#results-grid');
  const originSelect = $('#origin');
  const destinationSelect = $('#destination');

  const countryFlags = {
    'France': '🇫🇷', 'Canada': '🇨🇦', 'Belgique': '🇧🇪', 'Suisse': '🇨🇭',
    'Royaume-Uni': '🇬🇧', 'Australie': '🇦🇺', 'USA': '🇺🇸'
  };

  const insurers = [
    { name: 'Maple Insurance', initials: 'MI', rating: '★★★★★', price: 108, saving: 1280, color: 'linear-gradient(145deg,#e44f55,#aa2232)', best: true, docs: 'Relevé + permis' },
    { name: 'NorthStar Cover', initials: 'NS', rating: '★★★★★', price: 119, saving: 1135, color: 'linear-gradient(145deg,#397fee,#1646a7)', best: false, docs: 'Attestation traduite' },
    { name: 'Horizon Assurances', initials: 'HA', rating: '★★★★☆', price: 127, saving: 980, color: 'linear-gradient(145deg,#39b698,#187862)', best: false, docs: 'Relevé d’information' }
  ];

  const renderResults = () => {
    const years = Math.max(0, Number($('#years').value) || 0);
    const bonus = Math.max(0, Number($('#bonus').value) || 0);
    const age = Math.max(18, Number($('#age').value) || 18);
    const adjustment = Math.max(-12, Math.min(18, (8 - years) * 1.2 + (35 - age) * .3 - (bonus - 35) * .18));
    resultsGrid.innerHTML = insurers.map((insurer, index) => {
      const price = Math.max(64, Math.round(insurer.price + adjustment + index * 2));
      const saving = Math.max(420, Math.round(insurer.saving + years * 13 + bonus * 3));
      return `<article class="result-card ${insurer.best ? 'best' : ''}">
        ${insurer.best ? '<span class="best-label">Meilleur choix</span>' : ''}
        <div class="result-brand"><span class="result-logo" style="background:${insurer.color}">${insurer.initials}</span><div><h4>${insurer.name}</h4><span class="stars" aria-label="${insurer.rating === '★★★★★' ? '5' : '4'} étoiles">${insurer.rating}</span></div></div>
        <div class="result-price"><span>Prime mensuelle estimée</span><strong>${price} $ <small>/ mois</small></strong></div>
        <div class="result-details"><div><span>Bonus reconnu</span><b class="yes">✓ Oui, intégralement</b></div><div><span>Documents</span><b>${insurer.docs}</b></div><div><span>Délai estimé</span><b>${2 + index} jours</b></div></div>
        <div class="result-saving">↘ Économie estimée : ${saving.toLocaleString('fr-FR')} $ / an</div>
      </article>`;
    }).join('');
    $('#route-pill').textContent = `${countryFlags[originSelect.value] || '🌍'} ${originSelect.value} → ${countryFlags[destinationSelect.value] || '🌍'} ${destinationSelect.value}`;
    results.hidden = false;
    requestAnimationFrame(() => results.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' }));
  };

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.checkValidity()) return form.reportValidity();
    compareButton.classList.add('loading');
    compareButton.disabled = true;
    compareButton.setAttribute('aria-label', 'Comparaison en cours');
    window.setTimeout(() => {
      compareButton.classList.remove('loading');
      compareButton.disabled = false;
      compareButton.removeAttribute('aria-label');
      renderResults();
    }, reducedMotion ? 100 : 1100);
  });

  $('#swap-countries').addEventListener('click', () => {
    const origin = originSelect.value;
    const destination = destinationSelect.value;
    const destinationCanAcceptOrigin = [...destinationSelect.options].some(option => option.value === origin);
    const originCanAcceptDestination = [...originSelect.options].some(option => option.value === destination);
    if (destinationCanAcceptOrigin) destinationSelect.value = origin;
    if (originCanAcceptDestination) originSelect.value = destination;
  });
})();
