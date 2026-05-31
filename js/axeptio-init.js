/* ── Axeptio (cookie consent) — initialisation ────────────────────────
 * Doit être chargé en premier dans le <head> de chaque page.
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
