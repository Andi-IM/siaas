import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import Dashboard from "@/app/page";
import { getStudents } from "@/lib/data";

// Mock the data client
vi.mock("@/lib/data", () => ({
  getStudents: vi.fn(),
}));

const mockStudents = [
  {
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
    namaAyah: "",
    pekerjaanAyah: "",
    namaIbu: "",
    pekerjaanIbu: "",
    alamatOrangTua: "",
    namaWali: "",
    alamatWali: "",
    teleponWali: "",
    pekerjaanWali: "",
  },
  {
    nis: "22222",
    nisn: "0022222",
    nama: "Bob",
    tempatLahir: "Padang",
    tanggalLahir: "2008-02-02",
    jenisKelamin: "L" as const,
    agama: "Islam",
    alamat: "Padang",
    telepon: "456",
    sekolahAsal: "SMP 2",
    diterimaDiKelas: "X-2",
    diterimaPadaTanggal: "2025-07-01",
    kompetensi: "Teknik Pemesinan",
    nomorIjazah: "",
    tanggalKelulusan: "",
    status: "active" as const,
    namaAyah: "",
    pekerjaanAyah: "",
    namaIbu: "",
    pekerjaanIbu: "",
    alamatOrangTua: "",
    namaWali: "",
    alamatWali: "",
    teleponWali: "",
    pekerjaanWali: "",
  },
  {
    nis: "33333",
    nisn: "0033333",
    nama: "Charlie",
    tempatLahir: "Padang",
    tanggalLahir: "2008-03-03",
    jenisKelamin: "L" as const,
    agama: "Islam",
    alamat: "Padang",
    telepon: "789",
    sekolahAsal: "SMP 3",
    diterimaDiKelas: "X-1",
    diterimaPadaTanggal: "2025-07-01",
    kompetensi: "Teknik Pengelasan",
    nomorIjazah: "",
    tanggalKelulusan: "",
    status: "inactive" as const,
    namaAyah: "",
    pekerjaanAyah: "",
    namaIbu: "",
    pekerjaanIbu: "",
    alamatOrangTua: "",
    namaWali: "",
    alamatWali: "",
    teleponWali: "",
    pekerjaanWali: "",
  },
];

describe("Dashboard Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading skeletons initially", () => {
    (getStudents as any).mockReturnValue(new Promise(() => {}));

    render(<Dashboard />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    
    // Placeholder dashes for stats
    const statsDashes = screen.getAllByText("—");
    expect(statsDashes.length).toBe(3);

    // Loader table should be present
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("renders empty state when there are no students", async () => {
    (getStudents as any).mockResolvedValue([]);

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("Belum ada data siswa")).toBeInTheDocument();
    });

    expect(screen.getByText("Total Siswa")).toBeInTheDocument();
    expect(screen.getByText("Total Kelas")).toBeInTheDocument();
    expect(screen.getByText("Siswa Aktif")).toBeInTheDocument();

    // Stats should resolve to "0"
    expect(screen.getAllByText("0").length).toBe(3);
  });
  
  it("handles errors when fetching student data fails", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    (getStudents as any).mockRejectedValue(new Error("Database connection failed"));

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("Belum ada data siswa")).toBeInTheDocument();
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "Failed to load dashboard data:",
      expect.any(Error)
    );
    consoleSpy.mockRestore();
  });

  it("renders student statistics and recent students table", async () => {
    (getStudents as any).mockResolvedValue(mockStudents);

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("Charlie")).toBeInTheDocument();

    // Total Siswa: 3
    expect(screen.getByText("3")).toBeInTheDocument();
    // Total Kelas & Siswa Aktif: 2 (Alice & Bob are active, Charlie is inactive)
    expect(screen.getAllByText("2").length).toBe(2); // One for total classes, one for active students

    // Verify recent student list ordering (reverse chronological)
    const rows = screen.getAllByRole("row");
    // Row 0 is header, Row 1 should be Charlie, Row 2 Bob, Row 3 Alice
    expect(rows[1]).toHaveTextContent("Charlie");
    expect(rows[2]).toHaveTextContent("Bob");
    expect(rows[3]).toHaveTextContent("Alice");
  });

  it("does not update state if unmounted before fetch resolves", async () => {
    let resolvePromise: any;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    (getStudents as any).mockReturnValue(promise);

    const { unmount } = render(<Dashboard />);
    unmount();

    // Resolve the promise after unmounting
    resolvePromise(mockStudents);
  });

  it("does not update state if unmounted before fetch rejects", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    let rejectPromise: any;
    const promise = new Promise((_, reject) => {
      rejectPromise = reject;
    });
    (getStudents as any).mockReturnValue(promise);

    const { unmount } = render(<Dashboard />);
    unmount();

    // Reject the promise after unmounting
    rejectPromise(new Error("Database connection failed"));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to load dashboard data:",
        expect.any(Error)
      );
    });
    consoleSpy.mockRestore();
  });
});
