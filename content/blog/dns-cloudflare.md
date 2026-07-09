---
title: "Dari Domain Mentah Sampai Online: Panduan Setup DNS Cloudflare & Vercel Deployment"
description: "Panduan lengkap migrasi Nameserver dari registrar lokal ke Cloudflare, konfigurasi DNS record untuk Vercel Anycast IP, hingga website kamu bisa diakses publik menggunakan HTTPS secara instan."
slug: "panduan-dns-cloudflare-vercel"
tags: ["dns", "cloudflare", "vercel", "domain"]
createdAt: "2026-07-09"
updatedAt: "2026-07-09"
written: "Support written by AI"
pinned: false
draft: false
cover: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80"
---

Menghubungkan domain kustom (domain.com) ke hosting modern seperti Vercel sering kali menjadi momok bagi developer pemula. Banyak yang bingung karena perubahan data di dashboard tidak kunjung update, atau websitenya malah berstatus "Koneksi tidak aman".
Masalah utamanya sederhana: **gagal paham cara kerja delegasi DNS dan rute anycast server**.
Di artikel ini, kita akan bedah habis alur perjalanan domain dari saat baru dibeli di registrar lokal, didelegasikan ke Cloudflare, hingga akhirnya *live* di Vercel secara aman (HTTPS)!

[[toc]]

## Alur Kerja Resolusi Domain ke Vercel
Sebelum kita masuk ke langkah praktis, mari kita pahami bagaimana internet mengarahkan pengunjung ke website Vercel kamu. Vercel menggunakan jaringan **Anycast** global, yang berarti domain kamu akan diarahkan ke satu IP pintar yang otomatis memilih server terdekat dari lokasi pengunjung.

& route GET /index.html Cari alamat server fisik lewat DNS Anycast Vercel &

< response 200 Mengembalikan file HTML dari Edge Network terdekat <
Jika dianalogikan ke dunia nyata:
 * **Domain** adalah nama toko kamu (misal: webku).
 * **Vercel Anycast IP** (76.76.21.21) adalah nomor panggilan pusat yang otomatis menghubungkan pelanggan ke cabang toko terdekat.
 * **DNS Manager Cloudflare** adalah operator telepon yang mencatat nomor panggilan pusat tersebut.
## Langkah 1: Registrasi Domain & Migrasi Nameserver
Langkah pertama adalah membeli domain di registrar lokal (seperti GROW Digital, DomaiNesia, Niagahoster, dll). Setelah domain aktif, kamu akan mendapatkan akses ke dashboard manajemen domain.

:::warning Jebakan Dashboard Lama
Bawaan pabrik dari registrar lokal biasanya menyertakan DNS Manager mereka sendiri. Namun, performa DNS mereka seringkali lambat dan tidak memiliki proteksi keamanan yang baik. Di sinilah kita butuh bantuan **Cloudflare**.
:::
Untuk memindahkan hak kontrol DNS ke Cloudflare, kita harus mengganti **Nameserver (NS)** bawaan registrar menjadi Nameserver milik Cloudflare.

;;tabs
## Default Nameserver (GROW Digital)
```text
dns1-parking.masterweb.com
dns2-parking.masterweb.com
```
## Custom Nameserver (Cloudflare)
```text
armfazh.ns.cloudflare.com
sky.ns.cloudflare.com
```
;;
### Langkah Eksekusi Migrasi:
 1. Daftarkan akun baru di **Cloudflare**, masukkan domain kamu (contoh: webku.my.id).
 2. Cloudflare akan mendeteksi secara otomatis DNS record lama kamu, lalu memberikan kamu dua alamat **Custom Nameservers** baru.
 3. Masuk ke dashboard registrar tempat kamu beli domain, cari menu **Nameservers / DNS Management**.
 4. Ubah tipe Nameserver dari **Default** menjadi **Custom**, lalu masukkan dua alamat Nameserver yang dikasih Cloudflare tadi.
 5. Klik **Save**.
    
:::note Mengenal Propagasi
Proses pergantian Nameserver ini membutuhkan waktu transfer otoritas secara global sekitar \approx 1 hingga 24\text{ jam}. Selama masa ini, jangan utak-atik dashboard registrar lama kamu karena hak kontrolnya sudah resmi berpindah!
:::
## Langkah 2: Menghubungkan Domain ke Vercel
Asumsikan kamu sudah sukses melakukan deploy project website kamu ke Vercel lewat CLI ataupun integrasi GitHub.

