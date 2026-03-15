# Guide d'administration — Gacem Avocat Blog

## Sommaire
1. [Configuration initiale (à faire une seule fois)](#1-configuration-initiale)
2. [Se connecter à l'interface d'administration](#2-se-connecter)
3. [Rédiger et publier un nouvel article](#3-rédiger-un-article)
4. [Modifier un article existant](#4-modifier-un-article)
5. [Supprimer un article](#5-supprimer-un-article)
6. [Comment fonctionne la publication](#6-comment-fonctionne-la-publication)

---

## 1. Configuration initiale

> **À faire une seule fois avant de pouvoir utiliser l'interface admin.**

### Étape 1 — Créer une GitHub OAuth App

1. Connectez-vous sur [github.com](https://github.com)
2. Allez dans **Settings → Developer settings → OAuth Apps → New OAuth App**
3. Remplissez le formulaire :
   - **Application name** : `Gacem Avocat CMS`
   - **Homepage URL** : `https://gacem-avocat.com`
   - **Authorization callback URL** : `https://gacem-avocat.com/admin/`
4. Cliquez **Register application**
5. Notez le **Client ID** affiché (ex: `Ov23li...`)

### Étape 2 — Renseigner le Client ID dans la config

Ouvrez le fichier `admin/config.yml` et remplacez :
```yaml
app_id: REMPLACER_PAR_VOTRE_CLIENT_ID
```
par votre Client ID :
```yaml
app_id: Ov23liXXXXXXXXXXXX
```

Commitez et pushez cette modification. Vercel redéploie automatiquement.

> **Note sécurité** : Le Client ID est public (il est dans le code source). C'est normal pour PKCE. Ne partagez jamais le Client Secret — il n'est pas utilisé ici.

---

## 2. Se connecter

1. Ouvrez **https://gacem-avocat.com/admin/**
2. Cliquez **Login with GitHub**
3. Autorisez l'application sur GitHub (première connexion uniquement)
4. Vous accédez à l'interface Decap CMS

---

## 3. Rédiger un article

### Dans l'interface admin :

1. Cliquez **Articles de blog** dans le menu gauche
2. Cliquez **Nouvel article de blog** (bouton en haut à droite)
3. Remplissez les champs :

| Champ | Description |
|-------|-------------|
| **Titre** | Titre complet de l'article |
| **Date** | Date de publication (YYYY-MM-DD) |
| **Catégorie** | Choisissez dans la liste |
| **Meta description** | 150–160 caractères pour Google |
| **Extrait** | 2–3 phrases affichées sur la page blog |
| **Corps de l'article** | Rédigez ici avec l'éditeur riche |

4. Cliquez **Publier** en haut à droite
5. Decap CMS crée un commit sur GitHub
6. Vercel détecte le commit et redéploie le site (~1 minute)
7. L'article est en ligne sur **https://gacem-avocat.com/blog/[slug].html**

### Formatage dans l'éditeur :

| Élément | Comment faire |
|---------|---------------|
| Titre de section | Bouton `H2` dans la barre |
| Sous-titre | Bouton `H3` |
| Texte en gras | `Ctrl+B` ou bouton **B** |
| Liste à puces | Bouton `UL` |
| Liste numérotée | Bouton `OL` |
| Encadré callout | HTML direct : `<div class="callout"><p><strong>À retenir :</strong> texte</p></div>` |

---

## 4. Modifier un article

1. Ouvrez **https://gacem-avocat.com/admin/**
2. Cliquez **Articles de blog**
3. Cliquez sur l'article à modifier
4. Modifiez les champs souhaités
5. Cliquez **Publier** (ou **Enregistrer** pour un brouillon)
6. Vercel redéploie automatiquement (~1 minute)

---

## 5. Supprimer un article

1. Ouvrez l'article dans l'interface admin
2. Cliquez les **trois points** (`...`) en haut à droite
3. Choisissez **Supprimer**
4. Confirmez la suppression
5. Vercel redéploie automatiquement

> **Attention** : La suppression est définitive. Elle supprime le fichier `.md` du repo GitHub.

---

## 6. Comment fonctionne la publication

```
Vous rédigez dans /admin/
         ↓
Decap CMS crée un commit dans GitHub (posts/mon-article.md)
         ↓
Vercel détecte le nouveau commit
         ↓
Vercel exécute : npm install && node build.js
         ↓
build.js génère :
  - /blog/mon-article.html  (page article complète)
  - /posts/index.json       (liste pour blog.html)
  - /sitemap.xml            (mis à jour)
         ↓
Vercel déploie les fichiers générés (~1 minute)
         ↓
L'article est en ligne sur gacem-avocat.com
```

### Structure des fichiers

```
/
├── posts/                        ← Sources Markdown (gérés par Decap CMS)
│   ├── index.json                ← Généré par build.js
│   ├── recours-permis-construire.md
│   └── mon-nouvel-article.md
├── blog/                         ← HTML générés par build.js
│   ├── recours-permis-construire.html
│   └── mon-nouvel-article.html
├── admin/
│   ├── index.html                ← Interface Decap CMS
│   └── config.yml                ← Configuration (repo, champs, etc.)
├── build.js                      ← Script de génération
├── package.json                  ← Dépendances Node.js
└── vercel.json                   ← Configuration build Vercel
```
