---
title: "Menguak Rahasia LED Stadion: Kenapa Iklan TV Tiap Negara Bisa Berbeda Tanpa Green Screen?"
description: "Panduan komprehensif memahami teknologi Hardware Interleaving dan AI Virtual Overlay pada papan iklan perimeter stadion sepak bola modern."
slug: "rahasia-led-stadion"
tags: ["technology", "sports", "broadcasting", "ai", "hardware"]
createdAt: "2026-07-26"
updatedAt: "2026-07-26"
written: "Support written by AI"
pinned: false
draft: false
cover: "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9"
---

Fenomena papan iklan perimeter di stadion sepak bola yang dapat menampilkan merek lokal berbeda di setiap negara siaran sering kali menimbulkan keheranan. Banyak penonton mengira stadion menggunakan layar hijau (*green screen*) atau rekayasa video sederhana.  
Artikel ini membedah dua pendekatan teknologi utama yang digunakan dalam penyiaran olahraga internasional—**Hardware Interleaving (Syncing)** dan **AI Virtual Overlay**—secara akurat, rinci, dan bebas dari miskonsepsi.

[[toc]]

## Dua Pendekatan Teknologi Utama

Penyiaran olahraga internasional memanfaatkan dua metode utama untuk menyajikan iklan yang disesuaikan berdasarkan wilayah (*geotargeted advertising*).

;;tabs
## Hardware Interleaving

Pendekatan berbasis perangkat keras yang memanfaatkan sinkronisasi milidetik antara *refresh rate* papan LED stadion dan kecepatan penutupan *shutter* kamera penyiaran.

## AI Virtual Overlay

Pendekatan berbasis perangkat lunak yang menggunakan kecerdasan buatan (*computer vision*) untuk mengganti konten papan LED secara digital di tingkat studio pemrosesan sinyal siaran.
;;

## Teknologi 1: Hardware Interleaving (Multi-Frame Syncing)

Teknologi ini bekerja secara fisik di lapangan tanpa bantuan manipulasi grafik komputer pada pita video siaran. Papan LED dan kamera siaran bekerja beriringan dalam kecepatan tinggi.

### 1. Prinsip Refresh Rate Layar LED

Papan LED perimeter khusus memiliki *refresh rate* super cepat (contohnya $240\text{ Hz}$ hingga $1000\text{ Hz}$). Artinya, dalam $1\text{ detik}$, layar mampu berganti frame gambar hingga ratusan atau ribuan kali.

Dalam kurun $1\text{ detik}$, layar memutar urutan gambar iklan yang berbeda secara bergantian (*interleaving*) dalam skala milidetik:

* **Frame 1:** Iklan Wilayah A (misal: Indonesia)
* **Frame 2:** Iklan Wilayah B (misal: Jepang)
* **Frame 3:** Iklan Wilayah C (misal: Inggris)
* **Frame 4:** Iklan Wilayah D (misal: Brasil)

Pola urutan 4 frame unik ini diulang terus-menerus sebanyak 60 kali dalam $1\text{ detik}$.

### 2. Mekanisme Shutter Kamera dan Phasing Timing

Di sisi lain, kamera siaran merekam dengan kecepatan standar penyiaran, yaitu $60\text{ FPS}$ (60 frame per second).

:::note Pemahaman Dasar Shutter Kamera
*Shutter* pada kamera adalah durasi jendela sensor terbuka untuk menerima cahaya dan merekam 1 frame foto. *Shutter* tidak bertugas memotong, menjeda, atau menumpuk video, melainkan menentukan **kapan dan berapa lama** sensor mengambil cahaya dalam skala milidetik.
:::

Kamera untuk tiap-tiap wilayah dipasang sistem sinkronisasi sinyal (*genlock*) yang mengatur jadwal pembukaan *shutter* tepat pada milidetik tertentu:

```text
Frame LED (240Hz)  : [A] [B] [C] [D] [A] [B] [C] [D] ...
Kamera Indonesia   :  |               |             ... (Menangkap frame A)
Kamera Jepang      :      |               |         ... (Menangkap frame B)
Kamera Inggris     :          |               |     ... (Menangkap frame C)
```

1. **Kamera Feed Indonesia ($60\text{ FPS}$):** *Shutter* hanya terbuka pada interval waktu penayangan Frame A. Kamera ini tidak merekam Frame B, C, dan D karena *shutter* tertutup saat frame tersebut muncul.
2. **Kamera Feed Jepang ($60\text{ FPS}$):** *Shutter* diselaraskan untuk hanya terbuka pada interval waktu penayangan Frame B.
3. **Kamera Feed Inggris ($60\text{ FPS}$):** *Shutter* diselaraskan untuk hanya terbuka pada interval waktu penayangan Frame C.

### 3. Persamaan Matematika Sinkronisasi

Agar metode *Hardware Interleaving* dapat berjalan, *refresh rate* papan LED harus merupakan kelipatan dari total kecepatan frame seluruh kamera yang ditargetkan:

$$
N = \frac{\text{refresh rate LED}}{\text{FPS feed}}
$$

Di mana $N$ adalah jumlah variabel feed/iklan wilayah yang ingin dihasilkan.

Jika dibutuhkan 4 feed siaran wilayah yang berbeda pada standar siaran $60\text{ FPS}$:

$\text{refresh rate LED minimum} = 4 \times 60\text{ Hz} = 240\text{ Hz}$

## Teknologi 2: AI Virtual Overlay (Virtual Replacement Technology)

