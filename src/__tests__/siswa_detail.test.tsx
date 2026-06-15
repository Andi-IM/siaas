import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { useSearchParams } from "next/navigation";
import DetailPage from "@/app/siswa/detail/page";
import { DetailFallback } from "@/app/siswa/detail/StudentDetailView";
import { getStudentByNis, deleteStudent } from "@/lib/data";

// Mock router
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: vi.fn(() => new URLSearchParams("?nis=11111")),
}));

// Mock the data client
vi.mock("@/lib/data", () => ({
  getStudentByNis: vi.fn(),
  deleteStudent: vi.fn(),
}));

const originalSetTimeout = global.setTimeout;

const mockStudent = {
  nis: "11111",
  nisn: "0011111",
  nama: "Alice",
  tempatLahir: "Padang",
  tanggalLahir: "2008-01-01",
  jenisKelamin: "P" as const,
  agama: "Islam",
  alamat: "Padang",
  telepon: "123",
  sekolahAsal: "SMP 1",
  diterimaDiKelas: "X-1",
  diterimaPadaTanggal: "2025-07-01",
  kompetensi: "Teknik Pemesinan",
  nomorIjazah: "",
  tanggalKelulusan: "",
  status: "active" as const,
  namaAyah: "Father",
  pekerjaanAyah: "Job A",
  namaIbu: "Mother",
  pekerjaanIbu: "Job B",
  alamatOrangTua: "Padang Parents",
  namaWali: "Wali",
  alamatWali: "Padang Wali",
  teleponWali: "999",
  pekerjaanWali: "Job W",
};

