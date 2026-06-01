(function () {
  'use strict';

  /* ════════════════════════════════════════════════════════════════════
     CONFIG DATA-DRIVEN DES PANNEAUX DÉROULANTS (desktop + sous-menu mobile)
     ─────────────────────────────────────────────────────────────────────
     Pour AJOUTER UNE PAGE à un menu existant : ajouter un lien dans le
       groupe voulu ci-dessous. Rien d'autre à toucher.
     Pour AJOUTER UN NOUVEAU MENU déroulant : ajouter une clé ici, puis dans
       partials/header.html un <button data-nav-panel="ma-cle" ...> dans
       .nav-desktop (et son équivalent .menu-exp-btn côté mobile).
     Chaque entrée de lien : { label, href, small? }  (small → lien rapide).
     ════════════════════════════════════════════════════════════════════ */
  var NAV_PANELS = {
    expertises: {
      label: 'Expertises',
      groups: [
        {
          title: 'Domaines d’intervention',
          links: [
            { label: 'Droit administratif',      href: '/#expertises' },
            { label: 'Marchés publics',      href: '/#expertises' },
            { label: 'Urbanisme',                 href: '/#expertises' },
            { label: 'Contentieux administratif', href: '/#expertises' }
          ]
        },
        {
          title: 'Accompagnement dédié',
          links: [
            { label: 'Sécurité privée — CNAPS', href: '/cnaps', small: true },
            { label: 'Contester une OQTF',       href: '/contester-oqtf', small: true },
            { label: 'Effacement TAJ / B2',      href: '/effacement-taj-b2', small: true }
          ]
        }
      ]
    }
  };

  var FOCUSABLE = 'a[href], button:not([disabled])';

  var header      = document.querySelector('.site-header');
  var hero        = document.querySelector('.hero');
  var blurOverlay = document.querySelector('.page-blur-overlay');

  /* ── NAV BACKDROP : couche verre unique pour header + flyout ── */
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
      var onScroll = function () {
        var y = window.scrollY;
        var threshold = hero.offsetHeight - 52;
        if (y > threshold) {
          setScrollState('header-opaque');
        } else if (y > 30) {
          setScrollState('header-scrolled');
        } else {
          setScrollState(null);
        }
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
  }

  /* ════════════════════════════════════════════════════════════════════
     DESKTOP — Flyouts déroulants (style Apple, data-driven)
     ════════════════════════════════════════════════════════════════════ */
  var desktopBtns = [].slice.call(document.querySelectorAll('.nav-desktop [data-nav-panel]'));
  var flyouts = {};   // clé → élément .nav-flyout
  var btnByKey = {};  // clé → bouton déclencheur desktop

  function buildDesktopFlyout(key, cfg) {
    var flyout = document.createElement('div');
    flyout.className = 'nav-flyout';
    flyout.id = 'nav-flyout-' + key;
    flyout.setAttribute('role', 'region');
    flyout.setAttribute('aria-label', cfg.label);
    flyout.setAttribute('aria-hidden', 'true');

    var inner = document.createElement('div');
    inner.className = 'nav-flyout-inner';

    cfg.groups.forEach(function (group) {
      var g = document.createElement('div');
      g.className = 'nav-flyout-group';
      if (group.title) {
        var h = document.createElement('p');
        h.className = 'nav-flyout-group-title';
        h.textContent = group.title;
        g.appendChild(h);
      }
      var ul = document.createElement('ul');
      group.links.forEach(function (link) {
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.className = 'nav-flyout-link' + (link.small ? ' nav-flyout-link--sm' : '');
        a.href = link.href;
        a.textContent = link.label;
        a.addEventListener('click', function () { closeFlyout(false); });
        li.appendChild(a);
        ul.appendChild(li);
      });
      g.appendChild(ul);
      inner.appendChild(g);
    });

    flyout.appendChild(inner);
    return flyout;
  }

  var openKey = null;      // clé du flyout actuellement ouvert
  var lastTrigger = null;  // bouton à qui rendre le focus à la fermeture

  // Donne le focus sans laisser le navigateur faire défiler le conteneur :
  // .mobile-menu est en overflow:hidden et le slider repose sur un translateX.
  // Un focus() classique sur le bouton « retour » (hors-écran) ferait défiler
  // .mobile-menu horizontalement (scrollLeft=375) → le sous-panneau Expertises
  // se retrouve hors champ (panneau blanc). preventScroll empêche ça ; la
  // remise à zéro de scrollLeft couvre les navigateurs sans preventScroll.
  function focusNoScroll(el) {
    try { el.focus({ preventScroll: true }); }
    catch (e) { el.focus(); }
    if (mobileMenu) mobileMenu.scrollLeft = 0;
    if (panels) panels.scrollLeft = 0;
  }

  function openFlyout(key, trigger) {
    var fly = flyouts[key];
    if (!fly) return;

    var swapping = openKey && openKey !== key;
    if (swapping) {
      // Referme le précédent sans rejouer l'animation d'entrée du nouveau
      var prevFly = flyouts[openKey];
      var prevBtn = btnByKey[openKey];
      prevFly.classList.remove('open', 'no-anim');
      prevFly.setAttribute('aria-hidden', 'true');
      if (prevBtn) prevBtn.setAttribute('aria-expanded', 'false');
      fly.classList.add('no-anim');
    }

    fly.classList.add('open');
    fly.setAttribute('aria-hidden', 'false');
    trigger.setAttribute('aria-expanded', 'true');
    if (blurOverlay) blurOverlay.classList.add('active');
    navBackdrop.classList.add('mega-open');
    navBackdrop.style.height = (52 + fly.offsetHeight) + 'px';

    openKey = key;
    lastTrigger = trigger;

    var first = fly.querySelector(FOCUSABLE);
    if (first) first.focus();

    if (swapping) {
      requestAnimationFrame(function () { fly.classList.remove('no-anim'); });
    }
  }

  function closeFlyout(returnFocus) {
    if (!openKey) return;
    var fly = flyouts[openKey];
    var btn = btnByKey[openKey];
    var trigger = lastTrigger;

    fly.classList.remove('open', 'no-anim');
    fly.setAttribute('aria-hidden', 'true');
    if (btn) btn.setAttribute('aria-expanded', 'false');
    if (blurOverlay) blurOverlay.classList.remove('active');
    navBackdrop.classList.remove('mega-open');
    navBackdrop.style.height = '';

    openKey = null;
    lastTrigger = null;
    if (returnFocus && trigger) trigger.focus();
  }

  desktopBtns.forEach(function (btn) {
    var key = btn.getAttribute('data-nav-panel');
    var cfg = NAV_PANELS[key];
    if (!cfg) return;
    if (!flyouts[key]) {
      var fly = buildDesktopFlyout(key, cfg);
      if (header) header.appendChild(fly);
      flyouts[key] = fly;
      btnByKey[key] = btn;
    }
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      if (openKey === key) {
        closeFlyout(true);
      } else {
        openFlyout(key, btn);
      }
    });
  });

  if (blurOverlay) {
    blurOverlay.addEventListener('click', function () { closeFlyout(false); });
  }

  /* ════════════════════════════════════════════════════════════════════
     MOBILE — Burger, panneaux à deux niveaux
     ════════════════════════════════════════════════════════════════════ */
  var burger     = document.querySelector('.nav-burger');
  var mobileMenu = document.querySelector('.mobile-menu');
  var panels     = document.querySelector('.menu-panels');
  var subPanel   = document.querySelector('.menu-panel-exp');
  var expMobileBtn = document.querySelector('.menu-exp-btn[data-nav-panel]');
  var mobileBackBtn = null;

  // Génère le sous-panneau mobile depuis la config (bouton retour + liens à plat)
  if (subPanel && expMobileBtn) {
    var mobileKey = expMobileBtn.getAttribute('data-nav-panel');
    var mobileCfg = NAV_PANELS[mobileKey];
    if (mobileCfg) {
      mobileBackBtn = document.createElement('button');
      mobileBackBtn.className = 'back-btn';
      mobileBackBtn.setAttribute('aria-label', 'Retour au menu principal');
      var backChev = document.createElement('span');
      backChev.className = 'back-chevron';
      backChev.setAttribute('aria-hidden', 'true');
      mobileBackBtn.appendChild(backChev);
      subPanel.appendChild(mobileBackBtn);

      mobileCfg.groups.forEach(function (group) {
        group.links.forEach(function (link) {
          var a = document.createElement('a');
          a.href = link.href;
          a.textContent = link.label;
          if (link.small) a.className = 'nav-exp-cnaps';
          subPanel.appendChild(a);
        });
      });
    }
  }

  function showSub() {
    if (!panels) return;
    panels.classList.add('show-sub');
    if (expMobileBtn) expMobileBtn.setAttribute('aria-expanded', 'true');
    if (mobileBackBtn) focusNoScroll(mobileBackBtn);
  }

  function hideSub(returnFocus) {
    if (!panels) return;
    panels.classList.remove('show-sub');
    if (expMobileBtn) {
      expMobileBtn.setAttribute('aria-expanded', 'false');
      if (returnFocus) focusNoScroll(expMobileBtn);
    }
  }

  function closeMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    if (header) header.classList.remove('menu-open');
    navBackdrop.classList.remove('menu-open');
    if (burger) {
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Ouvrir le menu');
    }
    if (blurOverlay) blurOverlay.classList.remove('active');
    hideSub(false);
    document.body.style.overflow = '';
  }

  function openMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    if (header) header.classList.add('menu-open');
    navBackdrop.classList.add('menu-open');
    if (burger) {
      burger.setAttribute('aria-expanded', 'true');
      burger.setAttribute('aria-label', 'Fermer le menu');
    }
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

  if (expMobileBtn) {
    expMobileBtn.addEventListener('click', showSub);
  }
  if (mobileBackBtn) {
    mobileBackBtn.addEventListener('click', function () { hideSub(true); });
  }

  if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
  }

  /* ════════════════════════════════════════════════════════════════════
     CLAVIER — Échap (ferme flyout / menu) + piège de focus dans le flyout
     ════════════════════════════════════════════════════════════════════ */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (openKey) closeFlyout(true);
      if (mobileMenu && mobileMenu.classList.contains('open')) closeMenu();
      return;
    }

    if (e.key === 'Tab' && openKey) {
      var fly = flyouts[openKey];
      var items = [].slice.call(fly.querySelectorAll(FOCUSABLE));
      if (!items.length) return;
      var firstEl = items[0];
      var lastEl  = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }
  });

  /* ════════════════════════════════════════════════════════════════════
     BREAKPOINT — Au passage desktop ⇄ mobile, referme l'état du mode masqué
     (sinon overlay flou desktop ou scroll-lock mobile restent bloqués).
     ════════════════════════════════════════════════════════════════════ */
  var wasDesktop = window.innerWidth >= 901;
  window.addEventListener('resize', function () {
    var isDesktop = window.innerWidth >= 901;
    if (isDesktop === wasDesktop) return;
    wasDesktop = isDesktop;
    if (isDesktop) {
      // Passage en desktop : referme le menu mobile resté ouvert
      if (mobileMenu && mobileMenu.classList.contains('open')) closeMenu();
    } else {
      // Passage en mobile : referme le flyout desktop resté ouvert
      closeFlyout(false);
    }
  });

}());

