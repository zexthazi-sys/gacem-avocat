#!/usr/bin/env node
/**
 * build.js — Gacem Avocat
 * Lit les fichiers Markdown dans /posts/, génère :
 *   - /blog/[slug].html  pour chaque article
 *   - /posts/index.json  pour blog.html
 *   - /sitemap.xml       mis à jour
 */

const fs   = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

// ── Config ────────────────────────────────────────────────────────────────────
const SITE_URL   = 'https://www.gacem-avocat.com';
const POSTS_DIR  = path.join(__dirname, 'posts');
const BLOG_DIR   = path.join(__dirname, 'blog');

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
function articleTemplate(slug, data, bodyHtml) {
  const titleEsc   = escHtml(data.title);
  const descEsc    = escHtml(data.description);
  const dateFr     = formatDateFr(data.date);
  const catEsc     = escHtml(data.category);
  const canonUrl   = `${SITE_URL}/blog/${slug}`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <!-- Axeptio — doit être le premier script du head -->
  <script>
  window.axeptioSettings = {
    clientId: "69b7369ad57f3d304eeef408",
    cookiesVersion: "d758b774-bf79-4f54-812a-fa89e32aff9c",
  };
  (function(d, s) {
    var t = d.getElementsByTagName(s)[0], e = d.createElement(s);
    e.async = true; e.src = "//static.axept.io/sdk.js";
    t.parentNode.insertBefore(e, t);
  })(document, "script");
  <\/script>
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
  <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192.png">
  <link rel="apple-touch-icon" sizes="192x192" href="/favicon-192.png">
  <title>${titleEsc} &mdash; Gacem Avocat</title>
  <meta name="description" content="${descEsc}">
  <link rel="canonical" href="${canonUrl}">
  <!-- Open Graph -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="${canonUrl}">
  <meta property="og:title" content="${titleEsc} &mdash; Gacem Avocat">
  <meta property="og:description" content="${descEsc}">
  <meta property="og:image" content="https://www.gacem-avocat.com/assets/og-image.webp">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:locale" content="fr_FR">
  <meta property="og:site_name" content="Gacem Avocat">
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${titleEsc} &mdash; Gacem Avocat">
  <meta name="twitter:description" content="${descEsc}">
  <meta name="twitter:image" content="https://www.gacem-avocat.com/assets/og-image.webp">
  <style>
    /* Raleway — auto-hébergé */
    @font-face {
      font-family: 'Raleway';
      font-style: normal;
      font-weight: 100 600;
      font-display: swap;
      src: url('/assets/fonts/raleway-cyrillic-ext.woff2') format('woff2');
      unicode-range: U+0460-052F, U+1C80-1C8A, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F;
    }
    @font-face {
      font-family: 'Raleway';
      font-style: normal;
      font-weight: 100 600;
      font-display: swap;
      src: url('/assets/fonts/raleway-cyrillic.woff2') format('woff2');
      unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
    }
    @font-face {
      font-family: 'Raleway';
      font-style: normal;
      font-weight: 100 600;
      font-display: swap;
      src: url('/assets/fonts/raleway-vietnamese.woff2') format('woff2');
      unicode-range: U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB;
    }
    @font-face {
      font-family: 'Raleway';
      font-style: normal;
      font-weight: 100 600;
      font-display: swap;
      src: url('/assets/fonts/raleway-latin-ext.woff2') format('woff2');
      unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
    }
    @font-face {
      font-family: 'Raleway';
      font-style: normal;
      font-weight: 100 600;
      font-display: swap;
      src: url('/assets/fonts/raleway-latin.woff2') format('woff2');
      unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
    }
  </style>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": ${JSON.stringify(data.title)},
    "datePublished": ${JSON.stringify(data.date)},
    "author": { "@type": "Person", "name": "Hakim Gacem" },
    "publisher": { "@type": "Organization", "name": "Gacem Avocat" },
    "description": ${JSON.stringify(data.description)}
  }
  </script>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
    :focus-visible { outline: 2px solid #bdc9be; outline-offset: 3px; }
    html { -webkit-text-size-adjust: 100%; text-size-adjust: 100%; scroll-behavior: smooth; }
    body { font-family: 'Raleway', sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; overflow-x: hidden; }
    :root {
      --bleu-ardoise: #2d3f5c; --bleu-fonce: #2c3e50; --bleu-nuit: #1a1a2e;
      --vert-sauge: #bdc9be; --blanc: #ffffff; --noir: #000000;
      --degrade: radial-gradient(ellipse 160% 160% at 100% 100%, #6b4f6e 0%, #3d2f4a 40%, #2b2338 70%, #221e30 100%);
    }
    nav {
      position: -webkit-sticky; position: sticky; top: 0; z-index: 50;
      display: flex; align-items: center; justify-content: space-between;
      padding: 18px 48px; background: var(--blanc);
      border-bottom: 1px solid rgba(45,63,92,0.08);
    }
    .nav-logo { font-weight: 400; font-size: 20px; letter-spacing: 0.15em; color: var(--bleu-nuit); text-decoration: none; }
    .nav-logo span { font-weight: 200; }
    .nav-links { display: flex; gap: 32px; align-items: center; }
    .nav-links a { font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--bleu-ardoise); text-decoration: none; font-weight: 400; position: relative; transition: color 0.2s; }
    .nav-links a:hover { color: var(--bleu-nuit); }
    .nav-links a.active { color: var(--bleu-nuit); }
    .nav-links a:not(.nav-blog)::after { content: ''; position: absolute; left: 0; bottom: -3px; width: 100%; height: 1px; background: var(--bleu-ardoise); transform: scaleX(0); transform-origin: left center; transition: transform 0.28s ease; }
    .nav-links a:not(.nav-blog):hover::after, .nav-links a:not(.nav-blog).active::after { transform: scaleX(1); }
    .nav-blog { display: inline-flex; align-items: center; border: 1px solid rgba(45,63,92,0.22); border-radius: 20px; padding: 5px 12px; background: rgba(45,63,92,0.04); white-space: nowrap; transition: color 0.2s, background 0.25s, border-color 0.25s; }
    .nav-blog::after { content: '  ↗'; font-size: 9px; vertical-align: 1px; }
    .nav-blog:hover { background: rgba(45,63,92,0.09); border-color: rgba(45,63,92,0.4); }
    .nav-blog.active { background: rgba(45,63,92,0.1); border-color: rgba(45,63,92,0.4); }
    .article-header { background: var(--degrade); padding: 88px 64px 72px; }
    .article-header-inner { max-width: 720px; }
    .article-back { display: inline-block; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(255,255,255,0.4); text-decoration: none; font-weight: 400; margin-bottom: 36px; transition: color 0.2s; }
    .article-back:hover { color: rgba(255,255,255,0.8); }
    .article-meta { display: flex; gap: 20px; margin-bottom: 24px; align-items: center; }
    .article-category-badge { font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--vert-sauge); font-weight: 400; }
    .article-date-badge { font-size: 10px; letter-spacing: 0.1em; color: rgba(255,255,255,0.35); font-weight: 400; }
    .article-header h1 { font-size: clamp(24px, 3.5vw, 38px); font-weight: 300; color: var(--blanc); line-height: 1.3; letter-spacing: 0.02em; margin-bottom: 20px; }
    .article-intro { font-weight: 300; font-size: 15px; line-height: 1.9; color: rgba(255,255,255,0.6); max-width: 600px; }
    .article-body { padding: 72px 64px 88px; background: var(--blanc); }
    .article-content { max-width: 720px; }
    .article-content h2 { font-size: clamp(18px, 2.2vw, 24px); font-weight: 400; color: var(--bleu-nuit); margin-top: 56px; margin-bottom: 20px; padding-left: 20px; border-left: 2px solid var(--vert-sauge); line-height: 1.3; }
    .article-content h3 { font-size: 14px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: var(--bleu-ardoise); margin-top: 36px; margin-bottom: 14px; }
    .article-content p { font-size: 15px; font-weight: 400; line-height: 1.95; color: var(--bleu-fonce); margin-bottom: 20px; }
    .article-content ul, .article-content ol { padding-left: 0; margin-bottom: 20px; list-style: none; }
    .article-content ul li, .article-content ol li { font-size: 15px; font-weight: 400; line-height: 1.9; color: var(--bleu-fonce); padding-left: 20px; position: relative; margin-bottom: 10px; }
    .article-content ul li::before { content: '—'; position: absolute; left: 0; color: var(--vert-sauge); font-weight: 400; }
    .article-content ol { counter-reset: ol-counter; }
    .article-content ol li { counter-increment: ol-counter; }
    .article-content ol li::before { content: counter(ol-counter) '.'; position: absolute; left: 0; color: var(--vert-sauge); font-weight: 400; font-size: 13px; }
    .callout { background: #f0f2f4; border-left: 3px solid var(--vert-sauge); padding: 24px 28px; margin: 36px 0; }
    .callout p { font-size: 14px; font-weight: 400; line-height: 1.85; color: var(--bleu-ardoise); margin-bottom: 0; }
    .callout strong { font-weight: 500; color: var(--bleu-nuit); }
    .article-cta { margin-top: 64px; padding-top: 48px; border-top: 1px solid rgba(45,63,92,0.1); display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 24px; }
    .article-cta p { font-size: 14px; font-weight: 400; color: #6b7a8d; margin-bottom: 0; }
    .cta-btn { display: inline-block; padding: 13px 32px; border: 1px solid var(--bleu-ardoise); color: var(--bleu-ardoise); font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; font-weight: 400; text-decoration: none; transition: all 0.3s; }
    .cta-btn:hover { background: var(--bleu-ardoise); color: var(--blanc); }
    .back-to-blog { padding: 32px 64px; background: #f0f2f4; border-top: 1px solid rgba(45,63,92,0.06); }
    .back-to-blog a { font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--bleu-ardoise); text-decoration: none; font-weight: 400; transition: color 0.2s; }
    .back-to-blog a:hover { color: var(--bleu-nuit); }
    footer { padding: 24px 64px; background: var(--noir); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
    footer span, footer a { font-size: 10px; color: rgba(255,255,255,0.55); letter-spacing: 0.1em; font-weight: 400; text-decoration: none; transition: color 0.2s; }
    footer a:hover { color: rgba(255,255,255,0.8); }
    @media (max-width: 768px) {
      nav { padding: 16px 20px; } .nav-logo { font-size: 16px; } .nav-links { gap: 12px; } .nav-links a { font-size: 10px; } .nav-blog { padding: 4px 8px; }
      .article-header { padding: 60px 20px 48px; } .article-body { padding: 48px 20px 60px; }
      .back-to-blog { padding: 24px 20px; } footer { padding: 20px; justify-content: center; text-align: center; }
    }
    @media (max-width: 480px) {
      .nav-links a { font-size: 9px; letter-spacing: 0.06em; } .nav-blog { padding: 3px 7px; }
      .article-header { padding: 48px 16px 40px; } .article-body { padding: 40px 16px 48px; }
    }
  </style>
</head>
<body>

  <!-- BANDEAU TRAVAUX — à supprimer -->
  <div style="background:#f5c518;color:#1a1a1a;text-align:center;padding:9px 20px;font-family:'Raleway',sans-serif;font-size:11px;font-weight:500;letter-spacing:0.15em;text-transform:uppercase;">
    🚧 &nbsp;Site en cours de construction — merci de votre patience
  </div>
  <!-- /BANDEAU TRAVAUX -->
  <nav>
    <a href="/" class="nav-logo">Gacem <span>Avocat</span></a>
    <div class="nav-links">
      <a href="/#cabinet">Cabinet</a>
      <a href="/#expertises">Expertises</a>
      <a href="/#parcours">Parcours</a>
      <a href="/#contact">Contact</a>
      <a href="/blog" class="active nav-blog">Blog</a>
    </div>
  </nav>

  <main>
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

    <article class="article-body">
      <div class="article-content">
        ${bodyHtml}
        <div class="article-cta">
          <p>Vous avez une question sur cet article ou souhaitez &ecirc;tre accompagn&eacute;&nbsp;?</p>
          <a href="/#contact" class="cta-btn">Prendre contact</a>
        </div>
      </div>
    </article>
  </main>

  <div class="back-to-blog">
    <a href="/blog">&larr; Retour au blog</a>
  </div>

  <footer>
    <span>&copy; 2026 Gacem Avocat &middot; Tous droits r&eacute;serv&eacute;s</span>
    <a href="/mentions-legales">Mentions l&eacute;gales</a>
  </footer>

</body>
</html>`;
}

// ── Main ──────────────────────────────────────────────────────────────────────
console.log('🔨 Build — Gacem Avocat');

if (!fs.existsSync(BLOG_DIR)) fs.mkdirSync(BLOG_DIR, { recursive: true });

const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
if (files.length === 0) { console.log('  Aucun article trouvé dans /posts/'); }

const posts = [];

for (const file of files) {
  const slug    = file.replace('.md', '');
  const raw     = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8');
  const { data, content } = matter(raw);
  const bodyHtml = marked.parse(content);

  // Générer /blog/[slug].html
  const html = articleTemplate(slug, data, bodyHtml);
  const outPath = path.join(BLOG_DIR, `${slug}.html`);
  fs.writeFileSync(outPath, html, 'utf-8');
  console.log(`  ✓ /blog/${slug}.html`);

  // Normaliser la date en string YYYY-MM-DD (gray-matter peut retourner un objet Date)
  const rawDate = data.date;
  const dateStr = rawDate instanceof Date
    ? rawDate.toISOString().slice(0, 10)
    : String(rawDate || '').slice(0, 10);

  posts.push({
    slug,
    title:       data.title       || '',
    date:        dateStr,
    dateFr:      formatDateFr(dateStr || new Date().toISOString().slice(0,10)),
    category:    data.category    || '',
    description: data.description || '',
    excerpt:     data.excerpt     || '',
  });
}

// Trier par date décroissante
posts.sort((a, b) => new Date(b.date) - new Date(a.date));

// Générer /posts/index.json
const indexPath = path.join(POSTS_DIR, 'index.json');
fs.writeFileSync(indexPath, JSON.stringify(posts, null, 2), 'utf-8');
console.log('  ✓ /posts/index.json');

// Injecter le listing dans blog.html (rendu statique)
const blogHtmlPath = path.join(__dirname, 'blog.html');
let blogHtml = fs.readFileSync(blogHtmlPath, 'utf-8');

const articlesHtml = posts.length === 0
  ? '<p class="error-state">Aucun article pour le moment.</p>'
  : posts.map(p => `
        <a href="/blog/${p.slug}" class="article-card" role="listitem">
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

blogHtml = blogHtml.replace(
  /<!-- BUILD:ARTICLES -->[\s\S]*?<!-- \/BUILD:ARTICLES -->/,
  '<!-- BUILD:ARTICLES -->\n' + articlesHtml + '\n        <!-- /BUILD:ARTICLES -->'
);

fs.writeFileSync(blogHtmlPath, blogHtml, 'utf-8');
console.log('  ✓ blog.html (listing statique)');

// Générer sitemap.xml
const today = new Date().toISOString().slice(0, 10);
const articleEntries = posts.map(p => `
  <url>
    <loc>${SITE_URL}/blog/${p.slug}</loc>
    <lastmod>${p.date}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.7</priority>
  </url>`).join('');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>

  <url>
    <loc>${SITE_URL}/parcours</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>${SITE_URL}/blog</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
${articleEntries}
</urlset>
`;
fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemap, 'utf-8');
console.log('  ✓ sitemap.xml');
console.log(`\n✅ Build terminé — ${posts.length} article(s) généré(s)`);
