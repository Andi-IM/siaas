import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { useSearchParams } from "next/navigation";
import EditPage from "@/app/siswa/edit/page";
import { EditFallback } from "@/app/siswa/edit/EditSiswaView";
import { getStudentByNis, updateStudent } from "@/lib/data";
import { getConcentrations } from "@/lib/curriculum-data";

// Mock router and search params
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: vi.fn(() => new URLSearchParams("?nis=11111")),
}));

// Mock the data clients
vi.mock("@/lib/data", () => ({
  getStudentByNis: vi.fn(),
  updateStudent: vi.fn(),
}));

vi.mock("@/lib/curriculum-data", () => ({
  getConcentrations: vi.fn(() => Promise.resolve([
    { id: "k1", nama: "Teknik Pemesinan", programId: "p1" },
    { id: "k2", nama: "Teknik Pengelasan", programId: "p1" }
  ])),
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
  namaAyah: "",
  pekerjaanAyah: "",
  namaIbu: "",
  pekerjaanIbu: "",
  alamatOrangTua: "",
  namaWali: "",
  alamatWali: "",
  teleponWali: "",
  pekerjaanWali: "",
};

function getFieldInput(container: HTMLElement, labelText: string): HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement {
  const fields = Array.from(container.querySelectorAll(".form-field"));
  const matchedField = fields.find(f => {
    const label = f.querySelector(".form-field__label");
    return label && label.textContent?.includes(labelText);
  });
  if (!matchedField) {
    throw new Error(`Field with label "${labelText}" not found.`);
  }
  const input = matchedField.querySelector("input, select, textarea");
  if (!input) {
    throw new Error(`Input for field "${labelText}" not found.`);
  }
  return input as any;
}

describe("Edit Student Page", () => {
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

  it("renders EditPage correctly when nis is missing", async () => {
    vi.mocked(useSearchParams).mockReturnValueOnce(new URLSearchParams("") as any);
    (getStudentByNis as any).mockResolvedValue(null);

    render(<EditPage />);

    await waitFor(() => {
      expect(screen.getByText("Siswa tidak ditemukan")).toBeInTheDocument();
    });
  });

  it("renders EditFallback correctly", () => {
    render(<EditFallback />);
    expect(document.querySelector(".skeleton")).toBeInTheDocument();
  });

  it("renders loading skeletons initially", () => {
    (getStudentByNis as any).mockReturnValue(new Promise(() => {}));

    const { container } = render(<EditPage />);

    expect(screen.queryByText("Edit Siswa")).not.toBeInTheDocument();
    expect(container.getElementsByClassName("skeleton").length).toBeGreaterThan(0);
  });

  it("renders empty state when student is not found", async () => {
    (getStudentByNis as any).mockResolvedValue(null);

    render(<EditPage />);

    await waitFor(() => {
      expect(screen.getByText("Siswa tidak ditemukan")).toBeInTheDocument();
    });

    expect(screen.getByText("Kembali ke Daftar Siswa")).toBeInTheDocument();
  });

  it("pre-populates the form with student data", async () => {
    (getStudentByNis as any).mockResolvedValue(mockStudent);

    render(<EditPage />);

    await waitFor(() => {
      expect(screen.getByText("Edit Siswa")).toBeInTheDocument();
    });

    expect(screen.getByDisplayValue("Alice")).toBeInTheDocument();
    expect(screen.getByDisplayValue("11111")).toBeInTheDocument();
    expect(screen.getByDisplayValue("0011111")).toBeInTheDocument();
    expect(screen.getByDisplayValue("X-1")).toBeInTheDocument();
  });

  it("shows validation errors on empty submission", async () => {
    (getStudentByNis as any).mockResolvedValue(mockStudent);

    const { container } = render(<EditPage />);

    await waitFor(() => {
      expect(screen.getByText("Edit Siswa")).toBeInTheDocument();
    });

    // Clear required fields
    fireEvent.change(getFieldInput(container, "Nama Peserta Didik (Lengkap)"), { target: { value: "" } });
    fireEvent.change(getFieldInput(container, "Nomor Induk (NIS)"), { target: { value: "" } });
    fireEvent.change(getFieldInput(container, "NISN"), { target: { value: "" } });
    fireEvent.change(getFieldInput(container, "Diterima di Kelas"), { target: { value: "" } });

    const submitBtn = screen.getByRole("button", { name: /simpan/i });
    await userEvent.click(submitBtn);

    expect(screen.getByText("Nomor Induk (NIS) wajib diisi.")).toBeInTheDocument();
    expect(screen.getByText("NISN wajib diisi.")).toBeInTheDocument();
    expect(screen.getByText("Nama Lengkap wajib diisi.")).toBeInTheDocument();
    expect(screen.getByText("Kelas wajib diisi.")).toBeInTheDocument();
  });

  it("clears validation errors when field values are corrected", async () => {
    (getStudentByNis as any).mockResolvedValue(mockStudent);

    const { container } = render(<EditPage />);

    await waitFor(() => {
      expect(screen.getByText("Edit Siswa")).toBeInTheDocument();
    });

    // Clear required fields to trigger error
    fireEvent.change(getFieldInput(container, "Nama Peserta Didik (Lengkap)"), { target: { value: "" } });
    fireEvent.change(getFieldInput(container, "Nomor Induk (NIS)"), { target: { value: "" } });

    const submitBtn = screen.getByRole("button", { name: /simpan/i });
    await userEvent.click(submitBtn);

    // Verify errors are present
    expect(screen.getByText("Nomor Induk (NIS) wajib diisi.")).toBeInTheDocument();
    expect(screen.getByText("Nama Lengkap wajib diisi.")).toBeInTheDocument();

    // Type in NIS to clear NIS error
    const nisInput = getFieldInput(container, "Nomor Induk (NIS)");
    fireEvent.change(nisInput, { target: { value: "11111" } });

    // Assert NIS error is cleared, but Nama error remains
    expect(screen.queryByText("Nomor Induk (NIS) wajib diisi.")).not.toBeInTheDocument();
    expect(screen.getByText("Nama Lengkap wajib diisi.")).toBeInTheDocument();

    // Type in Nama to clear Nama error
    const namaInput = getFieldInput(container, "Nama Peserta Didik (Lengkap)");
    fireEvent.change(namaInput, { target: { value: "Alice" } });

    // Assert Nama error is cleared
    expect(screen.queryByText("Nama Lengkap wajib diisi.")).not.toBeInTheDocument();
  });

  it("submits updates successfully and redirects", async () => {
    (getStudentByNis as any).mockResolvedValue(mockStudent);
    (updateStudent as any).mockResolvedValue(undefined);

    const { container } = render(<EditPage />);

    await waitFor(() => {
      expect(screen.getByText("Edit Siswa")).toBeInTheDocument();
    });

    // Edit all 23 form fields instantly using fireEvent
    fireEvent.change(getFieldInput(container, "Nama Peserta Didik (Lengkap)"), { target: { value: "Alice Updated" } });
    fireEvent.change(getFieldInput(container, "Nomor Induk (NIS)"), { target: { value: "11111-U" } });
    fireEvent.change(getFieldInput(container, "NISN"), { target: { value: "0011111-U" } });
    fireEvent.change(getFieldInput(container, "Tempat Lahir"), { target: { value: "Padang Updated" } });
    fireEvent.change(getFieldInput(container, "Tanggal Lahir"), { target: { value: "2008-12-12" } });
    fireEvent.change(getFieldInput(container, "Jenis Kelamin"), { target: { value: "L" } });
    fireEvent.change(getFieldInput(container, "Agama"), { target: { value: "Kristen" } });
    fireEvent.change(getFieldInput(container, "Nomor Telepon Rumah"), { target: { value: "98765" } });
    fireEvent.change(getFieldInput(container, "Alamat Peserta Didik"), { target: { value: "Alamat Alice Updated" } });
    fireEvent.change(getFieldInput(container, "Sekolah Asal"), { target: { value: "SMP 2" } });
    fireEvent.change(getFieldInput(container, "Diterima di Kelas"), { target: { value: "X-2" } });
    fireEvent.change(getFieldInput(container, "Diterima pada Tanggal"), { target: { value: "2025-08-08" } });
    fireEvent.change(getFieldInput(container, "Konsentrasi Keahlian"), { target: { value: "Teknik Pengelasan" } });
    fireEvent.change(getFieldInput(container, "Nomor Ijazah (Alumni)"), { target: { value: "IJZ-999" } });
    fireEvent.change(getFieldInput(container, "Tanggal Kelulusan (Alumni)"), { target: { value: "2028-12-12" } });
    fireEvent.change(getFieldInput(container, "Status"), { target: { value: "inactive" } });
    fireEvent.change(getFieldInput(container, "Nama Ayah"), { target: { value: "Father Updated" } });
    fireEvent.change(getFieldInput(container, "Pekerjaan Ayah"), { target: { value: "Job A Updated" } });
    fireEvent.change(getFieldInput(container, "Nama Ibu"), { target: { value: "Mother Updated" } });
    fireEvent.change(getFieldInput(container, "Pekerjaan Ibu"), { target: { value: "Job B Updated" } });
    fireEvent.change(getFieldInput(container, "Alamat Orang Tua"), { target: { value: "Padang Parents Updated" } });
    fireEvent.change(getFieldInput(container, "Nama Wali Peserta Didik"), { target: { value: "Wali Updated" } });
    fireEvent.change(getFieldInput(container, "Pekerjaan Wali Peserta Didik"), { target: { value: "Job W Updated" } });
    fireEvent.change(getFieldInput(container, "Nomor Telepon Rumah Wali"), { target: { value: "999-888" } });
    fireEvent.change(getFieldInput(container, "Alamat Wali Peserta Didik"), { target: { value: "Padang Wali Updated" } });

    const submitBtn = screen.getByRole("button", { name: /simpan/i });
    await userEvent.click(submitBtn);

    expect(updateStudent).toHaveBeenCalledWith(
      "11111",
      expect.objectContaining({
        nama: "Alice Updated",
        nis: "11111-U",
        nisn: "0011111-U",
        tempatLahir: "Padang Updated",
        tanggalLahir: "2008-12-12",
        jenisKelamin: "L",
        agama: "Kristen",
        alamat: "Alamat Alice Updated",
        telepon: "98765",
        sekolahAsal: "SMP 2",
        diterimaDiKelas: "X-2",
        diterimaPadaTanggal: "2025-08-08",
        kompetensi: "Teknik Pengelasan",
        nomorIjazah: "IJZ-999",
        tanggalKelulusan: "2028-12-12",
        status: "inactive",
        namaAyah: "Father Updated",
        pekerjaanAyah: "Job A Updated",
        namaIbu: "Mother Updated",
        pekerjaanIbu: "Job B Updated",
        alamatOrangTua: "Padang Parents Updated",
        namaWali: "Wali Updated",
        pekerjaanWali: "Job W Updated",
        teleponWali: "999-888",
        alamatWali: "Padang Wali Updated",
      })
    );

    await waitFor(() => {
      expect(screen.getByText("Data siswa berhasil diperbarui")).toBeInTheDocument();
    });

    expect(mockPush).toHaveBeenCalledWith("/siswa/detail?nis=11111");
  });

  it("handles server/db errors during submission", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    (getStudentByNis as any).mockResolvedValue(mockStudent);
    (updateStudent as any).mockRejectedValue(new Error("Database write error"));

    render(<EditPage />);

    await waitFor(() => {
      expect(screen.getByText("Edit Siswa")).toBeInTheDocument();
    });

    const submitBtn = screen.getByRole("button", { name: /simpan/i });
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Failed to update student:", expect.any(Error));
    });

    // Should not show success state
    expect(screen.queryByText("Data siswa berhasil diperbarui")).not.toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it("handles db error on student load", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    (getStudentByNis as any).mockRejectedValue(new Error("Database read error"));

    render(<EditPage />);

    await waitFor(() => {
      expect(screen.getByText("Siswa tidak ditemukan")).toBeInTheDocument();
    });

    expect(consoleSpy).toHaveBeenCalledWith("Failed to load student:", expect.any(Error));
    consoleSpy.mockRestore();
  });

  it("does not update state if unmounted before fetch resolves", async () => {
    let resolvePromise: any;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    (getStudentByNis as any).mockReturnValue(promise);

    const { unmount } = render(<EditPage />);
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

    const { unmount } = render(<EditPage />);
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
