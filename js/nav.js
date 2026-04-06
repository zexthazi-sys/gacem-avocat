(function () {
  'use strict';

  var header = document.querySelector('.site-header');
  var hero   = document.querySelector('.hero');

  /* ── SCROLL : transparence sur homepage uniquement ── */
  if (header) {
    if (!hero) {
      /* Sous-pages : toujours opaque, couleurs foncées */
      header.classList.add('header-opaque');
    } else {
      function onScroll() {
        var y = window.scrollY;
        var threshold = hero.offsetHeight - 52;
        if (y > threshold) {
          /* Sur fond blanc : fond clair + texte foncé */
          header.classList.remove('header-scrolled');
          header.classList.add('header-opaque');
        } else if (y > 30) {
          /* Début de scroll sur hero : flou discret, texte blanc */
          header.classList.remove('header-opaque');
          header.classList.add('header-scrolled');
        } else {
          /* En haut : transparent */
          header.classList.remove('header-opaque');
          header.classList.remove('header-scrolled');
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
  }

  function openMegaMenu() {
    if (!megaMenu) return;
    megaMenu.classList.add('open');
    if (blurOverlay) blurOverlay.classList.add('active');
    if (expBtn) expBtn.setAttribute('aria-expanded', 'true');
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
    if (burger) burger.setAttribute('aria-expanded', 'false');
    if (blurOverlay) blurOverlay.classList.remove('active');
    if (panels) panels.classList.remove('show-sub');
    document.body.style.overflow = '';
  }

  function openMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add('open');
    if (header) header.classList.add('menu-open');
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
