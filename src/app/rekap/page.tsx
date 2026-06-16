"use client";

import { useState, useEffect, useRef } from "react";
import { Printer, FileUp, FileDown, Edit3, Save, X } from "lucide-react";
import Link from "next/link";
import { getStudents, getPrograms, getConcentrations, getSubjects, getStudentGradesByFilter, saveGradesBatch, importGradesFromExcel, exportGradesToExcel, getSemesters } from "@/lib/data";
import type { Student, ProgramKeahlian, KonsentrasiKeahlian, MataPelajaran, StudentGrade, Semester } from "@/lib/types";

function getCategoryWeight(cat: string): number {
  if (cat === "Kelompok Umum") return 1;
  if (cat === "Kelompok Kejuruan") return 2;
  return 99;
}

export default function RekapDataPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [programs, setPrograms] = useState<ProgramKeahlian[]>([]);
  const [concentrations, setConcentrations] = useState<KonsentrasiKeahlian[]>([]);
  const [subjects, setSubjects] = useState<MataPelajaran[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [semestersList, setSemestersList] = useState<Semester[]>([]);

  // Filters
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [selectedKonsentrasiId, setSelectedKonsentrasiId] = useState("");
  const [selectedSemester, setSelectedSemester] = useState(1);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [localGrades, setLocalGrades] = useState<Record<string, number>>({}); // Key: "studentId_subjectId"

  const [toast, setToast] = useState<string | null>(null);
  const [modalMessage, setModalMessage] = useState<{ title: string; body: string; type?: "info" | "error" | "success" } | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (modalMessage && dialogRef.current) {
      dialogRef.current.showModal();
    }
  }, [modalMessage]);

  const closeDialog = () => {
    setModalMessage(null);
    dialogRef.current?.close();
  };

  useEffect(() => {
    let active = true;
    async function loadInitial() {
      try {
        const [studs, progs, sems] = await Promise.all([
          getStudents(),
          getPrograms(),
          getSemesters()
        ]);
        if (active) {
          setStudents(studs);
          setPrograms(progs);
          setSemestersList(sems);
          if (progs.length > 0) setSelectedProgramId(progs[0].id);
        }
      } catch (e) {
        console.error("Failed to load initial rekap data:", e);
      }
    }
    loadInitial();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    async function loadCons() {
      if (selectedProgramId) {
        try {
          const cons = await getConcentrations(selectedProgramId);
          if (active) {
            setConcentrations(cons);
            if (cons.length > 0) setSelectedKonsentrasiId(cons[0].id);
            else setSelectedKonsentrasiId("");
          }
        } catch (e) {
          console.error("Failed to load concentrations:", e);
        }
      }
    }
    loadCons();
    return () => { active = false; };
  }, [selectedProgramId]);

  useEffect(() => {
    let active = true;
    async function loadSubjectsAndGrades() {
      if (selectedKonsentrasiId) {
        try {
          const [subjs, grads] = await Promise.all([
            getSubjects(selectedKonsentrasiId),
            getStudentGradesByFilter(selectedKonsentrasiId, selectedSemester)
          ]);
          if (active) {
            setSubjects(subjs);
            
            
            // Build local editing map
            const map: Record<string, number> = {};
            grads.forEach(g => {
              map[`${g.studentId}_${g.subjectId}`] = g.grade;
            });
            setLocalGrades(map);
          }
        } catch (e) {
          console.error("Failed to load subjects/grades:", e);
        }
      }
    }
    loadSubjectsAndGrades();
    return () => { active = false; };
  }, [selectedKonsentrasiId, selectedSemester]);

  const filteredStudents = students.filter(s => 
    !selectedKonsentrasiId || s.kompetensi === concentrations.find(k => k.id === selectedKonsentrasiId)?.nama
  );

  const filteredSubjects = subjects
    .filter(m => m.semesters.includes(selectedSemester))
    .sort((a, b) => {
      const wA = getCategoryWeight(a.kategori);
      const wB = getCategoryWeight(b.kategori);
      if (wA !== wB) return wA - wB;
      return a.sequence - b.sequence;
    });

  const activeSemesterInfo = semestersList.find(s => s.sequence === selectedSemester);
  const activeSemesterName = activeSemesterInfo ? activeSemesterInfo.nama : `Semester ${selectedSemester}`;

  const handlePrint = () => {
    window.print();
  };

  const handleSaveGrades = async () => {
    if (!selectedKonsentrasiId) return;
    try {
      const payload: StudentGrade[] = Object.entries(localGrades).map(([key, val]) => {
        const [studentId, subjectId] = key.split("_");
        return { studentId, subjectId, grade: val };
      });
      await saveGradesBatch(selectedKonsentrasiId, selectedSemester, payload);
      setIsEditing(false);
      // Refresh
      const grads = await getStudentGradesByFilter(selectedKonsentrasiId, selectedSemester);
      setGrades(grads);
      setToast("Nilai berhasil disimpan.");
      setTimeout(() => setToast(null), 3000);
    } catch (e) {
      console.error("Failed to save grades:", e);
      setModalMessage({
        title: "Gagal Menyimpan",
        body: "Gagal menyimpan nilai.",
        type: "error"
      });
    }
  };

  const getGradeValue = (studentId: string, subjectId: string) => {
    return localGrades[`${studentId}_${subjectId}`];
  };

  const setGradeValue = (studentId: string, subjectId: string, value: string) => {
    const num = parseFloat(value);
    const clamped = isNaN(num) ? 0 : Math.max(0, Math.min(100, num));
    setLocalGrades({
      ...localGrades,
      [`${studentId}_${subjectId}`]: clamped
    });
  };

  const handleImportExcel = async () => {
    try {
      const message = await importGradesFromExcel();
      setModalMessage({
        title: "Impor Excel",
        body: message,
        type: "success"
      });
      // Refresh students and grades
      const studs = await getStudents();
      setStudents(studs);
      if (selectedKonsentrasiId) {
        const grads = await getStudentGradesByFilter(selectedKonsentrasiId, selectedSemester);
        setGrades(grads);
        const map: Record<string, number> = {};
        grads.forEach(g => {
          map[`${g.studentId}_${g.subjectId}`] = g.grade;
        });
        setLocalGrades(map);
      }
    } catch (e) {
      console.error("Failed to import Excel:", e);
      setModalMessage({
        title: "Gagal Impor",
        body: typeof e === "string" ? e : "Gagal mengimpor Excel.",
        type: "error"
      });
    }
  };

  const handleExportExcel = async () => {
    if (!selectedKonsentrasiId) {
      setModalMessage({
        title: "Pilih Konsentrasi",
        body: "Silakan pilih Konsentrasi Keahlian terlebih dahulu.",
        type: "info"
      });
      return;
    }
    try {
      const message = await exportGradesToExcel(selectedKonsentrasiId);
      setModalMessage({
        title: "Ekspor Excel",
        body: message,
        type: "success"
      });
    } catch (e) {
      console.error("Failed to export Excel:", e);
      setModalMessage({
        title: "Gagal Ekspor",
        body: typeof e === "string" ? e : "Gagal mengekspor Excel.",
        type: "error"
      });
    }
  };

  return (
    <div className="rekap-page">
      {/* ── Page Header (Hidden on Print) ── */}
      <header className="page-header no-print">
        <div className="header-content">
          <div className="header-title">
            <h1 className="headline-sm">Rekap Data Hasil Belajar</h1>
            <p className="body-sm text-muted">
              Rekapitulasi nilai siswa per semester untuk laporan institusi.
            </p>
          </div>
          <div className="header-actions">
            {!isEditing ? (
              <>
                <button className="btn btn--secondary btn-icon-text" onClick={() => setIsEditing(true)}>
                  <Edit3 size={18} />
                  <span>Input Nilai</span>
                </button>
                <button className="btn btn--secondary btn-icon-text" onClick={handleImportExcel}>
                  <FileUp size={18} />
                  <span>Impor Excel</span>
                </button>
                <button className="btn btn--secondary btn-icon-text" onClick={handleExportExcel}>
                  <FileDown size={18} />
                  <span>Ekspor Excel</span>
                </button>
                <button className="btn btn--primary btn-icon-text" onClick={handlePrint}>
                  <Printer size={18} />
                  <span>Cetak Laporan</span>
                </button>
              </>
            ) : (
              <>
                <button className="btn btn--secondary btn-icon-text" onClick={() => setIsEditing(false)}>
                  <X size={18} />
                  <span>Batal</span>
                </button>
                <button className="btn btn--primary btn-icon-text" onClick={handleSaveGrades}>
                  <Save size={18} />
                  <span>Simpan Nilai</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Filters (Hidden on Print) ── */}
      <section className="filter-bar no-print card">
        <div className="form-field program-field">
          <label className="label-md" htmlFor="select-program">Program Keahlian</label>
          <select id="select-program" className="filter-select" value={selectedProgramId} onChange={e => setSelectedProgramId(e.target.value)}>
            {programs.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
          </select>
        </div>
        <div className="form-field konsentrasi-field">
          <label className="label-md" htmlFor="select-konsentrasi">Konsentrasi Keahlian</label>
          <select id="select-konsentrasi" className="filter-select" value={selectedKonsentrasiId} onChange={e => setSelectedKonsentrasiId(e.target.value)}>
            <option value="">Semua Konsentrasi</option>
            {concentrations.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
          </select>
        </div>
        <div className="form-field semester-field">
          <label className="label-md" htmlFor="select-semester">Semester</label>
          <select id="select-semester" className="filter-select" value={selectedSemester} onChange={e => setSelectedSemester(parseInt(e.target.value))}>
            {semestersList.map(s => <option key={s.id} value={s.sequence}>{s.nama}</option>)}
          </select>
        </div>
      </section>

      {/* ── Spreadsheet Layout ── */}
      <div className="rekap-container card">
        {/* Print Header (Visible only on Print) */}
        <div className="print-only">
          <h2 className="print-title">REKAP DATA HASIL BELAJAR SISWA</h2>
          <h3 className="print-subtitle">SMKN 1 SUMATERA BARAT</h3>
          <div className="print-meta-grid">
            <div>Program Studi: {programs.find(p => p.id === selectedProgramId)?.nama || "—"}</div>
            <div>Semester: {activeSemesterName}</div>
            <div>Konsentrasi: {concentrations.find(k => k.id === selectedKonsentrasiId)?.nama || "—"}</div>
            <div>Tahun Pelajaran: 2024/2025</div>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="rekap-table">
            <thead>
              {/* Tier 1 Header */}
              <tr>
                <th rowSpan={2} className="th-center">NO.</th>
                <th rowSpan={2} className="th-sticky-name">NAMA PESERTA DIDIK</th>
                <th colSpan={2} className="th-center">TEMPAT DAN TANGGAL LAHIR</th>
                <th rowSpan={2} className="th-center">L/P</th>
                <th rowSpan={2} className="th-center">NIS</th>
                <th rowSpan={2} className="th-center">NISN</th>
                <th colSpan={filteredSubjects.length} className="th-center">MATA PELAJARAN ({activeSemesterName.toUpperCase()})</th>
              </tr>
              {/* Tier 2 Header */}
              <tr>
                <th className="th-center">TEMPAT</th>
                <th className="th-center">TANGGAL</th>
                {filteredSubjects.map(m => (
                  <th key={m.id} className="th-subject">
                    <div className="subject-rotate">
                      {m.kode}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((s, idx) => (
                  <tr key={s.nis}>
                    <td className="td-center">{idx + 1}</td>
                    <td className="td-sticky-name">
                      <Link href={`/siswa/transkrip?nis=${s.nis}`} className="table-link">
                        {s.nama}
                      </Link>
                    </td>
                    <td className="td-center">{s.tempatLahir}</td>
                    <td className="td-center">{s.tanggalLahir}</td>
                    <td className="td-center">{s.jenisKelamin}</td>
                    <td className="td-center">{s.nis}</td>
                    <td className="td-center">{s.nisn}</td>
                    {filteredSubjects.map(m => {
                      const val = getGradeValue(s.nis, m.id);
                      return (
                        <td key={m.id} className={`td-grade ${isEditing ? 'is-editing' : ''}`}>
                          {isEditing ? (
                            <input 
                              type="number" 
                              step="0.01"
                              min="0"
                              max="100"
                              value={val ?? ""}
                              onChange={e => setGradeValue(s.nis, m.id, e.target.value)}
                              onWheel={e => (e.target as HTMLInputElement).blur()}
                            />
                          ) : (
                            <span className={!val ? 'text-muted' : ''}>
                              {val ?? "—"}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7 + filteredSubjects.length} className="empty-row">
                    Pilih konsentrasi untuk menampilkan data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      {/* ── Dialog Modal for Alerts ── */}
      <dialog ref={dialogRef} className="confirm-dialog" onClose={closeDialog}>
        {modalMessage && (
          <div className="confirm-dialog__inner">
            <h2 className="headline-sm" style={{ marginBottom: "var(--gutter)" }}>
              {modalMessage.title}
            </h2>
            <p className="body-md" style={{ marginBottom: "calc(var(--spacing-base) * 6)" }}>
              {modalMessage.body}
            </p>
            <div className="confirm-dialog__actions">
              <button className="btn btn--primary" onClick={closeDialog}>OK</button>
            </div>
          </div>
        )}
      </dialog>

      {/* ── Toast ── */}
      {toast && (
        <div className="toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </div>

      <style jsx>{`
        .rekap-page {
          padding: calc(var(--spacing-base) * 6);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--margin-desktop);
        }

        .text-muted {
          color: var(--on-surface-variant);
          margin-top: 4px;
        }

        .header-actions {
          display: flex;
          gap: calc(var(--spacing-base) * 2);
        }

        .filter-bar {
          padding: var(--gutter);
          margin-bottom: var(--margin-desktop);
          display: flex;
          gap: var(--gutter);
          flex-wrap: wrap;
          align-items: flex-end;
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .program-field, .konsentrasi-field {
          flex: 1;
          min-width: 200px;
        }

        .semester-field {
          width: 120px;
        }

        .rekap-container {
          padding: 0;
          overflow: hidden;
        }

        .table-wrapper {
          overflow: auto;
          max-height: calc(100vh - 300px);
        }

        .rekap-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          font-size: 11px;
        }

        .rekap-table th, .rekap-table td {
          border-right: 1px solid var(--outline-variant);
          border-bottom: 1px solid var(--outline-variant);
          padding: 6px 4px;
        }

        .rekap-table th {
          background: var(--surface-container-low);
          color: var(--on-surface-variant);
          font-weight: 600;
          font-size: 10px;
          text-transform: uppercase;
          position: sticky;
          top: 0;
          z-index: 5;
        }

        thead tr:nth-child(2) th {
          top: 33px; /* Approximate height of first row */
        }

        .th-center, .td-center {
          text-align: center;
        }

        .th-sticky-name, .td-sticky-name {
          position: sticky;
          left: 0;
          z-index: 10;
          min-width: 180px;
          text-align: left;
          background: var(--surface-container-low);
          border-right: 2px solid var(--outline);
        }

        .td-sticky-name {
          background: var(--surface-container-lowest);
          font-weight: 500;
        }

        .th-subject {
          height: 120px;
          vertical-align: bottom;
          padding: 8px 2px;
        }

        .subject-rotate {
          transform: rotate(-90deg);
          width: 24px;
          margin: 0 auto;
          white-space: nowrap;
          transform-origin: center;
        }

        .td-grade {
          text-align: center;
        }

        .td-grade.is-editing {
          padding: 0;
        }

        .td-grade input {
          width: 100%;
          border: none;
          background: transparent;
          textAlign: center;
          height: 32px;
          fontSize: 11px;
          outline: none;
          color: var(--primary);
          font-weight: 600;
        }

        .empty-row {
          padding: 48px;
          text-align: center;
          color: var(--on-surface-variant);
        }

        /* ── Print Styles ── */
        .print-only {
          display: none;
          text-align: center;
          margin-bottom: 32px;
        }

        .print-title {
          fontSize: 16px;
          font-weight: 700;
          margin: 0 0 4px 0;
        }

        .print-subtitle {
          fontSize: 14px;
          font-weight: 600;
          margin: 0 0 16px 0;
        }

        .print-meta-grid {
          display: grid;
          gridTemplateColumns: 1fr 1fr;
          text-align: left;
          font-size: 12px;
          border: 1px solid #000;
          padding: 8px;
        }

        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .rekap-page { padding: 0 !important; }
          .card { border: none !important; box-shadow: none !important; }
          .rekap-table th, .rekap-table td { border: 1px solid #000 !important; color: #000 !important; }
          .rekap-table th { position: static !important; }
          .th-sticky-name, .td-sticky-name { position: static !important; border-right: 1px solid #000 !important; }
          @page { size: landscape; margin: 1cm; }
        }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .rekap-page {
            padding: calc(var(--spacing-base) * 4);
          }
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            gap: 16px;
          }

          .header-actions {
            width: 100%;
            flex-wrap: wrap;
          }

          .header-actions .btn {
            flex: 1;
            justify-content: center;
          }

          .btn-icon-text span {
            display: none; /* Icon only on small mobile if needed, but flex:1 might fit labels */
          }
          
          @media (min-width: 480px) {
            .btn-icon-text span { display: inline; }
          }

          .filter-bar {
            flex-direction: column;
            align-items: stretch;
          }

          .program-field, .konsentrasi-field, .semester-field {
            width: 100%;
            min-width: 0;
          }
          
          .table-wrapper {
             max-height: calc(100vh - 400px);
          }
        }
      `}</style>
    </div>
  );
}



