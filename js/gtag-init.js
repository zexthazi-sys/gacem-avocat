/* ── Google tag (gtag.js) — Google Ads AW-18364175365 ──────────────────
 * Externalisé du HTML pour permettre une CSP sans 'unsafe-inline'
 * (même contrainte que axeptio-init.js).
 * Consent Mode v2 : tout refusé par défaut tant qu'Axeptio n'a pas
 * enregistré de consentement (wait_for_update laisse 500ms à Axeptio
 * pour pousser sa décision si elle est déjà connue — visiteur récurrent).
 */
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  wait_for_update: 500,
});
gtag('js', new Date());
gtag('config', 'AW-18364175365');
