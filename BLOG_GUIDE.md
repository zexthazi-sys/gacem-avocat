# Guide — Publier un article de blog

> **En une phrase :** déposez un fichier Markdown dans `/posts/`, committez, poussez sur `main`. C'est tout. Vercel génère automatiquement la page de l'article, la carte sur le blog, le sitemap et les balises SEO.

Vous n'avez **jamais** à toucher au HTML, ni à `blog.html`, ni au `sitemap.xml`. Ces fichiers sont générés à chaque déploiement par `build.js` (ils sont d'ailleurs ignorés par Git, c'est normal qu'ils n'apparaissent pas dans le dépôt).

---

## Le seul fichier à créer

Créez un fichier dans `/posts/` nommé en minuscules, sans accents, avec des tirets. Ce nom devient l'adresse de l'article.

```
posts/carte-sejour-etudiant.html   ❌  (pas de .html)
posts/carte-sejour-etudiant.md     ✅
```

→ donnera l'URL `https://www.gacem-avocat.com/blog/carte-sejour-etudiant`

**Exemples de noms valides :**
- `posts/responsabilite-etat-travaux-publics.md`
- `posts/recours-oqtf-delais.md`

---

## La structure du fichier

Un fichier d'article a deux parties : l'**en-tête** (entre les deux `---`) et le **contenu** (en dessous).

```markdown
---
title: "Titre complet de l'article"
date: 2026-06-07
category: Droit des étrangers
description: "Texte affiché dans les résultats Google, environ 155 caractères."
excerpt: "Accroche de 2-3 phrases affichée sous le titre et sur la carte du blog."
---
Premier paragraphe de l'article. Pas besoin de répéter le titre, il est déjà affiché automatiquement.

## 1. Mon premier titre de section

Mon texte...
```

### Les 5 champs de l'en-tête

| Champ | Rôle |
|-------|------|
| `title` | Titre de l'article (onglet, Google, gros titre en haut de la page) |
| `date` | Date de publication, **toujours** au format `AAAA-MM-JJ` (ex. `2026-06-07`). Sert au tri : l'article le plus récent apparaît en premier. |
| `category` | Étiquette affichée sur la carte (ex. `Droit administratif`, `Marchés publics`, `Urbanisme`, `Droit pénal`, `Droit des étrangers`) |
| `description` | Résumé pour Google (~155 caractères) |
| `excerpt` | Accroche affichée sous le titre de l'article et sur la carte du blog |

### ⚠️ Règle d'or : les guillemets

Si une valeur contient un **deux-points** « : », un **«** ou un **#**, mettez-la entre guillemets doubles `"..."`. Sinon le déploiement échoue (erreur de syntaxe).

```markdown
description: Réalité et sérieux des études : ce que dit la loi    ❌  casse le build
description: "Réalité et sérieux des études : ce que dit la loi"  ✅
```

Dans le doute, **mettez toujours `title`, `description` et `excerpt` entre guillemets** — ça ne coûte rien et ça évite l'erreur.

---

## Rédiger le contenu (Markdown)

En dessous du second `---`, on écrit en Markdown :

```markdown
## 1. Titre de section

Un paragraphe normal. On met un mot en **gras** avec deux étoiles,
ou en *italique* avec une étoile.

### Sous-titre

* Élément de liste à puces
* Autre élément

1. Première étape (liste numérotée)
2. Deuxième étape
```

### Mettre en avant une citation ou un point important (encadré)

Pour un encadré gris stylé (idéal pour citer un texte de loi ou une décision de justice), collez ce bloc HTML tel quel dans le Markdown :

```html
<div class="callout"><p><strong>Article L. 422-1 du CESEDA :</strong> « L'étranger qui établit qu'il suit un enseignement en France… »</p></div>
```

Pour une citation de jurisprudence avec sa référence en dessous, utilisez `<br>` et `<em>` (italique) :

```html
<div class="callout"><p>« Il appartient à l'administration… »<br><em>CAA de Lyon, 18 juin 2020, n° 19LY04733</em></p></div>
```

---

## Mettre en ligne

1. Enregistrez le fichier dans `/posts/`.
2. Committez et poussez sur la branche `main`.
3. Vercel détecte le push et reconstruit le site (~1 à 2 minutes).
4. L'article apparaît sur `https://www.gacem-avocat.com/blog`.

> Si rien n'apparaît après quelques minutes, c'est presque toujours une **erreur dans l'en-tête** (un « : » sans guillemets, une date mal formée). Dans ce cas, l'ancienne version du site reste en ligne — le site n'est jamais cassé — il suffit de corriger l'en-tête et de pousser à nouveau. Le statut du déploiement est consultable dans le tableau de bord Vercel (un build raté apparaît en rouge « Error »).

---

## Checklist avant de publier

- [ ] Fichier `.md` dans `/posts/`, nom en minuscules-avec-tirets, sans accents
- [ ] En-tête entre `---` avec les 5 champs (`title`, `date`, `category`, `description`, `excerpt`)
- [ ] `date` au format `AAAA-MM-JJ`
- [ ] `title`, `description`, `excerpt` entre guillemets doubles
- [ ] Contenu rédigé en Markdown sous le second `---`
- [ ] Commit + push sur `main` → Vercel déploie tout seul

---

## Ce que vous n'avez PLUS à faire

L'ancienne version de ce guide demandait de créer le HTML à la main, d'ajouter une carte dans `blog.html` et de modifier `sitemap.xml`. **Tout cela est désormais automatique.** Un seul fichier Markdown suffit.
