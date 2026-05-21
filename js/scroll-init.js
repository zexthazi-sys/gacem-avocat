/* ── Reset scroll position au chargement ──────────────────────────────
 * Externalisé du HTML pour permettre une CSP sans 'unsafe-inline'.
 */
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);
