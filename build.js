#!/usr/bin/env node
/**
 * build.js — Gacem Avocat
 * Lit les fichiers Markdown dans /posts/, génère :
 *   - /blog/[slug].html         pour chaque article
 *   - /posts/index.json         pour blog.html
 *   - /sitemap.xml              mis à jour
 *   - Réécrit aussi les pages statiques pour injecter :
 *       - les partials header/footer/contact (factorisation HTML)
 *       - les versions centralisées des assets (cache-busting unifié)
 */

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const matter = require('gray-matter');
const { marked } = require('marked');

// ── Config ────────────────────────────────────────────────────────────────────
const SITE_URL   = 'https://www.gacem-avocat.com';
const POSTS_DIR  = path.join(__dirname, 'posts');
const BLOG_DIR   = path.join(__dirname, 'blog');
const PARTIALS_DIR = path.join(__dirname, 'partials');

// ── Versions centralisées des assets ──────────────────────────────────────────
// Pour invalider le cache d'un fichier après modification, augmenter sa valeur
// ici (et seulement ici). Build.js propage la nouvelle version dans toutes les
// pages HTML en remplaçant les markers __V_*__.
const VERSIONS = {
  STYLE_CSS:     67,   // /css/style.css
  NAV_CSS:        8,   // /css/nav.css
  ARTICLE_CSS:    3,   // /css/article.css
  BLOG_CSS:       1,   // /css/blog.css
  LANDING_CSS:    2,   // /css/landing.css (socle partagé landing pages)
  PARCOURS_CSS:   1,   // /css/parcours.css
  ML_CSS:         1,   // /css/mentions-legales.css
  NAV_JS:         8,   // /js/nav.js
  SCROLL_REVEAL_JS: 2, // /js/scroll-reveal.js
  PAGE_TRANSITION_JS: 1,
  SPLASH_JS:      1,
  CAROUSEL_JS:    3,
  FAQ_JS:         1,
  AXEPTIO_JS:     2,
  SCROLL_INIT_JS: 1,
};

// ── Partials (HTML factorisés) ────────────────────────────────────────────────
// Chargés une fois au démarrage. Modifier un partial = modifier toutes les pages
// au prochain build.
const PARTIALS = {
  header:           fs.readFileSync(path.join(PARTIALS_DIR, 'header.html'), 'utf-8').trim(),
  'contact-section':fs.readFileSync(path.join(PARTIALS_DIR, 'contact-section.html'), 'utf-8').trim(),
  footer:           fs.readFileSync(path.join(PARTIALS_DIR, 'footer.html'), 'utf-8').trim(),
};

// Remplace tous les markers <!-- @partial NAME --> ... <!-- /@partial --> par le
// contenu du partial correspondant. Idempotent (peut être rejoué).
function injectPartials(html) {
  return html.replace(
    /<!-- @partial ([\w-]+) -->[\s\S]*?<!-- \/@partial -->/g,
    function (_, name) {
      if (!PARTIALS[name]) {
        console.warn(`⚠️  Partial inconnu : "${name}" — laissé tel quel`);
        return `<!-- @partial ${name} -->\n<!-- PARTIAL "${name}" INTROUVABLE -->\n<!-- /@partial -->`;
      }
      return `<!-- @partial ${name} -->\n${PARTIALS[name]}\n<!-- /@partial -->`;
    }
  );
}

// Remplace les markers __V_XXX__ par la valeur centralisée dans VERSIONS.
function applyVersions(html) {
  return html.replace(/__V_([A-Z_]+)__/g, function (full, key) {
    if (typeof VERSIONS[key] === 'undefined') {
      console.warn(`⚠️  Version inconnue : "${key}" — marker laissé tel quel`);
      return full;
    }
    return String(VERSIONS[key]);
  });
}

