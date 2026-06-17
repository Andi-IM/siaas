import React from "react";
import { render, screen, waitFor, within, fireEvent, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import CurriculumPage from "@/app/kurikulum/page";
import { KurikulumFallback } from "@/app/kurikulum/fallback";
import { 
  getPrograms, getConcentrations, getSubjects,
  addProgram, updateProgram,
  addConcentration, updateConcentration,
  addSubject, updateSubject, deleteSubject 
} from "@/lib/data";

// Mock the data client
vi.mock("@/lib/data", () => ({
  getPrograms: vi.fn(),
  getConcentrations: vi.fn(),
  getSubjects: vi.fn(),
  addProgram: vi.fn(),
  updateProgram: vi.fn(),
  addConcentration: vi.fn(),
  updateConcentration: vi.fn(),
  addSubject: vi.fn(),
  updateSubject: vi.fn(),
  deleteSubject: vi.fn(),
}));

const mockPrograms = [
  { id: "prog-1", nama: "Teknik Mesin" },
  { id: "prog-2", nama: "Teknik Elektronika" },
];

const mockConcentrations = [
  { id: "con-1", programId: "prog-1", nama: "Teknik Pemesinan" },
  { id: "con-2", programId: "prog-1", nama: "Teknik Pengelasan" },
];

const mockSubjects = [
  { id: "sub-1", konsentrasiId: "con-1", nama: "Matematika", kode: "MTK", kategori: "Kelompok Umum" as const, sequence: 1, semesters: [1], status: "active" as const },
  { id: "sub-2", konsentrasiId: "con-1", nama: "Fisika", kode: "FSK", kategori: "Kelompok Kejuruan" as const, sequence: 2, semesters: [1, 2], status: "inactive" as const },
];

describe("CurriculumPage - Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
    
    (getPrograms as any).mockResolvedValue(mockPrograms);
    (getConcentrations as any).mockResolvedValue(mockConcentrations);
    (getSubjects as any).mockResolvedValue(mockSubjects);
    (addProgram as any).mockResolvedValue({ id: "prog-new", nama: "New Program" });
    (updateProgram as any).mockResolvedValue({ id: "prog-1", nama: "Updated Program" });
    (addConcentration as any).mockResolvedValue({ id: "con-new", programId: "prog-1", nama: "New Concentration" });
    (updateConcentration as any).mockResolvedValue({ id: "con-1", programId: "prog-1", nama: "Updated Concentration" });
    (addSubject as any).mockResolvedValue({ id: "sub-new", konsentrasiId: "con-1", nama: "New Subject", kode: "NS", kategori: "Kelompok Umum", sequence: 3, semesters: [1], status: "active" });
    (updateSubject as any).mockResolvedValue({ id: "sub-1", konsentrasiId: "con-1", nama: "Updated Subject", kode: "MTK", kategori: "Kelompok Umum", sequence: 1, semesters: [1], status: "active" });
    (deleteSubject as any).mockResolvedValue(true);
  });

  it("renders programs, concentrations, and subjects successfully and handles selection changes", async () => {
    const { container } = render(<CurriculumPage />);

    // Check initial render
    await waitFor(() => {
      expect(screen.getByText("Manajemen Kurikulum & Mata Pelajaran")).toBeInTheDocument();
    });

    // Check if getPrograms was called
    expect(getPrograms).toHaveBeenCalled();

    // Scope to sidebar to verify sidebar programs
    const sidebar = container.querySelector(".curriculum-sidebar") as HTMLElement;
    await waitFor(() => {
      expect(within(sidebar).getByText("Teknik Mesin")).toBeInTheDocument();
      expect(within(sidebar).getByText("Teknik Elektronika")).toBeInTheDocument();
    });

    // Check if getConcentrations was automatically called with the first program ID "prog-1"
    await waitFor(() => {
      expect(getConcentrations).toHaveBeenCalledWith("prog-1");
    });

    // Check concentrations lists are rendered in sidebar
    await waitFor(() => {
      expect(within(sidebar).getByText("Teknik Pemesinan")).toBeInTheDocument();
      expect(within(sidebar).getByText("Teknik Pengelasan")).toBeInTheDocument();
    });

    // Check if getSubjects was automatically called with the first concentration ID "con-1"
    await waitFor(() => {
      expect(getSubjects).toHaveBeenCalledWith("con-1");
    });

    // Check subjects table is rendered
    const main = container.querySelector(".curriculum-main") as HTMLElement;
    await waitFor(() => {
      expect(within(main).getByText("Matematika")).toBeInTheDocument();
      expect(within(main).getByText("Fisika")).toBeInTheDocument();
    });

    // Test selection change: Click the second program "Teknik Elektronika"
    const prog2Btn = within(sidebar).getByText("Teknik Elektronika");
    await userEvent.click(prog2Btn);

    // Verify it triggers fetch for concentrations of prog-2
    await waitFor(() => {
      expect(getConcentrations).toHaveBeenCalledWith("prog-2");
    });

    // Test concentration selection change: Click the second concentration "Teknik Pengelasan"
    const con2Btn = within(sidebar).getByText("Teknik Pengelasan");
    await userEvent.click(con2Btn);

    // Verify it triggers fetch for subjects of con-2
    await waitFor(() => {
      expect(getSubjects).toHaveBeenCalledWith("con-2");
    });
  });

  it("handles empty program list gracefully", async () => {
    (getPrograms as any).mockResolvedValue([]);
    render(<CurriculumPage />);

    // Since programs is empty, no concentrations or subjects are loaded
    await waitFor(() => {
      expect(screen.getByText("Pilih program keahlian")).toBeInTheDocument();
      expect(screen.getByText("Pilih Konsentrasi Keahlian")).toBeInTheDocument();
    });
  });

  it("handles empty concentration list gracefully", async () => {
    (getPrograms as any).mockResolvedValue(mockPrograms);
    (getConcentrations as any).mockResolvedValue([]);
    
    render(<CurriculumPage />);
    
    await waitFor(() => {
      expect(screen.getByText("Teknik Mesin")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText("Belum ada konsentrasi")).toBeInTheDocument();
      expect(screen.getByText("Pilih Konsentrasi Keahlian")).toBeInTheDocument();
    });
  });

  it("handles api loading errors gracefully in programs, concentrations, and subjects", async () => {
    // 1. Error in getPrograms
    (getPrograms as any).mockRejectedValue(new Error("Database error"));
    render(<CurriculumPage />);
    
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith("Failed to refresh programs:", expect.any(Error));
    });

    cleanup();

    // 2. Error in getConcentrations
    (getPrograms as any).mockResolvedValue(mockPrograms);
    (getConcentrations as any).mockRejectedValue(new Error("Network error"));
    
    render(<CurriculumPage />);
    
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith("Failed to refresh concentrations:", expect.any(Error));
    });

    cleanup();

    // 3. Error in getSubjects
    (getPrograms as any).mockResolvedValue(mockPrograms);
    (getConcentrations as any).mockResolvedValue(mockConcentrations);
    (getSubjects as any).mockRejectedValue(new Error("Timeout error"));

    render(<CurriculumPage />);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith("Failed to load subjects:", expect.any(Error));
    });
  });

  it("can add a program successfully", async () => {
    const { container } = render(<CurriculumPage />);
    await waitFor(() => {
      expect(screen.getByText("Teknik Mesin")).toBeInTheDocument();
    });

    const addProgBtn = screen.getByTitle("Tambah Program");
    await userEvent.click(addProgBtn);

    const dialog = container.querySelector("dialog");
    expect(dialog).toHaveAttribute("open");

    const input = screen.getByPlaceholderText("Contoh: Teknik Mesin");
    fireEvent.change(input, { target: { value: "Teknik Otomotif" } });

    const submitBtn = screen.getByRole("button", { name: "Simpan Program" });
    await userEvent.click(submitBtn);

    expect(addProgram).toHaveBeenCalledWith("Teknik Otomotif");
    expect(getPrograms).toHaveBeenCalled();
    expect(dialog).not.toHaveAttribute("open");
  });

  it("handles program addition errors gracefully", async () => {
    const { container } = render(<CurriculumPage />);
    await waitFor(() => {
      expect(screen.getByText("Teknik Mesin")).toBeInTheDocument();
    });

    const addProgBtn = screen.getByTitle("Tambah Program");
    await userEvent.click(addProgBtn);

    const dialog = container.querySelector("dialog");
    const input = screen.getByPlaceholderText("Contoh: Teknik Mesin");
    fireEvent.change(input, { target: { value: "Teknik Gagal" } });
    
    (addProgram as any).mockRejectedValueOnce(new Error("Save failed"));
    const submitBtn = screen.getByRole("button", { name: "Simpan Program" });
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith("Failed to submit program:", expect.any(Error));
    });
    expect(dialog).not.toHaveAttribute("open");
  });

  it("can edit a program successfully", async () => {
    const { container } = render(<CurriculumPage />);
    const sidebar = container.querySelector(".curriculum-sidebar") as HTMLElement;
    await waitFor(() => {
      expect(within(sidebar).getByText("Teknik Mesin")).toBeInTheDocument();
    });

    const progItem = within(sidebar).getByText("Teknik Mesin").closest("li");
    const editBtn = progItem!.querySelectorAll("button")[1];
    await userEvent.click(editBtn);

    const dialog = container.querySelector("dialog");
    expect(dialog).toHaveAttribute("open");

    const input = screen.getByPlaceholderText("Contoh: Teknik Mesin");
    expect(input).toHaveValue("Teknik Mesin");

    fireEvent.change(input, { target: { value: "Teknik Mesin Modern" } });

    const submitBtn = screen.getByRole("button", { name: "Simpan Program" });
    await userEvent.click(submitBtn);

    expect(updateProgram).toHaveBeenCalledWith("prog-1", "Teknik Mesin Modern");
    expect(getPrograms).toHaveBeenCalled();
    expect(dialog).not.toHaveAttribute("open");
  });

  it("handles program edit errors gracefully", async () => {
    const { container } = render(<CurriculumPage />);
    const sidebar = container.querySelector(".curriculum-sidebar") as HTMLElement;
    await waitFor(() => {
      expect(within(sidebar).getByText("Teknik Mesin")).toBeInTheDocument();
    });

    const progItem = within(sidebar).getByText("Teknik Mesin").closest("li");
    const editBtn = progItem!.querySelectorAll("button")[1];
    await userEvent.click(editBtn);

    const dialog = container.querySelector("dialog");
    const input = screen.getByPlaceholderText("Contoh: Teknik Mesin");
    fireEvent.change(input, { target: { value: "Teknik Gagal" } });

    (updateProgram as any).mockRejectedValueOnce(new Error("Update failed"));
    const submitBtn = screen.getByRole("button", { name: "Simpan Program" });
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith("Failed to submit program:", expect.any(Error));
    });
    expect(dialog).not.toHaveAttribute("open");
  });

  it("can add a concentration successfully", async () => {
    const { container } = render(<CurriculumPage />);
    const sidebar = container.querySelector(".curriculum-sidebar") as HTMLElement;
    await waitFor(() => {
      expect(within(sidebar).getByText("Teknik Pemesinan")).toBeInTheDocument();
    });

    const addConBtn = screen.getByTitle("Tambah Konsentrasi");
    await userEvent.click(addConBtn);

    const dialog = container.querySelector("dialog");
    expect(dialog).toHaveAttribute("open");

    const input = screen.getByPlaceholderText("Contoh: Teknik Pemesinan");
    fireEvent.change(input, { target: { value: "Teknik Gambar Mesin" } });

    const submitBtn = screen.getByRole("button", { name: "Simpan Konsentrasi" });
    await userEvent.click(submitBtn);

    expect(addConcentration).toHaveBeenCalledWith("prog-1", "Teknik Gambar Mesin");
    expect(getConcentrations).toHaveBeenCalledWith("prog-1");
    expect(dialog).not.toHaveAttribute("open");
  });

  it("handles concentration addition errors gracefully", async () => {
    const { container } = render(<CurriculumPage />);
    const sidebar = container.querySelector(".curriculum-sidebar") as HTMLElement;
    await waitFor(() => {
      expect(within(sidebar).getByText("Teknik Pemesinan")).toBeInTheDocument();
    });

    const addConBtn = screen.getByTitle("Tambah Konsentrasi");
    await userEvent.click(addConBtn);

    const dialog = container.querySelector("dialog");
    const input = screen.getByPlaceholderText("Contoh: Teknik Pemesinan");
    fireEvent.change(input, { target: { value: "Konsentrasi Gagal" } });

    (addConcentration as any).mockRejectedValueOnce(new Error("Add concentration failed"));
    const submitBtn = screen.getByRole("button", { name: "Simpan Konsentrasi" });
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith("Failed to submit concentration:", expect.any(Error));
    });
    expect(dialog).not.toHaveAttribute("open");
  });

  it("can edit a concentration successfully", async () => {
    const { container } = render(<CurriculumPage />);
    const sidebar = container.querySelector(".curriculum-sidebar") as HTMLElement;
    await waitFor(() => {
      expect(within(sidebar).getByText("Teknik Pemesinan")).toBeInTheDocument();
    });

    const conItem = within(sidebar).getByText("Teknik Pemesinan").closest("li");
    const editBtn = conItem!.querySelectorAll("button")[1];
    await userEvent.click(editBtn);

    const dialog = container.querySelector("dialog");
    expect(dialog).toHaveAttribute("open");

    const input = screen.getByPlaceholderText("Contoh: Teknik Pemesinan");
    expect(input).toHaveValue("Teknik Pemesinan");

    fireEvent.change(input, { target: { value: "Teknik Pemesinan CNC" } });

    const submitBtn = screen.getByRole("button", { name: "Simpan Konsentrasi" });
    await userEvent.click(submitBtn);

    expect(updateConcentration).toHaveBeenCalledWith("con-1", "Teknik Pemesinan CNC");
    expect(getConcentrations).toHaveBeenCalledWith("prog-1");
    expect(dialog).not.toHaveAttribute("open");
  });

  it("handles concentration edit errors gracefully", async () => {
    const { container } = render(<CurriculumPage />);
    const sidebar = container.querySelector(".curriculum-sidebar") as HTMLElement;
    await waitFor(() => {
      expect(within(sidebar).getByText("Teknik Pemesinan")).toBeInTheDocument();
    });

    const conItem = within(sidebar).getByText("Teknik Pemesinan").closest("li");
    const editBtn = conItem!.querySelectorAll("button")[1];
    await userEvent.click(editBtn);

    const dialog = container.querySelector("dialog");
    const input = screen.getByPlaceholderText("Contoh: Teknik Pemesinan");
    fireEvent.change(input, { target: { value: "Konsentrasi Gagal" } });

    (updateConcentration as any).mockRejectedValueOnce(new Error("Update concentration failed"));
    const submitBtn = screen.getByRole("button", { name: "Simpan Konsentrasi" });
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith("Failed to submit concentration:", expect.any(Error));
    });
    expect(dialog).not.toHaveAttribute("open");
  });

  it("can add a subject successfully", async () => {
    const { container } = render(<CurriculumPage />);
    await waitFor(() => {
      expect(screen.getByText("Matematika")).toBeInTheDocument();
    });

    const addSubjectBtn = screen.getByRole("button", { name: /tambah mapel/i });
    await userEvent.click(addSubjectBtn);

    const dialog = container.querySelector("dialog");
    expect(dialog).toHaveAttribute("open");

    const sequenceInput = container.querySelector('input[type="number"]')!;
    const kodeInput = screen.getByPlaceholderText("Contoh: PAI");
    const namaInput = screen.getByPlaceholderText("Nama lengkap mata pelajaran");

    // Trigger the sequence empty onChange branch (parseInt || 0)
    fireEvent.change(sequenceInput, { target: { value: "" } });
    fireEvent.change(sequenceInput, { target: { value: "3" } });
    fireEvent.change(kodeInput, { target: { value: "KIM" } });
    fireEvent.change(namaInput, { target: { value: "Kimia" } });

    const s1Checkbox = screen.getByLabelText("S1");
    const s2Checkbox = screen.getByLabelText("S2");

    fireEvent.click(s1Checkbox);
    fireEvent.click(s2Checkbox);

    const selects = container.querySelectorAll("select");
    const kategoriSelect = selects[0];
    const statusSelect = selects[1];

    fireEvent.change(kategoriSelect, { target: { value: "Kelompok Kejuruan" } });
    fireEvent.change(statusSelect, { target: { value: "active" } });

    const submitBtn = screen.getByRole("button", { name: "Simpan Mapel" });
    await userEvent.click(submitBtn);

    expect(addSubject).toHaveBeenCalledWith({
      nama: "Kimia",
      kode: "KIM",
      kategori: "Kelompok Kejuruan",
      sequence: 3,
      semesters: [2],
      status: "active",
      konsentrasiId: "con-1",
    });
    expect(dialog).not.toHaveAttribute("open");
  });

  it("handles subject addition errors gracefully", async () => {
    const { container } = render(<CurriculumPage />);
    await waitFor(() => {
      expect(screen.getByText("Matematika")).toBeInTheDocument();
    });

    const addSubjectBtn = screen.getByRole("button", { name: /tambah mapel/i });
    await userEvent.click(addSubjectBtn);

    const dialog = container.querySelector("dialog");
    const sequenceInput = container.querySelector('input[type="number"]')!;
    const kodeInput = screen.getByPlaceholderText("Contoh: PAI");
    const namaInput = screen.getByPlaceholderText("Nama lengkap mata pelajaran");

    fireEvent.change(sequenceInput, { target: { value: "3" } });
    fireEvent.change(kodeInput, { target: { value: "KIM" } });
    fireEvent.change(namaInput, { target: { value: "Kimia Gagal" } });

    (addSubject as any).mockRejectedValueOnce(new Error("Add subject failed"));
    const submitBtn = screen.getByRole("button", { name: "Simpan Mapel" });
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith("Failed to submit subject:", expect.any(Error));
    });
    expect(dialog).not.toHaveAttribute("open");
  });

  it("can edit a subject successfully", async () => {
    const { container } = render(<CurriculumPage />);
    await waitFor(() => {
      expect(screen.getByText("Matematika")).toBeInTheDocument();
    });

    const row = screen.getByText("Matematika").closest("tr")!;
    const editBtn = within(row).getByTitle("Edit");
    await userEvent.click(editBtn);

    const dialog = container.querySelector("dialog");
    expect(dialog).toHaveAttribute("open");

    const namaInput = screen.getByPlaceholderText("Nama lengkap mata pelajaran");
    expect(namaInput).toHaveValue("Matematika");

    fireEvent.change(namaInput, { target: { value: "Matematika Lanjut" } });

    const submitBtn = screen.getByRole("button", { name: "Simpan Mapel" });
    await userEvent.click(submitBtn);

    expect(updateSubject).toHaveBeenCalledWith("sub-1", {
      nama: "Matematika Lanjut",
      kode: "MTK",
      kategori: "Kelompok Umum",
      sequence: 1,
      semesters: [1],
      status: "active",
    });
    expect(dialog).not.toHaveAttribute("open");
  });

  it("handles subject edit errors gracefully", async () => {
    const { container } = render(<CurriculumPage />);
    await waitFor(() => {
      expect(screen.getByText("Matematika")).toBeInTheDocument();
    });

    const row = screen.getByText("Matematika").closest("tr")!;
    const editBtn = within(row).getByTitle("Edit");
    await userEvent.click(editBtn);

    const dialog = container.querySelector("dialog");
    const namaInput = screen.getByPlaceholderText("Nama lengkap mata pelajaran");

    fireEvent.change(namaInput, { target: { value: "Matematika Gagal" } });

    (updateSubject as any).mockRejectedValueOnce(new Error("Update subject failed"));
    const submitBtn = screen.getByRole("button", { name: "Simpan Mapel" });
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith("Failed to submit subject:", expect.any(Error));
    });
    expect(dialog).not.toHaveAttribute("open");
  });

  it("can delete a subject (both confirming and cancelling) and handles delete errors", async () => {
    render(<CurriculumPage />);
    await waitFor(() => {
      expect(screen.getByText("Matematika")).toBeInTheDocument();
    });

    const row = screen.getByText("Matematika").closest("tr")!;
    const deleteBtn = within(row).getByTitle("Hapus");

    // Case 1: Cancel deletion via modal
    await userEvent.click(deleteBtn);

    let dialog = document.querySelector("dialog")!;
    expect(dialog).toHaveAttribute("open");
    expect(screen.getByText("Hapus Mata Pelajaran")).toBeInTheDocument();
    expect(within(dialog).getByText(/Matematika/)).toBeInTheDocument();

    const batalBtn = within(dialog).getByRole("button", { name: "Batal" });
    await userEvent.click(batalBtn);

    await waitFor(() => {
      expect(dialog).not.toHaveAttribute("open");
    });
    expect(deleteSubject).not.toHaveBeenCalled();

    // Case 2: Confirm deletion
    await userEvent.click(deleteBtn);

    dialog = document.querySelector("dialog")!;
    expect(dialog).toHaveAttribute("open");

    const hapusBtn = within(dialog).getByRole("button", { name: "Hapus" });
    await userEvent.click(hapusBtn);

    await waitFor(() => {
      expect(deleteSubject).toHaveBeenCalledWith("sub-1");
    });
    expect(getSubjects).toHaveBeenCalledWith("con-1");
    await waitFor(() => {
      expect(dialog).not.toHaveAttribute("open");
    });

    // Case 3: Error during deletion
    (deleteSubject as any).mockRejectedValueOnce(new Error("Delete failed"));
    await userEvent.click(deleteBtn);

    dialog = document.querySelector("dialog")!;
    expect(dialog).toHaveAttribute("open");
    const hapusBtn2 = within(dialog).getByRole("button", { name: "Hapus" });
    await userEvent.click(hapusBtn2);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith("Failed to delete subject:", expect.any(Error));
    });
    await waitFor(() => {
      expect(dialog).not.toHaveAttribute("open");
    });
  });

  it("closes modals when clicking close button or Batal button", async () => {
    const { container } = render(<CurriculumPage />);
    await waitFor(() => {
      expect(screen.getByText("Teknik Mesin")).toBeInTheDocument();
    });

    const addProgBtn = screen.getByTitle("Tambah Program");
    await userEvent.click(addProgBtn);

    const dialog = container.querySelector("dialog");
    expect(dialog).toHaveAttribute("open");

    // Click Close (X) button
    const closeBtn = screen.getByLabelText("Tutup");
    await userEvent.click(closeBtn);
    expect(dialog).not.toHaveAttribute("open");

    // Open again
    await userEvent.click(addProgBtn);
    expect(dialog).toHaveAttribute("open");

    // Click Batal button
    const batalBtn = screen.getByRole("button", { name: "Batal" });
    await userEvent.click(batalBtn);
    expect(dialog).not.toHaveAttribute("open");
  });

  it("handles delete subject when selectedKonsentrasiId is cleared during deletion", async () => {
    const { container } = render(<CurriculumPage />);
    await waitFor(() => {
      expect(screen.getByText("Matematika")).toBeInTheDocument();
    });

    const sidebar = container.querySelector(".curriculum-sidebar") as HTMLElement;
    const row = screen.getByText("Matematika").closest("tr")!;
    const deleteBtn = within(row).getByTitle("Hapus");

    await userEvent.click(deleteBtn);

    const dialog = document.querySelector("dialog")!;
    expect(dialog).toHaveAttribute("open");

    let resolveDelete: any;
    (deleteSubject as any).mockImplementationOnce(() => new Promise((resolve) => {
      resolveDelete = resolve;
    }));

    const hapusBtn = within(dialog).getByRole("button", { name: "Hapus" });
    await userEvent.click(hapusBtn);

    expect(deleteSubject).toHaveBeenCalledWith("sub-1");

    (getConcentrations as any).mockResolvedValueOnce([]);
    const prog2Btn = within(sidebar).getByText("Teknik Elektronika");
    await userEvent.click(prog2Btn);

    await waitFor(() => {
      expect(screen.getByText("Pilih Konsentrasi Keahlian")).toBeInTheDocument();
    });

    resolveDelete(true);
    expect(getSubjects).toHaveBeenCalledTimes(1);
  });

  it("renders KurikulumFallback correctly", () => {
    const { container } = render(<KurikulumFallback />);
    expect(container.querySelector(".skeleton")).toBeInTheDocument();
  });

  it("does not update subjects state if unmounted before fetch resolves", async () => {
    let resolvePromise: any;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    (getSubjects as any).mockReturnValue(promise);

    const { unmount } = render(<CurriculumPage />);
    
    await waitFor(() => {
      expect(getSubjects).toHaveBeenCalled();
    });

    unmount();
    resolvePromise([]);
  });
});
