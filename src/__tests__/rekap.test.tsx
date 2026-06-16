import React from "react";
import { render, screen, waitFor, within, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import RekapDataPage from "@/app/rekap/page";
import {
  getStudents,
  getPrograms,
  getConcentrations,
  getSubjects,
  getStudentGradesByFilter,
  importGradesFromExcel,
  exportGradesToExcel,
  getSemesters,
} from "@/lib/data";

// Mock the data client
vi.mock("@/lib/data", () => ({
  getStudents: vi.fn(),
  getPrograms: vi.fn(),
  getConcentrations: vi.fn(),
  getSubjects: vi.fn(),
  getStudentGradesByFilter: vi.fn(),
  importGradesFromExcel: vi.fn(),
  exportGradesToExcel: vi.fn(),
  getSemesters: vi.fn(),
}));

const mockStudents = [
  { nis: "11111", nama: "Alice", kompetensi: "Teknik Pemesinan" },
];
const mockPrograms = [{ id: "prog-1", nama: "Teknik Mesin" }];
const mockConcentrations = [{ id: "con-1", nama: "Teknik Pemesinan" }];
const mockSubjects = [
  { id: "sub-1", nama: "Matematika", kode: "MTK", kategori: "Kelompok Umum", sequence: 1, semesters: [1] },
];
const mockGrades = [{ studentId: "11111", subjectId: "sub-1", grade: 85 }];
const mockSemesters = [{ id: "sem-1", nama: "Semester 1", sequence: 1 }];

describe("Rekap Data Page - Dialog Modal Alerts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getStudents as any).mockResolvedValue(mockStudents);
    (getPrograms as any).mockResolvedValue(mockPrograms);
    (getConcentrations as any).mockResolvedValue(mockConcentrations);
    (getSubjects as any).mockResolvedValue(mockSubjects);
    (getStudentGradesByFilter as any).mockResolvedValue(mockGrades);
    (getSemesters as any).mockResolvedValue(mockSemesters);
  });

  it("renders filter controls and student list", async () => {
    render(<RekapDataPage />);

    await waitFor(() => {
      expect(screen.getByText("Rekap Data Hasil Belajar")).toBeInTheDocument();
    });

    expect(screen.getByText("Program Keahlian")).toBeInTheDocument();
    expect(screen.getByText("Konsentrasi Keahlian")).toBeInTheDocument();
    expect(screen.getByText("Semester")).toBeInTheDocument();
  });

  it("shows dialog modal on successful Excel import", async () => {
    (importGradesFromExcel as any).mockResolvedValue("Impor 1 data nilai siswa berhasil.");

    render(<RekapDataPage />);

    await waitFor(() => {
      expect(screen.getByText("Impor Excel")).toBeInTheDocument();
    });

    const importBtn = screen.getByRole("button", { name: /impor excel/i });
    await userEvent.click(importBtn);

    // Assert that the dialog modal shows with success message
    await waitFor(() => {
      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
      expect(within(dialog).getByText("Impor Excel")).toBeInTheDocument();
      expect(within(dialog).getByText("Impor 1 data nilai siswa berhasil.")).toBeInTheDocument();
    });

    // Close the dialog
    const okBtn = screen.getByRole("button", { name: "OK" });
    await userEvent.click(okBtn);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows error dialog modal on failed Excel import", async () => {
    (importGradesFromExcel as any).mockRejectedValue("File Excel tidak valid atau rusak.");

    render(<RekapDataPage />);

    await waitFor(() => {
      expect(screen.getByText("Impor Excel")).toBeInTheDocument();
    });

    const importBtn = screen.getByRole("button", { name: /impor excel/i });
    await userEvent.click(importBtn);

    // Assert that the dialog modal shows with error message
    await waitFor(() => {
      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
      expect(within(dialog).getByText("Gagal Impor")).toBeInTheDocument();
      expect(within(dialog).getByText("File Excel tidak valid atau rusak.")).toBeInTheDocument();
    });
  });

  it("shows warning dialog modal when exporting without concentration selected", async () => {
    (getConcentrations as any).mockResolvedValue([]); // No concentrations to select

    render(<RekapDataPage />);

    await screen.findByText("Rekap Data Hasil Belajar");

    // Wait for concentrations to be "loaded" (empty in this case)
    const consSelect = screen.getByLabelText("Konsentrasi Keahlian");
    await waitFor(() => {
      expect(consSelect).toHaveValue("");
    });

    const exportBtn = screen.getByRole("button", { name: /ekspor excel/i });
    await userEvent.click(exportBtn);

    // Assert that warning modal shows
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Pilih Konsentrasi")).toBeInTheDocument();
    expect(within(dialog).getByText("Silakan pilih Konsentrasi Keahlian terlebih dahulu.")).toBeInTheDocument();
  });

  it("shows success dialog modal on successful Excel export", async () => {
    (exportGradesToExcel as any).mockResolvedValue("Ekspor berhasil disimpan di D:/rekap.xlsx");

    render(<RekapDataPage />);

    await screen.findByText("Rekap Data Hasil Belajar");

    // Wait for concentrations to load and the first one to be auto-selected
    const consSelect = await screen.findByLabelText("Konsentrasi Keahlian");
    await waitFor(() => {
      expect(consSelect).toHaveValue("con-1");
    });

    const exportBtn = screen.getByRole("button", { name: /ekspor excel/i });
    await userEvent.click(exportBtn);

    // Assert that success modal shows
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText(/Ekspor Excel/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/Ekspor berhasil disimpan di D:\/rekap\.xlsx/i)).toBeInTheDocument();
  });
});
