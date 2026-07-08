---
title: "Cara Membuat Bot Telegram Pertama Anda (Desktop & Termux)"
description: "Panduan praktis dan tanpa basa-basi untuk membangun bot Telegram dari nol menggunakan Node.js. Cocok untuk pemula di Desktop maupun Termux."
slug: "membuat-bot-telegram-pemula"
tags: ["teknologi", "tutorial", "pemrograman"]
createdAt: "2026-07-07"
updatedAt: "2026-07-07"
written: "Support written by AI"
pinned: false
draft: false
cover: "https://plus.unsplash.com/premium_photo-1725985758385-d5462d6e7f50?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8dGVsZWdyYW0lMjBib3R8ZW58MHx8MHx8fDA%3D"
---

# Membangun Bot Telegram dari Nol
Banyak yang mengira membuat bot Telegram itu butuh keahlian *hacking* tingkat tinggi. Kenyataannya, selama Anda bisa membaca instruksi dasar dan menjalankan perintah di terminal, Anda bisa membuatnya dalam waktu kurang dari 15 menit.
Di tutorial ini, kita akan menggunakan **Node.js**. Panduan ini mencakup langkah untuk pengguna komputer (Desktop) maupun HP (Termux).

[[toc]]

## Langkah 1: Dapatkan Token dari BotFather
Semua bot Telegram lahir dari **BotFather**. Ini adalah bot resmi Telegram untuk mengelola bot lainnya.
 1. Buka aplikasi Telegram Anda, cari @BotFather di kolom pencarian.
 2. Kirim perintah /newbot.
 3. Masukkan **Nama Bot** (bebas, misalnya: Bot Percobaan Saya).
 4. Masukkan **Username Bot** (harus unik dan berakhiran dengan bot, misalnya: TestingBot2026_bot).
 5. Jika berhasil, BotFather akan memberikan **HTTP API Token**.
    
:::danger Peringatan Kritis!
Token API Anda adalah kunci rumah bot Anda. **JANGAN PERNAH** membagikan token ini kepada siapa pun, dan jangan mengunggahnya ke tempat publik seperti GitHub. Siapa pun yang memiliki token ini bisa membajak bot Anda sepenuhnya.
:::

## Langkah 2: Persiapan Environment (Node.js)
Pilih instruksi yang sesuai dengan perangkat yang Anda gunakan saat ini.

;;tabs
## 💻 Desktop (Windows/Mac/Linux)
Jika Anda menggunakan PC atau Laptop, Anda harus menginstal Node.js dari situs resminya.
 1. Buka nodejs.org dan unduh versi **LTS (Long Term Support)**.
 2. Instal seperti aplikasi biasa (tinggal klik *Next* sampai selesai).
 3. Buka **Command Prompt (CMD)** atau **Terminal**, lalu buat folder baru untuk proyek bot Anda:
    
```bash title="Terminal"
mkdir bot-telegram-saya
cd bot-telegram-saya

```

## 📱 Termux (Android)
Bagi Anda yang menggunakan Android, pastikan aplikasi Termux Anda diunduh dari **F-Droid**, BUKAN dari Play Store (versi Play Store sudah usang).
Buka Termux dan jalankan perintah ini secara berurutan untuk memperbarui sistem dan menginstal Node.js:

```bash title="Termux"
pkg update && pkg upgrade -y
pkg install nodejs -y

```
Setelah itu, buat folder proyek dan masuk ke dalamnya:

```bash title="Termux"
mkdir bot-telegram-saya
cd bot-telegram-saya

```

;;

## Langkah 3: Inisialisasi Proyek dan Install Library
Sekarang, kita harus menginisialisasi proyek Node.js dan menginstal *library* bernama node-telegram-bot-api untuk mempermudah komunikasi dengan server Telegram.
Jalankan perintah ini di terminal / Termux Anda (pastikan Anda sudah berada di dalam folder bot-telegram-saya):

```bash title="Inisialisasi & Install"
npm init -y
npm install node-telegram-bot-api

```

:::info Catatan
Perintah npm init -y akan membuat file package.json secara otomatis, sedangkan npm install akan mengunduh *library* yang kita butuhkan ke dalam folder node_modules.
:::

## Langkah 4: Menulis Kode Bot
Buat sebuah file baru bernama index.js. Anda bisa menggunakan teks editor seperti VS Code di Desktop, atau nano jika menggunakan Termux (nano index.js).
Salin dan tempel kode berikut. **Ingat:** Ganti teks MASUKKAN_TOKEN_ANDA_DI_SINI dengan token asli yang Anda dapatkan dari BotFather.

```js title="index.js"
const TelegramBot = require('node-telegram-bot-api');

// Ganti string di bawah dengan token BotFather Anda
const token = 'MASUKKAN_TOKEN_ANDA_DI_SINI';

// Inisialisasi bot dengan mode polling
const bot = new TelegramBot(token, { polling: true });

console.log('Bot sedang berjalan...');

// Membuat respons untuk perintah /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const nama = msg.from.first_name;
  
  bot.sendMessage(chatId, `Halo ${nama}! Selamat datang di bot pertama Anda. Ketik apa saja, dan saya akan menirunya.`);
});

// Membuat bot meniru (echo) semua pesan teks yang masuk
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Abaikan jika pesannya adalah /start agar tidak bentrok
  if (text === '/start') return;

  // Kirim balik pesan yang diterima
  bot.sendMessage(chatId, `Anda berkata: "${text}"`);
});

```

:::caution Periksa Kembali
Pastikan Anda menaruh token di dalam tanda kutip (string), dan pastikan tidak ada spasi tambahan di awal atau akhir token tersebut.
:::

## Langkah 5: Menjalankan Bot
Saatnya menguji hasil kerja Anda. Di terminal atau Termux, jalankan perintah ini:

```bash title="Run bot"
node index.js

```

Jika tidak ada *error*, Anda akan melihat tulisan Bot sedang berjalan... di layar terminal Anda.
Sekarang, buka Telegram, cari bot Anda, dan tekan **Start**. Cobalah mengirimkan pesan apa saja. Jika bot merespons sesuai kode di atas, selamat! Anda baru saja berhasil membuat bot Telegram.

:::tip Pro Tip
Bot Anda hanya akan merespons selama jendela terminal/Termux Anda terbuka dan perintah node index.js berjalan. Jika Anda menutup terminal, bot akan "mati". Untuk membuatnya hidup 24/7 di masa depan, Anda perlu mempelajari tentang *hosting* atau VPS.
:::
