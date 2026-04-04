(function () {
  const nav = document.querySelector('nav');
  const hero = document.querySelector('.hero');
  if (!nav || !hero) return;
  function onScroll() {
    const threshold = hero.offsetHeight - nav.offsetHeight;
    const y = window.scrollY;
    if (y > threshold) {
      nav.classList.remove('nav-blurred');
      nav.classList.add('nav-scrolled');
    } else if (y > 30) {
      nav.classList.remove('nav-scrolled');
      nav.classList.add('nav-blurred');
    } else {
      nav.classList.remove('nav-scrolled');
      nav.classList.remove('nav-blurred');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}());


/* ── Burger Menu ── */
(function() {
  const burger = document.querySelector('.nav-burger');
  const nav = document.querySelector('nav');
  const links = document.querySelector('.nav-links');
  if (!burger || !links) return;
  function toggleMenu(open) {
    links.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    nav.classList.toggle('nav-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (!open) {
      const s = document.querySelector('.nav-exp-sub');
      const t = document.querySelector('.nav-exp-toggle');
      if (s) s.classList.remove('open');
      if (t) t.setAttribute('aria-expanded', 'false');
      burger.focus();
    }
  }
  burger.addEventListener('click', function() { toggleMenu(!links.classList.contains('open')); });
  links.querySelectorAll('a').forEach(function(a) {
    a.addEventListener('click', function() { toggleMenu(false); });
  });

  /* Expertises sub-menu toggle */
  const expToggle = document.querySelector('.nav-exp-toggle');
  const expSub = document.querySelector('.nav-exp-sub');
  if (expToggle && expSub) {
    expToggle.addEventListener('click', function() {
      const open = expSub.classList.toggle('open');
      expToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
})();
