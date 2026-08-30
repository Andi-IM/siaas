# 0018: Revisi Kategori Transcript Group dan Aturan Tampilan Transkrip Nilai

* **Status:** accepted
* **Date:** 2026-08-30
* **Deciders:** Andi-IM, Gemini CLI
* **Supersedes:** ADR-0016 (partially — amends transcript_group enum and display rules)

## Context and Problem Statement

ADR-0016 menetapkan skema `transcript_group` untuk mengklasifikasikan mata pelajaran ke dalam kelompok perhitungan transkrip. Setelah implementasi berjalan, ditemukan tiga ketidaksesuaian antara skema yang ada dengan aturan administrasi sekolah yang sesungguhnya:

1. **UKK masuk Konsentrasi, tetapi tidak tampil di Transkrip 3 Tahun**: UKK (Uji Kompetensi Keahlian) seharusnya *tidak* dimunculkan sebagai baris tersendiri di Transkrip 3 Tahun, namun nilainya tetap masuk ke dalam formula rata-rata Konsentrasi Keahlian. Perilaku ini sudah sebagian diimplementasikan di frontend, tetapi belum diformalkan sebagai keputusan arsitektur.

2. **Mata Pelajaran Pilihan ditampilkan dengan nama generik**: Pada Transkrip Nilai (non-3-tahun), mata pelajaran yang termasuk kategori pilihan harus ditampilkan sebagai **"Mata Pelajaran Pilihan"** — bukan nama aslinya. Ini adalah persyaratan format resmi administrasi.

3. **Penamaan kategori tidak konsisten dengan istilah resmi**:
   - Kategori `UKK` di `transcript_group` membingungkan karena `UKK` adalah nama mata pelajaran, bukan nama kelompok.
   - PKL (Praktik Kerja Lapangan) selama ini masuk ke `KEJURUAN_UMUM`, padahal secara administrasi PKL merupakan komponen terpisah dengan perlakuan khusus.
   - Kategori yang menampung ujian keahlian seharusnya dinamai **`PKK`** (Penilaian Keahlian Keahlian), bukan `UKK`.

## Decision Drivers

* Keselarasan dengan format administrasi resmi sekolah.
* Menghilangkan ambiguitas antara nama mata pelajaran (`UKK`) dan nama kategori (`UKK`).
* PKL memerlukan fleksibilitas perlakuan tersendiri di masa depan (nilai, semester, tampilan).
* Konsistensi antara perilaku frontend dan spesifikasi arsitektur.

## Decisions

### A. UKK: Disembunyikan dari Transkrip 3 Tahun, Masuk Formula Konsentrasi

**Keputusan**: Mata pelajaran dengan `transcript_group = 'PKK'` (sebelumnya `'UKK'`):
- **TIDAK** ditampilkan sebagai baris di Transkrip 3 Tahun.
- Nilainya **TETAP** digunakan dalam formula rata-rata Konsentrasi Keahlian pada Transkrip Nilai:
  ```
  Nilai Konsentrasi Keahlian = (Avg S3 + Avg S4 + Avg S6 + Nilai PKK) / 4
  ```
- Baris "Konsentrasi Keahlian" yang tampil di Transkrip Nilai **mencakup** PKK dalam perhitungannya.

### B. Mata Pelajaran Pilihan: Nama Generik di Transkrip Nilai

**Keputusan**: Mata pelajaran yang termasuk `transcript_group = 'PILIHAN'` (kelompok baru):
- Di **Transkrip 3 Tahun**: ditampilkan dengan nama asli mata pelajaran (mis. *Melukis*).
- Di **Transkrip Nilai** (non-3-tahun): **selalu** ditampilkan dengan label **"Mata Pelajaran Pilihan"**, terlepas dari nama aslinya.
- Logika ini diimplementasikan murni di layer presentasi frontend — tidak mengubah data yang tersimpan di database.

### C. Perubahan Enum `transcript_group`

**Keputusan**: Enum `TranscriptGroup` diubah dari:

```
UMUM | KEJURUAN_UMUM | KEJURUAN_DASAR | KEJURUAN_KONSENTRASI | UKK
```

Menjadi:

```
UMUM | KEJURUAN_UMUM | KEJURUAN_DASAR | KEJURUAN_KONSENTRASI | PKK | PKL | PILIHAN
```

| Nilai Lama | Nilai Baru | Keterangan |
|:---|:---|:---|
| `UKK` | `PKK` | Rename: kategori untuk ujian kompetensi keahlian |
| *(dalam KEJURUAN_UMUM)* | `PKL` | Baru: Praktik Kerja Lapangan dipisah menjadi kategori mandiri |
| *(tidak ada)* | `PILIHAN` | Baru: Mata pelajaran pilihan siswa |

