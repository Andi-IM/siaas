"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Search, Eye, Pencil, Trash2, X } from "lucide-react";
import Link from "next/link";
import type { Student } from "@/lib/types";
import { getStudents, getUniqueClasses, deleteStudent } from "@/lib/data";

const PER_PAGE = 8;

export default function StudentListPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterKelas, setFilterKelas] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStudents(getStudents());
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (deleteTarget && dialogRef.current) {
      dialogRef.current.showModal();
    }
  }, [deleteTarget]);

  const classes = getUniqueClasses();

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      s.nama.toLowerCase().includes(q) ||
      s.nis.toLowerCase().includes(q) ||
      s.nisn.toLowerCase().includes(q);
    const matchKelas = !filterKelas || s.diterimaDiKelas === filterKelas;
    return matchSearch && matchKelas;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  function handleDelete() {
    if (!deleteTarget) return;
    deleteStudent(deleteTarget.nis);
    setStudents(getStudents());
    setDeleteTarget(null);
    setToast(`Siswa ${deleteTarget.nama} berhasil dihapus.`);
    dialogRef.current?.close();
    setTimeout(() => setToast(null), 3000);
  }

  function cancelDelete() {
    setDeleteTarget(null);
    dialogRef.current?.close();
  }

  return (
    <div className="list-page">
      {/* ── Action Bar ── */}
      <div className="list-action-bar">
        <div className="list-action-bar__left">
          <h1 className="headline-sm" style={{ margin: 0 }}>Manajemen Peserta Didik</h1>
          <span className="body-sm list-count">
            {loading ? "—" : `${filtered.length} siswa`}
          </span>
        </div>
        <div className="list-action-bar__right">
          <div className="search-field">
            <Search size={16} className="search-field__icon" aria-hidden="true" />
            <label htmlFor="search-siswa" className="sr-only">Cari NIS atau nama</label>
            <input
              id="search-siswa"
              ref={searchRef}
              type="search"
              placeholder="Cari NIS atau nama..."
              className="search-field__input"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
            {search && (
              <button
                className="search-field__clear"
                onClick={() => { setSearch(""); setPage(1); searchRef.current?.focus(); }}
                aria-label="Hapus pencarian"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <select
            className="filter-select"
            value={filterKelas}
            onChange={(e) => { setFilterKelas(e.target.value); setPage(1); }}
            aria-label="Filter kelas"
          >
            <option value="">Semua Kelas</option>
            {classes.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <Link href="/siswa/tambah" className="btn btn--primary" style={{ display: "inline-flex", alignItems: "center", gap: "calc(var(--spacing-base) * 2)", textDecoration: "none" }}>
            <Plus size={16} aria-hidden="true" />
            Tambah Siswa
          </Link>
        </div>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th className="label-md" scope="col">NIS</th>
                <th className="label-md" scope="col">Nama Lengkap</th>
                <th className="label-md" scope="col">Kelas</th>
                <th className="label-md" scope="col">Kompetensi Keahlian</th>
                <th className="label-md" scope="col">Status</th>
                <th className="label-md" scope="col">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j}><div className="skeleton" style={{ height: 16, width: j === 5 ? 80 : j === 1 ? 140 : 80 }} /></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <p className="body-md" style={{ fontWeight: 500 }}>
            {search || filterKelas
              ? "Tidak ditemukan siswa dengan kriteria tersebut."
              : "Belum ada data siswa."}
          </p>
          <p className="body-sm" style={{ color: "var(--on-surface-variant)" }}>
            {search || filterKelas
              ? "Coba ubah kata kunci atau filter kelas."
              : "Tambahkan siswa baru untuk memulai."}
          </p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="label-md" scope="col">No.</th>
                  <th className="label-md" scope="col">Nama Lengkap</th>
                  <th className="label-md" scope="col">NIS</th>
                  <th className="label-md" scope="col">NISN</th>
                  <th className="label-md" scope="col">Kelas</th>
                  <th className="label-md" scope="col">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((s, index) => (
                  <tr key={s.nis}>
                    <td className="table-data">{(safePage - 1) * PER_PAGE + index + 1}</td>
                    <td className="table-data" style={{ fontWeight: 500 }}>
                      <Link href={`/siswa/${s.nis}`} className="table-link">{s.nama}</Link>
                    </td>
                    <td className="table-data">{s.nis}</td>
                    <td className="table-data">{s.nisn}</td>
                    <td className="table-data">{s.diterimaDiKelas}</td>
                    <td className="table-data">
                      <div className="action-cell">
                        <Link
                          href={`/siswa/${s.nis}`}
                          className="icon-btn"
                          aria-label={`Lihat detail ${s.nama}`}
                        >
                          <Eye size={16} />
                        </Link>
                        <Link
                          href={`/siswa/${s.nis}/edit`}
                          className="icon-btn"
                          aria-label={`Edit ${s.nama}`}
                        >
                          <Pencil size={16} />
                        </Link>
                        <button
                          className="icon-btn icon-btn--danger"
                          aria-label={`Hapus ${s.nama}`}
                          onClick={() => setDeleteTarget(s)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <nav className="pagination" aria-label="Halaman">
              <button
                className="pagination__btn"
                disabled={safePage <= 1}
                onClick={() => setPage(safePage - 1)}
              >
                Sebelumnya
              </button>
              <div className="pagination__pages">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`pagination__page${p === safePage ? " pagination__page--active" : ""}`}
                    onClick={() => setPage(p)}
                    aria-current={p === safePage ? "page" : undefined}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                className="pagination__btn"
                disabled={safePage >= totalPages}
                onClick={() => setPage(safePage + 1)}
              >
                Selanjutnya
              </button>
            </nav>
          )}
        </>
      )}

      {/* ── Delete Confirmation Dialog ── */}
      <dialog ref={dialogRef} className="confirm-dialog" onClose={cancelDelete}>
        {deleteTarget && (
          <div className="confirm-dialog__inner">
            <h2 className="headline-sm" style={{ marginBottom: "var(--gutter)" }}>Hapus Siswa</h2>
            <p className="body-md" style={{ marginBottom: "calc(var(--spacing-base) * 6)" }}>
              Hapus siswa <strong>{deleteTarget.nama}</strong>? Data yang sudah dihapus tidak dapat dikembalikan.
            </p>
            <div className="confirm-dialog__actions">
              <button className="btn btn--secondary" onClick={cancelDelete}>Batal</button>
              <button className="btn btn--danger" onClick={handleDelete}>Hapus</button>
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
  );
}
