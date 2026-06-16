# 0014: Pelaporan Bug Otomatis dengan Log Diagnostik

**Status:** accepted
**Date:** 2026-06-16

## Context and Problem Statement

Sebagai aplikasi desktop yang dijalankan di berbagai lingkungan pengguna, mendiagnosis bug atau kesalahan teknis (seperti kegagalan database atau error runtime) seringkali sulit jika hanya mengandalkan deskripsi teks dari pengguna. Tim pengembang membutuhkan data teknis yang akurat (logs) untuk mereproduksi dan memperbaiki masalah dengan cepat.

## Decision

Kami mengimplementasikan fitur **Pelaporan Bug Terpadu** dengan ketentuan sebagai berikut:

1.  **Ekstraksi Log Otomatis**: Aplikasi secara otomatis mengambil log aktivitas terbaru menggunakan perintah Tauri `get_app_logs` saat pengguna mengirim laporan.
2.  **Endpoint Terpusat**: Laporan dikirim ke endpoint REST API terpusat (`https://sias-api-893975406407.us-central1.run.app/issues`) yang dikelola oleh tim pengembang.
3.  **Keamanan & Integritas**: 
    - Menggunakan header `X-SIAAS-App-Token` untuk memastikan laporan hanya datang dari aplikasi resmi.
    - Implementasi *rate limiting* di sisi server untuk mencegah spam.
4.  **Privasi Data**: Log yang dikirim hanya berisi informasi teknis aplikasi (query SQL, error runtime, status sistem). Data pribadi siswa (seperti nama, alamat, dll) secara sadar tidak disertakan dalam log diagnostik untuk mematuhi prinsip privasi.
5.  **Pengalaman Pengguna**:
    - Shortcut keyboard `Ctrl+Enter` untuk pengiriman cepat.
    - Feedback visual yang jelas untuk status pengiriman (loading, success, error).
    - Desain modal yang mengikuti standar UI "Academic Administrative Core" tanpa ketergantungan pada Tailwind CSS.

## Consequences

*   **Positive:** Mempercepat waktu perbaikan bug karena log teknis tersedia langsung bersama deskripsi pengguna.
*   **Positive:** Mengurangi beban pengguna dalam menjelaskan detail teknis yang rumit.
*   **Negative:** Membutuhkan koneksi internet untuk mengirim laporan (meskipun aplikasi utama bersifat offline-first).
*   **Negative:** Menambah dependensi pada infrastruktur cloud eksternal untuk penampungan isu.

## Implementation Plan

- **Frontend**: Komponen `BugReportModal.tsx` diintegrasikan pada halaman `Pengaturan` dan Sidebar.
- **Backend (Tauri)**: Implementasi command `get_app_logs` di Rust untuk membaca file log lokal.
- **Testing**: Test case di `pengaturan.test.tsx` memverifikasi alur pengiriman dan integrasi log.

## Verification

- [x] Laporan berhasil masuk ke dashboard tim pengembang dengan lampiran log lengkap.
- [x] `npm run test` menunjukkan 100% coverage pada logika pengiriman laporan bug.
- [x] Audit desain (Impeccable Critique) mengonfirmasi konsistensi visual modal.
