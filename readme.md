### 1. Tech Stack
- Runtime: Node.js dengan **ESM** (`"type": "module"` di package.json)
- Backend framework: **Express.js**
- Template engine: **EJS**, dengan pola *dynamic layout inclusion* (satu `layouts/base.ejs` yang menyertakan `pages/<page>.ejs` sesuai variabel `page`)
- Markdown compiler: `markdown-it` + `gray-matter` (frontmatter parser) + `highlight.js`/`prismjs` untuk syntax highlighting
- Dependency lain: `compression`, `helmet`, `serve-favicon`, `glob`
- Deploy target: Vercel (serverless) DAN mendukung local run — sertakan `vercel.json`
- Styling: Tailwind CSS via CDN (`cdn.tailwindcss.com?plugins=typography`), dark mode berbasis class, font Google "Poppins"
- Icon set: Lucide Icons via CDN (`lucide.createIcons()`)

### 2. Struktur Direktori
```
├── content/
│   ├── blog/*.md          # artikel blog
│   └── docs/*.md          # dokumentasi teknis
├── data/
│   ├── config.json        # info situs & profil (siteName, siteTitle, siteDescription, siteUrl, avatar, fullName, occupation, bio)
│   ├── navigation.json    # menu navbar [{label, href}]
│   ├── socials.json       # [{name, icon, url}]
│   └── projects.json      # [{id, title, description, image, tags[], featured, href}]
├── public/
│   ├── css/, images/, favicon.ico
├── src/
│   ├── app.js
│   ├── controllers/ (blogController.js, pageController.js, projectController.js)
│   ├── routes/ (index.js, pages.js, blog.js)
│   ├── middlewares/ (locals.js, errorHandler.js)
│   ├── services/ (cache.js, contentLoader.js, markdown.js, parser.js, seo.js)
│   └── libs/markdown/ (plugin-plugin custom markdown-it, lihat bagian 5)
├── views/
│   ├── layouts/base.ejs
│   ├── pages/ (home, blog, post, docs, doc, 404, 500)
│   └── partials/ (navbar, footer, seo, post-card, project-card)
├── vercel.json
└── package.json
```

### 3. Arsitektur Data & Caching (In-Memory, Zero-Database)
- Buat modul `services/cache.js` yang mengekspor objek singleton `cache = { blogs: [], docs: [], projects: [], socials: [], navigation: [], config: {} }`.
- Buat `services/contentLoader.js` dengan fungsi `initializeApplicationData()`:
  - Guard: jika `cache.blogs` & `cache.docs` sudah terisi (warm start), langsung return tanpa baca ulang disk.
  - Load semua JSON di `data/` secara **paralel** (`Promise.all`).
  - Gunakan `glob` untuk mencari semua `content/blog/**/*.md` dan `content/docs/**/*.md` secara paralel.
  - Baca & parse semua file markdown secara paralel via `Promise.all`, gunakan fallback `slug` dari nama file jika frontmatter tidak punya slug.
  - Urutkan blog: post dengan `pinned: true` di atas, lalu berdasarkan `createdAt` terbaru.
- Di `src/app.js`, terapkan **"Initialization Guard Middleware"** untuk mengatasi cold start di Vercel serverless:
  - Simpan flag `isInitialized` + `initPromise` di scope modul.
  - Middleware `ensureDataInitialized` menahan request sampai promise inisialisasi pertama selesai, lalu request berikutnya lewat instan tanpa re-load.
  - Jika `NODE_ENV !== 'production'`, jalankan `app.listen()` lokal setelah init selesai (mode dev/VPS). Saat di Vercel (`production`), export `app` sebagai handler serverless tanpa `listen()`.

### 4. Parsing Konten Markdown (Frontmatter)
Buat `services/parser.js` dengan fungsi `parseMarkdown(fileContent, filePath)` menggunakan `gray-matter`:
- Field frontmatter yang didukung: `title`, `description`, `slug`, `tags[]`, `createdAt`, `updatedAt`, `written`, `pinned` (boolean), `draft` (boolean), `cover` (URL gambar sampul).
- Hitung `readingTime` otomatis (asumsi 200 kata/menit) dari isi teks.
- Render `content` markdown ke HTML via instance `markdown-it` custom (lihat bagian 5), simpan sebagai field `html`.
- Kembalikan objek `{ title, description, slug, tags, createdAt, updatedAt, written, pinned, draft, cover, readingTime, html, raw, path }`.

### 5. Custom Markdown-It Plugins (WAJIB dibuat manual, bukan library pihak ketiga)
Buat plugin-plugin berikut di `src/libs/markdown/`, lalu daftarkan semua via `md.use()` di `services/markdown.js`:

