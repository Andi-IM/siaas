"use client";

import { useState, useEffect } from "react";
import { Printer, ChevronDown, Filter, FileSpreadsheet, Users, FileUp, FileDown } from "lucide-react";
import Link from "next/link";
import { getStudents, getPrograms, getConcentrations, getSubjects } from "@/lib/data";
import type { Student, ProgramKeahlian, KonsentrasiKeahlian, MataPelajaran } from "@/lib/types";

export default function RekapDataPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [programs, setPrograms] = useState<ProgramKeahlian[]>([]);
  const [concentrations, setConcentrations] = useState<KonsentrasiKeahlian[]>([]);
  const [subjects, setSubjects] = useState<MataPelajaran[]>([]);

  // Filters
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [selectedKonsentrasiId, setSelectedKonsentrasiId] = useState("");
  const [selectedSemester, setSelectedSemester] = useState(1);

  useEffect(() => {
    let active = true;
    async function loadInitial() {
      try {
        const [studs, progs] = await Promise.all([
          getStudents(),
          getPrograms()
        ]);
        if (active) {
          setStudents(studs);
          setPrograms(progs);
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
    async function loadSubjects() {
      if (selectedKonsentrasiId) {
        try {
          const subjs = await getSubjects(selectedKonsentrasiId);
          if (active) {
            setSubjects(subjs);
          }
        } catch (e) {
          console.error("Failed to load subjects:", e);
        }
      }
    }
    loadSubjects();
    return () => { active = false; };
  }, [selectedKonsentrasiId]);

  const filteredStudents = students.filter(s => 
    !selectedKonsentrasiId || s.kompetensi === concentrations.find(k => k.id === selectedKonsentrasiId)?.nama
  );

  const filteredSubjects = subjects.filter(m => m.semester === selectedSemester || m.kategori === "Kelompok Umum");

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="rekap-page" style={{ padding: "calc(var(--spacing-base) * 6)" }}>
      {/* ── Page Header (Hidden on Print) ── */}
      <header className="page-header no-print" style={{ marginBottom: "var(--margin-desktop)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 className="headline-sm" style={{ margin: 0 }}>Rekap Data Hasil Belajar</h1>
            <p className="body-sm" style={{ color: "var(--on-surface-variant)", marginTop: 4 }}>
              Rekapitulasi nilai siswa per semester untuk laporan institusi.
            </p>
          </div>
          <div style={{ display: "flex", gap: "calc(var(--spacing-base) * 2)" }}>
            <button className="btn btn--secondary" style={{ gap: 8 }}>
              <FileUp size={18} />
              Import Excel
            </button>
            <button className="btn btn--secondary" style={{ gap: 8 }}>
              <FileDown size={18} />
              Export Excel
            </button>
            <button className="btn btn--primary" onClick={handlePrint} style={{ gap: 8 }}>
              <Printer size={18} />
              Cetak Laporan
            </button>
          </div>
        </div>
      </header>

      {/* ── Filters (Hidden on Print) ── */}
      <section className="filter-bar no-print card" style={{ padding: "var(--gutter)", marginBottom: "var(--margin-desktop)", display: "flex", gap: "var(--gutter)", flexWrap: "wrap", alignItems: "flex-end" }}>
        <div className="form-field" style={{ flex: 1, minWidth: 200 }}>
          <label className="label-md" style={{ marginBottom: 8, display: "block" }}>Program Keahlian</label>
          <select className="filter-select" style={{ width: "100%" }} value={selectedProgramId} onChange={e => setSelectedProgramId(e.target.value)}>
            {programs.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
          </select>
        </div>
        <div className="form-field" style={{ flex: 1, minWidth: 200 }}>
          <label className="label-md" style={{ marginBottom: 8, display: "block" }}>Konsentrasi Keahlian</label>
          <select className="filter-select" style={{ width: "100%" }} value={selectedKonsentrasiId} onChange={e => setSelectedKonsentrasiId(e.target.value)}>
            <option value="">Semua Konsentrasi</option>
            {concentrations.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
          </select>
        </div>
        <div className="form-field" style={{ width: 120 }}>
          <label className="label-md" style={{ marginBottom: 8, display: "block" }}>Semester</label>
          <select className="filter-select" style={{ width: "100%" }} value={selectedSemester} onChange={e => setSelectedSemester(parseInt(e.target.value))}>
            {[1, 2, 3, 4, 5, 6].map(s => <option key={s} value={s}>Semester {s}</option>)}
          </select>
        </div>
      </section>

      {/* ── Spreadsheet Layout ── */}
      <div className="rekap-container card" style={{ padding: 0, overflow: "auto" }}>
        {/* Print Header (Visible only on Print) */}
        <div className="print-only" style={{ textAlign: "center", marginBottom: 32, display: "none" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px 0" }}>REKAP DATA HASIL BELAJAR SISWA</h2>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 16px 0" }}>SMKN 1 SUMATERA BARAT</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", textAlign: "left", fontSize: 12, border: "1px solid #000", padding: 8 }}>
            <div>Program Studi: {programs.find(p => p.id === selectedProgramId)?.nama || "—"}</div>
            <div>Semester: {selectedSemester}</div>
            <div>Konsentrasi: {concentrations.find(k => k.id === selectedKonsentrasiId)?.nama || "—"}</div>
            <div>Tahun Pelajaran: 2024/2025</div>
          </div>
        </div>

        <table className="rekap-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
          <thead>
            {/* Tier 1 Header */}
            <tr>
              <th rowSpan={2} style={thStyle}>NO.</th>
              <th rowSpan={2} style={{ ...thStyle, minWidth: 180 }}>NAMA PESERTA DIDIK</th>
              <th rowSpan={2} style={thStyle}>L/P</th>
              <th rowSpan={2} style={thStyle}>NIS</th>
              <th rowSpan={2} style={thStyle}>NISN</th>
              <th colSpan={filteredSubjects.length} style={{ ...thStyle, textAlign: "center" }}>MATA PELAJARAN (SEMESTER {selectedSemester})</th>
            </tr>
            {/* Tier 2 Header */}
            <tr>
              {filteredSubjects.map(m => (
                <th key={m.id} style={{ ...thStyle, height: 120, verticalAlign: "bottom" }}>
                  <div style={{ transform: "rotate(-90deg)", width: 24, margin: "0 auto", whiteSpace: "nowrap" }}>
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
                  <td style={tdStyle}>{idx + 1}</td>
                  <td style={{ ...tdStyle, textAlign: "left", fontWeight: 500 }}>
                    <Link href={`/siswa/transkrip?nis=${s.nis}`} className="table-link">
                      {s.nama}
                    </Link>
                  </td>
                  <td style={tdStyle}>{s.jenisKelamin}</td>
                  <td style={tdStyle}>{s.nis}</td>
                  <td style={tdStyle}>{s.nisn}</td>
                  {filteredSubjects.map(m => (
                    <td key={m.id} style={{ ...tdStyle, color: "var(--outline-variant)" }}>
                      {/* Placeholder grades */}
                      {Math.floor(Math.random() * (95 - 75 + 1)) + 75}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5 + filteredSubjects.length} style={{ padding: 48, textAlign: "center", color: "var(--on-surface-variant)" }}>
                  Pilih konsentrasi untuk menampilkan data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .rekap-page { padding: 0 !important; }
          .card { border: none !important; box-shadow: none !important; }
          .rekap-table th, .rekap-table td { border: 1px solid #000 !important; color: #000 !important; }
          @page { size: landscape; margin: 1cm; }
        }
      `}</style>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  border: "1px solid var(--outline-variant)",
  padding: "8px 4px",
  background: "var(--surface-container-low)",
  color: "var(--on-surface-variant)",
  fontWeight: 600,
  fontSize: 10,
  textTransform: "uppercase"
};

const tdStyle: React.CSSProperties = {
  border: "1px solid var(--outline-variant)",
  padding: "6px 4px",
  textAlign: "center",
  color: "var(--on-surface)"
};
