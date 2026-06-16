import type { Student, ProgramKeahlian, KonsentrasiKeahlian, MataPelajaran } from "./types";

export const defaultMockStudents: Student[] = [
  {
    nis: "24001",
    nisn: "0071234561",
    nama: "Ani Wijaya",
    tempatLahir: "Jakarta",
    tanggalLahir: "2007-03-15",
    jenisKelamin: "P",
    agama: "Islam",
    alamat: "Jl. Merdeka No. 45, Jakarta",
    telepon: "021-5551234",
    sekolahAsal: "SMP Negeri 1 Jakarta",
    diterimaDiKelas: "XII TKJ 1",
    diterimaPadaTanggal: "2022-07-11",
    kompetensi: "Teknik Komputer dan Jaringan",
    nomorIjazah: "DN-01/M-SMA/13/0000001",
    tanggalKelulusan: "",
    status: "active",
    namaAyah: "Supardi Wijaya",
    pekerjaanAyah: "Wiraswasta",
    namaIbu: "Siti Aminah",
    pekerjaanIbu: "Ibu Rumah Tangga",
    alamatOrangTua: "Jl. Merdeka No. 45, Jakarta",
    namaWali: "",
    alamatWali: "",
    teleponWali: "",
    pekerjaanWali: ""
  },
  {
    nis: "24002",
    nisn: "0069876543",
    nama: "Budi Santoso",
    tempatLahir: "Bandung",
    tanggalLahir: "2006-11-22",
    jenisKelamin: "L",
    agama: "Kristen",
    alamat: "Jl. Diponegoro No. 12, Bandung",
    telepon: "022-4445678",
    sekolahAsal: "SMP Negeri 2 Bandung",
    diterimaDiKelas: "XII TKJ 1",
    diterimaPadaTanggal: "2022-07-11",
    kompetensi: "Teknik Pemesinan",
    nomorIjazah: "DN-01/M-SMA/13/0000002",
    tanggalKelulusan: "",
    status: "active",
    namaAyah: "Herman Santoso",
    pekerjaanAyah: "PNS",
    namaIbu: "Lia Santoso",
    pekerjaanIbu: "Guru",
    alamatOrangTua: "Jl. Diponegoro No. 12, Bandung",
    namaWali: "",
    alamatWali: "",
    teleponWali: "",
    pekerjaanWali: ""
  }
];

export const programs: ProgramKeahlian[] = [
  { id: "p1", nama: "Teknik Mesin" },
];

export const concentrations: KonsentrasiKeahlian[] = [
  { id: "k1", programId: "p1", nama: "Teknik Pemesinan" },
  { id: "k2", programId: "p1", nama: "Teknik Pengelasan" },
];

