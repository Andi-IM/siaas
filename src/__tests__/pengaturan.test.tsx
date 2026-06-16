import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import PengaturanView from "@/app/pengaturan/PengaturanView";

// Mock invoke function
const mockInvoke = vi.fn();

vi.mock("@tauri-apps/api/core", () => ({
  invoke: (...args: any[]) => mockInvoke(...args),
}));

const originalSetTimeout = global.setTimeout;

describe("PengaturanView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: Reset window state
    if (typeof window !== "undefined") {
      delete (window as any).__TAURI_INTERNALS__;
      window.confirm = vi.fn(() => true);
    }
    // Safe async timeout mock to avoid re-entrancy issues in Testing Library
    vi.spyOn(global, "setTimeout").mockImplementation((cb: any, delay) => {
      if (delay === 1000 || delay === 1200 || delay === 1500) {
        return originalSetTimeout(cb, 0);
      }
      return originalSetTimeout(cb, delay);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders settings sections correctly", async () => {
    render(<PengaturanView />);

    expect(screen.getByText("Pengaturan Sistem")).toBeInTheDocument();
    expect(screen.getByText("Manajemen Basis Data")).toBeInTheDocument();
    expect(screen.getByText("Pelaporan Kendala & Bug")).toBeInTheDocument();
    expect(screen.getByTestId("reset-db-button")).toBeInTheDocument();
    expect(screen.getByTestId("export-db-button")).toBeInTheDocument();
    expect(screen.getByTestId("import-db-button")).toBeInTheDocument();
    expect(screen.getByTestId("open-bug-report-button")).toBeInTheDocument();

    // Default browser mode version
    await waitFor(() => {
      expect(screen.getByTestId("app-version-badge")).toHaveTextContent("Versi: 0.1.0 (Development)");
    });
  });

  it("loads and displays app version in Tauri environment", async () => {
    (window as any).__TAURI_INTERNALS__ = {};
    mockInvoke.mockImplementation(async (cmd) => {
      if (cmd === "get_app_version") return "2.3.4";
      return undefined;
    });

    render(<PengaturanView />);

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith("get_app_version");
    });

    await waitFor(() => {
      expect(screen.getByTestId("app-version-badge")).toHaveTextContent("Versi: 2.3.4");
    });
  });

  it("shows confirmation prompt when reset database is clicked", async () => {
    render(<PengaturanView />);

    const resetBtn = screen.getByTestId("reset-db-button");
    await userEvent.click(resetBtn);

    expect(
      screen.getByText("Apakah Anda benar-benar yakin ingin menghapus seluruh basis data lokal Anda?")
    ).toBeInTheDocument();
    expect(screen.getByTestId("confirm-reset-button")).toBeInTheDocument();
    expect(screen.getByTestId("cancel-reset-button")).toBeInTheDocument();
  });

  it("cancels confirmation prompt when Batal is clicked", async () => {
    render(<PengaturanView />);

    const resetBtn = screen.getByTestId("reset-db-button");
    await userEvent.click(resetBtn);

    const cancelBtn = screen.getByTestId("cancel-reset-button");
    await userEvent.click(cancelBtn);

    expect(
      screen.queryByText("Apakah Anda benar-benar yakin ingin menghapus seluruh basis data lokal Anda?")
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("reset-db-button")).toBeInTheDocument();
  });

  it("calls reset_database inside Tauri environment successfully", async () => {
    // Simulate Tauri internals
    (window as any).__TAURI_INTERNALS__ = {};
    mockInvoke.mockResolvedValue(undefined);

    render(<PengaturanView />);

    const resetBtn = screen.getByTestId("reset-db-button");
    await userEvent.click(resetBtn);

    const confirmBtn = screen.getByTestId("confirm-reset-button");
    await userEvent.click(confirmBtn);

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith("reset_database");
    });

    await waitFor(() => {
      expect(
        screen.getByText("Basis data berhasil direset dan dibuat ulang dari awal!")
      ).toBeInTheDocument();
    });
  });

  it("simulates reset in browser/development environment (non-Tauri)", async () => {
    render(<PengaturanView />);

    const resetBtn = screen.getByTestId("reset-db-button");
    await userEvent.click(resetBtn);

    const confirmBtn = screen.getByTestId("confirm-reset-button");
    await userEvent.click(confirmBtn);

    await waitFor(() => {
      expect(
        screen.getByText("[DEV MODE] Basis data disimulasikan berhasil direset.")
      ).toBeInTheDocument();
    });

    expect(mockInvoke).not.toHaveBeenCalledWith("reset_database");
  });

  it("shows error alert if reset_database fails in Tauri", async () => {
    // Simulate Tauri internals
    (window as any).__TAURI_INTERNALS__ = {};
    mockInvoke.mockImplementation(async (cmd) => {
      if (cmd === "reset_database") throw new Error("Database is locked");
      return undefined;
    });

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(<PengaturanView />);

    const resetBtn = screen.getByTestId("reset-db-button");
    await userEvent.click(resetBtn);

    const confirmBtn = screen.getByTestId("confirm-reset-button");
    await userEvent.click(confirmBtn);

    await waitFor(() => {
      expect(screen.getByText("Gagal mereset basis data: Database is locked")).toBeInTheDocument();
    });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("exports database inside Tauri environment successfully", async () => {
    (window as any).__TAURI_INTERNALS__ = {};
    mockInvoke.mockResolvedValue(undefined);

    render(<PengaturanView />);

    const exportBtn = screen.getByTestId("export-db-button");
    await userEvent.click(exportBtn);

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith("export_database");
    });

    await waitFor(() => {
      expect(screen.getByText("Basis data berhasil diekspor!")).toBeInTheDocument();
    });
  });

  it("simulates database export in browser mode successfully", async () => {
    render(<PengaturanView />);

    const exportBtn = screen.getByTestId("export-db-button");
    await userEvent.click(exportBtn);

    await waitFor(() => {
      expect(screen.getByText("[DEV MODE] Basis data disimulasikan berhasil diekspor.")).toBeInTheDocument();
    });
  });

  it("handles cancelled export properly (does not show error)", async () => {
    (window as any).__TAURI_INTERNALS__ = {};
    mockInvoke.mockRejectedValue("Batal memilih lokasi penyimpanan");

    render(<PengaturanView />);

    const exportBtn = screen.getByTestId("export-db-button");
    await userEvent.click(exportBtn);

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith("export_database");
    });

    // Should not show error or success message
    expect(screen.queryByTestId("status-message")).not.toBeInTheDocument();
  });

  it("shows error alert if database export fails in Tauri", async () => {
    (window as any).__TAURI_INTERNALS__ = {};
    mockInvoke.mockRejectedValue(new Error("Disk full"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(<PengaturanView />);

    const exportBtn = screen.getByTestId("export-db-button");
    await userEvent.click(exportBtn);

    await waitFor(() => {
      expect(screen.getByText("Gagal mengekspor basis data: Disk full")).toBeInTheDocument();
    });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("imports database inside Tauri environment successfully when confirmed", async () => {
    (window as any).__TAURI_INTERNALS__ = {};
    mockInvoke.mockResolvedValue(undefined);

    render(<PengaturanView />);

    const importBtn = screen.getByTestId("import-db-button");
    await userEvent.click(importBtn);

    expect(window.confirm).toHaveBeenCalledWith(
      expect.stringContaining("Apakah Anda yakin ingin mengimpor database baru?")
    );

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith("import_database");
    });

    await waitFor(() => {
      expect(screen.getByText("Basis data berhasil diimpor!")).toBeInTheDocument();
    });
  });

  it("does not import database if user cancels the confirm dialog", async () => {
    (window as any).__TAURI_INTERNALS__ = {};
    mockInvoke.mockResolvedValue(undefined);
    window.confirm = vi.fn(() => false);

    render(<PengaturanView />);

    const importBtn = screen.getByTestId("import-db-button");
    await userEvent.click(importBtn);

    expect(window.confirm).toHaveBeenCalled();
    expect(mockInvoke).not.toHaveBeenCalledWith("import_database");
    expect(screen.queryByTestId("status-message")).not.toBeInTheDocument();
  });

  it("simulates database import in browser mode successfully when confirmed", async () => {
    render(<PengaturanView />);

    const importBtn = screen.getByTestId("import-db-button");
    await userEvent.click(importBtn);

    await waitFor(() => {
      expect(screen.getByText("[DEV MODE] Basis data disimulasikan berhasil diimpor.")).toBeInTheDocument();
    });
  });

  it("handles cancelled import properly (does not show error)", async () => {
    (window as any).__TAURI_INTERNALS__ = {};
    mockInvoke.mockRejectedValue("Batal memilih berkas database");

    render(<PengaturanView />);

    const importBtn = screen.getByTestId("import-db-button");
    await userEvent.click(importBtn);

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith("import_database");
    });

    expect(screen.queryByTestId("status-message")).not.toBeInTheDocument();
  });

  it("shows error alert if database import fails in Tauri", async () => {
    (window as any).__TAURI_INTERNALS__ = {};
    mockInvoke.mockImplementation(async (cmd) => {
      if (cmd === "import_database") throw new Error("Invalid schema");
      return undefined;
    });
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(<PengaturanView />);

    const importBtn = screen.getByTestId("import-db-button");
    await userEvent.click(importBtn);

    await waitFor(() => {
      expect(screen.getByText("Gagal mengimpor basis data: Invalid schema")).toBeInTheDocument();
    });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("opens bug report modal when clicked", async () => {
    render(<PengaturanView />);

    expect(screen.queryByText("Laporkan Bug / Kendala")).not.toBeInTheDocument();

    const openBugBtn = screen.getByTestId("open-bug-report-button");
    await userEvent.click(openBugBtn);

    expect(screen.getByText("Laporkan Bug / Kendala")).toBeInTheDocument();
  });
});
