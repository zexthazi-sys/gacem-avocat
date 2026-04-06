(function () {
  'use strict';

  var header = document.querySelector('.site-header');
  var hero   = document.querySelector('.hero');

  /* ── NAV BACKDROP : couche verre unique pour header + mega-menu ── */
  var navBackdrop = document.createElement('div');
  navBackdrop.className = 'nav-backdrop';
  document.body.insertBefore(navBackdrop, document.body.firstChild);

  function setScrollState(state) {
    navBackdrop.classList.remove('header-scrolled', 'header-opaque');
    if (state) navBackdrop.classList.add(state);
    if (header) {
      header.classList.remove('header-scrolled', 'header-opaque');
      if (state) header.classList.add(state);
    }
  }

  /* ── SCROLL : transparence sur homepage uniquement ── */
  if (header) {
    if (!hero) {
      /* Sous-pages : toujours opaque, couleurs foncées */
      setScrollState('header-opaque');
    } else {
      function onScroll() {
        var y = window.scrollY;
        var threshold = hero.offsetHeight - 52;
        if (y > threshold) {
          setScrollState('header-opaque');
        } else if (y > 30) {
          setScrollState('header-scrolled');
        } else {
          setScrollState(null);
        }
      }
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
  }

  /* ── DESKTOP : Mega-menu Expertises ── */
  var expBtn     = document.querySelector('.nav-exp-btn');
  var megaMenu   = document.querySelector('.mega-menu');
  var blurOverlay = document.querySelector('.page-blur-overlay');

  function closeMegaMenu() {
    if (!megaMenu) return;
    megaMenu.classList.remove('open');
    if (blurOverlay) blurOverlay.classList.remove('active');
    if (expBtn) expBtn.setAttribute('aria-expanded', 'false');
    navBackdrop.classList.remove('mega-open');
    navBackdrop.style.height = '';
  }

  function openMegaMenu() {
    if (!megaMenu) return;
    megaMenu.classList.add('open');
    if (blurOverlay) blurOverlay.classList.add('active');
    if (expBtn) expBtn.setAttribute('aria-expanded', 'true');
    navBackdrop.classList.add('mega-open');
    navBackdrop.style.height = (52 + megaMenu.offsetHeight) + 'px';
  }

  if (expBtn && megaMenu) {
    var closeTimer;

    function scheduleClose() {
      closeTimer = setTimeout(closeMegaMenu, 120);
    }
    function cancelClose() {
      clearTimeout(closeTimer);
    }

    expBtn.addEventListener('mouseenter', function () {
      cancelClose();
      openMegaMenu();
    });
    expBtn.addEventListener('mouseleave', scheduleClose);

    megaMenu.addEventListener('mouseenter', cancelClose);
    megaMenu.addEventListener('mouseleave', scheduleClose);

    if (blurOverlay) blurOverlay.addEventListener('click', closeMegaMenu);

    megaMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMegaMenu);
    });
  }

  /* ── MOBILE : Burger & panneaux ── */
  var burger     = document.querySelector('.nav-burger');
  var mobileMenu = document.querySelector('.mobile-menu');
  var panels     = document.querySelector('.menu-panels');
  var expMobileBtn = document.querySelector('.menu-exp-btn');
  var backBtn    = document.querySelector('.back-btn');

  function closeMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('open');
    if (header) header.classList.remove('menu-open');
    navBackdrop.classList.remove('menu-open');
    if (burger) burger.setAttribute('aria-expanded', 'false');
    if (blurOverlay) blurOverlay.classList.remove('active');
    if (panels) panels.classList.remove('show-sub');
    document.body.style.overflow = '';
  }

  function openMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add('open');
    if (header) header.classList.add('menu-open');
    navBackdrop.classList.add('menu-open');
    if (burger) burger.setAttribute('aria-expanded', 'true');
    if (blurOverlay) blurOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  if (burger) {
    burger.addEventListener('click', function () {
      if (mobileMenu && mobileMenu.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  if (expMobileBtn && panels) {
    expMobileBtn.addEventListener('click', function () {
      panels.classList.add('show-sub');
    });
  }

  if (backBtn && panels) {
    backBtn.addEventListener('click', function () {
      panels.classList.remove('show-sub');
    });
  }

  if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
  }

  /* ── Touche Escape ── */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeMegaMenu();
      closeMenu();
    }
  });

}());
