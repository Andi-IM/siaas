import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import StudentTranscriptView from "@/app/siswa/transkrip/StudentTranscriptView";
import { getStudentByNis, getGradesByStudent, getConcentrations, getSubjects } from "@/lib/data";



vi.mock("@/lib/data", () => ({
  getStudentByNis: vi.fn(),
  getGradesByStudent: vi.fn(),
  getConcentrations: vi.fn(),
  getSubjects: vi.fn(),
}));

describe("StudentTranscriptView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (window as any).alert = vi.fn();
    (window as any).print = vi.fn();
  });

  it("renders loading state initially", () => {
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
    (getStudentByNis as any).mockResolvedValue({
      nis: "11111", nisn: "000111", nama: "Alice Smith",
      kompetensi: "Teknik Pemesinan", tempatLahir: "Padang", tanggalLahir: "2008-01-01",
      nomorIjazah: "IJ-001", tanggalKelulusan: "2026-06-14",
    });
    (getConcentrations as any).mockResolvedValue([{ id: "con-1", nama: "Teknik Pemesinan" }]);
    (getSubjects as any).mockResolvedValue([
      { id: "sub-1", nama: "Matematika", kode: "MTK", kategori: "Kelompok Umum", transcriptGroup: "UMUM", sequence: 1, status: "active" },
    ]);
    (getGradesByStudent as any).mockResolvedValue([
      { subject_id: "sub-1", semester_sequence: 1, grade: 80, category: "Kelompok Umum" },
    ]);

    const { container } = render(<StudentTranscriptView nis="11111" />);
    await waitFor(() => expect(screen.getByText(/Alice Smith/)).toBeInTheDocument());

    const tableContainer = container.querySelector(".table-container.no-print")!;
    expect(within(tableContainer as HTMLElement).getByText("Matematika")).toBeInTheDocument();
    expect(within(tableContainer as HTMLElement).getAllByText("80").length).toBeGreaterThan(0);
  });

  it("switches to 'Transkrip Nilai' (Supplement) mode and correctly aggregates grades", async () => {
    (getStudentByNis as any).mockResolvedValue({
      nis: "11111", nisn: "000111", nama: "Alice Smith",
      kompetensi: "Teknik Pemesinan", tempatLahir: "Padang", tanggalLahir: "2008-01-01",
      nomorIjazah: "IJ-001", tanggalKelulusan: "2026-06-14",
    });
    (getConcentrations as any).mockResolvedValue([{ id: "con-1", nama: "Teknik Pemesinan" }]);
    (getSubjects as any).mockResolvedValue([
      { id: "sub-1", nama: "Matematika", kode: "MTK", kategori: "Kelompok Umum", transcriptGroup: "UMUM", sequence: 1, status: "active" },
      { id: "sub-2", nama: "Fisika", kode: "FSK", kategori: "Kelompok Kejuruan", transcriptGroup: "KEJURUAN_UMUM", sequence: 2, status: "active" },
      { id: "sub-3", nama: "Dasar Teknik Mesin", kode: "DTM", kategori: "Kelompok Kejuruan", transcriptGroup: "KEJURUAN_DASAR", sequence: 3, status: "active" },
      { id: "sub-4", nama: "Bubut", kode: "BBT", kategori: "Kelompok Kejuruan", transcriptGroup: "KEJURUAN_KONSENTRASI", sequence: 4, status: "active" },
      { id: "sub-5", nama: "UKK", kode: "UKK", kategori: "Kelompok Kejuruan", transcriptGroup: "UKK", sequence: 5, status: "active" },
    ]);
    (getGradesByStudent as any).mockResolvedValue([
      { subject_id: "sub-1", semester_sequence: 1, grade: 80, category: "Kelompok Umum" },
      { subject_id: "sub-1", semester_sequence: 2, grade: 90, category: "Kelompok Umum" },
      { subject_id: "sub-3", semester_sequence: 1, grade: 70, category: "Kelompok Kejuruan" },
      { subject_id: "sub-3", semester_sequence: 2, grade: 80, category: "Kelompok Kejuruan" },
      { subject_id: "sub-3", semester_sequence: 3, grade: 90, category: "Kelompok Kejuruan" },
      { subject_id: "sub-4", semester_sequence: 3, grade: 85, category: "Kelompok Kejuruan" },
      { subject_id: "sub-4", semester_sequence: 4, grade: 85, category: "Kelompok Kejuruan" },
      { subject_id: "sub-4", semester_sequence: 6, grade: 90, category: "Kelompok Kejuruan" },
      { subject_id: "sub-5", semester_sequence: 99, grade: 95, category: "Kelompok Kejuruan" },
    ]);

    const { container } = render(<StudentTranscriptView nis="11111" />);

    await waitFor(() => {
      expect(screen.getByText(/Alice Smith/)).toBeInTheDocument();
    });

    const supplementBtn = screen.getByRole("button", { name: "Transkrip Nilai" });
    await userEvent.click(supplementBtn);

    const tableContainer = container.querySelector(".table-container.no-print")!;
    expect(within(tableContainer as HTMLElement).getByText("Nilai")).toBeInTheDocument();
    expect(within(tableContainer as HTMLElement).getByText("Konsentrasi Keahlian")).toBeInTheDocument();

    const dtmRow = within(tableContainer as HTMLElement).getByText("Dasar Teknik Mesin").closest("tr")!;
    expect(within(dtmRow).getByText("75.00")).toBeInTheDocument();

    const kkRow = within(tableContainer as HTMLElement).getByText("Konsentrasi Keahlian").closest("tr")!;
    expect(within(kkRow).getByText("88.75")).toBeInTheDocument();
  });

  it("switches back to 'Transkrip 3 Tahun' mode from supplement mode", async () => {
    (getStudentByNis as any).mockResolvedValue({
      nis: "11111", nisn: "000111", nama: "Alice Smith",
      kompetensi: "Teknik Pemesinan", tempatLahir: "Padang", tanggalLahir: "2008-01-01",
      nomorIjazah: "IJ-001", tanggalKelulusan: "2026-06-14",
    });
    (getConcentrations as any).mockResolvedValue([{ id: "con-1", nama: "Teknik Pemesinan" }]);
    (getSubjects as any).mockResolvedValue([
      { id: "sub-1", nama: "Matematika", kode: "MTK", kategori: "Kelompok Umum", transcriptGroup: "UMUM", sequence: 1, status: "active" },
    ]);
    (getGradesByStudent as any).mockResolvedValue([]);

    render(<StudentTranscriptView nis="11111" />);

    await waitFor(() => {
      expect(screen.getByText(/Alice Smith/)).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: "Transkrip Nilai" }));
    expect(screen.getByRole("button", { name: "Transkrip Nilai" })).toHaveClass("btn--primary");

    await userEvent.click(screen.getByRole("button", { name: "Transkrip 3 Tahun" }));
    expect(screen.getByRole("button", { name: "Transkrip 3 Tahun" })).toHaveClass("btn--primary");
    expect(screen.queryByRole("button", { name: /Transkrip Nilai/ })).toHaveClass("btn--secondary");
  });

  it("reorders MAPIL subject to the end in supplement mode", async () => {
    (getStudentByNis as any).mockResolvedValue({
      nis: "11111", nisn: "000111", nama: "Alice Smith",
      kompetensi: "Teknik Pemesinan", tempatLahir: "Padang", tanggalLahir: "2008-01-01",
      nomorIjazah: "IJ-001", tanggalKelulusan: "2026-06-14",
    });
    (getConcentrations as any).mockResolvedValue([{ id: "con-1", nama: "Teknik Pemesinan" }]);
    (getSubjects as any).mockResolvedValue([
      { id: "sub-1", nama: "Matematika", kode: "MTK", kategori: "Kelompok Umum", transcriptGroup: "UMUM", sequence: 1, status: "active" },
      { id: "sub-mp", nama: "MAPIL", kode: "MAPIL", kategori: "Kelompok Kejuruan", transcriptGroup: "KEJURUAN_UMUM", sequence: 2, status: "active" },
      { id: "sub-7", nama: "DDK", kode: "DDK", kategori: "Kelompok Kejuruan", transcriptGroup: "KEJURUAN_DASAR", sequence: 7, status: "active" },
    ]);
    (getGradesByStudent as any).mockResolvedValue([
      { subject_id: "sub-7", semester_sequence: 1, grade: 70, category: "Kelompok Kejuruan" },
    ]);

    const { container } = render(<StudentTranscriptView nis="11111" />);

    await waitFor(() => {
      expect(screen.getByText(/Alice Smith/)).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: "Transkrip Nilai" }));

    const subjectNames = ["Matematika", "MAPIL", "DDK"];
    const tableContainer = container.querySelector(".table-container.no-print")!;
    const cells = within(tableContainer as HTMLElement).getAllByRole("cell");
    const visibleSubjects = cells.filter((cell) => subjectNames.includes(cell.textContent?.trim() || ""));
    const names = visibleSubjects.map((cell) => cell.textContent?.trim());
    const mapilIndex = names.indexOf("MAPIL");
    expect(mapilIndex).toBeGreaterThan(-1);
    expect(mapilIndex).toBe(names.length - 1);
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
    (getStudentByNis as any).mockResolvedValue({
      nis: "11111", nisn: "000111", nama: "Alice Smith",
      kompetensi: "Teknik Pemesinan", tempatLahir: "Padang", tanggalLahir: "2008-01-01",
      nomorIjazah: "IJ-001", tanggalKelulusan: "2026-06-14",
    });
    (getConcentrations as any).mockResolvedValue([]);
    (getSubjects as any).mockResolvedValue([]);
    (getGradesByStudent as any).mockResolvedValue([]);

    render(<StudentTranscriptView nis="11111" />);

    await waitFor(() => {
      expect(screen.getByText(/Alice Smith/)).toBeInTheDocument();
    });

    const printBtn = screen.getByText("Cetak Transkrip");
    await userEvent.click(printBtn);

    expect(window.print).toHaveBeenCalled();
  });
});