/* ── Activation automatique du lien correspondant à la page courante ──
 * Ajoute la classe .active sur les liens de la nav qui correspondent à
 * l'URL actuelle. Évite d'avoir à dupliquer le HTML de la nav par page.
 */
(function () {
  var path = location.pathname.replace(/\/$/, '') || '/';
  var rules = [
    { match: /^\/parcours$/,           selector: '.nav-desktop a[href="/parcours"], .menu-panel-main a[href="/parcours"]' },
    { match: /^\/blog(\/.*)?$/,        selector: '.nav-desktop a[href="/blog"], .menu-panel-main a[href="/blog"]' },
    { match: /^\/cnaps$/,              selector: 'a[href="/cnaps"]' },
    { match: /^\/contester-oqtf$/,     selector: 'a[href="/contester-oqtf"]' },
    { match: /^\/effacement-taj-b2$/,  selector: 'a[href="/effacement-taj-b2"]' },
    { match: /^\/mentions-legales$/,   selector: '.footer-bar a[href="/mentions-legales"]', cls: 'footer-active' }
  ];
  rules.forEach(function (r) {
    if (!r.match.test(path)) return;
    var className = r.cls || 'active';
    document.querySelectorAll(r.selector).forEach(function (el) {
      el.classList.add(className);
    });
  });
}());
