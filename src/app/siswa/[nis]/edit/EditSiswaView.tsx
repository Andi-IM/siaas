"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getStudentByNis, updateStudent } from "@/lib/data";
import type { Student } from "@/lib/types";

export default function EditSiswaView({ nis }: { nis: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState<Student>({
    nis: "",
    nisn: "",
    nama: "",
    tempatLahir: "",
    tanggalLahir: "",
    jenisKelamin: "L",
    agama: "",
    alamat: "",
    telepon: "",
    sekolahAsal: "",
    diterimaDiKelas: "",
    diterimaPadaTanggal: "",
    kompetensi: "",
    nomorIjazah: "",
    tanggalKelulusan: "",
    status: "active",
    namaAyah: "",
    pekerjaanAyah: "",
    namaIbu: "",
    pekerjaanIbu: "",
    alamatOrangTua: "",
    namaWali: "",
    alamatWali: "",
    teleponWali: "",
    pekerjaanWali: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const timer = setTimeout(() => {
      const student = getStudentByNis(nis);
      if (student) {
        setForm({ ...student });
      } else {
        setNotFound(true);
      }
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [nis]);

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.nis.trim()) errs.nis = "Nomor Induk (NIS) wajib diisi.";
    if (!form.nisn.trim()) errs.nisn = "NISN wajib diisi.";
    if (!form.nama.trim()) errs.nama = "Nama Lengkap wajib diisi.";
    if (!form.diterimaDiKelas.trim()) errs.diterimaDiKelas = "Kelas wajib diisi.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    updateStudent(nis, { ...form });
    setSubmitted(true);
    setTimeout(() => router.push(`/siswa/${nis}`), 1200);
  }

  function setField<K extends keyof Student>(key: K, value: Student[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => { const { [key]: _, ...rest } = prev; return rest; });
  }

  if (loading) {
    return (
      <div className="form-page">
        <div className="form-page__inner">
          <div className="skeleton" style={{ height: 24, width: 200, marginBottom: 24 }} />
          <div className="skeleton" style={{ height: 16, width: "100%", marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 16, width: "100%", marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 16, width: "60%" }} />
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="form-page">
        <div className="form-page__inner">
          <div className="empty-state" style={{ padding: "calc(var(--spacing-base) * 16) calc(var(--spacing-base) * 4)" }}>
            <p className="headline-sm" style={{ marginBottom: "var(--gutter)" }}>Siswa tidak ditemukan</p>
            <p className="body-md" style={{ color: "var(--on-surface-variant)" }}>Data siswa tidak dapat diedit karena tidak ditemukan.</p>
            <Link href="/siswa" className="btn btn--primary" style={{ marginTop: "var(--gutter)" }}>Kembali ke Daftar Siswa</Link>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="form-page">
        <div className="form-page__inner">
          <div className="empty-state" style={{ padding: "calc(var(--spacing-base) * 16) calc(var(--spacing-base) * 4)" }}>
            <p className="headline-sm" style={{ marginBottom: "var(--gutter)" }}>Data siswa berhasil diperbarui</p>
            <p className="body-md" style={{ color: "var(--on-surface-variant)" }}>Mengalihkan ke detail siswa...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page">
      <div className="form-page__inner">
        <div className="form-page__header">
          <Link href={`/siswa/${nis}`} className="back-link" aria-label="Kembali ke detail siswa">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="headline-sm" style={{ margin: 0 }}>Edit Siswa</h1>
            <p className="body-sm" style={{ color: "var(--on-surface-variant)", marginTop: 4 }}>
              {form.nama} — {form.nis}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="student-form">
          {/* Bagian 1: Data Pribadi */}
          <section className="form-section">
            <h2 className="label-md" style={{ color: "var(--primary)", marginBottom: "var(--gutter)", borderBottom: "1px solid var(--outline-variant)", paddingBottom: 8 }}>DATA PRIBADI</h2>
            <div className="form-grid">
              <FormField label="Nama Peserta Didik (Lengkap)" error={errors.nama} required>
                <input
                  type="text"
                  className={`form-input${errors.nama ? " form-input--error" : ""}`}
                  value={form.nama}
                  onChange={(e) => setField("nama", e.target.value)}
                />
              </FormField>

              <FormField label="Nomor Induk (NIS)" error={errors.nis} required>
                <input
                  type="text"
                  className={`form-input${errors.nis ? " form-input--error" : ""}`}
                  value={form.nis}
                  onChange={(e) => setField("nis", e.target.value)}
                />
              </FormField>

              <FormField label="NISN" error={errors.nisn} required>
                <input
                  type="text"
                  className={`form-input${errors.nisn ? " form-input--error" : ""}`}
                  value={form.nisn}
                  onChange={(e) => setField("nisn", e.target.value)}
                />
              </FormField>

              <FormField label="Tempat Lahir">
                <input
                  type="text"
                  className="form-input"
                  value={form.tempatLahir}
                  onChange={(e) => setField("tempatLahir", e.target.value)}
                />
              </FormField>

              <FormField label="Tanggal Lahir">
                <input
                  type="date"
                  className="form-input"
                  value={form.tanggalLahir}
                  onChange={(e) => setField("tanggalLahir", e.target.value)}
                />
              </FormField>

              <FormField label="Jenis Kelamin">
                <select
                  className="form-input"
                  value={form.jenisKelamin}
                  onChange={(e) => setField("jenisKelamin", e.target.value as "L" | "P")}
                >
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </FormField>

              <FormField label="Agama">
                <input
                  type="text"
                  className="form-input"
                  value={form.agama}
                  onChange={(e) => setField("agama", e.target.value)}
                />
              </FormField>

              <FormField label="Nomor Telepon Rumah">
                <input
                  type="tel"
                  className="form-input"
                  value={form.telepon}
                  onChange={(e) => setField("telepon", e.target.value)}
                />
              </FormField>

              <FormField label="Alamat Peserta Didik">
                <textarea
                  className="form-input form-input--textarea"
                  value={form.alamat}
                  onChange={(e) => setField("alamat", e.target.value)}
                  rows={2}
                />
              </FormField>
            </div>
          </section>

          {/* Bagian 2: Data Akademik */}
          <section className="form-section" style={{ marginTop: "var(--margin-desktop)" }}>
            <h2 className="label-md" style={{ color: "var(--primary)", marginBottom: "var(--gutter)", borderBottom: "1px solid var(--outline-variant)", paddingBottom: 8 }}>DATA AKADEMIK</h2>
            <div className="form-grid">
              <FormField label="Sekolah Asal">
                <input
                  type="text"
                  className="form-input"
                  value={form.sekolahAsal}
                  onChange={(e) => setField("sekolahAsal", e.target.value)}
                />
              </FormField>

              <FormField label="Diterima di Kelas" error={errors.diterimaDiKelas} required>
                <input
                  type="text"
                  className={`form-input${errors.diterimaDiKelas ? " form-input--error" : ""}`}
                  value={form.diterimaDiKelas}
                  onChange={(e) => setField("diterimaDiKelas", e.target.value)}
                />
              </FormField>

              <FormField label="Diterima pada Tanggal">
                <input
                  type="date"
                  className="form-input"
                  value={form.diterimaPadaTanggal}
                  onChange={(e) => setField("diterimaPadaTanggal", e.target.value)}
                />
              </FormField>

              <FormField label="Kompetensi Keahlian">
                <input
                  type="text"
                  className="form-input"
                  value={form.kompetensi}
                  onChange={(e) => setField("kompetensi", e.target.value)}
                />
              </FormField>

              <FormField label="Nomor Ijazah (Alumni)">
                <input
                  type="text"
                  className="form-input"
                  value={form.nomorIjazah}
                  onChange={(e) => setField("nomorIjazah", e.target.value)}
                  placeholder="Diisi jika sudah lulus"
                />
              </FormField>

              <FormField label="Tanggal Kelulusan (Alumni)">
                <input
                  type="date"
                  className="form-input"
                  value={form.tanggalKelulusan}
                  onChange={(e) => setField("tanggalKelulusan", e.target.value)}
                />
              </FormField>

              <FormField label="Status">
                <select
                  className="form-input"
                  value={form.status}
                  onChange={(e) => setField("status", e.target.value as "active" | "inactive")}
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
              </FormField>
            </div>
          </section>

          {/* Bagian 3: Data Orang Tua */}
          <section className="form-section" style={{ marginTop: "var(--margin-desktop)" }}>
            <h2 className="label-md" style={{ color: "var(--primary)", marginBottom: "var(--gutter)", borderBottom: "1px solid var(--outline-variant)", paddingBottom: 8 }}>DATA ORANG TUA</h2>
            <div className="form-grid">
              <FormField label="Nama Ayah">
                <input
                  type="text"
                  className="form-input"
                  value={form.namaAyah}
                  onChange={(e) => setField("namaAyah", e.target.value)}
                />
              </FormField>

              <FormField label="Pekerjaan Ayah">
                <input
                  type="text"
                  className="form-input"
                  value={form.pekerjaanAyah}
                  onChange={(e) => setField("pekerjaanAyah", e.target.value)}
                />
              </FormField>

              <FormField label="Nama Ibu">
                <input
                  type="text"
                  className="form-input"
                  value={form.namaIbu}
                  onChange={(e) => setField("namaIbu", e.target.value)}
                />
              </FormField>

              <FormField label="Pekerjaan Ibu">
                <input
                  type="text"
                  className="form-input"
                  value={form.pekerjaanIbu}
                  onChange={(e) => setField("pekerjaanIbu", e.target.value)}
                />
              </FormField>

              <FormField label="Alamat Orang Tua">
                <textarea
                  className="form-input form-input--textarea"
                  value={form.alamatOrangTua}
                  onChange={(e) => setField("alamatOrangTua", e.target.value)}
                  rows={2}
                />
              </FormField>
            </div>
          </section>

          {/* Bagian 4: Data Wali */}
          <section className="form-section" style={{ marginTop: "var(--margin-desktop)" }}>
            <h2 className="label-md" style={{ color: "var(--primary)", marginBottom: "var(--gutter)", borderBottom: "1px solid var(--outline-variant)", paddingBottom: 8 }}>DATA WALI (OPSIONAL)</h2>
            <div className="form-grid">
              <FormField label="Nama Wali Peserta Didik">
                <input
                  type="text"
                  className="form-input"
                  value={form.namaWali}
                  onChange={(e) => setField("namaWali", e.target.value)}
                />
              </FormField>

              <FormField label="Pekerjaan Wali Peserta Didik">
                <input
                  type="text"
                  className="form-input"
                  value={form.pekerjaanWali}
                  onChange={(e) => setField("pekerjaanWali", e.target.value)}
                />
              </FormField>

              <FormField label="Nomor Telepon Rumah Wali">
                <input
                  type="tel"
                  className="form-input"
                  value={form.teleponWali}
                  onChange={(e) => setField("teleponWali", e.target.value)}
                />
              </FormField>

              <FormField label="Alamat Wali Peserta Didik">
                <textarea
                  className="form-input form-input--textarea"
                  value={form.alamatWali}
                  onChange={(e) => setField("alamatWali", e.target.value)}
                  rows={2}
                />
              </FormField>
            </div>
          </section>

          <div className="form-actions">
            <Link href={`/siswa/${nis}`} className="btn btn--secondary">Batal</Link>
            <button type="submit" className="btn btn--primary">Simpan Perubahan</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({ label, error, children, required }: { label: string; error?: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="form-field">
      <label className="form-field__label">
        {label}
        {required && <span aria-hidden="true" style={{ color: "var(--error)", marginLeft: 2 }}>*</span>}
      </label>
      {children}
      {error && <p className="form-field__error" role="alert">{error}</p>}
    </div>
  );
}
