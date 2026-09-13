/* ── head-init.js ───────────────────────────────────────────────────────
 * Fusion de 3 scripts de tête (axeptio-init.js + scroll-init.js +
 * gtag-init.js) en un seul fichier, pour économiser 2 requêtes bloquantes
 * dans le <head> de chaque page. Ordre d'exécution préservé à l'identique
 * (important pour le Consent Mode Google : les defaults de consentement
 * doivent être posés avant que le SDK gtag externe (chargé en async plus
 * bas dans le <head>) ne traite la file d'attente dataLayer).
 * ──────────────────────────────────────────────────────────────────── */

/* ── Axeptio (cookie consent) — initialisation ────────────────────────
 * Externalisé du HTML pour permettre une CSP sans 'unsafe-inline'.
 */
window.axeptioSettings = {
  clientId: "69b7369ad57f3d304eeef408",
  cookiesVersion: "d758b774-bf79-4f54-812a-fa89e32aff9c",
};
(function(d, s) {
  var t = d.getElementsByTagName(s)[0], e = d.createElement(s);
  e.async = true;
  e.src = "https://static.axept.io/sdk.js";
  t.parentNode.insertBefore(e, t);
})(document, "script");

/* ── Contrôle du widget flottant Axeptio ──────────────────────────────
 * Le widget est masqué par CSS (#axeptio_overlay > div { display:none }).
 * On l'affiche en JS (display:block inline) uniquement : (1) au 1er passage
 * tant qu'aucun consentement n'est enregistré, (2) à la demande via le lien
 * "Gérer les cookies" du footer. Réouverture du panneau via openCookies().
 */
window._axcb = window._axcb || [];
window._axcb.push(function (sdk) {
  function host() {
    var o = document.getElementById("axeptio_overlay");
    if (!o) return null;
    for (var i = 0; i < o.children.length; i++) {
      if (o.children[i].shadowRoot) return o.children[i];
    }
    return null;
  }
  // display:block en !important : la feuille de style du SDK pose une règle
  // de même spécificité qui sinon l'emporte sur notre masquage.
  function show() { var h = host(); if (h) { h.style.setProperty("display", "block", "important"); return true; } return false; }
  function hide() { var h = host(); if (h) h.style.removeProperty("display"); }

  // 1er passage (consentement non finalisé) : afficher le bandeau dès qu'il
  // est monté. Le SDK pose très tôt un cookie axeptio_cookies avec
  // $$completed:false — on se base donc sur le flag $$completed, pas sur la
  // simple présence du cookie. (Si on bump cookiesVersion → re-consentement,
  // $$completed repasse à false et le bandeau se réaffiche.)
  function consentDone() { return /%22\$\$completed%22:true/.test(document.cookie); }
  if (!consentDone()) {
    var n = 0, iv = setInterval(function () {
      if (consentDone()) { clearInterval(iv); hide(); return; }
      if (show() || ++n > 80) clearInterval(iv);
    }, 40);
  }

  sdk.on("cookies:complete", function () { hide(); });

  document.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest("[data-axeptio-open]") : null;
    if (!t) return;
    e.preventDefault();
    show();
    sdk.openCookies();
  });
});

/* ── Reset scroll position au chargement ──────────────────────────────
 * Externalisé du HTML pour permettre une CSP sans 'unsafe-inline'.
 */
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

/* ── Google tag (gtag.js) — Google Ads AW-18364175365 ──────────────────
 * Externalisé du HTML pour permettre une CSP sans 'unsafe-inline'
 * (même contrainte que ci-dessus).
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
