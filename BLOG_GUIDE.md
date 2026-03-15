# Guide — Ajouter un article de blog

## Structure des fichiers

```
/
├── index.html              ← Site principal (one-page)
├── blog.html               ← Page listant tous les articles
├── sitemap.xml             ← Sitemap SEO (à mettre à jour)
└── blog/
    ├── recours-permis-construire.html
    ├── allotissement-marches-publics.html
    └── mon-nouvel-article.html   ← Vos futurs articles ici
```

---

## Étape 1 — Créer le fichier de l'article

Dupliquez un article existant (ex: `blog/recours-permis-construire.html`) et renommez-le avec un nom de fichier en minuscules, sans accents, avec des tirets :

```
blog/nom-de-mon-article.html
```

**Exemples de noms valides :**
- `blog/responsabilite-etat-travaux-publics.html`
- `blog/contrat-de-concession-enjeux-2026.html`

---

## Étape 2 — Modifier le `<head>` de l'article

Mettez à jour les 4 éléments suivants dans le `<head>` :

```html
<!-- 1. Titre de l'onglet et résultat Google -->
<title>Titre de mon article — Gacem Avocat</title>

<!-- 2. Description affichée dans les résultats Google (155 caractères max) -->
<meta name="description" content="Courte description de l'article, environ 155 caractères, avec les mots-clés principaux.">

<!-- 3. URL canonique (remplacer avec l'URL réelle) -->
<link rel="canonical" href="https://gacem-avocat.com/blog/nom-de-mon-article.html">

<!-- 4. Données structurées Schema.org (pour Google) -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Titre de mon article",
  "datePublished": "2026-04-01",       ← Date au format YYYY-MM-DD
  "author": { "@type": "Person", "name": "Hakim Gacem" },
  "publisher": { "@type": "Organization", "name": "Gacem Avocat" },
  "description": "Même texte que la meta description."
}
</script>
```

---

## Étape 3 — Modifier le header de l'article

Dans le `<body>`, repérez la section `<header class="article-header">` et mettez à jour :

```html
<header class="article-header">
  <div class="article-header-inner">
    <a href="/blog.html" class="article-back">← Blog</a>
    <div class="article-meta">
      <span class="article-category-badge">Catégorie</span>  ← ex: Urbanisme / Marchés publics / Droit administratif
      <span class="article-date-badge">1er avril 2026</span> ← Date lisible en français
    </div>
    <h1>Titre complet de l'article</h1>
    <p class="article-intro">Accroche introductive de 2-3 phrases résumant l'article.</p>
  </div>
</header>
```

---

## Étape 4 — Rédiger le contenu

Dans `<div class="article-content">`, utilisez ces balises :

```html
<!-- Titre de section (niveau 2) -->
<h2>1. Mon titre de section</h2>

<!-- Sous-titre (niveau 3) -->
<h3>Sous-titre</h3>

<!-- Paragraphe -->
<p>Mon texte...</p>

<!-- Liste à puces -->
<ul>
  <li>Élément 1</li>
  <li>Élément 2</li>
</ul>

<!-- Liste numérotée -->
<ol>
  <li>Première étape</li>
  <li>Deuxième étape</li>
</ol>

<!-- Encadré mis en avant (callout) -->
<div class="callout">
  <p><strong>À retenir :</strong> Information importante à mettre en avant.</p>
</div>
```

---

## Étape 5 — Ajouter la carte sur blog.html

Ouvrez `blog.html` et ajoutez une nouvelle carte dans `<div class="articles-grid">` **au début** (les articles les plus récents en premier) :

```html
<a href="/blog/nom-de-mon-article.html" class="article-card" role="listitem">
  <div class="article-card-meta">
    <span class="article-date">1er avril 2026</span>
    <span class="article-category">Catégorie</span>
  </div>
  <div class="article-card-body">
    <h2 class="article-card-title">Titre de l'article</h2>
    <p class="article-card-excerpt">Court résumé de l'article en 2-3 phrases. Doit donner envie de lire la suite.</p>
    <span class="article-read-more">Lire l'article →</span>
  </div>
</a>
```

---

## Étape 6 — Mettre à jour sitemap.xml

Ajoutez une entrée dans `sitemap.xml` à la racine du site :

```xml
<url>
  <loc>https://gacem-avocat.com/blog/nom-de-mon-article.html</loc>
  <lastmod>2026-04-01</lastmod>    ← Date de publication (YYYY-MM-DD)
  <changefreq>yearly</changefreq>
  <priority>0.7</priority>
</url>
```

Mettez également à jour la `<lastmod>` de `blog.html` avec la date du jour.

---

## Checklist avant publication

- [ ] Fichier HTML créé dans `/blog/` avec un nom de fichier clair
- [ ] `<title>` unique et descriptif (60 caractères max)
- [ ] `<meta name="description">` rédigée (155 caractères max)
- [ ] `<link rel="canonical">` correct
- [ ] Données Schema.org mises à jour (`datePublished`, `headline`)
- [ ] Date lisible dans le header (`article-date-badge`)
- [ ] Catégorie renseignée (`article-category-badge`)
- [ ] Carte ajoutée en tête de `blog.html`
- [ ] `sitemap.xml` mis à jour
- [ ] Push sur GitHub → Vercel déploie automatiquement
