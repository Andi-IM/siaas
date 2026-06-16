# 0015: Seeding Database untuk Pengembangan dan Pengujian

**Status:** accepted
**Date:** 2026-06-16

## Context and Problem Statement

Untuk mendukung pengembangan fitur, demonstrasi, dan pengujian integrasi secara lokal, sistem membutuhkan data sampel (seed data) yang representatif. Data ini harus mencakup entitas akademik utama (program, konsentrasi, mata pelajaran, angkatan, semester), profil siswa (data pribadi), serta nilai siswa (student_grades) yang valid dan saling terelasi tanpa merusak integritas referensi (Foreign Key).

## Decision

Kami mengimplementasikan strategi seeding database menggunakan skrip SQL modular sebagai berikut:

1.  **Seed Academic Core (`seed_academic_core.sql`)**: 
    - Menginisialisasi data Program Keahlian, Jurusan (Majors), Batches (Angkatan 2024), Semesters (1-6 dan UKK), Subjects (Mata Pelajaran Kelompok Umum & Kejuruan).
    - Memetakan mata pelajaran ke kurikulum angkatan 2024 melalui tabel `curriculum_subjects`.
2.  **Seed Students (`seed_students.sql`)**:
    - Memasukkan 5 data siswa sampel dengan ID tetap dan profil valid yang terhubung ke jurusan Teknik Pemesinan (TP) dan Teknik Mekanik Industri (TMI).
3.  **Seed Student Grades (`seed_grades.sql`)**:
    - Skrip yang di-generate secara otomatis untuk menghubungkan 5 siswa dengan seluruh 78 mata pelajaran kurikulum yang relevan dengan jurusan mereka.
    - Memasukkan total 390 entri nilai akademis (`student_grades`) dengan rentang nilai yang realistis dan bervariasi berdasarkan profil akademis masing-masing siswa (misalnya Ahmad Fauzi dengan profil nilai tinggi, Eko Prasetyo dengan profil nilai bervariasi).
4.  **Eksekusi Seeding**:
    - Pengembang dapat memasukkan data seed ini secara langsung ke SQLite database lokal (`sias.db`) menggunakan CLI sqlite3 atau perkakas database lainnya.

## Consequences

*   **Positive:** Mempermudah demonstrasi aplikasi dengan data nilai dan siswa yang lengkap (390 entri nilai).
*   **Positive:** Membantu pengujian modul rekapitulasi data dan pembuatan transkrip nilai secara real-time dengan skenario data dunia nyata.
*   **Positive:** Menjaga integritas database karena semua ID UUID dan relasi foreign key telah divalidasi sebelumnya.
*   **Negative:** Skrip seed bersifat statis; jika ada perubahan pada kurikulum atau subjek baru, skrip `seed_grades.sql` perlu di-generate ulang.

## Implementation Plan

- **SQL Scripts**: Membuat dan memelihara file di folder `/scripts`:
  - `seed_academic_core.sql`
  - `seed_students.sql`
  - `seed_grades.sql`
- **Database Integration**: Eksekusi melalui skrip shell/PowerShell untuk mempermudah setup lingkungan pengembangan baru.

## Verification

- [x] Eksekusi sukses tanpa error constraint foreign key pada database SQLite lokal.
- [x] Seluruh data nilai (390 entri) berhasil terpetakan dengan benar dan tampil pada tabel rekapitulasi nilai di frontend.
