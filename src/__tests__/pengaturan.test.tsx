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
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders settings sections correctly", () => {
    render(<PengaturanView />);

    expect(screen.getByText("Pengaturan Sistem")).toBeInTheDocument();
    expect(screen.getByText("Manajemen Basis Data")).toBeInTheDocument();
    expect(screen.getByText("Pelaporan Kendala & Bug")).toBeInTheDocument();
    expect(screen.getByTestId("reset-db-button")).toBeInTheDocument();
    expect(screen.getByTestId("open-bug-report-button")).toBeInTheDocument();
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
    vi.spyOn(global, "setTimeout").mockImplementation((cb: any, delay) => {
      if (delay === 1500) {
        cb();
        return 0 as any;
      }
      return originalSetTimeout(cb, delay);
    });

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

    expect(mockInvoke).not.toHaveBeenCalled();
  });

  it("shows error alert if reset_database fails in Tauri", async () => {
    // Simulate Tauri internals
    (window as any).__TAURI_INTERNALS__ = {};
    mockInvoke.mockRejectedValue(new Error("Database is locked"));

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

  it("opens bug report modal when clicked", async () => {
    render(<PengaturanView />);

    expect(screen.queryByText("Laporkan Bug / Kendala")).not.toBeInTheDocument();

    const openBugBtn = screen.getByTestId("open-bug-report-button");
    await userEvent.click(openBugBtn);

    expect(screen.getByText("Laporkan Bug / Kendala")).toBeInTheDocument();
  });
});
