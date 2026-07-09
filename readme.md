# Arsitektur Website — `webmd`

> Personal portfolio + blog + dokumentasi, built with Express.js + EJS + Tailwind CSS.

---

## 📁 Struktur Proyek

```
webmd/
├── content/                   # Markdown sumber konten
│   ├── blog/*.md              # Artikel blog (10 file)
│   └── docs/*.md              # Dokumentasi (2 file)
├── data/                      # Data konfigurasi JSON
│   ├── config.json            # Info situs & profil
│   ├── navigation.json        # Menu navbar
│   ├── socials.json           # Link sosial media
│   └── projects.json          # Data proyek
├── public/                    # File statis (gambar, favicon)
├── src/                       # Kode backend
│   ├── app.js                 # Entry point Express
│   ├── controllers/
│   │   ├── pageController.js  # Handler halaman (home, blog, docs)
│   │   └── projectController.js # API projects
│   ├── routes/
│   │   ├── index.js           # Setup routing
│   │   └── pages.js           # Definisi route
│   ├── middlewares/
│   │   ├── locals.js           # Inject data ke semua view
│   │   └── errorHandler.js    # 404 & 500 handler
│   ├── services/
│   │   ├── cache.js           # Cache in-memory singleton
│   │   ├── contentLoader.js   # Load data & markdown saat startup
│   │   ├── parser.js          # Parse markdown → HTML via markdown-it
│   │   ├── markdown.js        # Config markdown-it + plugin registration
│   │   └── seo.js             # Helper meta tag SEO
│   └── libs/markdown/         # Plugin kustom markdown-it (8 plugin)
│       ├── GithubAnchor.js
│       ├── TableOfContent.js
│       ├── AdmonitionContainer.js
│       ├── MacCodeBlock.js
│       ├── MultiMediaPlayer.js
│       ├── HighlightBacktick.js
│       ├── Tabs.js
│       └── Dokapi.js
├── views/                     # Template EJS
│   ├── layouts/
│   │   └── base.ejs           # Layout utama (html, head, body, navbar, footer)
│   ├── pages/
│   │   ├── home.ejs           # Halaman depan
│   │   ├── blog.ejs           # Index blog
│   │   ├── post.ejs           # Detail artikel blog
│   │   ├── docs.ejs           # Index dokumentasi
│   │   ├── doc.ejs            # Detail dokumentasi
│   │   ├── 404.ejs            # Halaman tidak ditemukan
│   │   └── 500.ejs            # Error server
│   └── partials/
│       ├── seo.ejs            # Meta tag SEO (OG, Twitter, article)
│       ├── navbar.ejs         # Navigasi sticky
│       ├── footer.ejs         # Footer
│       ├── post-card.ejs      # Card artikel
│       └── project-card.ejs   # Card proyek
├── vercel.json                # Config deploy Vercel
├── package.json
├── readme.md
├── DESIGN-wise.md             # Design system Wise-inspired
└── ARSITEKTUR.md              ← file ini
```

---

## ⚙️ Cara Kerja (Request → Response)

```
Request masuk
  │
  ├─ helmet() → security headers
  ├─ compression() → gzip
  ├─ express.static('/static') → file di public/
  ├─ render wrapper → nangkap res.render(), render page → bungkus di layouts/base.ejs
  ├─ initialization guard → tunggu data selesai di-load (cold start)
  ├─ injectLocals → navigation, socials, config, currentPath → res.locals
  │
  ├─ Router (pages.js)
  │   ├─ GET /           → renderHome
  │   ├─ GET /blog       → renderBlogIndex
  │   ├─ GET /blog/:slug → renderBlogPost
  │   ├─ GET /docs       → renderDocsIndex
  │   ├─ GET /docs/:slug → renderDocDetail
  │   └─ GET /api/projects → apiProjects (JSON)
  │
  ├─ notFound (404) jika tidak ada route cocok
  └─ serverError (500) jika ada exception
```

### Cold Start vs Warm Start

- **Cold start** (pertama kali setelah deploy/idle): `initializeApplicationData()` jalan — baca semua file JSON + glob markdown + parse semuanya sekali → simpan di `cache` in-memory.
- **Warm start** (request berikutnya): guard `if (cache.blogs.length && cache.docs.length) return` — skip, langsung pakai cache.
- Guard middleware pakai `initPromise` agar request kedua menunggu request pertama selesai, bukan jalan duplikat.

---

## 🎨 Dimana Mengganti Style

