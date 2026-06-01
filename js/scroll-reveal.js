/* ── Scroll Reveal ── */
(function () {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.IntersectionObserver) return;

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  els.forEach(function (el) {
    observer.observe(el);
  });

  /* Carrousels horizontaux : révéler tout le groupe quand le carrousel entre
     verticalement dans le viewport. Les cartes hors-écran horizontalement ne
     déclenchent jamais l'observer individuel (IO peu fiable dans un conteneur
     à scroll horizontal, notamment sur iOS Safari) → elles resteraient à
     opacity:0 une fois atteintes. */
  const carousels = document.querySelectorAll('.exp-grid, .lp-grid');
  carousels.forEach(function (grid) {
    const cards = grid.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    if (!cards.length) return;
    const groupObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        cards.forEach(function (card) {
          card.classList.add('revealed');
          observer.unobserve(card);
        });
        groupObserver.unobserve(entry.target);
      });
    }, { threshold: 0.1 });
    groupObserver.observe(grid);
  });

  // Fallback : révéler les éléments déjà visibles au chargement
  setTimeout(function () {
    els.forEach(function (el) {
      if (el.classList.contains('revealed')) return;
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('revealed');
        observer.unobserve(el);
      }
    });
  }, 100);
})();
