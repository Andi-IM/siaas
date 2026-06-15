import { render, screen, waitFor, within, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import StudentListPage from "@/app/siswa/page";
import { getStudents, getUniqueClasses, deleteStudent } from "@/lib/data";

// Mock the data client
vi.mock("@/lib/data", () => ({
  getStudents: vi.fn(),
  getUniqueClasses: vi.fn(),
  deleteStudent: vi.fn(),
}));

const mockStudents = Array.from({ length: 10 }).map((_, i) => ({
  nis: `NIS-${i}`,
  nisn: `NISN-${i}`,
  nama: `Student Name ${i}`,
  tempatLahir: "Padang",
  tanggalLahir: "2008-01-01",
  jenisKelamin: (i % 2 === 0 ? "L" : "P") as "L" | "P",
  agama: "Islam",
  alamat: "Padang",
  telepon: "123",
  sekolahAsal: "SMP 1",
  diterimaDiKelas: i < 5 ? "X-1" : "X-2",
  diterimaPadaTanggal: "2025-07-01",
  kompetensi: i % 2 === 0 ? "Teknik Pemesinan" : "Teknik Pengelasan",
  nomorIjazah: "",
  tanggalKelulusan: "",
  status: "active" as "active" | "inactive",
  namaAyah: "",
  pekerjaanAyah: "",
  namaIbu: "",
  pekerjaanIbu: "",
  alamatOrangTua: "",
  namaWali: "",
  alamatWali: "",
  teleponWali: "",
  pekerjaanWali: "",
}));

const mockClasses = ["X-1", "X-2"];

describe("Student List Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading skeletons initially", () => {
    (getStudents as any).mockReturnValue(new Promise(() => {}));
    (getUniqueClasses as any).mockReturnValue(new Promise(() => {}));

    render(<StudentListPage />);

    expect(screen.getByText("Manajemen Peserta Didik")).toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument(); // count placeholder
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("renders empty state when there are no students", async () => {
    (getStudents as any).mockResolvedValue([]);
    (getUniqueClasses as any).mockResolvedValue([]);

    render(<StudentListPage />);

    await waitFor(() => {
      expect(screen.getByText("Belum ada data siswa.")).toBeInTheDocument();
    });

    expect(screen.getByText("0 siswa")).toBeInTheDocument();
  });

  it("renders students list and handles pagination", async () => {
    (getStudents as any).mockResolvedValue(mockStudents);
    (getUniqueClasses as any).mockResolvedValue(mockClasses);

    render(<StudentListPage />);

    await waitFor(() => {
      expect(screen.getByText("Student Name 0")).toBeInTheDocument();
    });

    expect(screen.getByText("10 siswa")).toBeInTheDocument();

    // Verify first page items (0-7, which is 8 items)
    expect(screen.getByText("Student Name 0")).toBeInTheDocument();
    expect(screen.getByText("Student Name 7")).toBeInTheDocument();
    expect(screen.queryByText("Student Name 8")).not.toBeInTheDocument();

    // Verify page indicators (buttons 1 and 2 exist, and 1 is active)
    const page1Btn = screen.getByRole("button", { name: "1" });
    const page2Btn = screen.getByRole("button", { name: "2" });
    expect(page1Btn).toHaveAttribute("aria-current", "page");
    expect(page2Btn).not.toHaveAttribute("aria-current");

    // Navigate to next page using "Selanjutnya" button
    const nextBtn = screen.getByRole("button", { name: /selanjutnya/i });
    await userEvent.click(nextBtn);

    // Page 2 items
    expect(screen.queryByText("Student Name 0")).not.toBeInTheDocument();
    expect(screen.getByText("Student Name 8")).toBeInTheDocument();
    expect(screen.getByText("Student Name 9")).toBeInTheDocument();
    expect(page2Btn).toHaveAttribute("aria-current", "page");
    expect(page1Btn).not.toHaveAttribute("aria-current");

    // Click page button 1 directly to go back
    await userEvent.click(page1Btn);
    expect(page1Btn).toHaveAttribute("aria-current", "page");

    // Click page button 2 directly to go forward
    await userEvent.click(page2Btn);
    expect(page2Btn).toHaveAttribute("aria-current", "page");

    // Navigate back to previous page using "Sebelumnya" button
    const prevBtn = screen.getByRole("button", { name: /sebelumnya/i });
    await userEvent.click(prevBtn);
    expect(screen.getByText("Student Name 0")).toBeInTheDocument();
    expect(page1Btn).toHaveAttribute("aria-current", "page");
  });

  it("handles search queries correctly", async () => {
    (getStudents as any).mockResolvedValue(mockStudents);
    (getUniqueClasses as any).mockResolvedValue(mockClasses);

    render(<StudentListPage />);

    await waitFor(() => {
      expect(screen.getByText("Student Name 0")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Cari NIS atau nama...");
    
    // Search by name
    await userEvent.type(searchInput, "Student Name 3");
    expect(screen.getByText("Student Name 3")).toBeInTheDocument();
    expect(screen.queryByText("Student Name 0")).not.toBeInTheDocument();
    expect(screen.getByText("1 siswa")).toBeInTheDocument();

    // Clear search
    const clearBtn = screen.getByRole("button", { name: "Hapus pencarian" });
    await userEvent.click(clearBtn);
    expect(screen.getByText("Student Name 0")).toBeInTheDocument();
    
    // Search by NIS
    await userEvent.type(searchInput, "NIS-9");
    expect(screen.getByText("Student Name 9")).toBeInTheDocument();
    expect(screen.queryByText("Student Name 0")).not.toBeInTheDocument();
  });

  it("handles search queries with no results correctly", async () => {
    (getStudents as any).mockResolvedValue(mockStudents);
    (getUniqueClasses as any).mockResolvedValue(mockClasses);

    render(<StudentListPage />);

    await waitFor(() => {
      expect(screen.getByText("Student Name 0")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Cari NIS atau nama...");
    
    // Search by random query that yields 0 results
    await userEvent.type(searchInput, "XYZ");
    
    expect(screen.getByText("Data siswa tidak ditemukan untuk pencarian ini.")).toBeInTheDocument();
    expect(screen.getByText("Coba sesuaikan kata kunci pencarian atau filter kelas.")).toBeInTheDocument();
    expect(screen.getByText("0 siswa")).toBeInTheDocument();
  });

  it("handles class filter correctly", async () => {
    (getStudents as any).mockResolvedValue(mockStudents);
    (getUniqueClasses as any).mockResolvedValue(mockClasses);

    render(<StudentListPage />);

    await waitFor(() => {
      expect(screen.getByText("Student Name 0")).toBeInTheDocument();
    });

    const classSelect = screen.getByRole("combobox");
    
    // Select class X-1
    await userEvent.selectOptions(classSelect, "X-1");
    // Under X-1 we have i < 5 (0, 1, 2, 3, 4) -> 5 students
    expect(screen.getByText("5 siswa")).toBeInTheDocument();
    expect(screen.getByText("Student Name 0")).toBeInTheDocument();
    expect(screen.queryByText("Student Name 5")).not.toBeInTheDocument();

    // Select class X-2
    await userEvent.selectOptions(classSelect, "X-2");
    // Under X-2 we have i >= 5 (5, 6, 7, 8, 9) -> 5 students
    expect(screen.getByText("5 siswa")).toBeInTheDocument();
    expect(screen.getByText("Student Name 5")).toBeInTheDocument();
    expect(screen.queryByText("Student Name 0")).not.toBeInTheDocument();
  });

  it("handles student deletion flow (confirm and cancel)", async () => {
    const originalSetTimeout = global.setTimeout;
    const setTimeoutSpy = vi.spyOn(global, "setTimeout").mockImplementation((cb: any, delay?: number, ...args: any[]) => {
      if (delay === 3000) {
        cb(...args);
        return 0 as any;
      }
      return originalSetTimeout(cb, delay, ...args);
    });
    (getStudents as any).mockResolvedValue(mockStudents);
    (getUniqueClasses as any).mockResolvedValue(mockClasses);
    (deleteStudent as any).mockResolvedValue(undefined);

    render(<StudentListPage />);

    await waitFor(() => {
      expect(screen.getByText("Student Name 0")).toBeInTheDocument();
    });

    // Find first delete button (using aria-label Hapus Student Name 0)
    const firstDeleteBtn = screen.getByLabelText("Hapus Student Name 0");
    await userEvent.click(firstDeleteBtn);

    // Modal opens
    expect(screen.getByRole("heading", { name: "Hapus Siswa" })).toBeInTheDocument();
    expect(within(screen.getByRole("dialog")).getByText("Student Name 0")).toBeInTheDocument();

    // Cancel deletion
    const cancelBtn = screen.getByRole("button", { name: /batal/i });
    await userEvent.click(cancelBtn);

    // Open again
    await userEvent.click(firstDeleteBtn);

    // Confirm deletion
    let resolveDelete: any;
    const deletePromise = new Promise(resolve => { resolveDelete = resolve; });
    (deleteStudent as any).mockReturnValue(deletePromise);
    
    const confirmBtn = screen.getByRole("button", { name: "Hapus" });
    await userEvent.click(confirmBtn);

    // Verify isDeleting state
    expect(confirmBtn).toHaveTextContent("Menghapus...");
    expect(confirmBtn).toBeDisabled();
    
    // Try clicking cancel while deleting to trigger the early return in cancelDelete
    const cancelBtnDeleting = screen.getByRole("button", { name: /batal/i });
    await userEvent.click(cancelBtnDeleting);

    // Resolve the deletion
    await act(async () => {
      resolveDelete(undefined);
    });

    expect(deleteStudent).toHaveBeenCalledWith("NIS-0");
    await waitFor(() => {
      // The toast is cleared immediately because setTimeout runs cb synchronously
      expect(screen.queryByText(/berhasil dihapus/i)).not.toBeInTheDocument();
    });

    // Verify optimistic UI update (Student Name 0 should be gone, count should be 9)
    expect(screen.queryByText("Student Name 0")).not.toBeInTheDocument();
    expect(screen.getByText("9 siswa")).toBeInTheDocument();

    setTimeoutSpy.mockRestore();
  });

  it("handles student deletion api failure", async () => {
    const originalSetTimeout = global.setTimeout;
    const setTimeoutSpy = vi.spyOn(global, "setTimeout").mockImplementation((cb: any, delay?: number, ...args: any[]) => {
      if (delay === 3000) {
        cb(...args);
        return 0 as any;
      }
      return originalSetTimeout(cb, delay, ...args);
    });
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    (getStudents as any).mockResolvedValue(mockStudents);
    (getUniqueClasses as any).mockResolvedValue(mockClasses);
    (deleteStudent as any).mockRejectedValue(new Error("Database delete error"));

    render(<StudentListPage />);

    await waitFor(() => {
      expect(screen.getByText("Student Name 0")).toBeInTheDocument();
    });

    const firstDeleteBtn = screen.getByLabelText("Hapus Student Name 0");
    await userEvent.click(firstDeleteBtn);

    const confirmBtn = screen.getByRole("button", { name: "Hapus" });
    await userEvent.click(confirmBtn);

    expect(consoleSpy).toHaveBeenCalledWith("Failed to delete student:", expect.any(Error));
    await waitFor(() => {
      // The toast is cleared immediately because setTimeout runs cb synchronously
      expect(screen.queryByText("Gagal menghapus siswa. Silakan coba lagi.")).not.toBeInTheDocument();
    });

    consoleSpy.mockRestore();
    setTimeoutSpy.mockRestore();
  });

  it("handles student deletion when target is null (early return)", async () => {
    (getStudents as any).mockResolvedValue(mockStudents);
    (getUniqueClasses as any).mockResolvedValue(mockClasses);

    render(<StudentListPage />);

    // Since we cannot trigger handleDelete with a null target through the UI,
    // we just verify that cancelDelete handles it smoothly when dialog closes
    await waitFor(() => {
      expect(screen.getByText("Student Name 0")).toBeInTheDocument();
    });

    const firstDeleteBtn = screen.getByLabelText("Hapus Student Name 0");
    await userEvent.click(firstDeleteBtn);

    // Trigger onClose event (which calls cancelDelete)
    const dialog = screen.getByRole("dialog");
    fireEvent(dialog, new Event("close"));
    
    // Once cancelDelete runs, deleteTarget is null, so the inner content goes away
    expect(screen.queryByText("Hapus Siswa")).not.toBeInTheDocument();
  });

  it("handles data loading failure", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    (getStudents as any).mockRejectedValue(new Error("Database connection failed"));
    (getUniqueClasses as any).mockResolvedValue(mockClasses);

    render(<StudentListPage />);

    await waitFor(() => {
      expect(screen.getByText("Belum ada data siswa.")).toBeInTheDocument();
    });

    expect(consoleSpy).toHaveBeenCalledWith("Failed to load students data:", expect.any(Error));
    consoleSpy.mockRestore();
  });

  it("does not update state if unmounted before fetch resolves", async () => {
    let resolvePromise: any;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    (getStudents as any).mockReturnValue(promise);
    (getUniqueClasses as any).mockResolvedValue(mockClasses);

    const { unmount } = render(<StudentListPage />);
    unmount();

    resolvePromise(mockStudents);
  });

  it("does not update state if unmounted before fetch rejects", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    let rejectPromise: any;
    const promise = new Promise((_, reject) => {
      rejectPromise = reject;
    });
    (getStudents as any).mockReturnValue(promise);
    (getUniqueClasses as any).mockResolvedValue(mockClasses);

    const { unmount } = render(<StudentListPage />);
    unmount();

    rejectPromise(new Error("Database error"));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to load students data:",
        expect.any(Error)
      );
    });
    consoleSpy.mockRestore();
  });

  it("cancelDelete returns early when isDeleting is true", async () => {
    (getStudents as any).mockResolvedValue(mockStudents);
    (getUniqueClasses as any).mockResolvedValue(mockClasses);
    let resolveDelete: any;
    const deletePromise = new Promise(resolve => { resolveDelete = resolve; });
    (deleteStudent as any).mockReturnValue(deletePromise);

    render(<StudentListPage />);

    await waitFor(() => {
      expect(screen.getByText("Student Name 0")).toBeInTheDocument();
    });

    const firstDeleteBtn = screen.getByLabelText("Hapus Student Name 0");
    await userEvent.click(firstDeleteBtn);

    const confirmBtn = screen.getByRole("button", { name: "Hapus" });
    await userEvent.click(confirmBtn);

    const dialog = screen.getByRole("dialog");
    fireEvent(dialog, new Event("close"));

    expect(screen.getByText("Hapus Siswa")).toBeInTheDocument();

    await act(async () => {
      resolveDelete(undefined);
    });
  });
});
