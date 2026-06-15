import { invoke } from "@tauri-apps/api/core";
import type { Student } from "./types";
import { isTauri } from "./tauri-utils";
import { getLocalStudents, saveLocalStudents } from "./mock-data";
import { mapDbToFrontend, type DbStudent } from "./student-mapper";

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
        guardian_address: student.guardian_address || null,
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
