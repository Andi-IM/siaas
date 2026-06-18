import { invoke } from "@tauri-apps/api/core";
import type { StudentGrade } from "./types";
import { isTauri } from "./tauri-utils";
import { filePicker } from "./dialog-utils";

export async function getStudentGradesByFilter(majorId: string, semester: number): Promise<StudentGrade[]> {
  if (isTauri()) {
    try {
      const dbGrades = await invoke<any[]>("get_grades_by_filter", { majorId, semesterSequence: semester });
      return dbGrades.map(g => ({
        studentId: g.student_id,
        subjectId: g.subject_id,
        grade: g.grade
      }));
    } catch (e) {
      console.error("Tauri get_grades_by_filter failed:", e);
    }
  }
  
  const key = `grades_${majorId}_S${semester}`;
  const local = localStorage.getItem(key);
  if (local) return JSON.parse(local);
  return [];
}

export async function saveGradesBatch(majorId: string, semester: number, grades: StudentGrade[]): Promise<void> {
  if (isTauri()) {
    try {
      const payload = grades.map(g => ({
        student_id: g.studentId,
        subject_id: g.subjectId,
        grade: g.grade
      }));
      await invoke("batch_upsert_grades", { 
        majorId, 
        semesterSequence: semester, 
        grades: payload 
      });
      return;
    } catch (e) {
      console.error("Tauri batch_upsert_grades failed:", e);
    }
  }

  const key = `grades_${majorId}_S${semester}`;
  localStorage.setItem(key, JSON.stringify(grades));
}

export async function getGradesByStudent(nis: string): Promise<any[]> {
  if (isTauri()) {
    try {
      return await invoke<any[]>("get_grades_by_student", { studentId: nis });
    } catch (e) {
      console.error("Tauri get_grades_by_student failed:", e);
    }
  }
  return [];
}

export async function importGradesFromExcel(): Promise<string> {
  if (isTauri()) {
    const file = await filePicker.pickExcel();
    if (!file) return "Batal memilih berkas";
    return await invoke<string>("import_grades_from_excel", { path: file.path });
  }
  throw new Error("Tauri API is not available");
}

export async function exportGradesToExcel(majorId: string): Promise<string> {
  if (isTauri()) {
    const file = await filePicker.saveFile(
      "Simpan Rekap Nilai",
      [{ name: "Excel Files", extensions: ["xlsx"] }],
      `rekap_nilai_${majorId}.xlsx`
    );
    if (!file) return "Batal menyimpan berkas";
    return await invoke<string>("export_grades_to_excel", { majorId, path: file.path });
  }
  throw new Error("Tauri API is not available");
}
