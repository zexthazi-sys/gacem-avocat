/* ── Active section tracking ── */
(function() {
  var sections = ['cabinet', 'expertises', 'parcours', 'contact'];
  var navMap = {
    'cabinet':    document.querySelector('.nav-desktop a[href="#cabinet"]'),
    'expertises': document.querySelector('.nav-exp-btn'),
    'parcours':   document.querySelector('.nav-desktop a[href="/parcours"]'),
    'contact':    document.querySelector('.nav-desktop a[href="#contact"]')
  };
  if (!window.IntersectionObserver) return;
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      var id = entry.target.id;
      var el = navMap[id];
      if (!el) return;
      if (entry.isIntersecting) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
  }, { rootMargin: '-30% 0px -60% 0px' });
  sections.forEach(function(id) {
    var el = document.getElementById(id);
    if (el) observer.observe(el);
  });
})();
