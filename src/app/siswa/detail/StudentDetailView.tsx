"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import type { Student } from "@/lib/types";
import { getStudentByNis, deleteStudent } from "@/lib/data";

export default function StudentDetailView({ nis }: { nis: string }) {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleted, setDeleted] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadStudent() {
      try {
        const found = await getStudentByNis(nis);
        if (active) {
          setStudent(found ?? null);
          setLoading(false);
        }
      } catch (e) {
        console.error("Failed to load student:", e);
        if (active) setLoading(false);
      }
    }
    loadStudent();
    return () => { active = false; };
  }, [nis]);

  async function handleDelete() {
    if (!student) return;
    try {
      await deleteStudent(student.nis);
      setDeleted(true);
      setTimeout(() => router.push("/siswa"), 1200);
    } catch (e) {
      console.error("Failed to delete student:", e);
    }
  }

  if (loading) {
    return (
      <div className="form-page">
        <div className="form-page__inner">
          <div className="skeleton" style={{ height: 24, width: 200, marginBottom: 24 }} />
          <div className="skeleton" style={{ height: 16, width: "60%", marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 16, width: "40%", marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 16, width: "50%" }} />
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="form-page">
        <div className="form-page__inner">
          <div className="empty-state" style={{ padding: "calc(var(--spacing-base) * 16) calc(var(--spacing-base) * 4)" }}>
            <p className="headline-sm" style={{ marginBottom: "var(--gutter)" }}>Siswa tidak ditemukan</p>
            <p className="body-md" style={{ color: "var(--on-surface-variant)", marginBottom: "var(--gutter)" }}>
              Data siswa dengan NIS {nis} tidak ditemukan.
            </p>
            <Link href="/siswa" className="btn btn--primary">Kembali ke Daftar Siswa</Link>
          </div>
        </div>
      </div>
    );
  }

  if (deleted) {
    return (
      <div className="form-page">
        <div className="form-page__inner">
          <div className="empty-state" style={{ padding: "calc(var(--spacing-base) * 16) calc(var(--spacing-base) * 4)" }}>
            <p className="headline-sm" style={{ marginBottom: "var(--gutter)" }}>Siswa berhasil dihapus</p>
            <p className="body-md" style={{ color: "var(--on-surface-variant)" }}>Mengalihkan ke daftar siswa...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page">
      <div className="form-page__inner">
        <div className="form-page__header" style={{ borderBottom: "1px solid var(--outline-variant)", paddingBottom: 24, marginBottom: 32 }}>
          <Link href="/siswa" className="back-link" aria-label="Kembali ke daftar siswa">
            <ArrowLeft size={20} />
          </Link>
          <div style={{ flex: 1 }}>
            <h1 className="headline-sm" style={{ margin: 0 }}>{student.nama}</h1>
            <p className="body-sm" style={{ color: "var(--on-surface-variant)", marginTop: 4 }}>NIS/NISN: {student.nis} / {student.nisn}</p>
          </div>
          <div style={{ display: "flex", gap: "calc(var(--spacing-base) * 2)" }}>
            <Link href={`/siswa/edit?nis=${student.nis}`} className="btn btn--secondary" style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none" }}>
              <Pencil size={16} />
              Edit Data
            </Link>
            <button className="btn btn--danger" style={{ display: "inline-flex", alignItems: "center", gap: 6 }} onClick={() => setShowConfirm(true)}>
              <Trash2 size={16} />
              Hapus
            </button>
          </div>
        </div>

        <div className="detail-sections" style={{ display: "flex", flexDirection: "column", gap: 48 }}>
          {/* Bagian 1: Data Pribadi */}
          <section>
            <h2 className="label-md" style={{ color: "var(--primary)", marginBottom: 16 }}>DATA PRIBADI</h2>
            <div className="detail-grid">
              <DetailRow label="Nama Lengkap" value={student.nama} />
              <DetailRow label="Nomor Induk (NIS)" value={student.nis} />
              <DetailRow label="NISN" value={student.nisn} />
              <DetailRow label="Tempat Lahir" value={student.tempatLahir} />
              <DetailRow label="Tanggal Lahir" value={student.tanggalLahir} />
              <DetailRow label="Jenis Kelamin" value={student.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"} />
              <DetailRow label="Agama" value={student.agama} />
              <DetailRow label="Nomor Telepon Rumah" value={student.telepon} />
              <DetailRow label="Alamat Peserta Didik" value={student.alamat} />
            </div>
          </section>

          {/* Bagian 2: Data Akademik */}
          <section>
            <h2 className="label-md" style={{ color: "var(--primary)", marginBottom: 16 }}>DATA AKADEMIK</h2>
            <div className="detail-grid">
              <DetailRow label="Sekolah Asal" value={student.sekolahAsal} />
              <DetailRow label="Diterima di Kelas" value={student.diterimaDiKelas} />
              <DetailRow label="Diterima pada Tanggal" value={student.diterimaPadaTanggal} />
              <DetailRow label="Kompetensi Keahlian" value={student.kompetensi} />
              <DetailRow label="Nomor Ijazah (Alumni)" value={student.nomorIjazah} />
              <DetailRow label="Tanggal Kelulusan (Alumni)" value={student.tanggalKelulusan} />
              <DetailRow label="Status Siswa" value={student.status === "active" ? "Aktif" : "Nonaktif"} isStatus />
            </div>
          </section>

          {/* Bagian 3: Data Orang Tua */}
          <section>
            <h2 className="label-md" style={{ color: "var(--primary)", marginBottom: 16 }}>DATA ORANG TUA</h2>
            <div className="detail-grid">
              <DetailRow label="Nama Ayah" value={student.namaAyah} />
              <DetailRow label="Pekerjaan Ayah" value={student.pekerjaanAyah} />
              <DetailRow label="Nama Ibu" value={student.namaIbu} />
              <DetailRow label="Pekerjaan Ibu" value={student.pekerjaanIbu} />
              <DetailRow label="Alamat Orang Tua" value={student.alamatOrangTua || student.alamat} />
            </div>
          </section>

          {/* Bagian 4: Data Wali */}
          <section>
            <h2 className="label-md" style={{ color: "var(--primary)", marginBottom: 16 }}>DATA WALI</h2>
            <div className="detail-grid">
              <DetailRow label="Nama Wali" value={student.namaWali} />
              <DetailRow label="Pekerjaan Wali" value={student.pekerjaanWali} />
              <DetailRow label="Nomor Telepon Wali" value={student.teleponWali} />
              <DetailRow label="Alamat Wali" value={student.alamatWali} />
            </div>
          </section>
        </div>

        {/* ── Delete Confirmation ── */}
        {showConfirm && (
          <>
            <div className="modal-backdrop" onClick={() => setShowConfirm(false)} />
            <div className="confirm-dialog confirm-dialog--inline" role="dialog" aria-modal="true" aria-label="Hapus siswa">
              <h2 className="headline-sm" style={{ marginBottom: "var(--gutter)" }}>Hapus Siswa</h2>
              <p className="body-md" style={{ marginBottom: "calc(var(--spacing-base) * 6)" }}>
                Hapus siswa <strong>{student.nama}</strong>? Data yang sudah dihapus tidak dapat dikembalikan.
              </p>
              <div className="confirm-dialog__actions">
                <button className="btn btn--secondary" onClick={() => setShowConfirm(false)}>Batal</button>
                <button className="btn btn--danger" onClick={handleDelete}>Hapus</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function DetailRow({ label, value, isStatus }: { label: string; value?: string; isStatus?: boolean }) {
  if (isStatus) {
    return (
      <div className="detail-row">
        <span className="label-md detail-row__label">{label}</span>
        <span className={`status-badge status-badge--${value === "Aktif" ? "active" : "inactive"}`}>
          {value}
        </span>
      </div>
    );
  }

  return (
    <div className="detail-row">
      <span className="label-md detail-row__label">{label}</span>
      <span className="body-md" style={{ color: value ? "inherit" : "var(--on-surface-variant)", fontStyle: value ? "normal" : "italic" }}>
        {value || "Tidak ada data"}
      </span>
    </div>
  );
}
