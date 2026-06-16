"use client";

import React, { useState } from "react";
import { BugReportModal } from "@/components/BugReportModal";
import { Database, Bug, AlertTriangle, RefreshCw } from "lucide-react";

export default function PengaturanView() {
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleResetDatabase = async () => {
    setLoadingReset(true);
    setStatusMsg(null);
    try {
      if (typeof window !== "undefined" && (window as any).__TAURI_INTERNALS__) {
        const { invoke } = await import("@tauri-apps/api/core");
        await invoke("reset_database");
        setStatusMsg({
          type: "success",
          text: "Basis data berhasil direset dan dibuat ulang dari awal!"
        });
      } else {
        // Fallback for development browser
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setStatusMsg({
          type: "success",
          text: "[DEV MODE] Basis data disimulasikan berhasil direset."
        });
      }
      setResetConfirm(false);
    } catch (err: any) {
      console.error("Failed to reset database:", err);
      setStatusMsg({
        type: "error",
        text: `Gagal mereset basis data: ${err.message || err}`
      });
    } finally {
      setLoadingReset(false);
    }
  };

  return (
    <div className="container" style={{ padding: "var(--gutter)", maxWidth: "800px", margin: "0 auto" }}>
      <header style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 600, color: "var(--color-fg)" }}>Pengaturan Sistem</h1>
        <p style={{ color: "var(--color-fg-muted)", fontSize: "14px", marginTop: "4px" }}>
          Kelola basis data lokal dan lakukan pelaporan diagnostik kendala sistem.
        </p>
      </header>

      {statusMsg && (
        <div 
          data-testid="status-message"
          style={{
            padding: "12px 16px",
            borderRadius: "6px",
            marginBottom: "1.5rem",
            fontSize: "14px",
            border: "1px solid",
            backgroundColor: statusMsg.type === "success" ? "#f0fdf4" : "#fef2f2",
            borderColor: statusMsg.type === "success" ? "#bbf7d0" : "#fecaca",
            color: statusMsg.type === "success" ? "#166534" : "#991b1b",
          }}
        >
          {statusMsg.text}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Database Management Card */}
        <section 
          style={{
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            padding: "1.5rem",
            backgroundColor: "var(--color-bg-card, #ffffff)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1rem" }}>
            <Database size={22} style={{ color: "var(--color-primary, #0f172a)" }} />
            <h2 style={{ fontSize: "18px", fontWeight: 600, color: "var(--color-fg)" }}>Manajemen Basis Data</h2>
          </div>

          <p style={{ color: "var(--color-fg-muted)", fontSize: "14px", lineHeight: "1.5", marginBottom: "1.5rem" }}>
            Aplikasi SIAAS menyimpan seluruh catatan siswa secara lokal menggunakan SQLite. Jika basis data Anda mengalami kerusakan struktural atau Anda ingin membersihkan seluruh data untuk memulai dari awal, gunakan opsi reset di bawah ini.
          </p>

          <div 
            style={{
              backgroundColor: "#fffbeb",
              border: "1px solid #fef3c7",
              borderRadius: "6px",
              padding: "12px 16px",
              marginBottom: "1.5rem",
              display: "flex",
              gap: "12px",
              alignItems: "flex-start"
            }}
          >
            <AlertTriangle size={18} style={{ color: "#d97706", flexShrink: 0, marginTop: "2px" }} />
            <div>
              <h4 style={{ fontSize: "13px", fontWeight: 600, color: "#92400e" }}>Tindakan Destruktif!</h4>
              <p style={{ fontSize: "12px", color: "#b45309", marginTop: "2px", lineHeight: "1.4" }}>
                Tindakan ini akan menghapus berkas data lokal secara permanen. Semua data sekolah, siswa, nilai, dan kurikulum akan hilang sepenuhnya dan tidak dapat dikembalikan.
              </p>
            </div>
          </div>

          {resetConfirm ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "#991b1b" }}>
                Apakah Anda benar-benar yakin ingin menghapus seluruh basis data lokal Anda?
              </p>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={handleResetDatabase}
                  disabled={loadingReset}
                  data-testid="confirm-reset-button"
                  style={{
                    backgroundColor: "#dc2626",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "4px",
                    padding: "8px 16px",
                    fontSize: "13px",
                    fontWeight: 500,
                    cursor: "pointer"
                  }}
                >
                  {loadingReset ? "Mereset..." : "Ya, Hapus Permanen"}
                </button>
                <button
                  onClick={() => setResetConfirm(false)}
                  disabled={loadingReset}
                  data-testid="cancel-reset-button"
                  style={{
                    backgroundColor: "#f3f4f6",
                    color: "#374151",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                    padding: "8px 16px",
                    fontSize: "13px",
                    fontWeight: 500,
                    cursor: "pointer"
                  }}
                >
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setResetConfirm(true)}
              data-testid="reset-db-button"
              style={{
                backgroundColor: "#fef2f2",
                color: "#dc2626",
                border: "1px solid #fca5a5",
                borderRadius: "6px",
                padding: "8px 16px",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#fee2e2"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#fef2f2"}
            >
              <RefreshCw size={14} />
              Reset & Buat Ulang Database
            </button>
          )}
        </section>

        {/* Bug Reporting Section */}
        <section 
          style={{
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            padding: "1.5rem",
            backgroundColor: "var(--color-bg-card, #ffffff)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1rem" }}>
            <Bug size={22} style={{ color: "var(--color-primary, #0f172a)" }} />
            <h2 style={{ fontSize: "18px", fontWeight: 600, color: "var(--color-fg)" }}>Pelaporan Kendala & Bug</h2>
          </div>

          <p style={{ color: "var(--color-fg-muted)", fontSize: "14px", lineHeight: "1.5", marginBottom: "1.5rem" }}>
            Menemukan keanehan atau error saat menggunakan sistem? Laporkan kepada tim pengembang kami. Pelaporan akan secara otomatis mengompresi log diagnostik lokal Anda dan meneruskannya ke backend berbasis kecerdasan buatan (Mistral-7B AI) sebelum didaftarkan sebagai tiket perbaikan GitHub.
          </p>

          <button
            onClick={() => setIsBugModalOpen(true)}
            data-testid="open-bug-report-button"
            style={{
              backgroundColor: "#0f172a",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              padding: "8px 16px",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#1e293b"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#0f172a"}
          >
            <Bug size={14} />
            Laporkan Kendala Sekarang
          </button>
        </section>
      </div>

      <BugReportModal isOpen={isBugModalOpen} onClose={() => setIsBugModalOpen(false)} />
    </div>
  );
}
