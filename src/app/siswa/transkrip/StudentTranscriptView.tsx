"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";
import type { Student, MataPelajaran } from "@/lib/types";
import { getStudentByNis, getGradesByStudent, getConcentrations, getSubjects } from "@/lib/data";
import React from "react";

interface TranscriptSubject {
  no: number;
  nama: string;
  scores: (number | null)[];
  average: number;
}

interface TranscriptCategory {
  nama: string;
  subjects: TranscriptSubject[];
}

interface PendampingSubject {
  no: number;
  nama: string;
  nilai: number;
}

interface PendampingCategory {
  nama: string;
  subjects: PendampingSubject[];
}

type TranscriptMode = "3-tahun" | "pendamping";

export default function StudentTranscriptView({ nis }: { nis: string }) {
  const [student, setStudent] = useState<Student | null>(null);
  const [subjects, setSubjects] = useState<MataPelajaran[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<TranscriptMode>("3-tahun");
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        const found = await getStudentByNis(nis);
        if (active && found) {
          setStudent(found);
          
          // Get concentration ID (need to find it from name or add it to Student model)
          // For now, let's assume we can get subjects if we had the ID.
          // I'll add a helper to find concentration by name.
          const allCons = await getConcentrations();
          const con = allCons.find(c => c.nama === found.kompetensi);
          
          const [subjs, allGrades] = await Promise.all([
            con ? getSubjects(con.id) : Promise.resolve([]),
            getGradesByStudent(nis)
          ]);
          
          if (active) {
            setSubjects(subjs);
            setGrades(allGrades);
            setLoading(false);
          }
        } else if (active) {
          setLoading(false);
        }
      } catch (e) {
        console.error("Failed to load transcript data:", e);
        if (active) setLoading(false);
      }
    }
    loadData();
    return () => { active = false; };
  }, [nis]);

  // --- Aggregate Data (computed before early returns for hooks safety) ---

  const categoryMap: Record<string, Record<string, TranscriptSubject>> = {
    "Kelompok Umum": {},
    "Kelompok Kejuruan": {}
  };

  // 1. Initialize with all subjects (exclude UKK — it's aggregated into Konsentrasi Keahlian)
  subjects.forEach(s => {
    if (s.transcriptGroup === "UKK") return;
    const cat = s.kategori === "Kelompok Umum" ? "Kelompok Umum" : "Kelompok Kejuruan";
    categoryMap[cat][s.id] = {
      no: s.sequence,
      nama: s.nama,
      scores: [null, null, null, null, null, null],
      average: 0
    };
  });

  // 2. Overlay grades
  grades.forEach(g => {
    if (g.semester_sequence > 6) return;
    const cat = g.category === "Kelompok Umum" ? "Kelompok Umum" : "Kelompok Kejuruan";
    if (categoryMap[cat][g.subject_id]) {
      categoryMap[cat][g.subject_id].scores[g.semester_sequence - 1] = g.grade;
    }
  });

  const categories: TranscriptCategory[] = Object.entries(categoryMap).map(([name, subs], idx) => {
    const sortedSubs = Object.values(subs).sort((a, b) => a.no - b.no).map((s, i) => {
      const validScores = s.scores.filter(v => v !== null) as number[];
      const avg = validScores.length > 0
        ? validScores.reduce((a, b) => a + b, 0) / validScores.length
        : 0;
      return { ...s, no: i + 1, average: avg };
    });
    return {
      nama: `${String.fromCharCode(65 + idx)}. ${name}`,
      subjects: sortedSubs
    };
  });

  const semesterAverages = [1, 2, 3, 4, 5, 6].map(sem => {
    const semGrades = grades.filter(g => g.semester_sequence === sem);
    return semGrades.length > 0
      ? semGrades.reduce((a, b) => a + b.grade, 0) / semGrades.length
      : 0;
  });

  // --- Transkrip Nilai Data ---

  const pendampingCategories: PendampingCategory[] = React.useMemo(() => {
    // Build a map: subjectId → { name, sequence, transcriptGroup, grades: Map<semesterSeq, grade> }
    const subjectGradeMap: Record<string, {
      name: string; sequence: number; transcriptGroup: string; grades: Map<number, number>;
    }> = {};

    subjects.forEach(s => {
      subjectGradeMap[s.id] = {
        name: s.nama,
        sequence: s.sequence,
        transcriptGroup: s.transcriptGroup,
        grades: new Map(),
      };
    });

    grades.forEach(g => {
      if (subjectGradeMap[g.subject_id]) {
        subjectGradeMap[g.subject_id].grades.set(g.semester_sequence, g.grade);
      }
    });

    const computeAverage = (subjectId: string, allowedSemesters?: number[]): number => {
      const s = subjectGradeMap[subjectId];
      if (!s) return 0;
      const scores: number[] = [];
      s.grades.forEach((grade, sem) => {
        if (!allowedSemesters || allowedSemesters.includes(sem)) {
          scores.push(grade);
        }
      });
      return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    };

    // Compute Konsentrasi Keahlian aggregated row
    const konsentrasiIds = subjects.filter(s => s.transcriptGroup === "KEJURUAN_KONSENTRASI").map(s => s.id);
    const ukkId = subjects.find(s => s.transcriptGroup === "UKK")?.id;

    let konsentrasiScore = 0;
    if (konsentrasiIds.length > 0) {
      const s3Scores: number[] = [];
      const s4Scores: number[] = [];
      const s6Scores: number[] = [];
      konsentrasiIds.forEach(id => {
        const g = subjectGradeMap[id]?.grades;
        if (g?.has(3)) s3Scores.push(g.get(3)!);
        if (g?.has(4)) s4Scores.push(g.get(4)!);
        if (g?.has(6)) s6Scores.push(g.get(6)!);
      });
      const avgS3 = s3Scores.length > 0 ? s3Scores.reduce((a, b) => a + b, 0) / s3Scores.length : 0;
      const avgS4 = s4Scores.length > 0 ? s4Scores.reduce((a, b) => a + b, 0) / s4Scores.length : 0;
      const avgS6 = s6Scores.length > 0 ? s6Scores.reduce((a, b) => a + b, 0) / s6Scores.length : 0;
      const ukkScore = ukkId ? (subjectGradeMap[ukkId]?.grades.get(99) ?? 0) : 0;
      konsentrasiScore = (avgS3 + avgS4 + avgS6 + ukkScore) / 4;
    }

    // Categorize: UMUM subjects → Kelompok Umum
    // KEJURUAN_UMUM, KEJURUAN_DASAR, KEJURUAN_KONSENTRASI → Kelompok Kejuruan
    const umumSubjects: PendampingSubject[] = [];
    const kejuruanSubjects: PendampingSubject[] = [];

    subjects
      .filter(s => s.status === "active")
      .sort((a, b) => {
        const wA = a.kategori === "Kelompok Umum" ? 1 : 2;
        const wB = b.kategori === "Kelompok Umum" ? 1 : 2;
        if (wA !== wB) return wA - wB;
        return a.sequence - b.sequence;
      })
      .forEach(s => {
        if (s.transcriptGroup === "KEJURUAN_KONSENTRASI") return;
        if (s.transcriptGroup === "UKK") return; // already included in Konsentrasi Keahlian formula

        let nilai: number;
        if (s.transcriptGroup === "KEJURUAN_DASAR") {
          nilai = computeAverage(s.id, [1, 2]);
        } else {
          nilai = computeAverage(s.id);
        }

        const entry: PendampingSubject = { no: 0, nama: s.nama, nilai };

        if (s.kategori === "Kelompok Umum") {
          umumSubjects.push(entry);
        } else {
          kejuruanSubjects.push(entry);
        }
      });

    // Number the subjects
    umumSubjects.forEach((s, i) => { s.no = i + 1; });

    // Insert Konsentrasi Keahlian right after DDK (KEJURUAN_DASAR)
    const ddkIndex = kejuruanSubjects.findIndex(s => {
      const subj = subjects.find(x => x.nama === s.nama);
      return subj?.transcriptGroup === "KEJURUAN_DASAR";
    });

    // Move MAPIL to the end
    const mapilIndex = kejuruanSubjects.findIndex(s => {
      const subj = subjects.find(x => x.nama === s.nama);
      return subj?.kode === "MAPIL";
    });
    if (mapilIndex !== -1) {
      const [mapil] = kejuruanSubjects.splice(mapilIndex, 1);
      kejuruanSubjects.push(mapil);
    }

    // Insert Konsentrasi Keahlian after DDK
    if (konsentrasiIds.length > 0) {
      const insertPos = ddkIndex !== -1 ? ddkIndex + 1 : kejuruanSubjects.length;
      kejuruanSubjects.splice(insertPos, 0, { no: 0, nama: "Konsentrasi Keahlian", nilai: konsentrasiScore });
    }

    // Number the subjects
    kejuruanSubjects.forEach((s, i) => { s.no = i + 1; });

    const result: PendampingCategory[] = [];
    if (umumSubjects.length > 0) {
      result.push({ nama: "A. Kelompok Mata Pelajaran Umum", subjects: umumSubjects });
    }
    if (kejuruanSubjects.length > 0) {
      result.push({ nama: "B. Kelompok Mata Pelajaran Kejuruan", subjects: kejuruanSubjects });
    }
    return result;
  }, [subjects, grades]);

  if (loading) {
    return (
      <div className="list-page">
        <div className="skeleton" style={{ height: 32, width: 300, marginBottom: 24 }} />
        <div className="skeleton" style={{ height: 400, width: "100%" }} />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="list-page">
        <div className="empty-state">
          <p className="headline-sm">Siswa tidak ditemukan</p>
          <Link href="/rekap" className="btn btn--primary">Kembali ke Rekap Data</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="list-page">
      {/* ── Screen UI Header ── */}
      <div className="list-action-bar no-print">
        <div className="list-action-bar__left">
          <Link href="/rekap" className="back-link" style={{ marginRight: 8 }}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="headline-sm" style={{ margin: 0 }}>Transkrip Nilai</h1>
            <p className="body-sm" style={{ color: "var(--on-surface-variant)" }}>
              {student.nama} · {student.nisn}
            </p>
          </div>
        </div>
        <div className="list-action-bar__right">
          <div style={{ display: "flex", gap: 0, marginRight: 16 }}>
            <button
              className={`btn ${mode === "3-tahun" ? "btn--primary" : "btn--secondary"}`}
              onClick={() => setMode("3-tahun")}
              style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
            >
              Transkrip 3 Tahun
            </button>
            <button
              className={`btn ${mode === "pendamping" ? "btn--primary" : "btn--secondary"}`}
              onClick={() => setMode("pendamping")}
              style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
            >
              Transkrip Nilai
            </button>
          </div>

          <button className="btn btn--primary" onClick={() => window.print()} style={{ gap: 8 }}>
            <Printer size={18} />
            Cetak Transkrip
          </button>
        </div>
      </div>

      {/* ── Dashboard Grid View (Screen Only — 3 Tahun) ── */}
      {mode === "3-tahun" && (
      <div className="table-container no-print">
        <table className="data-table">
          <thead>
            <tr>
              <th className="label-md" style={{ width: 40 }}>No</th>
              <th className="label-md">Mata Pelajaran</th>
              <th className="label-md" style={{ textAlign: "center" }}>S1</th>
              <th className="label-md" style={{ textAlign: "center" }}>S2</th>
              <th className="label-md" style={{ textAlign: "center" }}>S3</th>
              <th className="label-md" style={{ textAlign: "center" }}>S4</th>
              <th className="label-md" style={{ textAlign: "center" }}>S5</th>
              <th className="label-md" style={{ textAlign: "center" }}>S6</th>
              <th className="label-md" style={{ textAlign: "right" }}>AVG</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, catIdx) => (
              <React.Fragment key={catIdx}>
                <tr style={{ background: "var(--surface-container-low)" }}>
                  <td colSpan={9} style={{ fontWeight: 600, fontSize: 12, padding: "8px 16px" }}>{cat.nama}</td>
                </tr>
                {cat.subjects.map((sub) => (
                  <tr key={sub.no}>
                    <td className="table-data" style={{ color: "var(--on-surface-variant)" }}>{sub.no}</td>
                    <td className="table-data" style={{ fontWeight: 500 }}>{sub.nama}</td>
                    {sub.scores.map((score, sIdx) => (
                      <td key={sIdx} className="table-data" style={{ 
                        textAlign: "center", 
                        color: score ? "inherit" : "transparent",
                        background: score ? "transparent" : "#A6A6A6"
                      }}>
                        {score ?? "—"}
                      </td>
                    ))}
                    <td className="table-data" style={{ textAlign: "right", fontWeight: 700, color: "var(--primary)" }}>
                      {sub.average.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      )}

      {/* ── Transkrip Nilai Screen View ── */}
      {mode === "pendamping" && (
      <div className="table-container no-print">
        <table className="data-table">
          <thead>
            <tr>
              <th className="label-md" style={{ width: 40 }}>No</th>
              <th className="label-md">Mata Pelajaran</th>
              <th className="label-md" style={{ textAlign: "center" }}>Nilai</th>
            </tr>
          </thead>
          <tbody>
            {pendampingCategories.map((cat, catIdx) => (
              <React.Fragment key={catIdx}>
                <tr style={{ background: "var(--surface-container-low)" }}>
                  <td colSpan={3} style={{ fontWeight: 600, fontSize: 12, padding: "8px 16px" }}>{cat.nama}</td>
                </tr>
                {cat.subjects.map((sub) => (
                  <tr key={sub.no}>
                    <td className="table-data" style={{ color: "var(--on-surface-variant)" }}>{sub.no}</td>
                    <td className="table-data" style={{ fontWeight: 500 }}>{sub.nama}</td>
                    <td className="table-data" style={{ textAlign: "center", fontWeight: 700, color: "var(--primary)" }}>
                      {sub.nilai.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: "var(--surface-container-low)" }}>
              <td colSpan={2} style={{ fontWeight: 600, fontSize: 12, padding: "8px 16px" }}>Rata-rata</td>
              <td className="table-data" style={{ textAlign: "center", fontWeight: 700, color: "var(--primary)" }}>
                {(() => {
                  const all = pendampingCategories.flatMap(c => c.subjects);
                  const total = all.reduce((a, b) => a + b.nilai, 0);
                  return all.length > 0 ? (total / all.length).toFixed(2) : "0.00";
                })()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      )}

      {/* ── Official Print Layout (Excel-style — 3 Tahun) ── */}
      {mode === "3-tahun" && (
      <div ref={mode === "3-tahun" ? printRef : undefined} className="print-only" style={{ display: "none" }}>
        <h2 style={{ textAlign: "center", fontSize: "12pt", fontWeight: "bold", marginBottom: 12 }}>
          TRANSKRIP NILAI <br /> SEKOLAH MENENGAH KEJURUAN PROGRAM 3 TAHUN
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 12, fontSize: "10.5pt" }}>
          <div style={{ display: "flex" }}><span style={{ width: 180 }}>Nama</span>: <span style={{ fontWeight: "bold", marginLeft: 8 }}>{student.nama.toUpperCase()}</span></div>
          <div style={{ display: "flex" }}><span style={{ width: 180 }}>Tempat / Tanggal Lahir</span>: <span style={{ marginLeft: 8 }}>{student.tempatLahir}, {student.tanggalLahir}</span></div>
          <div style={{ display: "flex" }}><span style={{ width: 180 }}>NIS / NISN</span>: <span style={{ marginLeft: 8 }}>{student.nis} / {student.nisn}</span></div>
          <div style={{ display: "flex" }}><span style={{ width: 180 }}>Nama Sekolah</span>: <span style={{ marginLeft: 8 }}>SMK NEGERI 1 SUMATERA BARAT</span></div>
          <div style={{ display: "flex" }}><span style={{ width: 180 }}>Konsentrasi Keahlian</span>: <span style={{ marginLeft: 8 }}>{student.kompetensi}</span></div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid black", fontSize: "11pt", fontFamily: "'Times New Roman', Times, serif" }}>
          <thead>
            <tr style={{ backgroundColor: "#ffffff", WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
              <th rowSpan={2} style={printThStyle}>No</th>
              <th rowSpan={2} style={{ ...printThStyle, textAlign: "left", paddingLeft: "8px" }}>MATA PELAJARAN</th>
              <th colSpan={2} style={printThStyle}>KELAS X</th>
              <th colSpan={2} style={printThStyle}>KELAS XI</th>
              <th colSpan={2} style={printThStyle}>KELAS XII</th>
              <th rowSpan={2} style={printThStyle}>RATA-RATA<br/>NILAI</th>
            </tr>
            <tr style={{ backgroundColor: "#ffffff", WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
              <th style={{ ...printThStyle, whiteSpace: "nowrap", paddingLeft: "2px", paddingRight: "2px" }}>SMT 1</th>
              <th style={{ ...printThStyle, whiteSpace: "nowrap", paddingLeft: "2px", paddingRight: "2px" }}>SMT 2</th>
              <th style={{ ...printThStyle, whiteSpace: "nowrap", paddingLeft: "2px", paddingRight: "2px" }}>SMT 3</th>
              <th style={{ ...printThStyle, whiteSpace: "nowrap", paddingLeft: "2px", paddingRight: "2px" }}>SMT 4</th>
              <th style={{ ...printThStyle, whiteSpace: "nowrap", paddingLeft: "2px", paddingRight: "2px" }}>SMT 5</th>
              <th style={{ ...printThStyle, whiteSpace: "nowrap", paddingLeft: "2px", paddingRight: "2px" }}>SMT 6</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, catIdx) => (
              <React.Fragment key={catIdx}>
                <tr style={{ backgroundColor: "#D9D9D9", WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
                  <td colSpan={9} style={{ ...printTdStyle, textAlign: "left", fontWeight: "bold", paddingLeft: "8px" }}>
                    {cat.nama}
                  </td>
                </tr>
                {cat.subjects.map((sub) => (
                  <tr key={sub.no} style={{ height: "17px" }}>
                    <td style={printTdStyle}>{sub.no}</td>
                    <td style={{ ...printTdStyle, textAlign: "left", paddingLeft: "8px" }}>{sub.nama}</td>
                    {sub.scores.map((score, sIdx) => (
                      <td key={sIdx} style={{ 
                        ...printTdStyle, 
                        backgroundColor: score ? "transparent" : "#A6A6A6" 
                      }}>{score ?? ""}</td>
                    ))}
                    <td style={{ ...printTdStyle, fontWeight: "bold" }}>{sub.average.toFixed(2)}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ fontWeight: "bold", backgroundColor: "#ffffff", WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
              <td colSpan={2} style={{ ...printTdStyle, textAlign: "center" }}>RATA-RATA</td>
              {semesterAverages.map((avg, i) => (
                <td key={i} style={printTdStyle}>{avg.toFixed(2)}</td>
              ))}
              <td style={{ ...printTdStyle, backgroundColor: "#ffffff" }}></td>
            </tr>
          </tfoot>
        </table>

        <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end", textAlign: "center", fontSize: "10.5pt" }}>
          <div>
            <p style={{ marginBottom: 45 }}>Padang, 14 Juni 2026<br />Kepala Sekolah,</p>
            <p style={{ fontWeight: "bold", textDecoration: "underline", margin: 0 }}>Zulkifli, S.Pd</p>
            <p style={{ margin: 0 }}>NIP. 19670430 199802 1 001</p>
          </div>
        </div>
      </div>
      )}

      {/* ── Transkrip Nilai Print Layout ── */}
      {mode === "pendamping" && (
      <div ref={mode === "pendamping" ? printRef : undefined} className="print-only" style={{ display: "none" }}>
        <h2 style={{ textAlign: "center", fontSize: "12pt", fontWeight: "bold", textDecoration: "underline", marginBottom: 4 }}>
          TRANSKRIP NILAI
        </h2>
        <p style={{ textAlign: "center", fontSize: "10.5pt", marginTop: 0, marginBottom: 12 }}>
          Nomor: 421.2/251/TP.3/SMK-SB/{new Date().getFullYear()}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 12, fontSize: "10.5pt" }}>
          <div style={{ display: "flex" }}><span style={{ width: 280 }}>Satuan Pendidikan</span>: <span style={{ marginLeft: 8 }}>SMK Negeri 1 Sumatera Barat</span></div>
          <div style={{ display: "flex" }}><span style={{ width: 280 }}>Nomor Pokok Sekolah Nasional</span>: <span style={{ marginLeft: 8 }}>10310780</span></div>
          <div style={{ display: "flex" }}><span style={{ width: 280 }}>Nama Lengkap</span>: <span style={{ fontWeight: "bold", marginLeft: 8 }}>{student.nama.toUpperCase()}</span></div>
          <div style={{ display: "flex" }}><span style={{ width: 280 }}>Tempat, Tanggal Lahir</span>: <span style={{ marginLeft: 8 }}>{student.tempatLahir}, {student.tanggalLahir}</span></div>
          <div style={{ display: "flex" }}><span style={{ width: 280 }}>Nomor Induk Siswa Nasional</span>: <span style={{ marginLeft: 8 }}>{student.nisn}</span></div>
          <div style={{ display: "flex" }}><span style={{ width: 280 }}>Nomor Ijazah</span>: <span style={{ marginLeft: 8 }}>{student.nomorIjazah}</span></div>
          <div style={{ display: "flex" }}><span style={{ width: 280 }}>Tanggal Kelulusan</span>: <span style={{ marginLeft: 8 }}>{student.tanggalKelulusan}</span></div>
          <div style={{ display: "flex" }}><span style={{ width: 280 }}>Program Keahlian</span>: <span style={{ marginLeft: 8 }}>Teknik Mesin</span></div>
          <div style={{ display: "flex" }}><span style={{ width: 280 }}>Konsentrasi Keahlian</span>: <span style={{ marginLeft: 8 }}>{student.kompetensi}</span></div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid black", fontSize: "11pt", fontFamily: "'Times New Roman', Times, serif" }}>
          <thead>
            <tr style={{ backgroundColor: "#ffffff", WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
              <th rowSpan={2} style={printThStyle}>No</th>
              <th rowSpan={2} style={{ ...printThStyle, textAlign: "left", paddingLeft: "8px" }}>MATA PELAJARAN</th>
              <th rowSpan={2} style={printThStyle}>NILAI</th>
            </tr>
          </thead>
          <tbody>
            {pendampingCategories.map((cat, catIdx) => (
              <React.Fragment key={catIdx}>
                <tr style={{ backgroundColor: "#ffffff", WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
                  <td colSpan={3} style={{ ...printTdStyle, textAlign: "left", fontWeight: "bold", paddingLeft: "8px" }}>
                    {cat.nama}
                  </td>
                </tr>
                {cat.subjects.map((sub) => (
                  <tr key={sub.no} style={{ height: "17px" }}>
                    <td style={printTdStyle}>{sub.no}</td>
                    <td style={{ ...printTdStyle, textAlign: "left", paddingLeft: "8px" }}>{sub.nama}</td>
                    <td style={{ ...printTdStyle, fontWeight: "bold" }}>{sub.nilai.toFixed(2)}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
          <tfoot>
            {(() => {
              const allSubjects = pendampingCategories.flatMap(c => c.subjects);
              const total = allSubjects.reduce((a, b) => a + b.nilai, 0);
              const avg = allSubjects.length > 0 ? total / allSubjects.length : 0;
              return (
                <tr style={{ backgroundColor: "#ffffff", WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
                  <td colSpan={2} style={{ ...printTdStyle, textAlign: "left", fontWeight: "bold", paddingLeft: "8px" }}>
                    Rata-rata
                  </td>
                  <td style={{ ...printTdStyle, fontWeight: "bold" }}>{avg.toFixed(2)}</td>
                </tr>
              );
            })()}
          </tfoot>
        </table>

        <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end", textAlign: "center", fontSize: "10.5pt" }}>
          <div>
            <p style={{ marginBottom: 45 }}>Padang, 14 Juni 2026<br />Kepala Sekolah,</p>
            <p style={{ fontWeight: "bold", textDecoration: "underline", margin: 0 }}>Zulkifli, S.Pd</p>
            <p style={{ margin: 0 }}>NIP. 19670430 199802 1 001</p>
          </div>
        </div>
      </div>
      )}

      <style jsx>{`
        @media print {
          html, body { 
            overflow: visible !important; 
            height: auto !important;
          }
          .list-page { 
            overflow: visible !important; 
          }
          .no-print { display: none !important; }
          .print-only { 
            display: block !important; 
            font-family: 'Times New Roman', Times, serif !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            padding: 0.25cm !important;
          }
          body { background: #fff !important; }
          @page { 
            size: A4 portrait; 
            margin: 0.8cm 1cm;
          }
          .print-only table, 
          .print-only tr, 
          .print-only td, 
          .print-only th {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
}

const printThStyle: React.CSSProperties = {
  border: "1px solid black",
  padding: "4px 8px",
  textAlign: "center",
  fontWeight: "bold",
  verticalAlign: "middle"
};

const printTdStyle: React.CSSProperties = {
  border: "1px solid black",
  padding: "4px 8px",
  textAlign: "center",
  verticalAlign: "middle"
};
