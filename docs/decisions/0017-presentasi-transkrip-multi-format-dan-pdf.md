# ADR 0017: Presentasi Transkrip Multi-Format & Ekspor PDF Frontend

## Status
Diterima

## Konteks
Aplikasi SIAS membutuhkan fitur untuk menampilkan dan mencetak transkrip nilai akhir siswa untuk kebutuhan kelulusan. Terdapat dua format transkrip yang dibutuhkan oleh sekolah:
1. **Transkrip 3 Tahun**: Merupakan transkrip lengkap yang berisi grid seluruh nilai siswa per semester selama masa belajar (6 semester).
2. **Transkrip Nilai (Pendamping)**: Merupakan transkrip ringkasan yang hanya menampilkan satu nilai akhir rata-rata per mata pelajaran sebagai pendamping ijazah.

Sebelumnya, terdapat upaya menggabungkan logika kedua transkrip ini menjadi satu, yang justru menghilangkan fungsi pemisahan data antara kedua transkrip. Hal ini menyalahi kebutuhan pengguna karena kedua transkrip tersebut memiliki tujuan administratif yang berbeda. Selain itu, diperlukan mekanisme untuk mengekspor dokumen ini ke format PDF.

## Keputusan
1. **Pemisahan Tampilan Tabbing Transkrip**: Kami mempertahankan mode tabbing di antarmuka web, yaitu "Transkrip 3 Tahun" dan "Transkrip Nilai". Masing-masing tab memiliki layout cetak tersendiri dan struktur agregasi data terpisah.
2. **Agregasi Nilai Pendamping**: Untuk Transkrip Nilai, logika agregasi berbasis `transcriptGroup` digunakan untuk mengelompokkan nilai, serta memisahkan komponen seperti Nilai Uji Kompetensi Keahlian (UKK) secara khusus. Kami mendefinisikan tipe eksklusif `TranscriptGroup` (`UMUM`, `KEJURUAN_UMUM`, `KEJURUAN_DASAR`, `KEJURUAN_KONSENTRASI`, `UKK`) ke dalam skema dasar `MataPelajaran`.
3. **Ekspor PDF di Frontend (html2canvas & jsPDF)**: Kami tidak menggunakan proses generate PDF di backend menggunakan Rust. Sebagai gantinya, kami menggunakan pendekatan frontend yang mengonversi DOM layout print HTML langsung menjadi Canvas, lalu mencetaknya ke dokumen PDF berukuran A4 menggunakan `html2canvas-pro` dan `jsPDF`. Hal ini memastikan hasil PDF 100% sama dengan layout cetak yang dirancang menggunakan CSS (WYSIWYG).

## Konsekuensi
- **Positif**:
  - Sekolah dapat menghasilkan dua format dokumen transkrip yang sangat krusial tanpa harus menggunakan aplikasi eksternal.
  - Tampilan WYSIWYG untuk cetak dan ekspor PDF memastikan apa yang dilihat oleh user pada browser identik dengan hasil akhir PDF.
  - Skema data frontend menjadi lebih solid dengan adanya validasi properti opsional `transcriptGroup`.
- **Negatif / Perlu Diperhatikan**:
  - `html2canvas` berpotensi menyebabkan waktu render yang sedikit lebih lambat pada PDF yang berlapis tinggi jika struktur DOM terlalu besar. Oleh karena itu kami menggunakan layout tersembunyi berformat `display: none` namun tetap dimuat ke DOM secara sementara ketika mencetak PDF.
