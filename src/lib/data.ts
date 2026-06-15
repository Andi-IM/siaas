import { invoke } from "@tauri-apps/api/core";
import type { Student, ProgramKeahlian, KonsentrasiKeahlian, MataPelajaran } from "./types";

// ==========================================
// TAURI CHECK AND HELPER MAPPINGS
// ==========================================

const isTauri = (): boolean => {
  return typeof window !== "undefined" && (window as any).__TAURI_INTERNALS__ !== undefined;
};

interface DbStudent {
  id: string;
  major_id: string;
  full_name: string;
  nis: string;
  nisn: string;
  place_of_birth: string | null;
  date_of_birth: string | null;
  gender: string | null;
  religion: string | null;
  family_status: string | null;
  child_order: number | null;
  home_address: string | null;
  telephone: string | null;
  previous_school: string | null;
  admission_grade: string | null;
  admission_date: string | null;
  father_name: string | null;
  mother_name: string | null;
  parent_address: string | null;
  father_occupation: string | null;
  mother_occupation: string | null;
  guardian_name: string | null;
  guardian_address: string | null;
  guardian_phone_number: string | null;
  guardian_occupation: string | null;
  diploma_number: string | null;
  graduation_date: string | null;
  created_at: string;
  updated_at: string;
}

/// Resolves major_id from major name or creates a new Major entry in SQLite.
async function resolveMajorId(name: string): Promise<string> {
  const majors = await invoke<{ id: string; name: string }[]>("get_majors");
  const found = majors.find(m => m.name.toLowerCase() === name.toLowerCase());
  if (found) return found.id;

  const code = name.split(" ").map(w => w[0]).join("").toUpperCase() || "MAJ";
  const newMajor = await invoke<{ id: string }>("create_major", { code, name });
  return newMajor.id;
}

async function getMajorsMap(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  try {
    const majors = await invoke<{ id: string; name: string }[]>("get_majors");
    for (const m of majors) {
      map.set(m.id, m.name);
    }
  } catch (e) {
    console.error("Failed to fetch majors map:", e);
  }
  return map;
}

function mapDbToFrontend(db: DbStudent, majorsMap: Map<string, string>): Student {
  return {
    nis: db.nis,
    nisn: db.nisn,
    nama: db.full_name,
    tempatLahir: db.place_of_birth ?? "",
    tanggalLahir: db.date_of_birth ?? "",
    jenisKelamin: (db.gender as "L" | "P") ?? "L",
    agama: db.religion ?? "",
    alamat: db.home_address ?? "",
    telepon: db.telephone ?? "",
    sekolahAsal: db.previous_school ?? "",
    diterimaDiKelas: db.admission_grade ?? "",
    diterimaPadaTanggal: db.admission_date ?? "",
    kompetensi: majorsMap.get(db.major_id) ?? db.major_id,
    nomorIjazah: db.diploma_number ?? "",
    tanggalKelulusan: db.graduation_date ?? "",
    status: "active",
    namaAyah: db.father_name ?? "",
    pekerjaanAyah: db.father_occupation ?? "",
    namaIbu: db.mother_name ?? "",
    pekerjaanIbu: db.mother_occupation ?? "",
    alamatOrangTua: db.parent_address ?? "",
    namaWali: db.guardian_name ?? "",
    alamatWali: db.guardian_address ?? "",
    teleponWali: db.guardian_phone_number ?? "",
    pekerjaanWali: db.guardian_occupation ?? "",
  };
}

// ==========================================
// BROWSER LOCALSTORAGE FALLBACK DATA
// ==========================================

