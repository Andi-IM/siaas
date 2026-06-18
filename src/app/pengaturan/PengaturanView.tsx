"use client";

import React, { useState, useEffect } from "react";
import { BugReportModal } from "@/components/BugReportModal";
import { Database, Bug, AlertTriangle, RefreshCw, Download, Upload } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { filePicker } from "@/lib/dialog-utils";

const safeInvoke = async <T,>(cmd: string, args?: any): Promise<T> => {
  if (typeof window !== "undefined" && (window as any).__E2E_MOCK_INVOKE__) {
    return (window as any).__E2E_MOCK_INVOKE__(cmd, args);
  }
  if (args !== undefined) {
    return invoke<T>(cmd, args);
  }
  return invoke<T>(cmd);
};

export default function PengaturanView() {
  const [appVersion, setAppVersion] = useState("Memuat...");
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  const [loadingExport, setLoadingExport] = useState(false);
  const [loadingImport, setLoadingImport] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        if (typeof window !== "undefined" && ((window as any).__TAURI_INTERNALS__ || (window as any).__E2E_MOCK_INVOKE__)) {
          const ver = await safeInvoke<string>("get_app_version");
          setAppVersion(ver);
        } else {
          setAppVersion("0.1.0 (Development)");
        }
      } catch (err) {
        console.error("Failed to fetch app version:", err);
        setAppVersion("0.1.0");
      }
    };
    fetchVersion();
  }, []);

  const handleExportDatabase = async () => {
    setLoadingExport(true);
    setStatusMsg(null);
    try {
      if (typeof window !== "undefined" && ((window as any).__TAURI_INTERNALS__ || (window as any).__E2E_MOCK_INVOKE__)) {
        const file = await filePicker.saveFile(
          "Ekspor Basis Data",
          [{ name: "Database Files", extensions: ["db"] }],
          "sias.db"
        );
        if (!file) {
          throw "Batal memilih lokasi penyimpanan";
        }
        await safeInvoke("export_database", { path: file.path });
        setStatusMsg({
          type: "success",
          text: "Basis data berhasil diekspor!"
        });
      } else {
        // Fallback for development browser
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setStatusMsg({
          type: "success",
          text: "[DEV MODE] Basis data disimulasikan berhasil diekspor."
        });
      }
    } catch (err: any) {
      if (err !== "Batal memilih lokasi penyimpanan") {
        console.error("Failed to export database:", err);
        setStatusMsg({
          type: "error",
          text: `Gagal mengekspor basis data: ${err.message || err}`
        });
      }
    } finally {
      setLoadingExport(false);
    }
  };

  const handleImportDatabase = async () => {
    const confirmImport = window.confirm(
      "Apakah Anda yakin ingin mengimpor database baru? Tindakan ini akan menimpa database aktif Anda saat ini secara permanen."
    );
    if (!confirmImport) return;

    setLoadingImport(true);
    setStatusMsg(null);
    try {
      if (typeof window !== "undefined" && ((window as any).__TAURI_INTERNALS__ || (window as any).__E2E_MOCK_INVOKE__)) {
        const file = await filePicker.pickDatabase();
        if (!file) {
          throw "Batal memilih berkas database";
        }
        await safeInvoke("import_database", { path: file.path });
        setStatusMsg({
          type: "success",
          text: "Basis data berhasil diimpor!"
        });
      } else {
        // Fallback for development browser
        await new Promise((resolve) => setTimeout(resolve, 1200));
        setStatusMsg({
          type: "success",
          text: "[DEV MODE] Basis data disimulasikan berhasil diimpor."
        });
      }
    } catch (err: any) {
      if (err !== "Batal memilih berkas database") {
        console.error("Failed to import database:", err);
        setStatusMsg({
          type: "error",
          text: `Gagal mengimpor basis data: ${err.message || err}`
        });
      }
    } finally {
      setLoadingImport(false);
    }
  };

  const handleResetDatabase = async () => {
    setLoadingReset(true);
    setStatusMsg(null);
    try {
      if (typeof window !== "undefined" && ((window as any).__TAURI_INTERNALS__ || (window as any).__E2E_MOCK_INVOKE__)) {
        await safeInvoke("reset_database");
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
      <header style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 600, color: "var(--color-fg)" }}>Pengaturan Sistem</h1>
          <p style={{ color: "var(--color-fg-muted)", fontSize: "14px", marginTop: "4px" }}>
            Kelola basis data lokal dan lakukan pelaporan diagnostik kendala sistem.
          </p>
        </div>
        <div 
          style={{
            padding: "6px 12px",
            backgroundColor: "var(--color-bg-card, #ffffff)",
            border: "1px solid var(--color-border)",
            borderRadius: "4px",
            fontSize: "12px",
            color: "var(--color-fg-muted)",
            fontWeight: 500
          }}
          data-testid="app-version-badge"
        >
          Versi: {appVersion}
        </div>
      </header>

      {statusMsg && (
        <div 
          data-testid="status-message"
          style={{
            padding: "12px 16px",
            borderRadius: "4px",
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
            borderRadius: "4px",
            padding: "1.5rem",
            backgroundColor: "var(--color-bg-card, #ffffff)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1rem" }}>
            <Database size={22} style={{ color: "var(--color-primary, #0f172a)" }} />
            <h2 style={{ fontSize: "18px", fontWeight: 600, color: "var(--color-fg)" }}>Manajemen Basis Data</h2>
          </div>

          <p style={{ color: "var(--color-fg-muted)", fontSize: "14px", lineHeight: "1.5", marginBottom: "1.5rem" }}>
            Aplikasi SIAAS menyimpan seluruh catatan siswa secara lokal menggunakan SQLite. Anda dapat mengekspor salinan database Anda untuk keperluan cadangan (backup), mengimpor database cadangan yang sudah ada, atau mereset seluruh database jika terjadi kerusakan struktural.
          </p>

          <div 
            style={{
              backgroundColor: "#fffbeb",
              border: "1px solid #fef3c7",
              borderRadius: "4px",
              padding: "12px 16px",
              marginBottom: "1.5rem",
              display: "flex",
              gap: "12px",
              alignItems: "flex-start"
            }}
          >
            <AlertTriangle size={18} style={{ color: "#d97706", flexShrink: 0, marginTop: "2px" }} />
            <div>
              <h4 style={{ fontSize: "13px", fontWeight: 600, color: "#92400e" }}>Tindakan Pengelolaan Data!</h4>
              <p style={{ fontSize: "12px", color: "#b45309", marginTop: "2px", lineHeight: "1.4" }}>
                Proses impor dan reset database adalah tindakan destruktif. Data aktif yang ada di sistem saat ini akan digantikan atau dihapus secara permanen. Pastikan Anda telah mengekspor database cadangan terlebih dahulu sebelum melakukan impor atau reset.
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
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              <button
                onClick={handleExportDatabase}
                disabled={loadingExport || loadingImport}
                data-testid="export-db-button"
                style={{
                  backgroundColor: "#ffffff",
                  color: "var(--color-fg)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "4px",
                  padding: "8px 16px",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => { if (!loadingExport && !loadingImport) e.currentTarget.style.backgroundColor = "var(--color-bg-hover, #f1f5f9)"; }}
                onMouseLeave={(e) => { if (!loadingExport && !loadingImport) e.currentTarget.style.backgroundColor = "#ffffff"; }}
              >
                <Download size={14} />
                {loadingExport ? "Mengekspor..." : "Ekspor Database"}
              </button>

              <button
                onClick={handleImportDatabase}
                disabled={loadingExport || loadingImport}
                data-testid="import-db-button"
                style={{
                  backgroundColor: "#ffffff",
                  color: "var(--color-fg)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "4px",
                  padding: "8px 16px",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => { if (!loadingExport && !loadingImport) e.currentTarget.style.backgroundColor = "var(--color-bg-hover, #f1f5f9)"; }}
                onMouseLeave={(e) => { if (!loadingExport && !loadingImport) e.currentTarget.style.backgroundColor = "#ffffff"; }}
              >
                <Upload size={14} />
                {loadingImport ? "Mengimpor..." : "Impor Database"}
              </button>

              <button
                onClick={() => setResetConfirm(true)}
                disabled={loadingExport || loadingImport}
                data-testid="reset-db-button"
                style={{
                  backgroundColor: "#fef2f2",
                  color: "#dc2626",
                  border: "1px solid #fca5a5",
                  borderRadius: "4px",
                  padding: "8px 16px",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => { if (!loadingExport && !loadingImport) e.currentTarget.style.backgroundColor = "#fee2e2"; }}
                onMouseLeave={(e) => { if (!loadingExport && !loadingImport) e.currentTarget.style.backgroundColor = "#fef2f2"; }}
              >
                <RefreshCw size={14} />
                Reset Database
              </button>
            </div>
          )}
        </section>

        {/* Bug Reporting Section */}
        <section 
          style={{
            border: "1px solid var(--color-border)",
            borderRadius: "4px",
            padding: "1.5rem",
            backgroundColor: "var(--color-bg-card, #ffffff)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1rem" }}>
            <Bug size={22} style={{ color: "var(--color-primary, #0f172a)" }} />
            <h2 style={{ fontSize: "18px", fontWeight: 600, color: "var(--color-fg)" }}>Pelaporan Kendala & Bug</h2>
          </div>

          <p style={{ color: "var(--color-fg-muted)", fontSize: "14px", lineHeight: "1.5", marginBottom: "1.5rem" }}>
            Menemukan keanehan atau error saat menggunakan sistem? Laporkan kepada tim pengembang kami. Pelaporan akan secara otomatis mengumpulkan log diagnostik lokal Anda untuk membantu proses perbaikan secara tepat dan efisien.
          </p>

          <button
            onClick={() => setIsBugModalOpen(true)}
            data-testid="open-bug-report-button"
            style={{
              backgroundColor: "#0f172a",
              color: "#ffffff",
              border: "none",
              borderRadius: "4px",
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
