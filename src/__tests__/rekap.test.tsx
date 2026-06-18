import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
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
  { nis: "11111", nama: "Alice", kompetensi: "Teknik Pemesinan", tempatLahir: "Padang", tanggalLahir: "2008-01-01", jenisKelamin: "P", nisn: "000111" },
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

    const consSelect = await screen.findByLabelText("Konsentrasi Keahlian");
    await waitFor(() => {
      expect(consSelect).toHaveValue("con-1");
    });

    const exportBtn = screen.getByRole("button", { name: /ekspor excel/i });
    await userEvent.click(exportBtn);

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText(/Ekspor Excel/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/Ekspor berhasil disimpan di D:\/rekap\.xlsx/i)).toBeInTheDocument();
  });

  it("shows error dialog modal on failed Excel export", async () => {
    (exportGradesToExcel as any).mockRejectedValue("Gagal mengekspor ke Excel.");

    render(<RekapDataPage />);

    await screen.findByText("Rekap Data Hasil Belajar");

    const consSelect = await screen.findByLabelText("Konsentrasi Keahlian");
    await waitFor(() => {
      expect(consSelect).toHaveValue("con-1");
    });

    const exportBtn = screen.getByRole("button", { name: /ekspor excel/i });
    await userEvent.click(exportBtn);

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Gagal Ekspor")).toBeInTheDocument();
    expect(within(dialog).getByText("Gagal mengekspor ke Excel.")).toBeInTheDocument();
  });

  it("toggles edit mode and shows input fields", async () => {
    render(<RekapDataPage />);

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    const inputBtn = screen.getByRole("button", { name: /input nilai/i });
    await userEvent.click(inputBtn);

    expect(screen.getByRole("button", { name: /simpan nilai/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /batal/i })).toBeInTheDocument();

    const gradeInput = screen.getByDisplayValue("85");
    expect(gradeInput).toBeInTheDocument();

    await userEvent.clear(gradeInput);
    await userEvent.type(gradeInput, "90");
    expect(gradeInput).toHaveValue(90);
  });

  it("cancels edit mode and returns to non-edit state", async () => {
    render(<RekapDataPage />);

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    const inputBtn = screen.getByRole("button", { name: /input nilai/i });
    await userEvent.click(inputBtn);

    const gradeInput = screen.getByDisplayValue("85");
    await userEvent.clear(gradeInput);
    await userEvent.type(gradeInput, "95");

    const cancelBtn = screen.getByRole("button", { name: /batal/i });
    await userEvent.click(cancelBtn);

    expect(screen.getByRole("button", { name: /input nilai/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /simpan nilai/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /batal/i })).not.toBeInTheDocument();
  });

  it("changes semester and reloads grades", async () => {
    (getStudentGradesByFilter as any).mockResolvedValueOnce([]).mockResolvedValueOnce(mockGrades);
    (getSemesters as any).mockResolvedValue([
      { id: "sem-1", nama: "Semester 1", sequence: 1 },
      { id: "sem-2", nama: "Semester 2", sequence: 2 },
    ]);

    render(<RekapDataPage />);

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    const semesterSelect = screen.getByLabelText("Semester");
    await userEvent.selectOptions(semesterSelect, "2");

    await waitFor(() => {
      expect(getStudentGradesByFilter).toHaveBeenCalledWith("con-1", 2);
    });
  });

  it("handles initial load failure with console error", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    (getStudents as any).mockRejectedValue(new Error("Failed to load students"));

    render(<RekapDataPage />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Failed to load initial rekap data:", expect.any(Error));
    });
    consoleSpy.mockRestore();
  });

  it("handles concentration load failure with console error", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    (getConcentrations as any).mockRejectedValue(new Error("Failed to load concentrations"));

    render(<RekapDataPage />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Failed to load concentrations:", expect.any(Error));
    });
    consoleSpy.mockRestore();
  });

  it("handles subjects/grades load failure with console error", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    (getSubjects as any).mockRejectedValue(new Error("Failed to load subjects"));

    render(<RekapDataPage />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Failed to load subjects/grades:", expect.any(Error));
    });
    consoleSpy.mockRestore();
  });

  it("triggers print dialog when Cetak Laporan is clicked", async () => {
    if (typeof window.print === "undefined") {
      window.print = () => {};
    }
    const printSpy = vi.spyOn(window, "print").mockImplementation(() => {});
    render(<RekapDataPage />);

    await waitFor(() => {
      expect(screen.getByText("Rekap Data Hasil Belajar")).toBeInTheDocument();
    });

    const printBtn = screen.getByRole("button", { name: /cetak laporan/i });
    await userEvent.click(printBtn);

    expect(printSpy).toHaveBeenCalled();
    printSpy.mockRestore();
  });

  it("filters students by selected concentration", async () => {
    (getStudents as any).mockResolvedValue([
      { nis: "11111", nama: "Alice", kompetensi: "Teknik Pemesinan", tempatLahir: "Padang", tanggalLahir: "2008-01-01", jenisKelamin: "P", nisn: "000111" },
      { nis: "22222", nama: "Bob", kompetensi: "Teknik Pengelasan", tempatLahir: "Padang", tanggalLahir: "2009-01-01", jenisKelamin: "L", nisn: "000222" },
    ]);
    (getConcentrations as any).mockResolvedValue([
      { id: "con-1", nama: "Teknik Pemesinan" },
      { id: "con-2", nama: "Teknik Pengelasan" },
    ]);

    render(<RekapDataPage />);

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
      expect(screen.getByText("Bob")).toBeInTheDocument();
    });

    const konsentrasiSelect = screen.getByLabelText("Konsentrasi Keahlian");
    await waitFor(() => {
      expect(within(konsentrasiSelect).getByText("Teknik Pengelasan")).toBeInTheDocument();
    });
    await userEvent.selectOptions(konsentrasiSelect, "con-2");

    await waitFor(() => {
      expect(screen.queryByText("Alice")).not.toBeInTheDocument();
      expect(screen.getByText("Bob")).toBeInTheDocument();
    });
  });
});
