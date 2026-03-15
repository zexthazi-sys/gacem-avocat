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
const SITE_URL   = 'https://gacem-avocat.com';
const POSTS_DIR  = path.join(__dirname, 'posts');
const BLOG_DIR   = path.join(__dirname, 'blog');

// ── Helpers ───────────────────────────────────────────────────────────────────
const MONTHS_FR = [
  'janvier','février','mars','avril','mai','juin',
  'juillet','août','septembre','octobre','novembre','décembre'
];
function formatDateFr(dateStr) {
  const d = new Date(dateStr + 'T12:00:00Z');
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
  const canonUrl   = `${SITE_URL}/blog/${slug}.html`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${titleEsc} &mdash; Gacem Avocat</title>
  <meta name="description" content="${descEsc}">
  <link rel="canonical" href="${canonUrl}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Raleway:wght@100;200;300;400;500&display=swap" rel="stylesheet">
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
    .nav-logo { font-weight: 300; font-size: 20px; letter-spacing: 0.15em; color: var(--bleu-nuit); text-decoration: none; }
    .nav-logo span { font-weight: 100; }
    .nav-links { display: flex; gap: 32px; }
    .nav-links a { font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--bleu-ardoise); text-decoration: none; font-weight: 400; transition: color 0.2s; }
    .nav-links a:hover { color: var(--bleu-nuit); }
    .nav-links a.active { color: var(--bleu-nuit); border-bottom: 1px solid var(--vert-sauge); padding-bottom: 2px; }
    .article-header { background: var(--degrade); padding: 88px 64px 72px; }
    .article-header-inner { max-width: 720px; }
    .article-back { display: inline-block; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(255,255,255,0.4); text-decoration: none; font-weight: 300; margin-bottom: 36px; transition: color 0.2s; }
    .article-back:hover { color: rgba(255,255,255,0.8); }
    .article-meta { display: flex; gap: 20px; margin-bottom: 24px; align-items: center; }
    .article-category-badge { font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--vert-sauge); font-weight: 300; }
    .article-date-badge { font-size: 10px; letter-spacing: 0.1em; color: rgba(255,255,255,0.35); font-weight: 300; }
    .article-header h1 { font-size: clamp(24px, 3.5vw, 38px); font-weight: 200; color: var(--blanc); line-height: 1.3; letter-spacing: 0.02em; margin-bottom: 20px; }
    .article-intro { font-weight: 200; font-size: 15px; line-height: 1.9; color: rgba(255,255,255,0.6); max-width: 600px; }
    .article-body { padding: 72px 64px 88px; background: var(--blanc); }
    .article-content { max-width: 720px; }
    .article-content h2 { font-size: clamp(18px, 2.2vw, 24px); font-weight: 300; color: var(--bleu-nuit); margin-top: 56px; margin-bottom: 20px; padding-left: 20px; border-left: 2px solid var(--vert-sauge); line-height: 1.3; }
    .article-content h3 { font-size: 14px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: var(--bleu-ardoise); margin-top: 36px; margin-bottom: 14px; }
    .article-content p { font-size: 15px; font-weight: 300; line-height: 1.95; color: var(--bleu-fonce); margin-bottom: 20px; }
    .article-content ul, .article-content ol { padding-left: 0; margin-bottom: 20px; list-style: none; }
    .article-content ul li, .article-content ol li { font-size: 15px; font-weight: 300; line-height: 1.9; color: var(--bleu-fonce); padding-left: 20px; position: relative; margin-bottom: 10px; }
    .article-content ul li::before { content: '—'; position: absolute; left: 0; color: var(--vert-sauge); font-weight: 300; }
    .article-content ol { counter-reset: ol-counter; }
    .article-content ol li { counter-increment: ol-counter; }
    .article-content ol li::before { content: counter(ol-counter) '.'; position: absolute; left: 0; color: var(--vert-sauge); font-weight: 400; font-size: 13px; }
    .callout { background: #f0f2f4; border-left: 3px solid var(--vert-sauge); padding: 24px 28px; margin: 36px 0; }
    .callout p { font-size: 14px; font-weight: 300; line-height: 1.85; color: var(--bleu-ardoise); margin-bottom: 0; }
    .callout strong { font-weight: 500; color: var(--bleu-nuit); }
    .article-cta { margin-top: 64px; padding-top: 48px; border-top: 1px solid rgba(45,63,92,0.1); display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 24px; }
    .article-cta p { font-size: 14px; font-weight: 300; color: #6b7a8d; margin-bottom: 0; }
    .cta-btn { display: inline-block; padding: 13px 32px; border: 1px solid var(--bleu-ardoise); color: var(--bleu-ardoise); font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; font-weight: 300; text-decoration: none; transition: all 0.3s; }
    .cta-btn:hover { background: var(--bleu-ardoise); color: var(--blanc); }
    .back-to-blog { padding: 32px 64px; background: #f0f2f4; border-top: 1px solid rgba(45,63,92,0.06); }
    .back-to-blog a { font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--bleu-ardoise); text-decoration: none; font-weight: 400; transition: color 0.2s; }
    .back-to-blog a:hover { color: var(--bleu-nuit); }
    footer { padding: 24px 64px; background: var(--noir); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
    footer span, footer a { font-size: 10px; color: rgba(255,255,255,0.55); letter-spacing: 0.1em; font-weight: 300; text-decoration: none; transition: color 0.2s; }
    footer a:hover { color: rgba(255,255,255,0.8); }
    @media (max-width: 768px) {
      nav { padding: 16px 20px; } .nav-logo { font-size: 16px; } .nav-links { gap: 16px; } .nav-links a { font-size: 10px; }
      .article-header { padding: 60px 20px 48px; } .article-body { padding: 48px 20px 60px; }
      .back-to-blog { padding: 24px 20px; } footer { padding: 20px; justify-content: center; text-align: center; }
    }
    @media (max-width: 480px) {
      .nav-links a { font-size: 9px; letter-spacing: 0.06em; }
      .article-header { padding: 48px 16px 40px; } .article-body { padding: 40px 16px 48px; }
    }
  </style>
</head>
<body>

  <nav>
    <a href="/" class="nav-logo">Gacem <span>Avocat</span></a>
    <div class="nav-links">
      <a href="/#cabinet">Cabinet</a>
      <a href="/#expertises">Expertises</a>
      <a href="/#parcours">Parcours</a>
      <a href="/#contact">Contact</a>
      <a href="/blog.html" class="active">Blog</a>
    </div>
  </nav>

  <main>
    <header class="article-header">
      <div class="article-header-inner">
        <a href="/blog.html" class="article-back">&larr; Blog</a>
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
    <a href="/blog.html">&larr; Retour au blog</a>
  </div>

  <footer>
    <span>&copy; 2026 Gacem Avocat &middot; Tous droits r&eacute;serv&eacute;s</span>
    <a href="/">Retour au site</a>
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

  posts.push({
    slug,
    title:       data.title       || '',
    date:        data.date        || '',
    dateFr:      formatDateFr(data.date || new Date().toISOString().slice(0,10)),
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

// Générer sitemap.xml
const today = new Date().toISOString().slice(0, 10);
const articleEntries = posts.map(p => `
  <url>
    <loc>${SITE_URL}/blog/${p.slug}.html</loc>
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
    <loc>${SITE_URL}/blog.html</loc>
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
