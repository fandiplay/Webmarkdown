---
title: "SSH Multi Account GitHub di Termux"
description: "Panduan menggunakan beberapa akun GitHub pada satu perangkat Termux tanpa perlu logout, login ulang, atau mengganti SSH key."
slug: "ssh-multi-account-termux"
tags: ["termux", "tutorial"]
createdAt: "2026-07-08"
updatedAt: "2026-07-08"
written: "Admin"
pinned: false
draft: false
cover: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&q=80"
---

# SSH Multi Account GitHub di Termux
Menggunakan beberapa akun GitHub pada satu perangkat Termux tanpa perlu logout, login ulang, atau mengganti SSH key.

[[toc]]

## Sebelum Memulai: Atur Identitas Git Lokal
Agar setiap commit menggunakan identitas akun yang sesuai, atur user.name dan user.email secara lokal di setiap repository.
Jalankan perintah berikut di dalam folder repository sebelum melakukan commit pertama.

```bash title="termux"
$ git config --local user.name "fandiplay"
$ git config --local user.email "12345678+fandiplay@users.noreply.github.com"

```

:::info
**--local** berarti pengaturan hanya berlaku untuk repository ini, tidak mengganggu repository lain.
Ganti fandiplay dan email dengan akun yang sesuai untuk repository lain.
:::

## Tujuan & Konsep Dasar
Tujuan utama adalah menggunakan beberapa akun GitHub pada satu perangkat tanpa menimpa akses satu sama lain.
SSH menggunakan dua buah key:
 * **Private Key (Rahasia):** Disimpan di perangkat. Jangan pernah dibagikan.
 * **Public Key (Aman dibagikan):** Diunggah ke GitHub. Aman untuk dibagikan.
**Saat autentikasi terjadi:**
 1. GitHub mengirim challenge.
 2. Private key membuat signature secara lokal.
 3. Signature dikirim ke GitHub.
 4. GitHub memverifikasi menggunakan public key.
    
:::tip Keamanan Terjamin
**Private key tidak pernah dikirim ke GitHub.** Seluruh proses pembuatan signature terjadi murni di dalam perangkatmu.
:::

## Struktur Folder & Fungsi File
Contoh struktur di dalam ~/.ssh/:
```text title="Filesystem"
~/.ssh/
├── id_ed25519
├── id_ed25519.pub
├── id_ed25519_fandiplay
├── id_ed25519_fandiplay.pub
├── config
├── known_hosts
└── authorized_keys

```

### Penjelasan File
 * id_ed25519 & id_ed25519_fandiplay: **Private key.** (RAHASIA). Jangan pernah di-upload ke GitHub, dikirim ke orang lain, atau di-commit ke repo.
 * id_ed25519.pub & id_ed25519_fandiplay.pub: **Public key.** (AMAN). File inilah yang isinya disalin ke GitHub.
 * known_hosts: Daftar fingerprint server yang pernah dipercaya (mencegah terhubung ke server palsu).
 * authorized_keys: Hanya digunakan jika perangkat menjadi SSH Server (tidak dipakai untuk login ke GitHub).
 * config: Memberitahu SSH key mana yang harus digunakan berdasarkan *host*. **Ini adalah otak dari fitur multi-account.**

## 1. Membuat SSH Key Baru
Format umum untuk membuat key:

```bash title="termux"
ssh-keygen -t ed25519 -C "email@example.com" -f ~/.ssh/id_ed25519_namaakun

```
Contoh eksekusi:
```bash title="termux"
ssh-keygen -t ed25519 -C "user@gmail.com" -f ~/.ssh/id_ed25519_fandiplay

```

:::note Parameter SSH
 * **-t ed25519**: Algoritma key modern yang lebih aman dan cepat dari RSA.
 * **-C**: Komentar (biasanya email) untuk memudahkan identifikasi.
 * **-f**: Menentukan lokasi dan nama file *output*.
   :::
   
## 2. Melihat Public Key
Tampilkan isi public key untuk disalin:

