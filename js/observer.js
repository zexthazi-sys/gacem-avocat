/* ── Active section tracking ── */
(function() {
  const sections = ['cabinet', 'expertises', 'parcours', 'contact'];
  const navMap = {
    'cabinet':    document.querySelector('.nav-links-main a[href="#cabinet"]'),
    'expertises': document.querySelector('.nav-exp-toggle'),
    'parcours':   document.querySelector('.nav-links-main a[href="/parcours"]'),
    'contact':    document.querySelector('.nav-links-main a[href="#contact"]')
  };
  if (!window.IntersectionObserver) return;
  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      const id = entry.target.id;
      const el = navMap[id];
      if (!el) return;
      if (entry.isIntersecting) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
  }, { rootMargin: '-30% 0px -60% 0px' });
  sections.forEach(function(id) {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
})();