## Consequences

### Positif
- Tidak ada lagi ambiguitas antara kode mata pelajaran `UKK` dan kategori `UKK`.
- PKL dapat diperlakukan secara independen (nilai, semester, tampilan transkrip) di iterasi berikutnya.
- Aturan tampilan "Mata Pelajaran Pilihan" terdokumentasi sebagai keputusan, bukan sekadar workaround.
- Enum yang lebih granular memudahkan penambahan aturan baru per kategori di masa depan.

### Negatif / Risiko
- **Breaking change pada database**: Semua baris dengan `transcript_group = 'UKK'` harus di-migrate ke `'PKK'`. Begitu pula PKL dari `'KEJURUAN_UMUM'` ke `'PKL'`.
- **Breaking change pada TypeScript**: Tipe `TranscriptGroup` di `src/lib/types.ts` harus diperbarui. Semua referensi string literal `"UKK"` di frontend harus diganti ke `"PKK"`.
- **Pembaruan seed data**: File `scripts/seed_academic_core.sql` harus diperbarui agar `transcript_group` UKK → `PKK` dan PKL → `PKL`.
- **Pembaruan tests**: Test suite di `transkrip_view.test.tsx` dan `kurikulum.test.tsx` menggunakan nilai enum lama dan harus diperbarui.

## Implementation Plan

### 1. Database Migration (Rust)
Tambahkan migration baru di `src-tauri/src/db/migrations.rs`:
```sql
-- Rename UKK → PKK
UPDATE subjects SET transcript_group = 'PKK' WHERE transcript_group = 'UKK';
-- Pisah PKL dari KEJURUAN_UMUM
UPDATE subjects SET transcript_group = 'PKL' WHERE code = 'PKL';
```

### 2. TypeScript Type Update
Update `src/lib/types.ts`:
```typescript
export type TranscriptGroup =
  | "UMUM"
  | "KEJURUAN_UMUM"
  | "KEJURUAN_DASAR"
  | "KEJURUAN_KONSENTRASI"
  | "PKK"   // renamed from UKK
  | "PKL"   // new: Praktik Kerja Lapangan
  | "PILIHAN"; // new: Mata Pelajaran Pilihan
```

### 3. Frontend: Logika Tampilan Transkrip
Update `src/app/siswa/transkrip/StudentTranscriptView.tsx`:
- Ganti semua referensi `"UKK"` → `"PKK"`.
- Tambahkan rule: subject dengan `transcriptGroup === "PKK"` dikecualikan dari baris Transkrip 3 Tahun.
- Tambahkan rule: subject dengan `transcriptGroup === "PILIHAN"` ditampilkan sebagai `"Mata Pelajaran Pilihan"` di Transkrip Nilai.
- Pertimbangkan perlakuan tampilan PKL di kedua jenis transkrip.

### 4. Frontend: Form Kurikulum
Update `src/app/kurikulum/KurikulumView.tsx`:
- Tambahkan opsi `PKK`, `PKL`, `PILIHAN` pada dropdown `<select>` transcript group.
- Hapus opsi `UKK` (rename ke `PKK`).

### 5. Seed Data
Update `scripts/seed_academic_core.sql`:
- Ubah `transcript_group` baris UKK dari `'UKK'` → `'PKK'`.
- Ubah `transcript_group` baris PKL dari `'KEJURUAN_UMUM'` → `'PKL'`.

### 6. Update Tests
- `src/__tests__/transkrip_view.test.tsx`: Ganti `"UKK"` → `"PKK"`, tambah test untuk `PILIHAN` dan `PKL`.
- `src/__tests__/kurikulum.test.tsx`: Sesuaikan fixtures dan snapshot.

## Verification

- [ ] Migration database dijalankan dan data termigrasi (`UKK` → `PKK`, `PKL` → `PKL`).
- [ ] TypeScript tidak ada error setelah perubahan enum (`npx tsc --noEmit`).
- [ ] Transkrip 3 Tahun tidak menampilkan baris PKK.
- [ ] Nilai PKK tetap termasuk dalam perhitungan rata-rata Konsentrasi Keahlian.
- [ ] Mata pelajaran `PILIHAN` tampil sebagai "Mata Pelajaran Pilihan" di Transkrip Nilai.
- [ ] Mata pelajaran `PILIHAN` tampil dengan nama asli di Transkrip 3 Tahun.
- [ ] Dropdown kurikulum menampilkan opsi `PKK`, `PKL`, dan `PILIHAN`.
- [ ] Seluruh test suite lulus (`npm run test`).
