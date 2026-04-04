(function () {
  const site = document.getElementById('site');

  /* ── Respect prefers-reduced-motion ── */
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    if (site) site.style.opacity = '1';
    document.documentElement.classList.remove('splash-active');
    return;
  }

  /* ── Détection du contexte d'arrivée ── */
  const navEntry = performance && performance.getEntriesByType &&
                   performance.getEntriesByType('navigation')[0];
  const isReload = navEntry && navEntry.type === 'reload';
  const isExternal = !document.referrer ||
                     document.referrer.indexOf(location.hostname) === -1;

  /* ── sessionStorage : skip uniquement si navigation interne ── */
  if (!isReload && !isExternal && sessionStorage.getItem('gacem_intro_done')) {
    if (site) site.style.opacity = '1';
    document.documentElement.classList.remove('splash-active');
    return;
  }
  sessionStorage.setItem('gacem_intro_done', '1');

  /* ── Timings (ms) ──
     Phase 1 · 0           : overlay visible (fond #1a1a2e)
     Phase 2 · 1000ms      : logo apparaît (opacity fade-in)
     Phase 3 · 2200ms      : cercles s'agrandissent (2.2s)
     Phase 4 · 4200ms      : fondu de sortie + site révélé
     Phase 5 · 5300ms      : nettoyage DOM
     Mobile : timings × 4/6 (plus rapide)
  ── */
  const mobile = window.innerWidth < 768;
  const s      = mobile ? 4 / 6 : 1;

  const T_LOGO_SHOW     = Math.round(1000  * s);
  const T_CIRCLES_START = Math.round(2200  * s);
  const CIRCLE_DUR      = Math.round(2200  * s) + 'ms';
  const T_FADE_START    = Math.round(4200  * s);
  const T_REMOVE        = Math.round(5300  * s);

  /* ── Création de l'overlay ── */
  const overlay = document.createElement('div');
  overlay.id  = 'intro-overlay';
  overlay.innerHTML =
    '<div class="intro-logo"><strong>Gacem</strong><span> Avocat</span></div>' +
    '<div class="intro-circle intro-circle-tl"></div>' +
    '<div class="intro-circle intro-circle-br"></div>';
  document.body.insertBefore(overlay, document.body.firstChild);
  document.body.style.overflow = 'hidden';

  const logo    = overlay.querySelector('.intro-logo');
  const circles = overlay.querySelectorAll('.intro-circle');

  /* ── Phase 2 : logo apparaît ── */
  setTimeout(function () {
    logo.style.opacity = '1';
  }, T_LOGO_SHOW);

  /* ── Phase 3 : expansion des cercles + logo passe en noir ── */
  setTimeout(function () {
    [].forEach.call(circles, function (c) {
      c.style.webkitTransition = 'transform ' + CIRCLE_DUR + ' cubic-bezier(0.76,0,0.24,1)';
      c.style.transition       = 'transform ' + CIRCLE_DUR + ' cubic-bezier(0.76,0,0.24,1)';
      c.style.webkitTransform  = 'scale(25)';
      c.style.transform        = 'scale(25)';
    });
    /* Logo passe en bleu-nuit quand le blanc envahit l'écran */
    setTimeout(function () { logo.classList.add('dark'); }, Math.round(parseInt(CIRCLE_DUR) * 0.35));
  }, T_CIRCLES_START);

  /* ── Phase 4 : fondu de sortie + révélation du site ── */
  setTimeout(function () {
    overlay.classList.add('intro-fade');
    if (site) site.style.opacity = '1';
  }, T_FADE_START);

  /* ── Phase 5 : nettoyage DOM ── */
  setTimeout(function () {
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    document.body.style.overflow = '';
    document.documentElement.classList.remove('splash-active');
  }, T_REMOVE);
}());