Tidak ada file CSS statis. **Semua styling via Tailwind CDN + inline class di EJS.** Ini tempatnya:

### 1. Tailwind Config — `views/layouts/base.ejs`

```html
<script>
  tailwind.config = {
    darkMode: 'class',
    theme: {
      extend: {
        fontFamily: { sans: ['Inter', ...] },
        animation: { fadeIn: ... },
        keyframes: { fadeIn: ... }
      }
    }
  }
</script>
```

Ganti font, animasi, atau kustomisasi Tailwind di sini.

### 2. Warna Tema (light/dark) — `views/layouts/base.ejs`

Di bagian `<style>` inline:

```css
/* Prose colors (light) */
.prose { --tw-prose-body: #454745; --tw-prose-headings: #0e0f0c; ... }

/* Prose colors (dark) */
.dark .prose { --tw-prose-body: #c8cac5; --tw-prose-headings: #e8ebe6; ... }

/* Syntax highlighting Prism (light & dark) */
.token.comment { color: #868685; ... }
.dark .token.comment { color: #6b6b6a; ... }
```

### 3. Warna Background & Teks Global — `views/layouts/base.ejs`

```html
<body class="bg-[#e8ebe6] dark:bg-[#0e0f0c] text-[#0e0f0c] dark:text-[#e8ebe6] ...">
```

### 4. Komponen Per-Halaman — Masing-masing file `.ejs` di `views/pages/` & `views/partials/`

| File | Yang di-style |
|---|---|
| `views/pages/home.ejs` | Hero section, glow background, cards "Operational DNA", featured projects, latest posts |
| `views/pages/blog.ejs` | Search bar, sort dropdown, tag chips, grid post-card, modal "More tags" |
| `views/pages/post.ejs` | Cover image, meta info, tags, konten artikel (prose) |
| `views/pages/docs.ejs` | Grid card dokumentasi |
| `views/pages/doc.ejs` | Layout 2 kolom (artikel + sidebar), konten prose |
| `views/pages/404.ejs` | Angka besar 404, tombol Go Home |
| `views/pages/500.ejs` | Angka besar 500, error stack (dev mode) |
| `views/partials/navbar.ejs` | Sticky nav, logo, menu desktop/mobile, toggle dark mode |
| `views/partials/footer.ejs` | Copyright, sosial icons |
| `views/partials/post-card.ejs` | Card artikel (cover, title, desc, tags) |
| `views/partials/project-card.ejs` | Card proyek (cover, title, desc, tags) |

### 5. Plugin Markdown — Masing-masing file di `src/libs/markdown/`

Plugin menghasilkan HTML **dengan class Tailwind inline** (server-side). Contoh:

| Plugin | File | Class Tailwind yang dipakai |
|---|---|---|
| GithubAnchor | `GithubAnchor.js` | `group-hover:opacity-100`, `no-underline` |
| TableOfContent | `TableOfContent.js` | `bg-white/50`, `backdrop-blur`, `border-sky-200`, `text-sky-700` |
| AdmonitionContainer | `AdmonitionContainer.js` | `border-l-4`, `bg-sky-50`, `text-sky-800`, `dark:...` |
| MacCodeBlock | `MacCodeBlock.js` | `rounded-2xl`, `bg-[#1e1e1e]`, `shadow-lg` |
| MultiMediaPlayer | `MultiMediaPlayer.js` | class tailwind di wrapper video/audio |
| HighlightBacktick | `HighlightBacktick.js` | `bg-cyan-50`, `text-cyan-800`, `shadow-inner` |
| Tabs | `Tabs.js` | `border-b-2`, `border-sky-500`, `text-sky-600` |
| Dokapi | `Dokapi.js` | Badge warna per HTTP method, collapsible card |

### 6. Data JSON — `data/`

| File | Fungsinya |
|---|---|
| `config.json` | `siteName`, `siteTitle`, `siteDescription`, `siteUrl`, `avatar`, `fullName`, `occupation`, `bio` |
| `navigation.json` | Array `{label, href}` untuk navbar |
| `socials.json` | Array `{name, icon, url}` untuk footer |
| `projects.json` | Array proyek dengan `featured` boolean |

### 7. Konten Markdown — `content/blog/*.md` & `content/docs/*.md`

Frontmatter (YAML):

```yaml
---
title: "Judul"
description: "Deskripsi"
slug: "judul-artikel"
tags: ["tag1", "tag2"]
createdAt: "2025-07-01"
updatedAt: "2025-07-05"
written: "Nama Penulis"
pinned: false
draft: false
cover: "https://..."
---
```

