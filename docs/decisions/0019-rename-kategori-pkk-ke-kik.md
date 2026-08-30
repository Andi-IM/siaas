# 0019: Penyesuaian Penamaan Kategori Transcript Group PKK Menjadi KIK

* **Status:** accepted
* **Date:** 2026-08-30
* **Deciders:** Andi-IM, Gemini CLI
* **Amends:** ADR-0018 (revisi enum transcript_group PKK -> KIK)

## Context and Problem Statement

Pada ADR-0018, kategori ujian kejuruan/keahlian diklasifikasikan dengan nama `PKK`. Berdasarkan pembaruan nomenklatur kurikulum dan standar administrasi akademik terbaru, kategori tersebut kini resmi disesuaikan menjadi **KIK (Kreativitas, Inovasi, dan Kewirausahaan)**.

## Decision

1. **Enum `TranscriptGroup`**:
   Nilai enum `PKK` diperbarui menjadi `KIK`:
   ```
   UMUM | KEJURUAN_UMUM | KEJURUAN_DASAR | KEJURUAN_KONSENTRASI | KIK | PKL | PILIHAN
   ```

2. **Migrasi Database (Migration 15)**:
   Menjalankan migrasi database otomatis untuk memperbarui record lama:
   ```sql
   UPDATE subjects SET transcript_group = 'KIK' WHERE transcript_group = 'PKK';
   ```

3. **Frontend & Logika Transkrip**:
   - Opsi pada dropdown Manajemen Kurikulum ditampilkan sebagai:
     `KIK (Kreativitas, Inovasi, dan Kewirausahaan)`
   - Aturan agregasi nilai Konsentrasi Keahlian pada Transkrip Nilai tetap memperhitungkan nilai KIK:
     ```
     Nilai Konsentrasi Keahlian = (Avg S3 + Avg S4 + Avg S6 + Nilai KIK) / 4
     ```
   - Mata pelajaran KIK tetap disembunyikan dari baris Transkrip 3 Tahun (karena telah diagregasi ke dalam Konsentrasi Keahlian).

4. **Seed Data**:
   File `scripts/seed_academic_core.sql` diselaraskan menggunakan `transcript_group = 'KIK'`.

## Consequences

* Keselarasan 100% dengan istilah kurikulum resmi (KIK).
* Database termigrasi secara otomatis dan backward compatible.
