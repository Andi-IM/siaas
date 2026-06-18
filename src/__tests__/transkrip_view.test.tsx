import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import StudentTranscriptView from "@/app/siswa/transkrip/StudentTranscriptView";
import { getStudentByNis, getGradesByStudent, getConcentrations, getSubjects } from "@/lib/data";

// Mock the data client
vi.mock("@/lib/data", () => ({
  getStudentByNis: vi.fn(),
  getGradesByStudent: vi.fn(),
  getConcentrations: vi.fn(),
  getSubjects: vi.fn(),
}));

const mockStudent = {
  nis: "11111",
  nisn: "000111",
  nama: "Alice Smith",
  kompetensi: "Teknik Pemesinan",
  tempatLahir: "Padang",
  tanggalLahir: "2008-01-01",
  nomorIjazah: "IJ-001",
  tanggalKelulusan: "2026-06-14",
};

const mockConcentrations = [
  { id: "con-1", nama: "Teknik Pemesinan" },
];

const mockSubjects = [
  { id: "sub-1", nama: "Matematika", kode: "MTK", kategori: "Kelompok Umum", transcriptGroup: "UMUM", sequence: 1, status: "active" },
  { id: "sub-2", nama: "Fisika", kode: "FSK", kategori: "Kelompok Kejuruan", transcriptGroup: "KEJURUAN_UMUM", sequence: 2, status: "active" },
  { id: "sub-3", nama: "Dasar Teknik Mesin", kode: "DTM", kategori: "Kelompok Kejuruan", transcriptGroup: "KEJURUAN_DASAR", sequence: 3, status: "active" },
  { id: "sub-4", nama: "Bubut", kode: "BBT", kategori: "Kelompok Kejuruan", transcriptGroup: "KEJURUAN_KONSENTRASI", sequence: 4, status: "active" },
  { id: "sub-5", nama: "UKK", kode: "UKK", kategori: "Kelompok Kejuruan", transcriptGroup: "UKK", sequence: 5, status: "active" },
];

const mockGrades = [
  { subject_id: "sub-1", semester_sequence: 1, grade: 80, category: "Kelompok Umum" },
  { subject_id: "sub-1", semester_sequence: 2, grade: 90, category: "Kelompok Umum" },
  { subject_id: "sub-3", semester_sequence: 1, grade: 70, category: "Kelompok Kejuruan" },
  { subject_id: "sub-3", semester_sequence: 2, grade: 80, category: "Kelompok Kejuruan" },
  { subject_id: "sub-3", semester_sequence: 3, grade: 90, category: "Kelompok Kejuruan" }, // Should be ignored for KEJURUAN_DASAR
  { subject_id: "sub-4", semester_sequence: 3, grade: 85, category: "Kelompok Kejuruan" },
  { subject_id: "sub-4", semester_sequence: 4, grade: 85, category: "Kelompok Kejuruan" },
  { subject_id: "sub-4", semester_sequence: 6, grade: 90, category: "Kelompok Kejuruan" },
  { subject_id: "sub-5", semester_sequence: 99, grade: 95, category: "Kelompok Kejuruan" },
];

describe("StudentTranscriptView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getStudentByNis as any).mockResolvedValue(mockStudent);
    (getConcentrations as any).mockResolvedValue(mockConcentrations);
    (getSubjects as any).mockResolvedValue(mockSubjects);
    (getGradesByStudent as any).mockResolvedValue(mockGrades);
  });

  it("renders loading state initially", () => {
    // Return a promise that doesn't resolve immediately
    (getStudentByNis as any).mockReturnValue(new Promise(() => {}));
    render(<StudentTranscriptView nis="11111" />);
    expect(document.querySelector(".skeleton")).toBeInTheDocument();
  });

  it("renders empty state if student not found", async () => {
    (getStudentByNis as any).mockResolvedValue(null);
    render(<StudentTranscriptView nis="99999" />);
    await waitFor(() => {
      expect(screen.getByText("Siswa tidak ditemukan")).toBeInTheDocument();
    });
  });

  it("renders transcript data successfully in 3-Year mode", async () => {
    const { container } = render(<StudentTranscriptView nis="11111" />);

    await waitFor(() => {
      expect(screen.getByText(/Alice Smith/)).toBeInTheDocument();
    });

    expect(screen.getByText("Transkrip 3 Tahun")).toBeInTheDocument();
    
    // Scope to the screen table
    const tableContainer = container.querySelector(".table-container.no-print")!;
    expect(within(tableContainer as HTMLElement).getByText("Matematika")).toBeInTheDocument();
    
    // Check if grades are displayed
    expect(within(tableContainer as HTMLElement).getAllByText("80").length).toBeGreaterThan(0);
    expect(within(tableContainer as HTMLElement).getAllByText("90").length).toBeGreaterThan(0);
  });

  it("switches to 'Transkrip Nilai' (Supplement) mode and correctly aggregates grades", async () => {
    const { container } = render(<StudentTranscriptView nis="11111" />);

    await waitFor(() => {
      expect(screen.getByText(/Alice Smith/)).toBeInTheDocument();
    });

    const supplementBtn = screen.getByRole("button", { name: "Transkrip Nilai" });
    await userEvent.click(supplementBtn);

    const tableContainer = container.querySelector(".table-container.no-print")!;
    expect(within(tableContainer as HTMLElement).getByText("Nilai")).toBeInTheDocument();
    expect(within(tableContainer as HTMLElement).getByText("Konsentrasi Keahlian")).toBeInTheDocument();

    // Verify KEJURUAN_DASAR aggregation (Avg of S1 & S2 only: (70+80)/2 = 75)
    const dtmRow = within(tableContainer as HTMLElement).getByText("Dasar Teknik Mesin").closest("tr")!;
    expect(within(dtmRow).getByText("75.00")).toBeInTheDocument();

    // Verify Konsentrasi Keahlian aggregation
    // S3 avg: 85
    // S4 avg: 85
    // S6 avg: 90
    // UKK: 95
    // Final: (85 + 85 + 90 + 95) / 4 = 355 / 4 = 88.75
    const kkRow = within(tableContainer as HTMLElement).getByText("Konsentrasi Keahlian").closest("tr")!;
    expect(within(kkRow).getByText("88.75")).toBeInTheDocument();
  });

  it("handles errors during data loading", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    (getStudentByNis as any).mockRejectedValue(new Error("Fetch failed"));
    
    render(<StudentTranscriptView nis="11111" />);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Failed to load transcript data:", expect.any(Error));
    });
    consoleSpy.mockRestore();
  });

  it("triggers print dialog when 'Cetak Transkrip' is clicked", async () => {
    if (typeof window.print === "undefined") {
      window.print = () => {};
    }
    const printSpy = vi.spyOn(window, "print").mockImplementation(() => {});
    render(<StudentTranscriptView nis="11111" />);

    await waitFor(() => {
      expect(screen.getByText(/Alice Smith/)).toBeInTheDocument();
    });

    const printBtn = screen.getByText("Cetak Transkrip");
    await userEvent.click(printBtn);

    expect(printSpy).toHaveBeenCalled();
    printSpy.mockRestore();
  });
});
