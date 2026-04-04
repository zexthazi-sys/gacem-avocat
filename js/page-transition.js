/* ── Page Transition — fondu de sortie sur les liens internes ── */
(function () {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.addEventListener('click', function (e) {
    var link = e.target.closest('a');
    if (!link) return;

    // Ignorer : externe, nouvel onglet, ancre, mailto, tel, javascript
    var href = link.getAttribute('href');
    if (!href) return;
    if (link.target === '_blank') return;
    if (href.charAt(0) === '#') return;
    if (href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0 || href.indexOf('javascript:') === 0) return;

    // Ignorer les liens externes
    if (link.hostname && link.hostname !== location.hostname) return;

    // Ignorer les ancres sur la même page (ex: /#contact depuis index)
    if (href.indexOf('#') !== -1) {
      var parts = href.split('#');
      var path = parts[0] || '/';
      if (path === location.pathname || path === location.pathname + '.html') return;
    }

    e.preventDefault();
    document.body.classList.add('page-exit');
    setTimeout(function () {
      window.location.href = href;
    }, 200);
  });
})();
