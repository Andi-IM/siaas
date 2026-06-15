import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import TambahPage from "@/app/siswa/tambah/page";
import { TambahFallback } from "@/app/siswa/tambah/fallback";
import { addStudent } from "@/lib/data";

// Mock router
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock the data client
vi.mock("@/lib/data", () => ({
  addStudent: vi.fn(),
}));

const originalSetTimeout = global.setTimeout;

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

describe("Add Student Page", () => {
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

  it("renders form sections and input fields", () => {
    render(<TambahPage />);

    expect(screen.getByText("Tambah Siswa")).toBeInTheDocument();
    expect(screen.getByText("DATA PRIBADI")).toBeInTheDocument();
    expect(screen.getByText("DATA AKADEMIK")).toBeInTheDocument();
    expect(screen.getByText("DATA ORANG TUA")).toBeInTheDocument();
    expect(screen.getByText("DATA WALI (OPSIONAL)")).toBeInTheDocument();

    // Check key inputs are present
    expect(screen.getByPlaceholderText("Nama lengkap sesuai ijazah")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Contoh: 24001")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Contoh: 0071234561")).toBeInTheDocument();
  });

  it("shows validation errors on empty submission", async () => {
    render(<TambahPage />);

    const submitBtn = screen.getByRole("button", { name: /simpan/i });
    await userEvent.click(submitBtn);

    // Verify error messages
    expect(screen.getByText("Nomor Induk (NIS) wajib diisi.")).toBeInTheDocument();
    expect(screen.getByText("NISN wajib diisi.")).toBeInTheDocument();
    expect(screen.getByText("Nama Lengkap wajib diisi.")).toBeInTheDocument();
    expect(screen.getByText("Kelas wajib diisi.")).toBeInTheDocument();
  });

  it("clears validation errors when field values are corrected", async () => {
    const { container } = render(<TambahPage />);

    const submitBtn = screen.getByRole("button", { name: /simpan/i });
    await userEvent.click(submitBtn);

    // Verify error messages are present
    expect(screen.getByText("Nomor Induk (NIS) wajib diisi.")).toBeInTheDocument();
    expect(screen.getByText("Nama Lengkap wajib diisi.")).toBeInTheDocument();

    // Type in NIS field to clear its error
    const nisInput = getFieldInput(container, "Nomor Induk (NIS)");
    fireEvent.change(nisInput, { target: { value: "12345" } });

    // Assert NIS error is cleared, but Nama error remains
    expect(screen.queryByText("Nomor Induk (NIS) wajib diisi.")).not.toBeInTheDocument();
    expect(screen.getByText("Nama Lengkap wajib diisi.")).toBeInTheDocument();

    // Type in Nama field to clear its error
    const namaInput = getFieldInput(container, "Nama Peserta Didik (Lengkap)");
    fireEvent.change(namaInput, { target: { value: "John Doe" } });

    // Assert Nama error is cleared
    expect(screen.queryByText("Nama Lengkap wajib diisi.")).not.toBeInTheDocument();
  });

  it("submits successfully and redirects on valid data", async () => {
    (addStudent as any).mockResolvedValue(undefined);

    const { container } = render(<TambahPage />);

    // Fill all form fields using fireEvent for high-speed execution
    fireEvent.change(getFieldInput(container, "Nama Peserta Didik (Lengkap)"), { target: { value: "David" } });
    fireEvent.change(getFieldInput(container, "Nomor Induk (NIS)"), { target: { value: "44444" } });
    fireEvent.change(getFieldInput(container, "NISN"), { target: { value: "0044444" } });
    fireEvent.change(getFieldInput(container, "Tempat Lahir"), { target: { value: "Padang" } });
    fireEvent.change(getFieldInput(container, "Tanggal Lahir"), { target: { value: "2008-01-01" } });
    fireEvent.change(getFieldInput(container, "Jenis Kelamin"), { target: { value: "P" } });
    fireEvent.change(getFieldInput(container, "Agama"), { target: { value: "Islam" } });
    fireEvent.change(getFieldInput(container, "Nomor Telepon Rumah"), { target: { value: "12345" } });
    fireEvent.change(getFieldInput(container, "Alamat Peserta Didik"), { target: { value: "Alamat David" } });
    fireEvent.change(getFieldInput(container, "Sekolah Asal"), { target: { value: "SMP 1" } });
    fireEvent.change(getFieldInput(container, "Diterima di Kelas"), { target: { value: "X-1" } });
    fireEvent.change(getFieldInput(container, "Diterima pada Tanggal"), { target: { value: "2025-07-01" } });
    fireEvent.change(getFieldInput(container, "Kompetensi Keahlian"), { target: { value: "Teknik Pemesinan" } });
    fireEvent.change(getFieldInput(container, "Nomor Ijazah (Alumni)"), { target: { value: "IJZ-123" } });
    fireEvent.change(getFieldInput(container, "Tanggal Kelulusan (Alumni)"), { target: { value: "2028-06-01" } });
    fireEvent.change(getFieldInput(container, "Nama Ayah"), { target: { value: "Ayah David" } });
    fireEvent.change(getFieldInput(container, "Pekerjaan Ayah"), { target: { value: "Pekerjaan Ayah" } });
    fireEvent.change(getFieldInput(container, "Nama Ibu"), { target: { value: "Ibu David" } });
    fireEvent.change(getFieldInput(container, "Pekerjaan Ibu"), { target: { value: "Pekerjaan Ibu" } });
    fireEvent.change(getFieldInput(container, "Alamat Orang Tua"), { target: { value: "Alamat Ortu" } });
    fireEvent.change(getFieldInput(container, "Nama Wali Peserta Didik"), { target: { value: "Wali David" } });
    fireEvent.change(getFieldInput(container, "Pekerjaan Wali Peserta Didik"), { target: { value: "Pekerjaan Wali" } });
    fireEvent.change(getFieldInput(container, "Nomor Telepon Rumah Wali"), { target: { value: "54321" } });
    fireEvent.change(getFieldInput(container, "Alamat Wali Peserta Didik"), { target: { value: "Alamat Wali" } });

    const submitBtn = screen.getByRole("button", { name: /simpan/i });
    await userEvent.click(submitBtn);

    expect(addStudent).toHaveBeenCalledWith({
      nama: "David",
      nis: "44444",
      nisn: "0044444",
      tempatLahir: "Padang",
      tanggalLahir: "2008-01-01",
      jenisKelamin: "P",
      agama: "Islam",
      alamat: "Alamat David",
      telepon: "12345",
      sekolahAsal: "SMP 1",
      diterimaDiKelas: "X-1",
      diterimaPadaTanggal: "2025-07-01",
      kompetensi: "Teknik Pemesinan",
      nomorIjazah: "IJZ-123",
      tanggalKelulusan: "2028-06-01",
      status: "active",
      namaAyah: "Ayah David",
      pekerjaanAyah: "Pekerjaan Ayah",
      namaIbu: "Ibu David",
      pekerjaanIbu: "Pekerjaan Ibu",
      alamatOrangTua: "Alamat Ortu",
      namaWali: "Wali David",
      pekerjaanWali: "Pekerjaan Wali",
      teleponWali: "54321",
      alamatWali: "Alamat Wali",
    });

    await waitFor(() => {
      expect(screen.getByText("Siswa berhasil ditambahkan")).toBeInTheDocument();
    });

    expect(mockPush).toHaveBeenCalledWith("/siswa");
  });

  it("handles server/db errors during submission", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    (addStudent as any).mockRejectedValue(new Error("Database write error"));

    const { container } = render(<TambahPage />);

    // Fill required form fields
    fireEvent.change(getFieldInput(container, "Nama Peserta Didik (Lengkap)"), { target: { value: "David" } });
    fireEvent.change(getFieldInput(container, "Nomor Induk (NIS)"), { target: { value: "44444" } });
    fireEvent.change(getFieldInput(container, "NISN"), { target: { value: "0044444" } });
    fireEvent.change(getFieldInput(container, "Diterima di Kelas"), { target: { value: "X-1" } });

    const submitBtn = screen.getByRole("button", { name: /simpan/i });
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Failed to add student:", expect.any(Error));
    });

    // Should not show success state
    expect(screen.queryByText("Siswa berhasil ditambahkan")).not.toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it("renders TambahFallback correctly", () => {
    const { container } = render(<TambahFallback />);
    expect(container.querySelector(".skeleton")).toBeInTheDocument();
  });
});
