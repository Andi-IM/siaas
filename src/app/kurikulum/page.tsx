"use client";

import { useState, useEffect } from "react";
import { ChevronRight, Plus, Pencil, Trash2, LayoutGrid, BookOpen, GraduationCap } from "lucide-react";
import { getPrograms, getConcentrations, getSubjects } from "@/lib/data";
import type { ProgramKeahlian, KonsentrasiKeahlian, MataPelajaran } from "@/lib/types";

export default function CurriculumPage() {
  const [programs, setPrograms] = useState<ProgramKeahlian[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [concentrations, setConcentrations] = useState<KonsentrasiKeahlian[]>([]);
  const [selectedKonsentrasiId, setSelectedKonsentrasiId] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<MataPelajaran[]>([]);

  useEffect(() => {
    const progs = getPrograms();
    setPrograms(progs);
    if (progs.length > 0) {
      setSelectedProgramId(progs[0].id);
    }
  }, []);

  useEffect(() => {
    if (selectedProgramId) {
      const icons = getConcentrations(selectedProgramId);
      setConcentrations(icons);
      if (icons.length > 0) {
        setSelectedKonsentrasiId(icons[0].id);
      } else {
        setSelectedKonsentrasiId(null);
      }
    } else {
      setConcentrations([]);
      setSelectedKonsentrasiId(null);
    }
  }, [selectedProgramId]);

  useEffect(() => {
    if (selectedKonsentrasiId) {
      setSubjects(getSubjects(selectedKonsentrasiId));
    } else {
      setSubjects([]);
    }
  }, [selectedKonsentrasiId]);

  const activeProgram = programs.find(p => p.id === selectedProgramId);
  const activeKonsentrasi = concentrations.find(k => k.id === selectedKonsentrasiId);

  return (
    <div className="curriculum-page" style={{ padding: "calc(var(--spacing-base) * 6)" }}>
      <header className="page-header" style={{ marginBottom: "var(--margin-desktop)" }}>
        <h1 className="headline-sm" style={{ margin: 0 }}>Manajemen Kurikulum & Mata Pelajaran</h1>
        <p className="body-sm" style={{ color: "var(--on-surface-variant)", marginTop: 4 }}>
          Kelola program keahlian, konsentrasi, dan pemetaan mata pelajaran.
        </p>
      </header>

      <div className="curriculum-layout" style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "var(--gutter)", alignItems: "start" }}>
        
        {/* --- Sidebar: Program & Konsentrasi --- */}
        <aside className="curriculum-sidebar" style={{ display: "flex", flexDirection: "column", gap: "var(--gutter)" }}>
          
          {/* Program Keahlian Card */}
          <div className="card" style={{ padding: "var(--gutter)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h2 className="label-md" style={{ color: "var(--primary)" }}>PROGRAM KEAHLIAN</h2>
              <button className="icon-btn" title="Tambah Program"><Plus size={14} /></button>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 4 }}>
              {programs.map(p => (
                <li key={p.id}>
                  <button 
                    onClick={() => setSelectedProgramId(p.id)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 12px",
                      borderRadius: "var(--rounded-md)",
                      border: "none",
                      background: selectedProgramId === p.id ? "var(--secondary-container)" : "transparent",
                      color: selectedProgramId === p.id ? "var(--on-secondary-container)" : "inherit",
                      fontSize: 14,
                      fontWeight: selectedProgramId === p.id ? 600 : 400,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 8
                    }}
                  >
                    <GraduationCap size={16} />
                    {p.nama}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Konsentrasi Keahlian Card */}
          <div className="card" style={{ padding: "var(--gutter)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h2 className="label-md" style={{ color: "var(--primary)" }}>KONSENTRASI KEAHLIAN</h2>
              <button className="icon-btn" title="Tambah Konsentrasi"><Plus size={14} /></button>
            </div>
            {concentrations.length > 0 ? (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                {concentrations.map(k => (
                  <li key={k.id}>
                    <button 
                      onClick={() => setSelectedKonsentrasiId(k.id)}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "8px 12px",
                        borderRadius: "var(--rounded-md)",
                        border: "none",
                        background: selectedKonsentrasiId === k.id ? "var(--primary-container)" : "transparent",
                        color: selectedKonsentrasiId === k.id ? "var(--on-primary-container)" : "inherit",
                        fontSize: 13,
                        fontWeight: selectedKonsentrasiId === k.id ? 600 : 400,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 8
                      }}
                    >
                      <LayoutGrid size={14} />
                      <span style={{ flex: 1 }}>{k.nama}</span>
                      {selectedKonsentrasiId === k.id && <ChevronRight size={14} />}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="body-sm" style={{ color: "var(--on-surface-variant)", fontStyle: "italic" }}>Pilih program keahlian</p>
            )}
          </div>
        </aside>

        {/* --- Main Content: Mata Pelajaran --- */}
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
                <button className="btn btn--primary" style={{ gap: 8 }}>
                  <Plus size={16} />
                  Tambah Mapel
                </button>
              </div>

              <div className="table-container" style={{ margin: 0, border: "none" }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="label-md" scope="col" style={{ width: 60 }}>Kode</th>
                      <th className="label-md" scope="col">Nama Mata Pelajaran</th>
                      <th className="label-md" scope="col" style={{ width: 100 }}>Kelompok</th>
                      <th className="label-md" scope="col" style={{ width: 100, textAlign: "right" }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.length > 0 ? (
                      subjects.map(m => (
                        <tr key={m.id}>
                          <td className="table-data" style={{ fontWeight: 600, color: "var(--primary)" }}>{m.kode}</td>
                          <td className="table-data">{m.nama}</td>
                          <td className="table-data">
                            <span className="status-badge" style={{ background: "var(--surface-container-high)", color: "var(--on-surface)" }}>
                              Kelompok {m.kelompok}
                            </span>
                          </td>
                          <td className="table-data">
                            <div className="action-cell" style={{ justifyContent: "flex-end" }}>
                              <button className="icon-btn" title="Edit"><Pencil size={14} /></button>
                              <button className="icon-btn icon-btn--danger" title="Hapus"><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} style={{ padding: "48px 0", textAlign: "center" }}>
                          <BookOpen size={32} style={{ color: "var(--outline-variant)", marginBottom: 12 }} />
                          <p className="body-md">Belum ada mata pelajaran untuk konsentrasi ini.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              <div style={{ padding: "12px var(--gutter)", background: "var(--surface-container-lowest)", borderTop: "1px solid var(--outline-variant)" }}>
                <p className="body-sm" style={{ color: "var(--on-surface-variant)" }}>
                  Total: <strong>{subjects.length}</strong> Mata Pelajaran
                </p>
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
    </div>
  );
}
