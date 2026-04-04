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