1. **`GithubAnchor.js`** — Override `heading_open`:
   - Auto-generate `id` slug dari teks heading (untuk anchor link).
   - Tambahkan class Tailwind berjenjang sesuai level heading (h1–h6, ukuran font & margin berbeda).
   - Sisipkan link anchor `<a href="#slug">` di kiri heading: tampil karakter `#` default, berubah jadi ikon link SVG saat hover (pakai `group-hover`).

2. **`TableOfContent.js`** — Dua tahap:
   - Block rule mendeteksi baris `[[toc]]` sebagai token TOC placeholder.
   - Core rule mengumpulkan semua heading (level 1–6) di dokumen, generate slug, lalu render sebagai komponen `<details>` dropdown "Table of Content" collapsible (default open), dengan indentasi & warna berjenjang per level heading, styling Tailwind bertema biru (sky).

3. **`AdmonitionContainer.js`** — Custom container block mirip Docusaurus, sintaks:
   ```
   ::: note Judul Opsional
   Isi konten...
   :::
   ```
   Dukung tipe: `note`, `info`, `tip`, `warning`, `caution`, `danger` — masing-masing dengan warna Tailwind & ikon SVG berbeda (sky untuk note/info, emerald untuk tip, amber untuk warning/caution, red untuk danger). Marker minimal 3 karakter `:`, mendukung nested tokenization (isi container diproses ulang sebagai markdown).

4. **`MacCodeBlock.js`** — Override renderer `fence` (code block):
   - Server-side syntax highlighting via **Prism.js** (`prismjs` + `prismjs/components/index.js`, dynamic language loading, dengan `languageMap` alias seperti `js→javascript`, `py→python`, `sh→bash`, dll).
   - Render sebagai kartu bergaya **macOS Terminal**: header dengan 3 dot (merah/kuning/hijau), judul file/bahasa di tengah, tombol "Wrap/Unwrap" toggle word-wrap dan tombol "Copy" (via `navigator.clipboard`) di kanan — keduanya inline `onclick` vanilla JS tanpa framework.
   - Dukung syntax fence dengan atribut `title="nama-file"` opsional.

5. **`MultiMediaPlayer.js`** — Override renderer `image`:
   - Deteksi ekstensi file dari URL gambar markdown (`![alt](src)`).
   - Jika ekstensi termasuk video (`mp4, webm, ogg, mov, m4v`) → render `<video controls>`.
   - Jika ekstensi termasuk audio (`mp3, wav, ogg, aac, m4a, flac`) → render `<audio controls>`.
   - Selain itu → render `<img loading="lazy">` normal.

6. **`HighlightBacktick.js`** — Override renderer `code_inline`: styling inline code (backtick tunggal) dengan warna cyan, shadow inset halus, border tipis, hapus backtick bawaan dari Tailwind Typography (`before:content-none after:content-none`).

7. **`Tabs.js`** — Custom block syntax untuk tab container:
   ```
   ;;tabs
   ## Tab 1
   konten...
   ## Tab 2
   konten...
   ;;
   ```
   Parse depth-tracking untuk nested tabs, render sebagai UI tab horizontal-scrollable dengan animasi fade-in saat ganti tab (vanilla JS, tanpa framework).

8. **`Dokapi.js`** — Custom syntax dokumentasi API bergaya Postman/Swagger ringan, dengan blok:
   - `& route ... &` untuk mendefinisikan endpoint (method GET/POST/DELETE/PATCH/PUT + path + deskripsi), render sebagai card collapsible dengan badge warna per HTTP verb.
   - `< response ... <` untuk mendefinisikan contoh response (status code + message).
   - `# define-reference ... #` dan `@ reference @` untuk mendefinisikan blok yang bisa dipakai ulang (reusable snippet) di banyak tempat dalam dokumen — di-resolve di core rule setelah parsing block selesai.

Registrasi urutan plugin di `services/markdown.js`: inline highlight → media player → anchor → toc → multimd-table (pakai `markdown-it-multimd-table` dengan opsi `multiline, rowspan, headerless`) → admonition → mac codeblock → `@mdit/plugin-figure` → `@mdit/plugin-img-lazyload` → `@mdit/plugin-tab` → dokapi → tabs.

### 6. Routing & Controllers
- `GET /` → `renderHome`: tampilkan hero, about/overview cards, projects `featured: true`, 6 post terbaru non-draft.
- `GET /blog` → `renderBlogIndex`: semua post non-draft + daftar unique tags, dengan UI search box + sort (newest/oldest) + filter tag chip (client-side vanilla JS, atribut `data-tags`, `data-title`, `data-date` di setiap card untuk filtering).
- `GET /blog/:slug` → `renderBlogPost`: render halaman detail post beserta meta SEO artikel (og:type=article, published/modified time, author, tags). 404 jika slug tidak ada / post masih draft.
- `GET /docs` → `renderDocsIndex`: grid card semua dokumen.
- `GET /docs/:slug` → `renderDocDetail`: layout 2 kolom (artikel + sidebar sticky "Document Index"), 404 jika tidak ditemukan.
- `GET /api/projects` → JSON semua project (dari cache, tanpa perlu re-baca file).
- Static assets di-mount di path `/static` → folder `public/`, plus `serveFavicon` untuk favicon.ico.
- Error handling: middleware `handleNotFound` (404) dan `handleServerError` (500) masing-masing render halaman EJS dengan SEO title sesuai, dan pada 500 tampilkan detail error hanya jika `NODE_ENV === 'development'`.