// ── Last-mod date helper ─────────────────────────────────────────────────────
// Priorité : 1) date du dernier commit git, 2) mtime du fichier, 3) aujourd'hui.
// Évite que toutes les URLs du sitemap aient la date du build, ce qui faisait
// croire à Google que toutes les pages avaient été modifiées en même temps.
function getLastModDate(absPath) {
  // 1) Git
  try {
    const rel = path.relative(__dirname, absPath);
    const out = execSync(`git log -1 --format=%cs -- "${rel}"`, {
      cwd: __dirname,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(out)) return out;
  } catch (_) { /* fallback */ }

  // 2) mtime
  try {
    const stat = fs.statSync(absPath);
    return stat.mtime.toISOString().slice(0, 10);
  } catch (_) { /* fallback */ }

  // 3) Aujourd'hui
  return new Date().toISOString().slice(0, 10);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const MONTHS_FR = [
  'janvier','février','mars','avril','mai','juin',
  'juillet','août','septembre','octobre','novembre','décembre'
];
function formatDateFr(dateStr) {
  if (!dateStr) return '';
  // gray-matter peut retourner un objet Date ou une string ISO/YYYY-MM-DD
  let d;
  if (dateStr instanceof Date) {
    d = dateStr;
  } else {
    const s = String(dateStr);
    d = s.includes('T') ? new Date(s) : new Date(s + 'T12:00:00Z');
  }
  if (isNaN(d.getTime())) return String(dateStr);
  return `${d.getUTCDate()} ${MONTHS_FR[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Article HTML template ─────────────────────────────────────────────────────
function articleTemplate(slug, data, bodyHtml, allPosts = []) {
  const titleEsc   = escHtml(data.title);
  const descEsc    = escHtml(data.description);
  const dateFr     = formatDateFr(data.date);
  const catEsc     = escHtml(data.category);
  const canonUrl   = `${SITE_URL}/blog/${slug}`;

  // Articles connexes — 3 derniers articles hors article courant
  const related = allPosts
    .filter(p => p.slug !== slug)
    .slice(0, 3);
  const relatedHtml = related.length === 0 ? '' : `
        <aside class="related-articles" aria-label="Articles connexes">
          <h2 class="related-title">À lire aussi</h2>
          <ul class="related-list">
${related.map(p => `            <li><a href="/blog/${p.slug}"><span class="related-category">${escHtml(p.category || '')}</span><span class="related-link-title">${escHtml(p.title)}</span></a></li>`).join('\n')}
          </ul>
        </aside>`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <!-- Axeptio — doit être le premier script du head -->
  <script src="/js/axeptio-init.js?v=__V_AXEPTIO_JS__"><\/script>
  <script src="/js/scroll-init.js?v=__V_SCROLL_INIT_JS__"><\/script>
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
  <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
  <meta name="theme-color" content="#1a1a2e">
  <link rel="preconnect" href="https://static.axept.io" crossorigin>
  <link rel="preload" href="/assets/fonts/raleway-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/css/style.css?v=__V_STYLE_CSS__">
  <link rel="stylesheet" href="/css/nav.css?v=__V_NAV_CSS__">
  <link rel="stylesheet" href="/css/article.css?v=__V_ARTICLE_CSS__">
  <title>${titleEsc} — Gacem Avocat</title>
  <meta name="description" content="${descEsc}">
  <link rel="canonical" href="${canonUrl}">
  <!-- Open Graph -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="${canonUrl}">
  <meta property="og:title" content="${titleEsc} — Gacem Avocat">
  <meta property="og:description" content="${descEsc}">
  <meta property="og:image" content="https://www.gacem-avocat.com/assets/og-image.webp">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:locale" content="fr_FR">
  <meta property="og:site_name" content="Gacem Avocat">
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${titleEsc} — Gacem Avocat">
  <meta name="twitter:description" content="${descEsc}">
  <meta name="twitter:image" content="https://www.gacem-avocat.com/assets/og-image.webp">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "headline": ${JSON.stringify(data.title)},
        "datePublished": ${JSON.stringify(data.date instanceof Date ? data.date.toISOString().slice(0,10) : String(data.date || '').slice(0,10))},
        "author": { "@type": "Person", "name": "Hakim Gacem", "@id": "https://www.gacem-avocat.com/#hakim-gacem" },
        "publisher": { "@type": "Organization", "name": "Gacem Avocat", "logo": { "@type": "ImageObject", "url": "https://www.gacem-avocat.com/assets/logo-gacem-avocat.svg" } },
        "description": ${JSON.stringify(data.description)},
        "url": ${JSON.stringify(canonUrl)},
        "mainEntityOfPage": ${JSON.stringify(canonUrl)},
        "image": "https://www.gacem-avocat.com/assets/og-image.webp",
        "inLanguage": "fr-FR",
        "articleSection": ${JSON.stringify(data.category || 'Droit public')}
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://www.gacem-avocat.com/" },
          { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://www.gacem-avocat.com/blog" },
          { "@type": "ListItem", "position": 3, "name": ${JSON.stringify(data.title)}, "item": ${JSON.stringify(canonUrl)} }
        ]
      }
    ]
  }
  </script>
</head>
<body>

<!-- @partial header -->
<!-- /@partial -->

  <main id="main" tabindex="-1">
    <header class="article-header">
      <div class="article-header-inner">
        <a href="/blog" class="article-back">&larr; Blog</a>
        <div class="article-meta">
          <span class="article-category-badge">${catEsc}</span>
          <span class="article-date-badge">${dateFr}</span>
        </div>
        <h1>${titleEsc}</h1>
        <p class="article-intro">${escHtml(data.excerpt)}</p>
      </div>
    </header>

    <article class="article-body reveal">
      <div class="article-content">
        ${bodyHtml}
${relatedHtml}
        <div class="article-cta reveal">
          <p>Vous avez une question sur cet article ou souhaitez être accompagné&nbsp;?</p>
          <a href="/#contact" class="cta-btn">Prendre contact</a>
        </div>
      </div>
    </article>
  </main>

  <div class="back-to-blog">
    <a href="/blog">&larr; Retour au blog</a>
  </div>

<!-- @partial footer -->
<!-- /@partial -->

<script src="/js/nav.js?v=__V_NAV_JS__"><\/script>
<script src="/js/scroll-reveal.js?v=__V_SCROLL_REVEAL_JS__"><\/script>
<script src="/js/page-transition.js?v=__V_PAGE_TRANSITION_JS__"><\/script>
</body>
</html>`;
}

// ── Main ──────────────────────────────────────────────────────────────────────
console.log('🔨 Build — Gacem Avocat');

if (!fs.existsSync(BLOG_DIR)) fs.mkdirSync(BLOG_DIR, { recursive: true });

const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
if (files.length === 0) { console.log('  Aucun article trouvé dans /posts/'); }

// ── Passe 1 : lire tous les MD et collecter les données ─────────────────────
const rawPosts = files.map(file => {
  const slug    = file.replace('.md', '');
  const raw     = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8');
  const { data, content } = matter(raw);
  const bodyHtml = marked.parse(content);

  const rawDate = data.date;
  const dateStr = rawDate instanceof Date
    ? rawDate.toISOString().slice(0, 10)
    : String(rawDate || '').slice(0, 10);

  return { slug, data, bodyHtml, dateStr };
});

// Trier par date décroissante AVANT génération (pour que "Articles connexes" récupère les + récents)
rawPosts.sort((a, b) => new Date(b.dateStr) - new Date(a.dateStr));

// Liste légère pour passer aux templates (évite de fuir tout le bodyHtml)
const allPosts = rawPosts.map(r => ({
  slug: r.slug,
  title: r.data.title || '',
  category: r.data.category || '',
  date: r.dateStr,
}));

// ── Passe 2 : générer le HTML de chaque article ──────────────────────────────
const posts = [];
for (const r of rawPosts) {
  let html = articleTemplate(r.slug, r.data, r.bodyHtml, allPosts);
  // Injecter partials + propager les versions des assets
  html = applyVersions(injectPartials(html));
  const outPath = path.join(BLOG_DIR, `${r.slug}.html`);
  fs.writeFileSync(outPath, html, 'utf-8');
  console.log(`  ✓ /blog/${r.slug}.html`);

  posts.push({
    slug:        r.slug,
    title:       r.data.title       || '',
    date:        r.dateStr,
    dateFr:      formatDateFr(r.dateStr || new Date().toISOString().slice(0,10)),
    category:    r.data.category    || '',
    description: r.data.description || '',
    excerpt:     r.data.excerpt     || '',
  });
}

// Générer /posts/index.json
const indexPath = path.join(POSTS_DIR, 'index.json');
fs.writeFileSync(indexPath, JSON.stringify(posts, null, 2), 'utf-8');
console.log('  ✓ /posts/index.json');

// Injecter le listing dans blog.html (rendu statique)
const blogHtmlPath = path.join(__dirname, 'blog.html');
let blogHtml = fs.readFileSync(blogHtmlPath, 'utf-8');

const articlesHtml = posts.length === 0
  ? '<p class="error-state">Aucun article pour le moment.</p>'
  : posts.map((p, i) => `
        <a href="/blog/${p.slug}" class="article-card reveal reveal-delay-${Math.min(i + 1, 4)}" role="listitem">
          <div class="article-card-meta">
            <span class="article-date">${escHtml(p.dateFr)}</span>
            <span class="article-category">${escHtml(p.category)}</span>
          </div>
          <div class="article-card-body">
            <h2 class="article-card-title">${escHtml(p.title)}</h2>
            <p class="article-card-excerpt">${escHtml(p.excerpt)}</p>
            <span class="article-read-more">Lire l\u2019article \u2192</span>
          </div>
        </a>`).join('\n');

const articlesPattern = /<!-- BUILD:ARTICLES -->[\s\S]*?<!-- \/BUILD:ARTICLES -->/;
if (!articlesPattern.test(blogHtml)) {
  console.error('❌ ERREUR : markers <!-- BUILD:ARTICLES --> introuvables dans blog.html');
  console.error('   Le build est interrompu pour éviter de déployer un blog vide.');
  process.exit(1);
}
blogHtml = blogHtml.replace(
  articlesPattern,
  '<!-- BUILD:ARTICLES -->\n' + articlesHtml + '\n        <!-- /BUILD:ARTICLES -->'
);

// blog.html contient déjà les markers @partial header/contact-section/footer,
// on les remplace ici avant d'écrire.
blogHtml = applyVersions(injectPartials(blogHtml));

fs.writeFileSync(blogHtmlPath, blogHtml, 'utf-8');
console.log('  ✓ blog.html (listing statique)');

// ── Pages statiques : injection partials + versions ──────────────────────────
// Toutes les pages HTML à la racine contiennent des markers <!-- @partial ... -->
// et __V_*__. Build.js les transforme à chaque exécution.
const STATIC_PAGES = ['index.html', 'cnaps.html', 'contester-oqtf.html', 'effacement-taj-b2.html', 'parcours.html', 'mentions-legales.html', '404.html'];
STATIC_PAGES.forEach(function (filename) {
  const filepath = path.join(__dirname, filename);
  if (!fs.existsSync(filepath)) {
    console.warn(`  ⚠️  ${filename} introuvable, ignoré`);
    return;
  }
  let html = fs.readFileSync(filepath, 'utf-8');
  html = injectPartials(html);
  html = applyVersions(html);
  fs.writeFileSync(filepath, html, 'utf-8');
  console.log(`  ✓ ${filename} (partials + versions injectés)`);
});

// Générer sitemap.xml — chaque URL reçoit la date du dernier commit du fichier
// source. La page /blog reçoit la date du post le plus récent (puisque c'est ce
// qui change réellement quand on publie un article).
const lastModIndex   = getLastModDate(path.join(__dirname, 'index.html'));
const lastModCnaps   = getLastModDate(path.join(__dirname, 'cnaps.html'));
const lastModOqtf    = getLastModDate(path.join(__dirname, 'contester-oqtf.html'));
const lastModTajB2   = getLastModDate(path.join(__dirname, 'effacement-taj-b2.html'));
const lastModML      = getLastModDate(path.join(__dirname, 'mentions-legales.html'));
const lastModParc    = getLastModDate(path.join(__dirname, 'parcours.html'));

// Pour /blog, on prend max(date du fichier blog.html source, date la plus récente parmi les posts)
const blogFileDate = getLastModDate(path.join(__dirname, 'blog.html'));
const latestPostDate = posts.length > 0
  ? posts.map(p => p.date).sort().reverse()[0]
  : blogFileDate;
const lastModBlog = [blogFileDate, latestPostDate].sort().reverse()[0];

const articleEntries = posts.map(p => {
  const mdPath = path.join(POSTS_DIR, `${p.slug}.md`);
  const lastMod = getLastModDate(mdPath);
  return `
  <url>
    <loc>${SITE_URL}/blog/${p.slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.7</priority>
  </url>`;
}).join('');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${lastModIndex}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>

  <url>
    <loc>${SITE_URL}/cnaps</loc>
    <lastmod>${lastModCnaps}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>${SITE_URL}/contester-oqtf</loc>
    <lastmod>${lastModOqtf}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>${SITE_URL}/effacement-taj-b2</loc>
    <lastmod>${lastModTajB2}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>${SITE_URL}/mentions-legales</loc>
    <lastmod>${lastModML}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>

  <url>
    <loc>${SITE_URL}/parcours</loc>
    <lastmod>${lastModParc}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>${SITE_URL}/blog</loc>
    <lastmod>${lastModBlog}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
${articleEntries}
</urlset>
`;
fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemap, 'utf-8');
console.log('  ✓ sitemap.xml');
console.log(`\n✅ Build terminé — ${posts.length} article(s) généré(s)`);
