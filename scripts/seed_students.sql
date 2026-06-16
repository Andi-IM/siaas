-- Seed script untuk memasukkan 5 data siswa (students)
-- Field opsional dikosongkan (bernilai NULL secara default di SQLite)

-- 1. Pastikan data jurusan (majors) dengan ID 'be5b9778-2092-43af-9630-153ce124c122' (Teknik Pemesinan) tersedia agar foreign key terpenuhi
INSERT OR IGNORE INTO majors (id, code, name, program_id)
VALUES 
('be5b9778-2092-43af-9630-153ce124c122', 'TP', 'Teknik Pemesinan', '751b4503-5553-43bf-bed0-b1dc3f35e923'),
('7f0cbd3b-0dbd-4a52-85a4-aff5db36f794', 'TMI', 'Teknik Mekanik Industri', '751b4503-5553-43bf-bed0-b1dc3f35e923');

-- 2. Memasukkan 5 data siswa ke tabel students
INSERT INTO students (id, major_id, full_name, nis, nisn)
VALUES 
('fd2026f2-efe6-4b56-ab32-9c8f930e9d71', 'be5b9778-2092-43af-9630-153ce124c122', 'Ahmad Fauzi', '10001', '0011223341'),
('983cb0c4-1328-4b09-adfb-73790c6d4c39', 'be5b9778-2092-43af-9630-153ce124c122', 'Budi Santoso', '10002', '0011223342'),
('99e8bc26-f1c7-4c9c-8fc5-7179c02d289f', '7f0cbd3b-0dbd-4a52-85a4-aff5db36f794', 'Citra Lestari', '10003', '0011223343'),
('185c3b2c-5381-40b6-9855-770702640fd2', '7f0cbd3b-0dbd-4a52-85a4-aff5db36f794', 'Dewi Sartika', '10004', '0011223344'),
('03dafa08-cbf7-4081-bdfd-4124a336d5cc', '7f0cbd3b-0dbd-4a52-85a4-aff5db36f794', 'Eko Prasetyo', '10005', '0011223345');
