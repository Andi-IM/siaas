import { invoke } from "@tauri-apps/api/core";
import type { ProgramKeahlian, KonsentrasiKeahlian, MataPelajaran, TranscriptGroup, Semester } from "./types";
import { isTauri } from "./tauri-utils";
import { programs, concentrations, subjects } from "./mock-data";

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

export async function getSemesters(): Promise<Semester[]> {
  if (isTauri()) {
    try {
      const dbSems = await invoke<{ id: string; code: string; name: string; sequence: number }[]>("get_semesters");
      return dbSems.map(s => ({
        id: s.id,
        kode: s.code,
        nama: s.name,
        sequence: s.sequence
      })).sort((a, b) => a.sequence - b.sequence);
    } catch (e) {
      console.error("Tauri get_semesters failed:", e);
    }
  }
  return [
    { id: "s1", kode: "SMT1", nama: "Semester 1", sequence: 1 },
    { id: "s2", kode: "SMT2", nama: "Semester 2", sequence: 2 },
    { id: "s3", kode: "SMT3", nama: "Semester 3", sequence: 3 },
    { id: "s4", kode: "SMT4", nama: "Semester 4", sequence: 4 },
    { id: "s5", kode: "SMT5", nama: "Semester 5", sequence: 5 },
    { id: "s6", kode: "SMT6", nama: "Semester 6", sequence: 6 },
    { id: "s99", kode: "UKK", nama: "Uji Kompetensi Keahlian", sequence: 99 }
  ];
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
        transcriptGroup: (s.transcript_group as TranscriptGroup) ?? "UMUM",
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
      let subjectId: string;
      try {
        const res = await invoke<{ id: string }>("create_subject", {
          code: subject.kode,
          name: subject.nama,
          category: subject.kategori,
          status: subject.status,
          transcriptGroup: subject.transcriptGroup,
          sequence: subject.sequence
        });
        subjectId = res.id;
      } catch (e) {
        const all = await invoke<any[]>("get_subjects");
        const found = all.find(s => s.code === subject.kode);
        if (!found) throw e;
        subjectId = found.id;
      }

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
      if (data.nama || data.kode || data.kategori || data.status || data.transcriptGroup || data.sequence !== undefined) {
        const all = await invoke<any[]>("get_subjects");
        const current = all.find(s => s.id === id);
        if (current) {
          await invoke("update_subject", {
            id,
            name: data.nama || current.name,
            code: data.kode || current.code,
            category: data.kategori || current.category,
            status: data.status || current.status,
            transcriptGroup: data.transcriptGroup || current.transcript_group,
            sequence: data.sequence !== undefined ? data.sequence : current.sequence
          });
        }
      }

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
      await invoke("delete_subject", { id });
      return;
    } catch (e) {
      console.error("Tauri delete_subject failed:", e);
    }
  }
  const idx = subjects.findIndex(m => m.id === id);
  if (idx !== -1) subjects.splice(idx, 1);
}