Kustom syntax markdown: `[[toc]]`, `:::note ... :::`, `;;tabs ... ;;`, code block dengan `title=""`, `& route ... &`, `< response ... <`, dsb.

---

## 🧠 Arsitektur Data (Zero Database)

```
Semua data dari file → cache in-memory (cold start) → serve dari cache (warm start)

File:
  data/config.json       ─┐
  data/navigation.json   ─┤  Promise.all() → cache.*
  data/socials.json      ─┤
  data/projects.json     ─┘
  content/blog/**/*.md   ─┤  glob → Promise.all(parseMarkdown) → cache.blogs
  content/docs/**/*.md   ─┘                                       → cache.docs

cache = {
  blogs:    [{ title, slug, tags, createdAt, pinned, draft, cover, readingTime, html, ... }],
  docs:     [{ title, slug, tags, createdAt, readingTime, html, ... }],
  projects: [{ id, title, description, image, tags, featured, href }],
  socials:  [{ name, icon, url }],
  navigation: [{ label, href }],
  config:   { siteName, siteTitle, ... }
}
```

### Alur Parsing Markdown

```
file.md
  → gray-matter (parse frontmatter YAML)
  → markdown-it + 8 plugin kustom → HTML
  → hitung readingTime (200 kata/menit)
  → objek { title, slug, tags, createdAt, ..., html }
```

---

## 🚀 Deployment — Vercel

`vercel.json`:
- Builder: `@vercel/node` → `src/app.js`
- `includeFiles: "content/**"` — markdown ikut bundle
- Rewrite: `/static/*` → `public/*`, sisanya → `src/app.js`
- Local dev: `node --watch src/app.js` (port 3000)

Di Vercel (production), `app` di-export sebagai default — tidak pakai `app.listen()`.
Di lokal (`NODE_ENV !== 'production'`), `app.listen()` jalan.

---

## 📐 Design System (Wise-inspired)

Dari `DESIGN-wise.md` — palet Wise:

| Token | Warna | Tailwind |
|---|---|---|
| `primary` | `#9fe870` | `bg-[#9fe870]` |
| `ink` | `#0e0f0c` | `text-[#0e0f0c]` |
| `canvas-soft` | `#e8ebe6` | `bg-[#e8ebe6]` |
| `canvas` | `#ffffff` | `bg-white` |
| `body` | `#454745` | `text-[#454745]` |
| `mute` | `#868685` | `text-[#868685]` |

Semua warna hardcoded sebagai `bg-[#...]` atau `text-[#...]` langsung di class Tailwind. **Tidak pakai variable CSS** — ganti warna dengan search-replace di seluruh file `.ejs`.

> **Ceil:** Ekstrak ke CSS variables atau Tailwind `theme.extend.colors` di config kalau warna dipakai > 20 kali.
> **Kapan:** Saat mau ganti tema secara sistematis.

---

## 🔌 Plugin Markdown Kustom (8 plugin)

| Plugin | Sintaks | Output |
|---|---|---|
| GithubAnchor | heading `## Teks` | auto `id` slug + link anchor `#` |
| TableOfContent | `[[toc]]` | Dropdown collapsible daftar isi |
| AdmonitionContainer | `:::note ... :::` | Card berwarna dengan ikon |
| MacCodeBlock | ``````js title="file.js"`````` | macOS-style terminal dengan copy & wrap |
| MultiMediaPlayer | `![alt](video.mp4)` | `<video>` / `<audio>` alih-alih `<img>` |
| HighlightBacktick | `` `code` `` | Inline code dengan gaya cyan |
| Tabs | `;;tabs ... ;;` | Tab horizontal dengan animasi fade |
| Dokapi | `& route GET /api ... &` | Card endpoint API collapsible |

---

## 🧪 Routing Lengkap

| Method | Path | Controller | View |
|---|---|---|---|
| GET | `/` | `renderHome` | `pages/home` |
| GET | `/blog` | `renderBlogIndex` | `pages/blog` |
| GET | `/blog/:slug` | `renderBlogPost` | `pages/post` |
| GET | `/docs` | `renderDocsIndex` | `pages/docs` |
| GET | `/docs/:slug` | `renderDocDetail` | `pages/doc` |
| GET | `/api/projects` | `apiProjects` | JSON |
| * | *static* | `express.static` | file di `public/` |
| * | *not found* | `notFound` | `pages/404` |
| * | *error* | `serverError` | `pages/500` |
