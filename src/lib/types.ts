export interface Student {
  // Dasar
  nis: string; // Nomor Induk
  nisn: string; // NISN
  nama: string; // Nama Peserta Didik (Lengkap)
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: "L" | "P";
  agama: string;
  alamat: string;
  telepon: string; // Nomor Telepon Rumah
  
  // Akademik
  sekolahAsal: string;
  diterimaDiKelas: string;
  diterimaPadaTanggal: string;
  kompetensi: string; // Kompetensi Keahlian
  nomorIjazah: string;
  tanggalKelulusan: string;
  status: "active" | "inactive";

  // Keluarga (Ayah)
  namaAyah: string;
  pekerjaanAyah: string;
  
  // Keluarga (Ibu)
  namaIbu: string;
  pekerjaanIbu: string;
  alamatOrangTua: string;

  // Wali
  namaWali: string;
  alamatWali: string;
  teleponWali: string;
  pekerjaanWali: string;
}

export interface ProgramKeahlian {
  id: string;
  nama: string;
}

export interface KonsentrasiKeahlian {
  id: string;
  programId: string;
  nama: string;
}

export type TranscriptGroup =
  | "UMUM"
  | "KEJURUAN_UMUM"
  | "KEJURUAN_DASAR"
  | "KEJURUAN_KONSENTRASI"
  | "PKK"
  | "PKL"
  | "PILIHAN";

export interface MataPelajaran {
  id: string;
  konsentrasiId: string;
  nama: string;
  kode: string;
  kategori: "Kelompok Umum" | "Kelompok Kejuruan";
  transcriptGroup: TranscriptGroup;
  sequence: number;
  semesters: number[];
  status: "active" | "inactive";
}

export interface StudentGrade {
  studentId: string;
  subjectId: string;
  grade: number;
}

export interface Semester {
  id: string;
  kode: string;
  nama: string;
  sequence: number;
}
