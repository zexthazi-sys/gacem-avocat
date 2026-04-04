/* ── FAQ Accordéon ── */
(function () {
  const questions = document.querySelectorAll('.faq-question');
  questions.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      const answerId = btn.getAttribute('aria-controls');
      const answer = document.getElementById(answerId);

      /* Fermer tous les autres */
      questions.forEach(function (other) {
        if (other !== btn) {
          other.setAttribute('aria-expanded', 'false');
          const otherId = other.getAttribute('aria-controls');
          const otherAnswer = document.getElementById(otherId);
          if (otherAnswer) otherAnswer.classList.remove('open');
        }
      });

      /* Basculer l'état courant */
      btn.setAttribute('aria-expanded', String(!expanded));
      if (answer) {
        if (expanded) {
          answer.classList.remove('open');
        } else {
          answer.classList.add('open');
        }
      }
    });
  });
})();
