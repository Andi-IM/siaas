# 0007: Pola View-Wrapper untuk Menghindari Ghost Lines Istanbul

**Status:** accepted
**Date:** 2026-06-16

## Context and Problem Statement

Pada pengujian aplikasi SIAAS yang berbasis Next.js App Router menggunakan Vitest dan provider coverage Istanbul, kami mendapati adanya anomali *coverage* berupa *ghost lines*. *Ghost lines* ini menunjukkan baris-baris kosong atau baris yang sebenarnya tidak dapat dieksekusi seolah-olah tidak tercover (uncovered). 

Analisis menunjukkan bahwa masalah ini merupakan efek dari *double-instrumentation* dan *statement map overriding* oleh Istanbul saat *parallel workers* pada Vitest menjalankan file secara dinamis melalui tes sekaligus memindainya secara statis. Hal ini sering terjadi pada file *page wrapper* Next.js (seperti yang hanya berisi `Suspense`) ketika komponen inner (View) dimock secara langsung dengan *static path*.

## Decision

Untuk memastikan *test coverage* yang valid dan mencapai 100%, kami mengadopsi **Pola View-Wrapper (Single Source of Compilation)** untuk setiap rute halaman:

1. **Pemisahan Modul**: File `app/[fitur]/page.tsx` murni digunakan sebagai *thin wrapper* (seperti `Suspense` boundary atau layout minimalis).
2. **Komponen Inti di View**: Seluruh logika utama dipindahkan ke komponen terpisah berakhiran `View.tsx` (misal: `TambahSiswaView.tsx`).
3. **Pola Pengujian (Krusial)**: 
   - Di test integrasi utama (misal `siswa_add.test.tsx`), **jangan hanya merender komponen `View`**. Sebaliknya, impor dan **render komponen `Wrapper` (`page.tsx`)** agar worker memuat dan mengkompilasi file *wrapper* secara bersamaan dalam alur yang sama.
   - Pada file test terpisah khusus *wrapper*, hindari penggunaan `vi.mock("@/app/...")` statis. Gunakan impor asli `import * as ViewModule from "./View"` dan lakukan mock menggunakan `vi.spyOn(ViewModule, "default")`.
4. **Lokasi Fallback**: Pindahkan komponen Fallback (seperti Skeleton Loading) ke luar `page.tsx` (misalnya diekspor dari file `View`) agar *wrapper* `page.tsx` menjadi seringkas mungkin.

## Consequences

*   **Positif:** Laporan *coverage* akurat (menghilangkan *ghost lines*) dan representatif.
*   **Positif:** Pemisahan *concerns* yang lebih rapi antara asynchronous boundary (di `page.tsx`) dengan logika interaksi klien (di `[Page]View.tsx`).
*   **Negatif:** Sedikit penambahan *boilerplate* saat membuat halaman baru karena selalu membutuhkan dua file (Page dan View) serta test *wrapper* tersendiri.

## Implementation Plan

- **Affected paths**: Pola ini diaplikasikan pada semua halaman rute Next.js (seperti `src/app/siswa/tambah`, `src/app/siswa/detail`, dan `src/app/siswa/edit`).
- **Pattern**: Rendering komponen `page.tsx` utama pada file unit test komponen `[Page]View`.
- Kebijakan ini **wajib** diikuti untuk seluruh modul halaman baru agar tidak terjadi kemunduran (regresi) pada persentase test coverage.

## Verification

- [x] `npm run test:coverage` menunjukkan 100% *statements*, *branches*, *functions*, dan *lines* pada fitur-fitur yang direfaktor (`tambah`, `edit`, `detail`).
- [x] Angka *ghost lines* (seperti *line* 397-766 pada file berukuran < 100 baris) tidak lagi muncul di dalam laporan *coverage*.
