import { Plus, Pencil, Printer } from "lucide-react";
import Link from "next/link";
import { getStudents } from "@/lib/data";

export default function Dashboard() {
  const allStudents = getStudents();
  // Ambil 5 siswa terakhir (yang baru ditambahkan)
  const recentStudents = [...allStudents].reverse().slice(0, 5);

  return (
    <div className="dashboard-page" style={{ padding: "calc(var(--spacing-base) * 6)" }}>
      <header className="page-header" style={{ marginBottom: "var(--margin-desktop)" }}>
        <h1 className="headline-sm" style={{ margin: 0 }}>Dashboard</h1>
        <p className="body-sm" style={{ color: "var(--on-surface-variant)", marginTop: 4 }}>
          Selamat datang di Sistem Informasi Administrasi Akademik Siswa
        </p>
      </header>

      <section aria-labelledby="stats-heading" className="stats-section" style={{ marginBottom: "var(--margin-desktop)" }}>
        <h2 id="stats-heading" className="sr-only">Ringkasan</h2>
        <div className="stats-grid">
          <StatCard label="Total Siswa" value={String(allStudents.length)} />
          <StatCard label="Total Kelas" value={String(new Set(allStudents.map(s => s.diterimaDiKelas)).size)} />
          <StatCard label="Siswa Aktif" value={String(allStudents.filter(s => s.status === "active").length)} />
        </div>
      </section>

      <section aria-labelledby="actions-heading" className="actions-section" style={{ marginBottom: "var(--margin-desktop)" }}>
        <h2 id="actions-heading" className="headline-sm" style={{ fontSize: "var(--body-lg)", fontWeight: 600, marginBottom: "var(--gutter)" }}>
          Aksi Cepat
        </h2>
        <div className="actions-grid">
          <Link href="/siswa/tambah" className="quick-action-btn" style={{ textDecoration: "none", color: "inherit" }}>
            <QuickAction icon={Plus} label="Tambah Siswa" />
          </Link>
          <button className="quick-action-btn" type="button">
            <QuickAction icon={Pencil} label="Input Nilai" />
          </button>
          <button className="quick-action-btn" type="button">
            <QuickAction icon={Printer} label="Cetak Laporan" />
          </button>
        </div>
      </section>

      <section aria-labelledby="recent-heading">
        <h2 id="recent-heading" className="headline-sm" style={{ fontSize: "var(--body-lg)", fontWeight: 600, marginBottom: "var(--gutter)" }}>
          Siswa Terbaru
        </h2>
        {recentStudents.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="label-md" scope="col">NIS</th>
                  <th className="label-md" scope="col">Nama Lengkap</th>
                  <th className="label-md" scope="col">Kelompok Keahlian</th>
                  <th className="label-md" scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentStudents.map((s) => (
                  <tr key={s.nis}>
                    <td className="table-data">{s.nis}</td>
                    <td className="table-data" style={{ fontWeight: 500 }}>
                      <Link href={`/siswa/${s.nis}`} className="table-link">{s.nama}</Link>
                    </td>
                    <td className="table-data">{s.kompetensi}</td>
                    <td className="table-data">
                      <span className={`status-badge status-badge--${s.status}`}>
                        {s.status === "active" ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <p className="body-md" style={{ fontWeight: 500 }}>Belum ada data siswa</p>
            <p className="body-sm" style={{ color: "var(--on-surface-variant)" }}>
              Tambahkan siswa baru untuk memulai.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-card">
      <span className="label-md stat-card__label">{label}</span>
      <span className="display-lg stat-card__value">{value}</span>
    </div>
  );
}

function QuickAction({ icon: Icon, label }: { icon: React.ComponentType<{ size?: number }>; label: string }) {
  return (
    <>
      <span className="quick-action-btn__icon" aria-hidden="true">
        <Icon size={20} />
      </span>
      <span className="body-md" style={{ fontWeight: 600 }}>{label}</span>
    </>
  );
}
