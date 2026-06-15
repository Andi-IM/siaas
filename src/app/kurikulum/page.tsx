"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronRight, Plus, Pencil, Trash2, LayoutGrid, BookOpen, GraduationCap, X } from "lucide-react";
import { 
  getPrograms, getConcentrations, getSubjects,
  addProgram, updateProgram,
  addConcentration, updateConcentration,
  addSubject, updateSubject, deleteSubject 
} from "@/lib/data";
import type { ProgramKeahlian, KonsentrasiKeahlian, MataPelajaran } from "@/lib/types";

type ModalType = "program" | "concentration" | "subject" | null;

export default function CurriculumPage() {
  // Data State
  const [programs, setPrograms] = useState<ProgramKeahlian[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [concentrations, setConcentrations] = useState<KonsentrasiKeahlian[]>([]);
  const [selectedKonsentrasiId, setSelectedKonsentrasiId] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<MataPelajaran[]>([]);

  // Modal State
  const [modal, setModal] = useState<{ type: ModalType; editId: string | null }>({ type: null, editId: null });
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Form State
  const [programForm, setProgramForm] = useState({ nama: "" });
  const [concentrationForm, setConcentrationForm] = useState({ nama: "" });
  const [subjectForm, setSubjectForm] = useState<Omit<MataPelajaran, "id" | "konsentrasiId">>({
    nama: "", kode: "", kategori: "Kelompok Umum", sequence: 1, semesters: [1], status: "active"
  });

  const refreshPrograms = async () => {
    try {
      const progs = await getPrograms();
      setPrograms(progs);
      if (progs.length > 0 && !selectedProgramId) setSelectedProgramId(progs[0].id);
    } catch (e) {
      console.error("Failed to refresh programs:", e);
    }
  };

  const refreshConcentrations = async (pId: string) => {
    try {
      const cons = await getConcentrations(pId);
      setConcentrations(cons);
      if (cons.length > 0 && !selectedKonsentrasiId) setSelectedKonsentrasiId(cons[0].id);
    } catch (e) {
      console.error("Failed to refresh concentrations:", e);
    }
  };

  useEffect(() => {
    refreshPrograms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedProgramId) {
      refreshConcentrations(selectedProgramId);
    } else {
      setConcentrations([]);
      setSelectedKonsentrasiId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProgramId]);

  useEffect(() => {
    let active = true;
    async function loadSubjects() {
      if (selectedKonsentrasiId) {
        try {
          const subjs = await getSubjects(selectedKonsentrasiId);
          if (active) setSubjects(subjs);
        } catch (e) {
          console.error("Failed to load subjects:", e);
        }
      } else {
        if (active) setSubjects([]);
      }
    }
    loadSubjects();
    return () => { active = false; };
  }, [selectedKonsentrasiId]);

  useEffect(() => {
    if (modal.type && dialogRef.current) {
      dialogRef.current.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [modal.type]);

  const activeProgram = programs.find(p => p.id === selectedProgramId);
  const activeKonsentrasi = concentrations.find(k => k.id === selectedKonsentrasiId);

  // --- Handlers ---

  const openModal = (type: ModalType, id: string | null = null) => {
    if (type === "program") {
      setProgramForm({ nama: id ? programs.find(p => p.id === id)?.nama || "" : "" });
    } else if (type === "concentration") {
      setConcentrationForm({ nama: id ? concentrations.find(k => k.id === id)?.nama || "" : "" });
    } else if (type === "subject") {
      const s = id ? subjects.find(m => m.id === id) : null;
      setSubjectForm(s ? { 
        nama: s.nama, kode: s.kode, kategori: s.kategori, sequence: s.sequence, semesters: s.semesters, status: s.status 
      } : { 
        nama: "", kode: "", kategori: "Kelompok Umum", sequence: subjects.length + 1, semesters: [1], status: "active" 
      });
    }
    setModal({ type, editId: id });
  };

  const closeModal = () => setModal({ type: null, editId: null });

  const handleProgramSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modal.editId) await updateProgram(modal.editId, programForm.nama);
      else await addProgram(programForm.nama);
      await refreshPrograms();
    } catch (e) {
      console.error("Failed to submit program:", e);
    }
    closeModal();
  };

  const handleConcentrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgramId) return;
    try {
      if (modal.editId) await updateConcentration(modal.editId, concentrationForm.nama);
      else await addConcentration(selectedProgramId, concentrationForm.nama);
      await refreshConcentrations(selectedProgramId);
    } catch (e) {
      console.error("Failed to submit concentration:", e);
    }
    closeModal();
  };

  const handleSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKonsentrasiId) return;
    try {
      if (modal.editId) await updateSubject(modal.editId, subjectForm);
      else await addSubject({ ...subjectForm, konsentrasiId: selectedKonsentrasiId });
      const subjs = await getSubjects(selectedKonsentrasiId);
      setSubjects(subjs);
    } catch (e) {
      console.error("Failed to submit subject:", e);
    }
    closeModal();
  };

  const handleDeleteSubject = async (id: string) => {
    if (confirm("Hapus mata pelajaran ini?")) {
      try {
        await deleteSubject(id);
        if (selectedKonsentrasiId) {
          const subjs = await getSubjects(selectedKonsentrasiId);
          setSubjects(subjs);
        }
      } catch (e) {
        console.error("Failed to delete subject:", e);
      }
    }
  };

  return (
    <div className="curriculum-page" style={{ padding: "calc(var(--spacing-base) * 6)" }}>
      <header className="page-header" style={{ marginBottom: "var(--margin-desktop)" }}>
        <h1 className="headline-sm" style={{ margin: 0 }}>Manajemen Kurikulum & Mata Pelajaran</h1>
        <p className="body-sm" style={{ color: "var(--on-surface-variant)", marginTop: 4 }}>
          Kelola program keahlian, konsentrasi, dan pemetaan mata pelajaran.
        </p>
      </header>

      <div className="curriculum-layout" style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "var(--gutter)", alignItems: "start" }}>
        
        {/* --- Sidebar --- */}
        <aside className="curriculum-sidebar" style={{ display: "flex", flexDirection: "column", gap: "var(--gutter)" }}>
          
          {/* Program Keahlian */}
          <div className="card" style={{ padding: "var(--gutter)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h2 className="label-md" style={{ color: "var(--primary)" }}>PROGRAM KEAHLIAN</h2>
              <button className="icon-btn" onClick={() => openModal("program")} title="Tambah Program"><Plus size={14} /></button>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 4 }}>
              {programs.map(p => (
                <li key={p.id} style={{ display: "flex", gap: 4 }}>
                  <button 
                    onClick={() => setSelectedProgramId(p.id)}
                    style={{
                      flex: 1, textAlign: "left", padding: "8px 12px", borderRadius: "var(--rounded-md)", border: "none",
                      background: selectedProgramId === p.id ? "var(--secondary-container)" : "transparent",
                      color: selectedProgramId === p.id ? "var(--on-secondary-container)" : "inherit",
                      fontSize: 14, fontWeight: selectedProgramId === p.id ? 600 : 400, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 8
                    }}
                  >
                    <GraduationCap size={16} />
                    {p.nama}
                  </button>
                  <button className="icon-btn" style={{ height: 36 }} onClick={() => openModal("program", p.id)}><Pencil size={12} /></button>
                </li>
              ))}
            </ul>
          </div>

          {/* Konsentrasi Keahlian */}
          <div className="card" style={{ padding: "var(--gutter)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h2 className="label-md" style={{ color: "var(--primary)" }}>KONSENTRASI</h2>
              <button className="icon-btn" onClick={() => openModal("concentration")} title="Tambah Konsentrasi" disabled={!selectedProgramId}><Plus size={14} /></button>
            </div>
            {concentrations.length > 0 ? (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                {concentrations.map(k => (
                  <li key={k.id} style={{ display: "flex", gap: 4 }}>
                    <button 
                      onClick={() => setSelectedKonsentrasiId(k.id)}
                      style={{
                        flex: 1, textAlign: "left", padding: "8px 12px", borderRadius: "var(--rounded-md)", border: "none",
                        background: selectedKonsentrasiId === k.id ? "var(--primary-container)" : "transparent",
                        color: selectedKonsentrasiId === k.id ? "var(--on-primary-container)" : "inherit",
                        fontSize: 13, fontWeight: selectedKonsentrasiId === k.id ? 600 : 400, cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 8
                      }}
                    >
                      <LayoutGrid size={14} />
                      <span style={{ flex: 1 }}>{k.nama}</span>
                      {selectedKonsentrasiId === k.id && <ChevronRight size={14} />}
                    </button>
                    <button className="icon-btn" style={{ height: 34 }} onClick={() => openModal("concentration", k.id)}><Pencil size={12} /></button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="body-sm" style={{ color: "var(--on-surface-variant)", fontStyle: "italic" }}>{selectedProgramId ? "Belum ada konsentrasi" : "Pilih program keahlian"}</p>
            )}
          </div>
        </aside>

        {/* --- Main Content --- */}
        <main className="curriculum-main">
          {activeKonsentrasi ? (
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "var(--gutter)", borderBottom: "1px solid var(--outline-variant)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--surface-container-low)" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--on-surface-variant)", marginBottom: 4 }}>
                    <span className="label-md">{activeProgram?.nama}</span>
                    <ChevronRight size={12} />
                    <span className="label-md" style={{ color: "var(--primary)" }}>{activeKonsentrasi.nama}</span>
                  </div>
                  <h2 className="headline-sm" style={{ fontSize: 18, margin: 0 }}>Daftar Mata Pelajaran</h2>
                </div>
                <button className="btn btn--primary" style={{ gap: 8 }} onClick={() => openModal("subject")}>
                  <Plus size={16} />
                  Tambah Mapel
                </button>
              </div>

              <div className="table-container" style={{ margin: 0, border: "none" }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="label-md" scope="col" style={{ width: 40, textAlign: "center" }}>#</th>
                      <th className="label-md" scope="col" style={{ width: 80 }}>Kode</th>
                      <th className="label-md" scope="col">Mata Pelajaran</th>
                      <th className="label-md" scope="col">Kategori</th>
                      <th className="label-md" scope="col" style={{ width: 80 }}>Smtr</th>
                      <th className="label-md" scope="col" style={{ width: 100 }}>Status</th>
                      <th className="label-md" scope="col" style={{ width: 80, textAlign: "right" }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.length > 0 ? (
                      subjects.map(m => (
                        <tr key={m.id}>
                          <td className="table-data" style={{ textAlign: "center", color: "var(--on-surface-variant)", fontSize: 12 }}>{m.sequence}</td>
                          <td className="table-data" style={{ fontWeight: 600, color: "var(--primary)" }}>{m.kode}</td>
                          <td className="table-data">{m.nama}</td>
                          <td className="table-data">
                            <span className="body-sm" style={{ color: "var(--on-surface-variant)" }}>{m.kategori}</span>
                          </td>
                          <td className="table-data" style={{ textAlign: "center", fontSize: 12 }}>{m.semesters.join(", ")}</td>
                          <td className="table-data">
                            <span className={`status-badge status-badge--${m.status}`}>
                              {m.status === "active" ? "Aktif" : "Nonaktif"}
                            </span>
                          </td>
                          <td className="table-data">
                            <div className="action-cell" style={{ justifyContent: "flex-end" }}>
                              <button className="icon-btn" title="Edit" onClick={() => openModal("subject", m.id)}><Pencil size={14} /></button>
                              <button className="icon-btn icon-btn--danger" title="Hapus" onClick={() => handleDeleteSubject(m.id)}><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} style={{ padding: "48px 0", textAlign: "center" }}>
                          <BookOpen size={32} style={{ color: "var(--outline-variant)", marginBottom: 12 }} />
                          <p className="body-md">Belum ada mata pelajaran untuk konsentrasi ini.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="empty-state card" style={{ height: "400px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
               <LayoutGrid size={48} style={{ color: "var(--outline-variant)", marginBottom: 16 }} />
               <h2 className="headline-sm">Pilih Konsentrasi Keahlian</h2>
               <p className="body-md" style={{ color: "var(--on-surface-variant)" }}>Pilih salah satu konsentrasi di sebelah kiri untuk mengelola mata pelajaran.</p>
            </div>
          )}
        </main>
      </div>

      {/* --- Modals --- */}
      <dialog ref={dialogRef} className="confirm-dialog" onClose={closeModal}>
        <div className="confirm-dialog__inner">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h2 className="headline-sm" style={{ margin: 0 }}>
              {modal.editId ? "Edit" : "Tambah"} {modal.type === "program" ? "Program" : modal.type === "concentration" ? "Konsentrasi" : "Mata Pelajaran"}
            </h2>
            <button className="icon-btn" onClick={closeModal} aria-label="Tutup"><X size={18} /></button>
          </div>

          {modal.type === "program" && (
            <form onSubmit={handleProgramSubmit}>
              <div className="form-field">
                <label className="form-field__label">Nama Program Keahlian</label>
                <input type="text" className="form-input" value={programForm.nama} onChange={e => setProgramForm({ nama: e.target.value })} required autoFocus placeholder="Contoh: Teknik Mesin" />
              </div>
              <div className="form-actions" style={{ marginTop: 24 }}>
                <button type="button" className="btn btn--secondary" onClick={closeModal}>Batal</button>
                <button type="submit" className="btn btn--primary">Simpan Program</button>
              </div>
            </form>
          )}

          {modal.type === "concentration" && (
            <form onSubmit={handleConcentrationSubmit}>
              <p className="body-sm" style={{ color: "var(--on-surface-variant)", marginBottom: 16 }}>Program: <strong>{activeProgram?.nama}</strong></p>
              <div className="form-field">
                <label className="form-field__label">Nama Konsentrasi Keahlian</label>
                <input type="text" className="form-input" value={concentrationForm.nama} onChange={e => setConcentrationForm({ nama: e.target.value })} required autoFocus placeholder="Contoh: Teknik Pemesinan" />
              </div>
              <div className="form-actions" style={{ marginTop: 24 }}>
                <button type="button" className="btn btn--secondary" onClick={closeModal}>Batal</button>
                <button type="submit" className="btn btn--primary">Simpan Konsentrasi</button>
              </div>
            </form>
          )}

          {modal.type === "subject" && (
            <form onSubmit={handleSubjectSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "100px 140px 1fr", gap: 16 }}>
                <div className="form-field">
                  <label className="form-field__label">No. Urut</label>
                  <input type="number" className="form-input" value={subjectForm.sequence} onChange={e => setSubjectForm({ ...subjectForm, sequence: parseInt(e.target.value) || 0 })} required min={1} />
                </div>
                <div className="form-field">
                  <label className="form-field__label">Kode Mapel</label>
                  <input type="text" className="form-input" value={subjectForm.kode} onChange={e => setSubjectForm({ ...subjectForm, kode: e.target.value })} required placeholder="Contoh: PAI" />
                </div>
                <div className="form-field">
                  <label className="form-field__label">Nama Mata Pelajaran</label>
                  <input type="text" className="form-input" value={subjectForm.nama} onChange={e => setSubjectForm({ ...subjectForm, nama: e.target.value })} required placeholder="Nama lengkap mata pelajaran" />
                </div>
              </div>
              
              <div className="form-field" style={{ marginTop: 16 }}>
                <label className="form-field__label" style={{ marginBottom: 8, display: "block" }}>Semester Terpeta</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <label key={num} style={{ 
                      display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", border: "1px solid var(--outline-variant)", 
                      borderRadius: "var(--rounded-md)", cursor: "pointer",
                      background: subjectForm.semesters.includes(num) ? "var(--primary-container)" : "transparent",
                      borderColor: subjectForm.semesters.includes(num) ? "var(--primary)" : "var(--outline-variant)",
                      color: subjectForm.semesters.includes(num) ? "var(--on-primary-container)" : "inherit",
                    }}>
                      <input 
                        type="checkbox" 
                        checked={subjectForm.semesters.includes(num)}
                        style={{ width: 14, height: 14 }}
                        onChange={(e) => {
                          const val = num;
                          const next = e.target.checked 
                            ? [...subjectForm.semesters, val].sort()
                            : subjectForm.semesters.filter(x => x !== val);
                          setSubjectForm({ ...subjectForm, semesters: next });
                        }}
                      />
                      <span className="label-md">S{num}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
                <div className="form-field">
                  <label className="form-field__label">Kategori</label>
                  <select className="form-input" value={subjectForm.kategori} onChange={e => setSubjectForm({ ...subjectForm, kategori: e.target.value as any })}>
                    <option value="Kelompok Umum">Kelompok Umum</option>
                    <option value="Kelompok Kejuruan">Kelompok Kejuruan</option>
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-field__label">Status</label>
                  <select className="form-input" value={subjectForm.status} onChange={e => setSubjectForm({ ...subjectForm, status: e.target.value as any })}>
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="form-actions" style={{ marginTop: 32 }}>
                <button type="button" className="btn btn--secondary" onClick={closeModal}>Batal</button>
                <button type="submit" className="btn btn--primary" disabled={subjectForm.semesters.length === 0}>Simpan Mapel</button>
              </div>
            </form>
          )}
        </div>
      </dialog>
    </div>
  );
}