export const subjects: MataPelajaran[] = [
  { id: "m1", konsentrasiId: "k1", nama: "Pendidikan Agama dan Budi Pekerti", kode: "PAI", kategori: "Kelompok Umum", transcriptGroup: "UMUM", sequence: 1, semesters: [1, 2, 3, 4, 5, 6], status: "active" },
  { id: "m2", konsentrasiId: "k1", nama: "Pendidikan Pancasila", kode: "PP", kategori: "Kelompok Umum", transcriptGroup: "UMUM", sequence: 2, semesters: [1, 2, 3, 4, 5, 6], status: "active" },
  { id: "m3", konsentrasiId: "k1", nama: "Bahasa Indonesia", kode: "BIN", kategori: "Kelompok Umum", transcriptGroup: "UMUM", sequence: 3, semesters: [1, 2, 3, 4, 5, 6], status: "active" },
  { id: "m4", konsentrasiId: "k1", nama: "Matematika", kode: "MAT", kategori: "Kelompok Umum", transcriptGroup: "KEJURUAN_UMUM", sequence: 4, semesters: [1, 2, 3, 4, 5, 6], status: "active" },
  { id: "m5", konsentrasiId: "k1", nama: "Bahasa Inggris", kode: "BIG", kategori: "Kelompok Umum", transcriptGroup: "KEJURUAN_UMUM", sequence: 5, semesters: [1, 2, 3, 4, 5, 6], status: "active" },
  { id: "m6", konsentrasiId: "k1", nama: "Sejarah", kode: "SEJ", kategori: "Kelompok Umum", transcriptGroup: "UMUM", sequence: 6, semesters: [1, 2, 3, 4], status: "active" },
  { id: "m7", konsentrasiId: "k1", nama: "Seni Budaya", kode: "SNB", kategori: "Kelompok Umum", transcriptGroup: "UMUM", sequence: 7, semesters: [1, 2], status: "active" },
  { id: "m8", konsentrasiId: "k1", nama: "Pendidikan Jasmani, Olahraga, dan Kesehatan", kode: "PJOK", kategori: "Kelompok Umum", transcriptGroup: "UMUM", sequence: 8, semesters: [1, 2, 3, 4], status: "active" },
  { id: "m9", konsentrasiId: "k1", nama: "Informatika", kode: "INF", kategori: "Kelompok Kejuruan", transcriptGroup: "KEJURUAN_UMUM", sequence: 1, semesters: [1, 2], status: "active" },
  { id: "m10", konsentrasiId: "k1", nama: "Proyek IPAS", kode: "IPAS", kategori: "Kelompok Kejuruan", transcriptGroup: "KEJURUAN_UMUM", sequence: 2, semesters: [1, 2], status: "active" },
  { id: "m11", konsentrasiId: "k1", nama: "Gambar Teknik Mesin", kode: "GTM", kategori: "Kelompok Kejuruan", transcriptGroup: "KEJURUAN_KONSENTRASI", sequence: 3, semesters: [1, 2], status: "active" },
  { id: "m12", konsentrasiId: "k1", nama: "Pekerjaan Dasar Teknik Mesin", kode: "PDTM", kategori: "Kelompok Kejuruan", transcriptGroup: "KEJURUAN_DASAR", sequence: 4, semesters: [1, 2], status: "active" },
  { id: "m13", konsentrasiId: "k1", nama: "Dasar Perancangan Teknik Mesin", kode: "DPTM", kategori: "Kelompok Kejuruan", transcriptGroup: "KEJURUAN_KONSENTRASI", sequence: 5, semesters: [1, 2], status: "active" },
];

export function initializeMockData() {
  if (typeof window !== "undefined" && !localStorage.getItem("sias_students")) {
    const list = [...defaultMockStudents];
    for (let i = 3; i <= 40; i++) {
      const isP = i % 3 === 0;
      list.push({
        nis: `24${String(i).padStart(3, '0')}`,
        nisn: `007${Math.floor(Math.random() * 10000000)}`,
        nama: `${isP ? "Siti" : "Ahmad"} ${["Pratama", "Hidayat", "Kusuma", "Putri", "Lestari"][i % 5]} ${i}`,
        tempatLahir: "Sumatera Barat",
        tanggalLahir: "2007-01-01",
        jenisKelamin: isP ? "P" : "L",
        agama: "Islam",
        alamat: "Padang, Sumatera Barat",
        telepon: "0751-xxxxx",
        sekolahAsal: "SMP N 1 Padang",
        diterimaDiKelas: "X TM 1",
        diterimaPadaTanggal: "2024-07-01",
        kompetensi: "Teknik Pemesinan",
        nomorIjazah: "",
        tanggalKelulusan: "",
        status: "active",
        namaAyah: "Ayah",
        pekerjaanAyah: "Wiraswasta",
        namaIbu: "Ibu",
        pekerjaanIbu: "Ibu Rumah Tangga",
        alamatOrangTua: "Padang",
        namaWali: "",
        alamatWali: "",
        teleponWali: "",
        pekerjaanWali: ""
      });
    }
    localStorage.setItem("sias_students", JSON.stringify(list));
  }
}

export function getLocalStudents(): Student[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("sias_students");
  return stored ? JSON.parse(stored) : defaultMockStudents;
}

export function saveLocalStudents(students: Student[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("sias_students", JSON.stringify(students));
  }
}
