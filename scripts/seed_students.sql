-- Seed script untuk memasukkan 5 data siswa (students) dengan data LENGKAP
-- Semua field terisi sesuai skema 23-field Student (Data Pribadi, Akademik, Orang Tua, Wali)

-- 1. Pastikan data jurusan (majors) tersedia agar foreign key terpenuhi
INSERT OR IGNORE INTO majors (id, code, name, program_id)
VALUES 
('be5b9778-2092-43af-9630-153ce124c122', 'TP', 'Teknik Pemesinan', '751b4503-5553-43bf-bed0-b1dc3f35e923'),
('7f0cbd3b-0dbd-4a52-85a4-aff5db36f794', 'TMI', 'Teknik Mekanik Industri', '751b4503-5553-43bf-bed0-b1dc3f35e923');

-- 2. Memasukkan 5 data siswa ke tabel students (SEMUA KOLOM)
INSERT INTO students (
  id, major_id, full_name, nis, nisn,
  place_of_birth, date_of_birth, gender, religion,
  family_status, child_order,
  home_address, telephone,
  previous_school, admission_grade, admission_date,
  father_name, mother_name, parent_address,
  father_occupation, mother_occupation,
  guardian_name, guardian_address, guardian_phone_number, guardian_occupation,
  diploma_number, graduation_date
)
VALUES 
-- 1. Ahmad Fauzi — Teknik Pemesinan
(
  'fd2026f2-efe6-4b56-ab32-9c8f930e9d71',
  'be5b9778-2092-43af-9630-153ce124c122',
  'Ahmad Fauzi', '10001', '0011223341',
  'Padang', '2008-03-15', 'L', 'Islam',
  'Anak Kandung', 2,
  'Jl. Sudirman No. 45, Kel. Padang Baru, Kec. Padang Timur, Kota Padang', '0751-812345',
  'SMP Negeri 1 Padang', 'X', '2023-07-10',
  'H. Muhammad Fauzi', 'Hj. Siti Aminah',
  'Jl. Sudirman No. 45, Kel. Padang Baru, Kec. Padang Timur, Kota Padang',
  'Wiraswasta', 'Ibu Rumah Tangga',
  '', '', '', '',
  'DN-05 Dd 0512345', '2026-06-14'
),
-- 2. Budi Santoso — Teknik Pemesinan
(
  '983cb0c4-1328-4b09-adfb-73790c6d4c39',
  'be5b9778-2092-43af-9630-153ce124c122',
  'Budi Santoso', '10002', '0011223342',
  'Bukittinggi', '2007-11-22', 'L', 'Islam',
  'Anak Kandung', 1,
  'Jl. A. Yani No. 12, Kel. Aur Birugo, Kec. Aur Birugo Tigo Baleh, Kota Bukittinggi', '0752-34567',
  'SMP Negeri 3 Bukittinggi', 'X', '2023-07-10',
  'Santoso', 'Nurhayati',
  'Jl. A. Yani No. 12, Kel. Aur Birugo, Kec. Aur Birugo Tigo Baleh, Kota Bukittinggi',
  'Pegawai Negeri Sipil', 'Guru',
  '', '', '', '',
  'DN-05 Dd 0512346', '2026-06-14'
),
-- 3. Citra Lestari — Teknik Mekanik Industri
(
  '99e8bc26-f1c7-4c9c-8fc5-7179c02d289f',
  '7f0cbd3b-0dbd-4a52-85a4-aff5db36f794',
  'Citra Lestari', '10003', '0011223343',
  'Solok', '2008-05-08', 'P', 'Islam',
  'Anak Kandung', 3,
  'Jl. Pahlawan No. 7, Kel. Tanah Garam, Kec. Lubuk Sikarah, Kota Solok', '0755-20123',
  'SMP Negeri 2 Solok', 'X', '2023-07-10',
  'Ir. Bambang Lestari', 'Dra. Ratna Dewi',
  'Jl. Pahlawan No. 7, Kel. Tanah Garam, Kec. Lubuk Sikarah, Kota Solok',
  'Insinyur', 'Dosen',
  'Drs. Hendra Lestari', 'Jl. Imam Bonjol No. 22, Kota Padang', '0812-7654-3210', 'Pensiunan PNS',
  'DN-05 Dd 0512347', '2026-06-14'
),
-- 4. Dewi Sartika — Teknik Mekanik Industri
(
  '185c3b2c-5381-40b6-9855-770702640fd2',
  '7f0cbd3b-0dbd-4a52-85a4-aff5db36f794',
  'Dewi Sartika', '10004', '0011223344',
  'Payakumbuh', '2008-01-30', 'P', 'Islam',
  'Anak Kandung', 1,
  'Jl. Soekarno-Hatta No. 88, Kel. Kubu Gadang, Kec. Payakumbuh Utara, Kota Payakumbuh', '0752-91234',
  'SMP Negeri 1 Payakumbuh', 'X', '2023-07-10',
  'Sartika Putra', 'Yuliana',
  'Jl. Soekarno-Hatta No. 88, Kel. Kubu Gadang, Kec. Payakumbuh Utara, Kota Payakumbuh',
  'Pedagang', 'Bidan',
  '', '', '', '',
  'DN-05 Dd 0512348', '2026-06-14'
),
-- 5. Eko Prasetyo — Teknik Mekanik Industri
(
  '03dafa08-cbf7-4081-bdfd-4124a336d5cc',
  '7f0cbd3b-0dbd-4a52-85a4-aff5db36f794',
  'Eko Prasetyo', '10005', '0011223345',
  'Pariaman', '2007-09-03', 'L', 'Islam',
  'Anak Kandung', 4,
  'Jl. Veteran No. 33, Kel. Kampung Perak, Kec. Pariaman Tengah, Kota Pariaman', '0751-92876',
  'SMP Negeri 2 Pariaman', 'X', '2023-07-10',
  'Prasetyo', 'Murni',
  'Jl. Veteran No. 33, Kel. Kampung Perak, Kec. Pariaman Tengah, Kota Pariaman',
  'Nelayan', 'Ibu Rumah Tangga',
  'Hardi Prasetyo', 'Jl. Khatib Sulaiman No. 10, Kota Padang', '0813-6543-2100', 'Wiraswasta',
  'DN-05 Dd 0512349', '2026-06-14'
);