describe("Student Detail Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(global, "setTimeout").mockImplementation((cb: any, delay) => {
      if (delay === 1200) {
        cb();
        return 0 as any;
      }
      return originalSetTimeout(cb, delay);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders DetailPage correctly when nis is missing", async () => {
    // This covers the default nis = "" in DetailPageContent
    vi.mocked(useSearchParams).mockReturnValueOnce(new URLSearchParams("") as any);
    (getStudentByNis as any).mockResolvedValue(null);

    render(<DetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Siswa tidak ditemukan")).toBeInTheDocument();
    });
  });

  it("renders DetailFallback correctly", () => {
    render(<DetailFallback />);
    expect(document.querySelector(".skeleton")).toBeInTheDocument();
  });

  it("renders loading skeletons initially", () => {
    (getStudentByNis as any).mockReturnValue(new Promise(() => {}));

    const { container } = render(<DetailPage />);

    expect(screen.queryByText("Alice")).not.toBeInTheDocument();
    expect(container.getElementsByClassName("skeleton").length).toBeGreaterThan(0);
  });

  it("renders empty state when student is not found", async () => {
    (getStudentByNis as any).mockResolvedValue(null);

    render(<DetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Siswa tidak ditemukan")).toBeInTheDocument();
    });

    expect(screen.getByText("Data siswa dengan NIS 11111 tidak ditemukan.")).toBeInTheDocument();
  });

  it("renders all student details fields correctly", async () => {
    (getStudentByNis as any).mockResolvedValue(mockStudent);

    render(<DetailPage />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Alice" })).toBeInTheDocument();
    });

    expect(screen.getByText("NIS/NISN: 11111 / 0011111")).toBeInTheDocument();
    
    // Check personal details
    expect(screen.getByText("Padang Parents")).toBeInTheDocument();
    expect(screen.getByText("Wali")).toBeInTheDocument();
    expect(screen.getByText("Teknik Pemesinan")).toBeInTheDocument();
    expect(screen.getByText("SMP 1")).toBeInTheDocument();
  });

  it("handles student deletion flow (confirm and cancel)", async () => {
    (getStudentByNis as any).mockResolvedValue(mockStudent);
    (deleteStudent as any).mockResolvedValue(undefined);

    const { container } = render(<DetailPage />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Alice" })).toBeInTheDocument();
    });

    const deleteBtn = screen.getByRole("button", { name: /hapus/i });
    await userEvent.click(deleteBtn);

    // Modal dialog pops up
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText("Hapus Siswa")).toBeInTheDocument();
    expect(within(dialog).getByText("Alice")).toBeInTheDocument();

    // Click cancel button
    const cancelBtn = within(dialog).getByRole("button", { name: /batal/i });
    await userEvent.click(cancelBtn);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Click delete again
    await userEvent.click(deleteBtn);

    // Click modal backdrop to close dialog
    const backdrop = container.querySelector(".modal-backdrop")!;
    await userEvent.click(backdrop);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Click delete again
    await userEvent.click(deleteBtn);
    
    // Click confirm delete
    const confirmBtn = within(screen.getByRole("dialog")).getByRole("button", { name: "Hapus" });
    await userEvent.click(confirmBtn);

    expect(deleteStudent).toHaveBeenCalledWith("11111");

    await waitFor(() => {
      expect(screen.getByText("Siswa berhasil dihapus")).toBeInTheDocument();
    });

    expect(mockPush).toHaveBeenCalledWith("/siswa");
  });

  it("handles db error on student load", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    (getStudentByNis as any).mockRejectedValue(new Error("Database error"));

    render(<DetailPage />);

    await waitFor(() => {
      expect(screen.queryByRole("heading", { name: "Alice" })).not.toBeInTheDocument();
    });

    expect(consoleSpy).toHaveBeenCalledWith("Failed to load student:", expect.any(Error));
    consoleSpy.mockRestore();
  });

  it("handles db error on deletion", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    (getStudentByNis as any).mockResolvedValue(mockStudent);
    (deleteStudent as any).mockRejectedValue(new Error("Database delete error"));

    render(<DetailPage />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Alice" })).toBeInTheDocument();
    });

    const deleteBtn = screen.getByRole("button", { name: /hapus/i });
    await userEvent.click(deleteBtn);

    const confirmBtn = within(screen.getByRole("dialog")).getByRole("button", { name: "Hapus" });
    await userEvent.click(confirmBtn);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Failed to delete student:", expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it("renders male and inactive status correctly", async () => {
    (getStudentByNis as any).mockResolvedValue({
      ...mockStudent,
      jenisKelamin: "L",
      status: "inactive",
    });

    render(<DetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Laki-laki")).toBeInTheDocument();
    });

    expect(screen.getByText("Nonaktif")).toBeInTheDocument();
  });

  it("renders fallback address and 'Tidak ada data' for empty optional fields", async () => {
    (getStudentByNis as any).mockResolvedValue({
      ...mockStudent,
      alamatOrangTua: "",
      nomorIjazah: "",
      tanggalKelulusan: "",
    });

    render(<DetailPage />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Alice" })).toBeInTheDocument();
    });

    // Since alamatOrangTua is empty, it should fall back to alamat ("Padang")
    const parentAddressRow = screen.getByText("Alamat Orang Tua").closest(".detail-row") as HTMLElement;
    expect(within(parentAddressRow).getByText("Padang")).toBeInTheDocument();

    // Check optional fields that are empty show "Tidak ada data"
    const ijazahRow = screen.getByText("Nomor Ijazah (Alumni)").closest(".detail-row") as HTMLElement;
    expect(within(ijazahRow).getByText("Tidak ada data")).toBeInTheDocument();
  });

  it("does not update state if unmounted before fetch resolves", async () => {
    let resolvePromise: any;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    (getStudentByNis as any).mockReturnValue(promise);

    const { unmount } = render(<DetailPage />);
    unmount();

    resolvePromise(mockStudent);
  });

  it("does not update state if unmounted before fetch rejects", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    let rejectPromise: any;
    const promise = new Promise((_, reject) => {
      rejectPromise = reject;
    });
    (getStudentByNis as any).mockReturnValue(promise);

    const { unmount } = render(<DetailPage />);
    unmount();

    rejectPromise(new Error("Database error"));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to load student:",
        expect.any(Error)
      );
    });
    consoleSpy.mockRestore();
  });
});
