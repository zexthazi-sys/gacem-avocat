// Désactiver la restauration automatique du scroll par le navigateur
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
// Forcer le scroll en haut au chargement
window.scrollTo(0, 0);
