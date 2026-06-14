import type { Student } from "./types";

const allStudents: Student[] = [
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
    kompetensi: "Teknik Komputer dan Jaringan",
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
  },
];

export function getStudents(): Student[] {
  return [...allStudents];
}

export function getStudentByNis(nis: string): Student | undefined {
  return allStudents.find((s) => s.nis === nis);
}

export function getUniqueClasses(): string[] {
  return [...new Set(allStudents.map((s) => s.diterimaDiKelas))].sort();
}

export function addStudent(student: Student): void {
  allStudents.push(student);
}

export function updateStudent(nis: string, data: Partial<Student>): boolean {
  const idx = allStudents.findIndex((s) => s.nis === nis);
  if (idx === -1) return false;
  allStudents[idx] = { ...allStudents[idx], ...data };
  return true;
}

export function deleteStudent(nis: string): boolean {
  const idx = allStudents.findIndex((s) => s.nis === nis);
  if (idx === -1) return false;
  allStudents.splice(idx, 1);
  return true;
}

// Curriculum Data
const programs: import("./types").ProgramKeahlian[] = [
  { id: "p1", nama: "Teknik Mesin" },
];

const concentrations: import("./types").KonsentrasiKeahlian[] = [
  { id: "k1", programId: "p1", nama: "Teknik Pemesinan" },
  { id: "k2", programId: "p1", nama: "Teknik Pengelasan" },
];

const subjects: import("./types").MataPelajaran[] = [
  { id: "m1", konsentrasiId: "k1", nama: "Pendidikan Agama dan Budi Pekerti", kode: "PAI", kategori: "Kelompok Umum", semester: 1, status: "active" },
  { id: "m2", konsentrasiId: "k1", nama: "Pendidikan Pancasila", kode: "PP", kategori: "Kelompok Umum", semester: 1, status: "active" },
  { id: "m3", konsentrasiId: "k1", nama: "Bahasa Indonesia", kode: "BIN", kategori: "Kelompok Umum", semester: 1, status: "active" },
  { id: "m4", konsentrasiId: "k1", nama: "Matematika", kode: "MAT", kategori: "Kelompok Umum", semester: 1, status: "active" },
  { id: "m5", konsentrasiId: "k1", nama: "Bahasa Inggris", kode: "BIG", kategori: "Kelompok Umum", semester: 1, status: "active" },
  { id: "m6", konsentrasiId: "k1", nama: "Sejarah", kode: "SEJ", kategori: "Kelompok Umum", semester: 1, status: "active" },
  { id: "m7", konsentrasiId: "k1", nama: "Seni Budaya", kode: "SNB", kategori: "Kelompok Umum", semester: 1, status: "active" },
  { id: "m8", konsentrasiId: "k1", nama: "Pendidikan Jasmani, Olahraga, dan Kesehatan", kode: "PJOK", kategori: "Kelompok Umum", semester: 1, status: "active" },
  { id: "m9", konsentrasiId: "k1", nama: "Informatika", kode: "INF", kategori: "Kelompok Umum", semester: 1, status: "active" },
  { id: "m10", konsentrasiId: "k1", nama: "Proyek IPAS", kode: "IPAS", kategori: "Kelompok Umum", semester: 1, status: "active" },
  { id: "m11", konsentrasiId: "k1", nama: "Gambar Teknik Mesin", kode: "GTM", kategori: "Kelompok Kejuruan", semester: 1, status: "active" },
  { id: "m12", konsentrasiId: "k1", nama: "Pekerjaan Dasar Teknik Mesin", kode: "PDTM", kategori: "Kelompok Kejuruan", semester: 1, status: "active" },
  { id: "m13", konsentrasiId: "k1", nama: "Dasar Perancangan Teknik Mesin", kode: "DPTM", kategori: "Kelompok Kejuruan", semester: 1, status: "active" },
];

export function getPrograms() { return [...programs]; }
export function getConcentrations(programId?: string) {
  if (!programId) return [...concentrations];
  return concentrations.filter(k => k.programId === programId);
}
export function getSubjects(konsentrasiId?: string) {
  if (!konsentrasiId) return [...subjects];
  return subjects.filter(m => m.konsentrasiId === konsentrasiId);
}

// CRUD for Curriculum
export function addProgram(name: string) {
  const newProg = { id: `p${programs.length + 1}`, nama: name };
  programs.push(newProg);
  return newProg;
}

export function updateProgram(id: string, name: string) {
  const p = programs.find(x => x.id === id);
  if (p) p.nama = name;
}

export function addConcentration(programId: string, name: string) {
  const newK = { id: `k${concentrations.length + 1}`, programId, nama: name };
  concentrations.push(newK);
  return newK;
}

export function updateConcentration(id: string, name: string) {
  const k = concentrations.find(x => x.id === id);
  if (k) k.nama = name;
}

export function addSubject(subject: Omit<import("./types").MataPelajaran, "id">) {
  const newM = { ...subject, id: `m${subjects.length + 1}` };
  subjects.push(newM);
  return newM;
}

export function updateSubject(id: string, data: Partial<import("./types").MataPelajaran>) {
  const idx = subjects.findIndex(m => m.id === id);
  if (idx !== -1) subjects[idx] = { ...subjects[idx], ...data };
}

export function deleteSubject(id: string) {
  const idx = subjects.findIndex(m => m.id === id);
  if (idx !== -1) subjects.splice(idx, 1);
}
