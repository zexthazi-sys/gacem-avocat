(function () {
  var capsules = document.querySelectorAll('.exp-capsule');
  capsules.forEach(function (capsule) {
    var grid    = capsule.querySelector('.exp-grid, .cnaps-grid');
    var nav     = capsule.nextElementSibling;
    if (!grid || !nav) return;
    var prevBtn = nav.querySelector('.exp-nav-prev');
    var nextBtn = nav.querySelector('.exp-nav-next');
    var dots    = nav.querySelectorAll('.exp-dot');

    if (!prevBtn || !nextBtn) return;

    function cardStep() {
      var card = grid.querySelector('.exp-card, .cnaps-card');
      if (!card) return grid.clientWidth;
      var gap = parseFloat(window.getComputedStyle(grid).gap) || 10;
      return card.offsetWidth + gap;
    }

    function activeIndex() {
      var step = cardStep();
      if (!step) return 0;
      return Math.round(grid.scrollLeft / step);
    }

    function updateDots(idx) {
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === idx);
      });
    }

    function updateButtons() {
      var left    = Math.round(grid.scrollLeft);
      var maxLeft = Math.round(grid.scrollWidth - grid.clientWidth);
      prevBtn.disabled = left <= 0;
      nextBtn.disabled = left >= maxLeft;
      updateDots(activeIndex());
    }

    prevBtn.addEventListener('click', function () {
      grid.scrollBy({ left: -cardStep(), behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', function () {
      grid.scrollBy({ left: cardStep(), behavior: 'smooth' });
    });

    grid.addEventListener('scroll', updateButtons, { passive: true });

    updateButtons();
    window.addEventListener('resize', updateButtons, { passive: true });
  });
}());