const defaultMockStudents: Student[] = [
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

// Seed fallback data for paginated viewing
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

function getLocalStudents(): Student[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("sias_students");
  return stored ? JSON.parse(stored) : defaultMockStudents;
}

function saveLocalStudents(students: Student[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("sias_students", JSON.stringify(students));
  }
}

// ==========================================
// EXPOSED ASYNC STUDENT APIS
// ==========================================

export async function getStudents(): Promise<Student[]> {
  if (isTauri()) {
    try {
      const dbStudents = await invoke<DbStudent[]>("get_students");
      const majorsMap = await getMajorsMap();
      return dbStudents.map(s => mapDbToFrontend(s, majorsMap));
    } catch (e) {
      console.error("Tauri get_students failed, falling back to local:", e);
    }
  }
  return getLocalStudents();
}

export async function getStudentByNis(nis: string): Promise<Student | undefined> {
  if (isTauri()) {
    try {
      const list = await getStudents();
      return list.find(s => s.nis === nis);
    } catch (e) {
      console.error("Tauri getStudentByNis failed:", e);
    }
  }
  return getLocalStudents().find(s => s.nis === nis);
}

export async function getUniqueClasses(): Promise<string[]> {
  const list = await getStudents();
  return [...new Set(list.map(s => s.diterimaDiKelas))].sort();
}

export async function addStudent(student: Student): Promise<void> {
  if (isTauri()) {
    try {
      const majorId = await resolveMajorId(student.kompetensi);
      
      const dbPayload = {
        id: "",
        major_id: majorId,
        full_name: student.nama,
        nis: student.nis,
        nisn: student.nisn,
        place_of_birth: student.tempatLahir || null,
        date_of_birth: student.tanggalLahir || null,
        gender: student.jenisKelamin || null,
        religion: student.agama || null,
        family_status: null,
        child_order: null,
        home_address: student.alamat || null,
        telephone: student.telepon || null,
        previous_school: student.sekolahAsal || null,
        admission_grade: student.diterimaDiKelas || null,
        admission_date: student.diterimaPadaTanggal || null,
        father_name: student.namaAyah || null,
        mother_name: student.namaIbu || null,
        parent_address: student.alamatOrangTua || null,
        father_occupation: student.pekerjaanAyah || null,
        mother_occupation: student.pekerjaanIbu || null,
        guardian_name: student.namaWali || null,
        guardian_address: student.alamatWali || null,
        guardian_phone_number: student.teleponWali || null,
        guardian_occupation: student.pekerjaanWali || null,
        diploma_number: student.nomorIjazah || null,
        graduation_date: student.tanggalKelulusan || null,
        created_at: "",
        updated_at: ""
      };

      await invoke("create_student", { student: dbPayload });
      return;
    } catch (e) {
      console.error("Tauri create_student failed, running local fallback:", e);
    }
  }

  const list = getLocalStudents();
  list.push(student);
  saveLocalStudents(list);
}

export async function updateStudent(nis: string, data: Partial<Student>): Promise<boolean> {
  if (isTauri()) {
    try {
      const current = await getStudentByNis(nis);
      if (!current) return false;
      const merged = { ...current, ...data };
      
      const majorId = await resolveMajorId(merged.kompetensi);
      const dbPayload = {
        id: "",
        major_id: majorId,
        full_name: merged.nama,
        nis: merged.nis,
        nisn: merged.nisn,
        place_of_birth: merged.tempatLahir || null,
        date_of_birth: merged.tanggalLahir || null,
        gender: merged.jenisKelamin || null,
        religion: merged.agama || null,
        family_status: null,
        child_order: null,
        home_address: merged.alamat || null,
        telephone: merged.telepon || null,
        previous_school: merged.sekolahAsal || null,
        admission_grade: merged.diterimaDiKelas || null,
        admission_date: merged.diterimaPadaTanggal || null,
        father_name: merged.namaAyah || null,
        mother_name: merged.namaIbu || null,
        parent_address: merged.alamatOrangTua || null,
        father_occupation: merged.pekerjaanAyah || null,
        mother_occupation: merged.pekerjaanIbu || null,
        guardian_name: merged.namaWali || null,
        guardian_address: merged.alamatWali || null,
        guardian_phone_number: merged.teleponWali || null,
        guardian_occupation: merged.pekerjaanWali || null,
        diploma_number: merged.nomorIjazah || null,
        graduation_date: merged.tanggalKelulusan || null,
        created_at: "",
        updated_at: ""
      };

      await invoke("update_student", { nis, student: dbPayload });
      return true;
    } catch (e) {
      console.error("Tauri update_student failed, running local fallback:", e);
    }
  }

  const list = getLocalStudents();
  const idx = list.findIndex(s => s.nis === nis);
  if (idx === -1) return false;
  list[idx] = { ...list[idx], ...data };
  saveLocalStudents(list);
  return true;
}

export async function deleteStudent(nis: string): Promise<boolean> {
  if (isTauri()) {
    try {
      const deleted = await invoke<boolean>("delete_student", { nis });
      return deleted;
    } catch (e) {
      console.error("Tauri deleteStudent failed:", e);
    }
  }

  const list = getLocalStudents();
  const idx = list.findIndex(s => s.nis === nis);
  if (idx === -1) return false;
  list.splice(idx, 1);
  saveLocalStudents(list);
  return true;
}

// ==========================================
// CURRICULUM FALLBACK DATA
// ==========================================

const programs: ProgramKeahlian[] = [
  { id: "p1", nama: "Teknik Mesin" },
];

const concentrations: KonsentrasiKeahlian[] = [
  { id: "k1", programId: "p1", nama: "Teknik Pemesinan" },
  { id: "k2", programId: "p1", nama: "Teknik Pengelasan" },
];

const subjects: MataPelajaran[] = [
  { id: "m1", konsentrasiId: "k1", nama: "Pendidikan Agama dan Budi Pekerti", kode: "PAI", kategori: "Kelompok Umum", sequence: 1, semesters: [1, 2, 3, 4, 5, 6], status: "active" },
  { id: "m2", konsentrasiId: "k1", nama: "Pendidikan Pancasila", kode: "PP", kategori: "Kelompok Umum", sequence: 2, semesters: [1, 2, 3, 4, 5, 6], status: "active" },
  { id: "m3", konsentrasiId: "k1", nama: "Bahasa Indonesia", kode: "BIN", kategori: "Kelompok Umum", sequence: 3, semesters: [1, 2, 3, 4, 5, 6], status: "active" },
  { id: "m4", konsentrasiId: "k1", nama: "Matematika", kode: "MAT", kategori: "Kelompok Umum", sequence: 4, semesters: [1, 2, 3, 4, 5, 6], status: "active" },
  { id: "m5", konsentrasiId: "k1", nama: "Bahasa Inggris", kode: "BIG", kategori: "Kelompok Umum", sequence: 5, semesters: [1, 2, 3, 4, 5, 6], status: "active" },
  { id: "m6", konsentrasiId: "k1", nama: "Sejarah", kode: "SEJ", kategori: "Kelompok Umum", sequence: 6, semesters: [1, 2, 3, 4], status: "active" },
  { id: "m7", konsentrasiId: "k1", nama: "Seni Budaya", kode: "SNB", kategori: "Kelompok Umum", sequence: 7, semesters: [1, 2], status: "active" },
  { id: "m8", konsentrasiId: "k1", nama: "Pendidikan Jasmani, Olahraga, dan Kesehatan", kode: "PJOK", kategori: "Kelompok Umum", sequence: 8, semesters: [1, 2, 3, 4], status: "active" },
  { id: "m9", konsentrasiId: "k1", nama: "Informatika", kode: "INF", kategori: "Kelompok Kejuruan", sequence: 1, semesters: [1, 2], status: "active" },
  { id: "m10", konsentrasiId: "k1", nama: "Proyek IPAS", kode: "IPAS", kategori: "Kelompok Kejuruan", sequence: 2, semesters: [1, 2], status: "active" },
  { id: "m11", konsentrasiId: "k1", nama: "Gambar Teknik Mesin", kode: "GTM", kategori: "Kelompok Kejuruan", sequence: 3, semesters: [1, 2], status: "active" },
  { id: "m12", konsentrasiId: "k1", nama: "Pekerjaan Dasar Teknik Mesin", kode: "PDTM", kategori: "Kelompok Kejuruan", sequence: 4, semesters: [1, 2], status: "active" },
  { id: "m13", konsentrasiId: "k1", nama: "Dasar Perancangan Teknik Mesin", kode: "DPTM", kategori: "Kelompok Kejuruan", sequence: 5, semesters: [1, 2], status: "active" },
];

// ==========================================
// EXPOSED ASYNC CURRICULUM APIS
// ==========================================

export async function getPrograms(): Promise<ProgramKeahlian[]> {
  if (isTauri()) {
    try {
      const dbProgs = await invoke<{ id: string; name: string }[]>("get_programs");
      return dbProgs.map(p => ({ id: p.id, nama: p.name }));
    } catch (e) {
      console.error("Tauri get_programs failed:", e);
    }
  }
  return [...programs];
}

export async function getConcentrations(programId?: string): Promise<KonsentrasiKeahlian[]> {
  if (isTauri()) {
    try {
      const dbMajors = await invoke<{ id: string; name: string; program_id: string | null }[]>("get_majors");
      const list = dbMajors.map(m => ({ 
        id: m.id, 
        programId: m.program_id ?? "", 
        nama: m.name 
      }));
      if (programId) return list.filter(k => k.programId === programId);
      return list;
    } catch (e) {
      console.error("Tauri get_majors failed:", e);
    }
  }
  if (!programId) return [...concentrations];
  return concentrations.filter(k => k.programId === programId);
}

function getCategoryWeight(cat: string): number {
  if (cat === "Kelompok Umum") return 1;
  if (cat === "Kelompok Kejuruan") return 2;
  return 99;
}

export async function getSubjects(konsentrasiId?: string): Promise<MataPelajaran[]> {
  if (isTauri() && konsentrasiId) {
    try {
      const dbSubjects = await invoke<any[]>("get_subjects_by_major", { majorId: konsentrasiId });
      return dbSubjects.map(s => ({
        id: s.id,
        konsentrasiId: konsentrasiId,
        nama: s.name,
        kode: s.code,
        kategori: s.kategori as any,
        sequence: s.sequence,
        semesters: s.semesters,
        status: s.status as any
      }));
    } catch (e) {
      console.error("Tauri get_subjects_by_major failed:", e);
    }
  }
  if (!konsentrasiId) return [...subjects];
  const list = subjects.filter(m => m.konsentrasiId === konsentrasiId);
  return list.sort((a, b) => {
    const wA = getCategoryWeight(a.kategori);
    const wB = getCategoryWeight(b.kategori);
    if (wA !== wB) return wA - wB;
    return a.sequence - b.sequence;
  });
}

export async function addProgram(name: string): Promise<ProgramKeahlian> {
  if (isTauri()) {
    try {
      const res = await invoke<{ id: string; name: string }>("create_program", { name });
      return { id: res.id, nama: res.name };
    } catch (e) {
      console.error("Tauri create_program failed:", e);
    }
  }
  const newProg = { id: `p${programs.length + 1}`, nama: name };
  programs.push(newProg);
  return newProg;
}

export async function updateProgram(id: string, name: string): Promise<void> {
  if (isTauri()) {
    try {
      await invoke("update_program", { id, name });
      return;
    } catch (e) {
      console.error("Tauri update_program failed:", e);
    }
  }
  const p = programs.find(x => x.id === id);
  if (p) p.nama = name;
}

export async function addConcentration(programId: string, name: string): Promise<KonsentrasiKeahlian> {
  if (isTauri()) {
    try {
      const code = name.split(" ").map(w => w[0]).join("").toUpperCase() || "CON";
      const res = await invoke<{ id: string; name: string; program_id: string | null }>("create_major", { 
        name, 
        code, 
        programId: programId 
      });
      return { id: res.id, programId: res.program_id ?? "", nama: res.name };
    } catch (e) {
      console.error("Tauri create_major failed:", e);
    }
  }
  const newK = { id: `k${concentrations.length + 1}`, programId, nama: name };
  concentrations.push(newK);
  return newK;
}

export async function updateConcentration(id: string, name: string): Promise<void> {
  if (isTauri()) {
    try {
      const code = name.split(" ").map(w => w[0]).join("").toUpperCase() || "CON";
      // We don't have update_major yet that preserves program_id but I implemented it in commands.rs
      // Wait, I implemented update_major(id, name, code, program_id)
      
      // Need current program_id first or just pass null if we don't want to change it
      const majors = await invoke<any[]>("get_majors");
      const current = majors.find(m => m.id === id);
      
      await invoke("update_major", { 
        id, 
        name, 
        code, 
        programId: current?.program_id || null 
      });
      return;
    } catch (e) {
      console.error("Tauri update_major failed:", e);
    }
  }
  const k = concentrations.find(x => x.id === id);
  if (k) k.nama = name;
}

export async function addSubject(subject: Omit<MataPelajaran, "id">): Promise<MataPelajaran> {
  if (isTauri()) {
    try {
      // 1. Create or get subject
      let subjectId: string;
      try {
        const res = await invoke<{ id: string }>("create_subject", {
          code: subject.kode,
          name: subject.nama,
          category: subject.kategori,
          status: subject.status,
          sequence: subject.sequence
        });
        subjectId = res.id;
      } catch (e) {
        const all = await invoke<any[]>("get_subjects");
        const found = all.find(s => s.code === subject.kode);
        if (!found) throw e;
        subjectId = found.id;
      }

      // 2. Assign to semesters
      await invoke("assign_subject_to_semesters", {
        majorId: subject.konsentrasiId,
        subjectId: subjectId,
        semesterSequences: subject.semesters
      });

      return { ...subject, id: subjectId };
    } catch (e) {
      console.error("Tauri subject integration failed:", e);
    }
  }
  const newM = { ...subject, id: `m${subjects.length + 1}` };
  subjects.push(newM);
  return newM;
}

export async function updateSubject(id: string, data: Partial<MataPelajaran>): Promise<void> {
  if (isTauri()) {
    try {
      // 1. Update subject master record if name/code/etc changed
      if (data.nama || data.kode || data.kategori || data.status || data.sequence !== undefined) {
        const all = await invoke<any[]>("get_subjects");
        const current = all.find(s => s.id === id);
        if (current) {
          await invoke("update_subject", {
            id,
            name: data.nama || current.name,
            code: data.kode || current.code,
            category: data.kategori || current.category,
            status: data.status || current.status,
            sequence: data.sequence !== undefined ? data.sequence : current.sequence
          });
        }
      }

      // 2. Update semester assignments if semesters changed
      if (data.semesters && data.konsentrasiId) {
        await invoke("assign_subject_to_semesters", {
          majorId: data.konsentrasiId,
          subjectId: id,
          semesterSequences: data.semesters
        });
      }
      return;
    } catch (e) {
      console.error("Tauri updateSubject failed:", e);
    }
  }
  const idx = subjects.findIndex(m => m.id === id);
  if (idx !== -1) subjects[idx] = { ...subjects[idx], ...data };
}

export async function deleteSubject(id: string): Promise<void> {
  if (isTauri()) {
    try {
      // For now, we only delete the master subject. 
      // In a real app, we might just want to remove the mapping if it's shared.
      // But the UI seems to treat subjects as concentration-specific.
      await invoke("delete_subject", { id });
      return;
    } catch (e) {
      console.error("Tauri delete_subject failed:", e);
    }
  }
  const idx = subjects.findIndex(m => m.id === id);
  if (idx !== -1) subjects.splice(idx, 1);
}
