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
      if (delay === 1000 || delay === 1200 || delay === 1500 || delay === 2000) {
        return originalSetTimeout(cb, 50);
      }
      return originalSetTimeout(cb, delay);
    });
    if (typeof window !== "undefined") {
      vi.spyOn(window, "setTimeout").mockImplementation((cb: any, delay) => {
        if (delay === 1000 || delay === 1200 || delay === 1500 || delay === 2000) {
          return originalSetTimeout(cb, 50);
        }
        return originalSetTimeout(cb, delay);
      });
    }
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
    }, { timeout: 3000 });

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
    mockInvoke.mockImplementation(async (cmd) => {
      if (cmd === "save_file_dialog") return { path: "/mock/path/sias.db", name: "sias.db" };
      return undefined;
    });

    render(<PengaturanView />);

    const exportBtn = screen.getByTestId("export-db-button");
    await userEvent.click(exportBtn);

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith("save_file_dialog", expect.any(Object));
      expect(mockInvoke).toHaveBeenCalledWith("export_database", { path: "/mock/path/sias.db" });
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
    }, { timeout: 3000 });
  });

  it("handles cancelled export properly (does not show error)", async () => {
    (window as any).__TAURI_INTERNALS__ = {};
    mockInvoke.mockImplementation(async (cmd) => {
      if (cmd === "save_file_dialog") return null;
      return undefined;
    });

    render(<PengaturanView />);

    const exportBtn = screen.getByTestId("export-db-button");
    await userEvent.click(exportBtn);

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith("save_file_dialog", expect.any(Object));
    });

    expect(mockInvoke).not.toHaveBeenCalledWith("export_database", expect.any(Object));

    // Should not show error or success message
    expect(screen.queryByTestId("status-message")).not.toBeInTheDocument();
  });

  it("shows error alert if database export fails in Tauri", async () => {
    (window as any).__TAURI_INTERNALS__ = {};
    mockInvoke.mockImplementation(async (cmd) => {
      if (cmd === "save_file_dialog") return { path: "/mock/path/sias.db", name: "sias.db" };
      if (cmd === "export_database") throw new Error("Disk full");
      return undefined;
    });
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
    mockInvoke.mockImplementation(async (cmd) => {
      if (cmd === "open_file_dialog") return { path: "/mock/import/sias.db", name: "sias.db" };
      return undefined;
    });

    render(<PengaturanView />);

    const importBtn = screen.getByTestId("import-db-button");
    await userEvent.click(importBtn);

    expect(window.confirm).toHaveBeenCalledWith(
      expect.stringContaining("Apakah Anda yakin ingin mengimpor database baru?")
    );

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith("open_file_dialog", expect.any(Object));
      expect(mockInvoke).toHaveBeenCalledWith("import_database", { path: "/mock/import/sias.db" });
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
    expect(mockInvoke).not.toHaveBeenCalledWith("import_database", expect.any(Object));
    expect(screen.queryByTestId("status-message")).not.toBeInTheDocument();
  });

  it("simulates database import in browser mode successfully when confirmed", async () => {
    // Explicitly ensure confirm returns true to prevent state leakage from previous tests
    window.confirm = vi.fn(() => true);
    
    render(<PengaturanView />);

    const importBtn = screen.getByTestId("import-db-button");
    await userEvent.click(importBtn);

    await waitFor(() => {
      expect(screen.getByText("[DEV MODE] Basis data disimulasikan berhasil diimpor.")).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("handles cancelled import properly (does not show error)", async () => {
    (window as any).__TAURI_INTERNALS__ = {};
    mockInvoke.mockImplementation(async (cmd) => {
      if (cmd === "open_file_dialog") return null;
      return undefined;
    });

    render(<PengaturanView />);

    const importBtn = screen.getByTestId("import-db-button");
    await userEvent.click(importBtn);

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith("open_file_dialog", expect.any(Object));
    });

    expect(mockInvoke).not.toHaveBeenCalledWith("import_database", expect.any(Object));
    expect(screen.queryByTestId("status-message")).not.toBeInTheDocument();
  });

  it("shows error alert if database import fails in Tauri", async () => {
    (window as any).__TAURI_INTERNALS__ = {};
    mockInvoke.mockImplementation(async (cmd) => {
      if (cmd === "open_file_dialog") return { path: "/mock/import/sias.db", name: "sias.db" };
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
    expect(screen.getByTestId("bug-report-form")).toBeInTheDocument();
  });

  it("submits bug report successfully with logs in Tauri environment", async () => {
    (window as any).__TAURI_INTERNALS__ = {};
    mockInvoke.mockImplementation(async (cmd) => {
      if (cmd === "get_app_logs") return "SYSTEM_LOG_DATA";
      return undefined;
    });

    // Mock global fetch
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: "success" }),
    });
    global.fetch = mockFetch;

    render(<PengaturanView />);
    await userEvent.click(screen.getByTestId("open-bug-report-button"));

    // Fill the form
    await userEvent.type(screen.getByTestId("bug-title-input"), "Test Bug Title");
    await userEvent.type(screen.getByTestId("bug-body-input"), "Test Bug Body");

    const submitBtn = screen.getByTestId("submit-bug-report-button");
    await userEvent.click(submitBtn);

    // Should call invoke for logs
    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith("get_app_logs");
    });

    // Should call fetch with correct data
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/issues"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            title: "Test Bug Title",
            body: "Test Bug Body",
            logs: "SYSTEM_LOG_DATA",
          }),
        })
      );
    });

    // Should show success message
    await waitFor(() => {
      expect(screen.getByTestId("bug-report-success")).toBeInTheDocument();
    });

    // Should automatically close after timeout
    await waitFor(() => {
      expect(screen.queryByText("Laporkan Bug / Kendala")).not.toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("shows error message if bug report submission fails", async () => {
    // Mock global fetch failure
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
    });
    global.fetch = mockFetch;

    render(<PengaturanView />);
    await userEvent.click(screen.getByTestId("open-bug-report-button"));

    await userEvent.type(screen.getByTestId("bug-title-input"), "Error Bug");
    await userEvent.type(screen.getByTestId("bug-body-input"), "Error Body");

    await userEvent.click(screen.getByTestId("submit-bug-report-button"));

    await waitFor(() => {
      expect(screen.getByTestId("bug-report-error")).toHaveTextContent(
        "Gagal mengirim laporan bug. Silakan coba lagi nanti."
      );
    });
  });

  it("closes bug report modal when Batal is clicked", async () => {
    render(<PengaturanView />);
    await userEvent.click(screen.getByTestId("open-bug-report-button"));

    const cancelBtn = screen.getByTestId("cancel-bug-report-button");
    await userEvent.click(cancelBtn);

    expect(screen.queryByText("Laporkan Bug / Kendala")).not.toBeInTheDocument();
  });
});