```bash title="Deploy project ke Vercel via CLI"
vercel --prod
```
Secara default, Vercel akan memberikan kamu domain gratisan berakhiran .vercel.app. Untuk menggunakan domain kustom sendiri:
 1. Buka **Vercel Dashboard**, masuk ke project kamu, pilih tab **Settings** > **Domains**.
 2. Masukkan nama domain kustom kamu: webku.my.id, lalu klik **Add**.
 3. Vercel secara pintar akan mendeteksi apakah kamu menggunakan domain utama (*apex domain*) atau subdomain (seperti www).
 4. Kamu akan diberikan petunjuk konfigurasi DNS yang sangat spesifik:
   * **Untuk Domain Utama (webku.my.id)**: Diarahkan menggunakan **A Record** ke IP 76.76.21.21.
   * **Untuk Subdomain (www.webku.my.id)**: Diarahkan menggunakan **CNAME Record** ke cname.vercel-dns.com.
## Langkah 3: Konfigurasi DNS di Dashboard Cloudflare
Buka dashboard **Cloudflare** kamu (bukan dashboard registrar lokal lagi!). Di sinilah kita akan memasukkan data petunjuk jalan dari Vercel tadi.
### 1. Mengarahkan Domain Utama (A Record)
 * Klik menu **DNS** > **Records**.
 * Klik **+ Add record**.
 * Pilih Type: A.
 * Kolom Name: Isi @ (artinya domain utama).
 * Kolom IPv4 address: Masukkan IP Anycast Vercel: 76.76.21.21.
 * **Proxy Status**: Setel ke **DNS Only** (Awan Abu-abu) untuk proses deteksi awal oleh Vercel.
 * Klik **Save**.
### 2. Mengarahkan Subdomain (CNAME Record)
 * Klik **+ Add record** lagi.
 * Pilih Type: CNAME.
 * Kolom Name: Isi www.
 * Kolom Target: Masukkan target DNS Vercel: cname.vercel-dns.com.
 * **Proxy Status**: Setel ke **DNS Only** (Awan Abu-abu).
 * Klik **Save**.

| Tipe Record | Hostname / Name | Value / Target | Status Proxy (Awal) |
| :--- | :--- | :--- | :--- |
| A | @ | 76.76.21.21 | **DNS Only (Abu-abu)** |
| CNAME | www | cname.vercel-dns.com | **DNS Only (Abu-abu)** |

## Langkah 4: Penerbitan Sertifikat Keamanan SSL (HTTPS)
Setelah semua record disimpan di Cloudflare, silakan kembali ke **Vercel Dashboard** di bagian menu **Domains** tadi. Vercel akan melakukan pengecekan secara berkala secara otomatis.
Begitu konfigurasi DNS terdeteksi sukses, status domain di Vercel akan langsung berubah menjadi centang hijau dan memproses penerbitan sertifikat SSL melalui Let's Encrypt.

:::danger Koneksi Tidak Aman!
Selama proses generate SSL (biasanya memakan waktu 2 - 10 menit), browser mungkin akan menampilkan peringatan keamanan jika kamu mencoba memaksa masuk lewat HTTPS. Tetap tenang dan jangan mengubah data DNS apa pun di fase ini.
:::
## Langkah 5: Mengaktifkan Cloudflare Proxy (Awan Orange)
Setelah gembok keamanan aktif di browser kamu dan website sudah resmi bisa diakses menggunakan HTTPS dengan lancar, kamu bisa melakukan optimasi akhir di Cloudflare.
Masuk kembali ke menu DNS Cloudflare, edit **A Record** dan **CNAME Record** yang barusan kamu buat, lalu ubah status Proxy dari **DNS Only (Abu-abu)** menjadi **Proxied (Awan Orange)**.

:::tip Mengapa Harus Di-proxy?
Mengaktifkan awan orange Cloudflare di atas infrastruktur Vercel memberikan lapisan keamanan ekstra (Web Application Firewall bawaan Cloudflare) dan mempercepat loading aset statis lewat mekanisme kompresi di server terdekat (Edge Cache).
:::
## Kesimpulan
Beralih ke Vercel memberikan kamu efisiensi tinggi dalam siklus *development*. Dengan mengandalkan Cloudflare sebagai pengatur lalu lintas DNS dan Vercel sebagai mesin penyaji website, kamu telah menciptakan kombinasi arsitektur web modern yang sangat solid, aman, dan tentunya 100% gratis!
Infrastruktur sudah matang, sistem penunjuk jalan sudah rapi. Sekarang saatnya kamu fokus mematangkan produk dan mulai menawarkan solusi pembuatan website profesional ini ke dunia nyata!
## Referensi
 * Cloudflare. (2026). [*Managing DNS records*. Cloudflare Docs.](https://developers.cloudflare.com/dns/)
 * Vercel. (2026). [*Configuring a Custom Domain on Vercel*. Vercel Docs.](https://vercel.com/docs/concepts/projects/domains)