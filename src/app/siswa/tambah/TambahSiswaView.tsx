"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { addStudent } from "@/lib/data";
import { Student } from "@/lib/types";

export default function TambahSiswaView() {
  const router = useRouter();

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
  const [submitted, setSubmitted] = useState(false);

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.nis.trim()) errs.nis = "Nomor Induk (NIS) wajib diisi.";
    if (!form.nisn.trim()) errs.nisn = "NISN wajib diisi.";
    if (!form.nama.trim()) errs.nama = "Nama Lengkap wajib diisi.";
    if (!form.diterimaDiKelas.trim()) errs.diterimaDiKelas = "Kelas wajib diisi.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    try {
      await addStudent({ ...form });
      setSubmitted(true);
      setTimeout(() => router.push("/siswa"), 1200);
    } catch (e) {
      console.error("Failed to add student:", e);
    }
  }

  function setField<K extends keyof Student>(key: K, value: Student[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => { const { [key]: _, ...rest } = prev; return rest; });
  }

  if (submitted) {
    return (
      <div className="form-page">
        <div className="form-page__inner">
          <div className="empty-state" style={{ padding: "calc(var(--spacing-base) * 16) calc(var(--spacing-base) * 4)" }}>
            <p className="headline-sm" style={{ marginBottom: "var(--gutter)" }}>Siswa berhasil ditambahkan</p>
            <p className="body-md" style={{ color: "var(--on-surface-variant)" }}>Mengalihkan ke daftar siswa...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page">
      <div className="form-page__inner">
        <div className="form-page__header">
          <Link href="/siswa" className="back-link" aria-label="Kembali ke daftar siswa">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="headline-sm" style={{ margin: 0 }}>Tambah Siswa</h1>
            <p className="body-sm" style={{ color: "var(--on-surface-variant)", marginTop: 4 }}>
              Masukkan data lengkap peserta didik baru
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
                  placeholder="Nama lengkap sesuai ijazah"
                />
              </FormField>

              <FormField label="Nomor Induk (NIS)" error={errors.nis} required>
                <input
                  type="text"
                  className={`form-input${errors.nis ? " form-input--error" : ""}`}
                  value={form.nis}
                  onChange={(e) => setField("nis", e.target.value)}
                  placeholder="Contoh: 24001"
                />
              </FormField>

              <FormField label="NISN" error={errors.nisn} required>
                <input
                  type="text"
                  className={`form-input${errors.nisn ? " form-input--error" : ""}`}
                  value={form.nisn}
                  onChange={(e) => setField("nisn", e.target.value)}
                  placeholder="Contoh: 0071234561"
                />
              </FormField>

              <FormField label="Tempat Lahir">
                <input
                  type="text"
                  className="form-input"
                  value={form.tempatLahir}
                  onChange={(e) => setField("tempatLahir", e.target.value)}
                  placeholder="Kota kelahiran"
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
                  placeholder="Agama"
                />
              </FormField>

              <FormField label="Nomor Telepon Rumah">
                <input
                  type="tel"
                  className="form-input"
                  value={form.telepon}
                  onChange={(e) => setField("telepon", e.target.value)}
                  placeholder="Contoh: 021-xxxxxx"
                />
              </FormField>

              <FormField label="Alamat Peserta Didik">
                <textarea
                  className="form-input form-input--textarea"
                  value={form.alamat}
                  onChange={(e) => setField("alamat", e.target.value)}
                  placeholder="Alamat lengkap tempat tinggal"
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
                  placeholder="Nama SMP/MTs asal"
                />
              </FormField>

              <FormField label="Diterima di Kelas" error={errors.diterimaDiKelas} required>
                <input
                  type="text"
                  className={`form-input${errors.diterimaDiKelas ? " form-input--error" : ""}`}
                  value={form.diterimaDiKelas}
                  onChange={(e) => setField("diterimaDiKelas", e.target.value)}
                  placeholder="Contoh: X TKJ 1"
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
                  placeholder="Contoh: Teknik Komputer dan Jaringan"
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
                  placeholder="Kosongkan jika sama dengan alamat siswa"
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
            <Link href="/siswa" className="btn btn--secondary">Batal</Link>
            <button type="submit" className="btn btn--primary">Simpan Siswa</button>
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
