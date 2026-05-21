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
