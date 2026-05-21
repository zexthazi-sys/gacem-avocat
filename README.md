# Gacem Avocat — Site

Site vitrine du cabinet d'avocat Hakim Gacem (droit public, Paris).

## Stack technique

- **HTML/CSS/JS vanille** — pas de framework JavaScript
- **build.js** (Node.js) — petit générateur statique :
  - Transforme les articles Markdown (`/posts/*.md`) en pages HTML (`/blog/*.html`)
  - Injecte les partials (header, footer, contact) dans toutes les pages
  - Propage les versions centralisées des assets (cache-busting)
  - Régénère `sitemap.xml` avec les dates réelles de modification (`git log`)
- **Decap CMS** (`/admin`) — interface d'édition du blog, auth GitHub OAuth
- **Vercel** — hébergement + déploiement automatique au push GitHub

## Structure du projet

```
/
├── index.html, cnaps.html, parcours.html, blog.html,
│   mentions-legales.html, 404.html    ← Pages sources (avec markers @partial)
├── partials/
│   ├── header.html                    ← Navigation + menu mobile (commun)
│   ├── contact-section.html           ← Bloc Contact (commun)
│   └── footer.html                    ← Footer bar copyright (commun)
├── css/
│   ├── style.css                      ← Styles globaux + variables CSS
│   ├── nav.css                        ← Navigation (header, mega-menu, burger)
│   ├── article.css                    ← Pages d'articles de blog
│   ├── blog.css                       ← Page liste blog
│   ├── cnaps.css                      ← Page CNAPS
│   ├── parcours.css                   ← Page Parcours
│   └── mentions-legales.css           ← Page Mentions légales
├── js/
│   ├── nav.js                         ← Comportement nav (scroll, burger, menu)
│   ├── splash.js                      ← Écran d'introduction (home uniquement)
│   ├── scroll-reveal.js               ← Animations au scroll
│   ├── page-transition.js             ← Fondu lors des navigations internes
│   ├── carousel.js                    ← Carousel d'expertises
│   ├── faq.js                         ← Accordéon FAQ (CNAPS uniquement)
│   ├── observer.js                    ← Mise à jour nav active selon section visible
│   ├── axeptio-init.js                ← Initialisation cookies (Axeptio)
│   └── scroll-init.js                 ← Reset scroll au chargement
├── posts/                             ← Articles sources (.md) — édités via Decap
├── blog/                              ← Articles HTML générés par build.js
├── assets/                            ← Images, polices, og-image
├── admin/                             ← Decap CMS (édition blog en ligne)
├── api/                               ← Endpoints OAuth GitHub pour Decap
├── build.js                           ← Générateur statique
├── package.json
├── vercel.json                        ← Config Vercel (cache, sécurité, redirections)
├── robots.txt
└── sitemap.xml                        ← Régénéré par build.js
```

## Installation locale

```bash
# Installer Node.js (si pas déjà fait) : https://nodejs.org/
npm install                  # installe gray-matter + marked
npm run build                # génère articles + sitemap + injecte partials
python3 -m http.server 8000  # ou n'importe quel serveur HTTP statique
# Ouvrir http://localhost:8000
```

## Déployer

Le déploiement est automatique : tout `git push` sur `main` déclenche un build Vercel.
Le build exécute :
```
git fetch --unshallow    # récupère l'historique git complet (pour sitemap)
npm install
npm run build            # node build.js
```

Pas besoin de tester localement avant chaque push (Vercel build l'environnement de zéro).
Si le build Vercel échoue, l'ancienne version reste en ligne.

## Workflow quotidien

### Ajouter un article de blog
**Option 1 — Recommandée** : via Decap CMS
1. Aller sur https://www.gacem-avocat.com/admin
2. Se connecter avec GitHub
3. Cliquer sur "New post"

**Option 2 — Manuelle** : créer un `.md` dans `/posts/`
1. Voir le format dans `BLOG_GUIDE.md`
2. Commiter et pousser → Vercel régénère le site

### Modifier la navigation
Modifier `partials/header.html`. Le changement s'applique à TOUTES les pages au prochain build.

### Modifier le contact (téléphone, email, adresse)
Modifier `partials/contact-section.html`. Pareil — propagé partout.

### Modifier le footer (copyright)
Modifier `partials/footer.html`.

### Invalider le cache d'un fichier CSS/JS
Les CSS et JS sont mis en cache **1 an** par les navigateurs. Pour forcer la mise à jour :
1. Ouvrir `build.js`
2. Trouver l'objet `VERSIONS` en haut du fichier
3. Augmenter la version du fichier modifié (ex: `STYLE_CSS: 62` → `STYLE_CSS: 63`)
4. Commiter et pousser

Build.js propage automatiquement la nouvelle version dans toutes les pages.

## Sécurité

- **CSP** (Content-Security-Policy) configurée dans `vercel.json` — bloque les scripts inline non whitelistés
- **HSTS** activé (2 ans, includeSubDomains, preload)
- **Authentification GitHub OAuth** pour `/admin` via Vercel Functions (`/api/auth.js`, `/api/callback.js`)
- **Variables d'environnement** : `GITHUB_CLIENT_ID` et `GITHUB_CLIENT_SECRET` à configurer dans le dashboard Vercel

## Aide à l'édition

- `BLOG_GUIDE.md` — comment écrire un article en Markdown
- `GUIDE_ADMIN.md` — comment utiliser Decap CMS
- Cette doc — vue d'ensemble du projet

## Pour reprendre la main rapidement

Si tu reviens sur le projet après une longue pause :
1. Lis ce README en entier
2. Regarde `build.js` (~400 lignes commentées)
3. Vérifie que `npm run build` tourne sans erreur en local
4. Push une petite modif pour valider que Vercel build encore correctement
