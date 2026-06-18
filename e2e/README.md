# Pengujian End-to-End (E2E) SIAS

Folder ini berisi seluruh perlengkapan dan skrip untuk pengujian *End-to-End* (E2E) pada aplikasi desktop SIAS (Sistem Informasi Akademik Sekolah).

Pengujian dilakukan menggunakan **[WebdriverIO](https://webdriver.io/)** (WDIO) yang secara langsung mengontrol *WebView2* (browser internal yang digunakan oleh Tauri di Windows) untuk mensimulasikan interaksi pengguna yang sesungguhnya.

## Teknologi yang Digunakan
- **WebdriverIO (v9):** Sebagai *test runner* dan *automation framework*.
- **Mocha:** Sebagai *testing framework* (`describe`, `it`, `before`, `beforeEach`).
- **@wdio/globals:** Untuk mengakses variabel global seperti `browser`, `$`, `$$`, dan `expect`.

## Struktur Direktori
```text
e2e/
├── test/
│   ├── seeds/           # Skrip untuk inisialisasi data (seeding) sebelum tes berjalan
│   │   └── academic.js  # Seeder untuk data Program, Konsentrasi, dan Mapel
│   └── specs/           # Kumpulan skenario pengujian E2E (.e2e.js)
│       ├── kurikulum.e2e.js
│       └── siswa.e2e.js
├── wdio.conf.js         # Konfigurasi utama WebdriverIO untuk Tauri
└── package.json         # Dependensi E2E
```

## Prasyarat
Sebelum menjalankan pengujian, pastikan aplikasi Tauri telah berhasil di-*build* dalam mode debug. Jika tidak, WDIO akan gagal menemukan *executable*. Tes E2E akan menggunakan dan mengubah database lokal pengembangan (`src-tauri/target/debug/sias_dev.db`).

## Cara Menjalankan Tes

1. Buka terminal dan masuk ke folder `e2e`:
   ```bash
   cd e2e
   ```
2. Instal dependensi (hanya dilakukan sekali):
   ```bash
   pnpm install
   ```
3. Jalankan seluruh pengujian:
   ```bash
   pnpm test
   ```
   Atau untuk menjalankan file pengujian spesifik:
   ```bash
   pnpm test --spec test/specs/siswa.e2e.js
   ```

## Proses Seeding Database
Untuk menjamin pengujian berjalan secara independen dan *idempotent* (hasilnya selalu sama terlepas dari state sebelumnya), pengujian menggunakan skrip *seeding*.

Sebagai contoh, pada pengujian Siswa (`siswa.e2e.js`), sebelum tes pertama dijalankan, skrip memanggil `seedAcademicCore()` dari folder `seeds`. Skrip ini akan mengeksekusi *command-line* `sqlite3` untuk menyuntikkan data skema kurikulum awal ke dalam `sias_dev.db` menggunakan file SQL yang berada di root proyek (`scripts/seed_academic_core.sql`).

## Fitur Tangkapan Layar (Screenshots) Otomatis
Pengujian ini telah dikonfigurasi untuk menangkap layar (*screenshot*) pada momen-momen penting (misalnya ketika modal terbuka atau data baru ditambahkan).
Gambar-gambar tersebut secara otomatis disimpan ke direktori `docs/user-guide/images/` untuk digunakan secara langsung di dalam dokumentasi **Panduan Pengguna** Markdown di Github/Gitlab. 

Hal ini memastikan dokumentasi panduan SIAS selalu *up-to-date* dengan tampilan antarmuka aplikasi terbaru secara otomatis setiap kali tes E2E dijalankan.