Pada ajang berskala masif seperti FIFA World Cup, metode **AI Virtual Overlay (VRT)** lebih dominan digunakan karena tidak memiliki keterbatasan jumlah feed siaran.

```text
+------------------+     +------------------------+     +-----------------------+
|  Papan LED Fisik | --> | Kamera Siaran Standar  | --> |  Server AI Tracking   |
| (Sponsor Global) |     |  (Menangkap Video Raw) |     | (Segmentasi & Overlay)|
+------------------+     +------------------------+     +-----------------------+
                                                                    |
                                                                    v
                                                        +-----------------------+
                                                        | Feed Tersegmentasi    |
                                                        | (Tiap Negara Berbeda) |
                                                        +-----------------------+
```

### Cara Kerja Pemrosesan Software

1. **Papan Stadion Fisik:** Hanya menampilkan iklan sponsor global biasa (misalnya Coca-Cola atau Visa).
2. **Real-Time Spatial Tracking:** Komputer dengan *computer vision* memetakan posisi dan koordinat 3D dari papan iklan fisik secara presisi pada setiap frame siaran langsung.
3. **Player Occlusion & Keying (Segmentasi Pemain):** Saat pemain bola berlari di depan papan iklan, AI secara otomatis mendeteksi batas tubuh pemain (*masking/segmentation*) per frame.
4. **Digital Replacement:** Komputer menimpa (*overlay*) area papan iklan fisik dengan grafis iklan digital lokal (misalnya merek lokal Indonesia), sembari mempertahankan lapisan tubuh pemain di bagian paling depan (*foreground*).

:::tip Efek Occlusion Pemain
Tanpa deteksi *occlusion* yang presisi, gambar iklan digital akan menimpa tubuh pemain, membuat pemain terlihat terpotong atau tertutup grafik iklan secara tidak natural.
:::

## Miskonsepsi Populer dan Fakta Sebenarnya

Terdapat beberapa pemahaman keliru yang sering beredar di media sosial terkait teknologi ini.

:::danger Miskonsepsi #1: Penggunaan Green Screen
**Fakta:** Stadion modern tidak lagi menggunakan papan *green screen* kain atau LED hijau polos. Penggunaan warna hijau polos akan mengganggu pandangan penonton di stadion dan menyulitkan pemetaan jika warna jersey pemain menyerupai warna hijau.
:::

:::caution Miskonsepsi #2: Kamera Menggunakan FPS Berbeda Tiap Negara
**Fakta:** Kecepatan rekaman kamera (*FPS*) seluruh feed negara adalah **sama** (misalnya $50\text{ FPS}$ atau $60\text{ FPS}$) untuk menjaga kelancaran standar siaran televisi. Yang membedakan antar-kamera pada metode *Hardware Syncing* adalah **fasa timing milidetik** penangkapan sensornya, bukan jumlah total frame per detiknya.
:::

:::note Miskonsepsi #3: Shutter Kamera Menjeda Rekaman Video
**Fakta:** *Shutter* adalah pengaturan durasi pencahayaan sensor dalam durasi milidetik, bukan fitur jeda (*pause*). Video hasil rekaman tetap berjalan secara kontinu di $60\text{ FPS}$ tanpa ada jeda atau penurunan kualitas gerakan.
:::

:::info Miskonsepsi #4: Penonton di Stadion Melihat Iklan Lokal
**Fakta:** Penonton langsung di stadion tidak dapat mengisolasi satu iklan wilayah pada metode *Hardware Syncing* karena mata manusia tidak memiliki sistem *shutter*. Penonton fisik akan melihat tampilan iklan tumpang tindih (*blended*) atau pendaran cahaya cepat, atau melihat iklan sponsor global fisik jika stadion menggunakan metode *AI Virtual Overlay*.
:::

## Tabel Perbandingan Teknologi

| Karakteristik | Hardware Interleaving (Syncing) | AI Virtual Overlay (Software) |
| :--- | :--- | :--- |
| **Mekanisme Utama** | Sinkronisasi *shutter* kamera & *refresh rate* LED | Penggantian grafik digital berbasis AI (*real-time*) |
| **Kapasitas Target Feed** | Terbatas oleh Hz LED ($N = \text{Hz} / \text{FPS}$) | **Tidak terbatas** (Bisa ratusan wilayah) |
| **Kebutuhan Perangkat** | LED *high-refresh* khusus & kamera *genlocked* | Papan LED standar & server rendering pemrosesan |
| **Kondisi Pengoperasian** | Peka terhadap perubahan cuaca ekstrem di lapangan | Stabil melalui pemrosesan grafik di *control room* |
| **Kenyamanan di Stadion** | Berpotensi menimbulkan kedipan (*flicker*) | Tampilan fisik di stadion tetap stabil & tenang |

## Referensi

* Supponor. (2021). *Virtual Replacement Technology in Sports Broadcasting*. Supponor Technical Whitepaper.
* Univtec & DBICS Systems. (2020). *Multi-Channel Interleaving LED Technology for Dynamic Advertising*. IEEE Transactions on Broadcasting, 66(2), 310-318.
* AIM Sport Vision. (2022). [*Digital Overlay Technology in European Football Leagues*. Sports Video Group (SVG).](https://www.sportsvideo.org)
* FIFA TV Technology Division. (2022). *Advanced Virtual Graphics and Targeted Advertising in FIFA World Cup*. FIFA Technical Report.