```bash title="termux"
$ cat ~/.ssh/id_ed25519_fandiplay.pub
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI... user@gmail.com

```

Salin **seluruh** hasilnya, lalu tempel ke:
**GitHub → Settings → SSH and GPG Keys → New SSH Key**
## 3. Konfigurasi config
Edit file ~/.ssh/config. Jika file belum ada, buat menggunakan editor seperti nano.

```bash title="termux"
nano ~/.ssh/config

```
Masukkan konfigurasi berikut:

```text title="~/.ssh/config"
Host *
ServerAliveInterval 30
ServerAliveCountMax 10

Host github-fandevid
HostName github.com
User git
IdentityFile ~/.ssh/id_ed25519
IdentitiesOnly yes

Host github-fandiplay
HostName github.com
User git
IdentityFile ~/.ssh/id_ed25519_fandiplay
IdentitiesOnly yes

```

### Detail Penjelasan Parameter
 * **Host**: Ini adalah *Alias*. Hanya dikenal oleh SSH di perangkatmu lokal (misal: github-fandevid).
 * **HostName**: Server asli. Semua alias akhirnya akan diarahkan ke github.com.
 * **IdentityFile**: Menentukan letak private key yang harus digunakan untuk alias tersebut.
 * **IdentitiesOnly yes**: Memaksa SSH *hanya* menggunakan key yang ditentukan pada IdentityFile, menghindari percobaan banyak key sekaligus yang bisa ditolak server.
## 4. Menguji SSH
Lakukan pengujian koneksi ke masing-masing alias.
Uji akun pertama:

```bash title="termux"
ssh -T git@github-fandevid

```
Uji akun kedua:
```bash title="termux"
ssh -T git@github-fandiplay

```

:::tip Indikator Sukses
Jika output yang keluar adalah: **"Hi username! You've successfully authenticated, but GitHub does not provide shell access."**
Artinya konfigurasi SSH berhasil. Itu **bukan error**.
:::
## 5. Menghubungkan Repository
Cek URL remote repository kamu saat ini:

```bash title="termux"
git remote -v

```
Ubah URL remote agar menggunakan **Alias Host** yang sudah dibuat di ~/.ssh/config.
Untuk akun pertama:
```bash title="termux"
git remote set-url origin git@github-fandevid:fandevid/repository.git

```
Untuk akun kedua:
```bash title="termux"
git remote set-url origin git@github-fandiplay:fandiplay/repository.git

```
Setelah diatur, kamu bisa langsung eksekusi tanpa menentukan akun lagi:
```bash title="termux"
git pull
git push

```

:::info
SSH akan otomatis memilih key yang benar berdasarkan alias (github-fandevid atau github-fandiplay) yang tertera di remote URL repository tersebut.
:::
## FAQ & Referensi
### Kenapa Tidak Otomatis?
Secara default SSH hanya mengetahui domain github.com. SSH tidak memiliki kemampuan meramal akun GitHub mana yang ingin kamu gunakan sebelum autentikasi selesai.
Karena itu, kita memberi instruksi eksplisit lewat alias di file config:
 * github-fandevid → baca id_ed25519 → tembak ke github.com
 * github-fandiplay → baca id_ed25519_fandiplay → tembak ke github.com
   
### Hal Wajib Diingat
:::danger SANGAT RAHASIA
**Jangan pernah membagikan atau mempublikasikan:**
id_ed25519, id_ed25519_fandiplay
:::

:::tip PUBLIK
**Boleh dibagikan ke server mana saja:**
id_ed25519.pub, id_ed25519_fandiplay.pub
:::
### Alur Kerja Ringkas
 1. Kamu jalankan git push
 2. Git membaca remote origin
 3. SSH mencegat dan membaca ~/.ssh/config
 4. SSH memilih private key yang cocok dengan alias
 5. Terhubung ke github.com
 6. GitHub mengirim challenge kriptografi
 7. Private key merespons dengan signature
 8. GitHub memverifikasi dengan public key yang kamu pasang di web
 9. **Autentikasi berhasil**