### 7. SEO Middleware
Buat `services/seo.js` dengan fungsi `buildSeoOptions(customOptions)`:
- Default title/description/canonical/ogImage diambil dari `data/config.json`.
- Jika `customOptions.title` diberikan, gabungkan jadi format `"{title} | {siteName}"`.
- Support field artikel: `publishedTime`, `modifiedTime`, `author`, `tags[]` — hanya dirender di `<meta>` jika `ogType === 'article'`.
- Buat partial `views/partials/seo.ejs` yang render semua meta tag standar + Open Graph + Twitter Card + article-specific meta tags secara kondisional.

### 8. Middleware Global (locals injector)
Buat `middlewares/locals.js` — inject ke `res.locals` di setiap request: `navigation`, `socials`, `config` (dari cache), dan `currentPath` (dari `req.path`) — dipakai navbar untuk highlight menu aktif.

### 9. Desain Visual (Design System)
- Palet warna: base **slate** (background/teks) + accent **sky blue** (`sky-400/500/600`), dark mode penuh via Tailwind `class` strategy.
- Font: **Poppins** (Google Fonts), rounded corners besar (`rounded-2xl`/`rounded-3xl`) di semua card/button.
- Efek: glow/aura blur background di belakang halaman (`blur-[120px]`), hover `-translate-y-1` + shadow pada card, transisi halus 300ms di semua elemen interaktif.
- Navbar: sticky top, blur backdrop, logo avatar bulat + nama situs, menu desktop horizontal + hamburger mobile dropdown, toggle dark/light theme (simpan preferensi di `localStorage`, cegah FOUC dengan inline script di `<head>` sebelum body render), tombol GitHub eksternal.
- Homepage: hero 2 kolom (teks + foto profil), section "Operational DNA" (4 kartu: Who Am I / Occupation / Hobbies / Interests), grid Portfolio Projects, grid Recent Publications (max 6).
- Halaman Blog index: search bar + dropdown sort + filter tag chips (collapsible jika tag > 10), grid post-card dengan cover image, badge "Pinned", tanggal, reading time, tags.
- Halaman Doc detail: layout 2 kolom (artikel prose 8-col + sidebar sticky info 4-col), gunakan Tailwind Typography `prose` class dengan kustomisasi heading/link.
- Semua kode HTML component (admonition, code block, toc, dsb.) harus styled inline via class Tailwind di dalam string HTML plugin markdown-it (server-side rendered), bukan CSS file terpisah.

### 10. Data Contoh (seed data)
Sertakan contoh isi untuk:
- `data/config.json`: siteName, siteTitle, siteDescription, siteUrl, avatar (URL gambar), fullName, occupation, bio.
- `data/navigation.json`: minimal `Home` (`/`) dan `Blog` (`/blog`).
- `data/socials.json`: minimal GitHub & Instagram.
- `data/projects.json`: minimal 2 project contoh dengan field `id, title, description, image, tags[], featured, href`.
- 2–3 file `content/blog/*.md` contoh dengan frontmatter lengkap (title, description, slug, tags, createdAt, updatedAt, pinned, draft, cover).
- 1–2 file `content/docs/*.md` contoh yang mendemonstrasikan semua custom syntax markdown (`[[toc]]`, admonition `:::`, tab `;;tabs`, code block dengan title, dsb) sebagai dokumentasi "Getting Started" dan "System Architecture".

### 11. Deployment
- `vercel.json`: build `src/app.js` via `@vercel/node`, `includeFiles: "content/**"` agar file markdown ikut terbundle, rewrite semua path (`/css`, `/js`, `/images`, `/favicon`) ke folder `public/`, sisanya diarahkan ke `src/app.js`.
- Pastikan app bisa jalan di dua mode: lokal (`node --watch src/app.js` untuk dev) dan serverless Vercel (tanpa `app.listen()`, hanya `export default app`).

### 12. Kriteria Penerimaan (Acceptance Criteria)
- Tidak ada database eksternal — semua data dari file JSON + Markdown lokal.
- Build time konten hanya terjadi sekali per cold start (in-memory cache).
- Semua custom markdown syntax berfungsi dan menghasilkan HTML dengan styling Tailwind yang konsisten dengan tema (light & dark mode).
- SEO meta tags lengkap & valid di setiap jenis halaman (home, blog index, blog post, docs index, doc detail).
- Responsive di mobile (hamburger menu) dan desktop.
