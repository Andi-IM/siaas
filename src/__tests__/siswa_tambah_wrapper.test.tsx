import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import * as TambahSiswaViewModule from "@/app/siswa/tambah/TambahSiswaView";
import TambahSiswaPage from "@/app/siswa/tambah/page";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

let shouldSuspend = false;

describe("Siswa Tambah Page Wrapper", () => {
  beforeEach(() => {
    shouldSuspend = false;
    vi.spyOn(TambahSiswaViewModule, "default").mockImplementation(() => {
      if (shouldSuspend) throw new Promise(() => {});
      return <div data-testid="tambah-siswa-view">Tambah Siswa View</div>;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders TambahSiswaPage wrapper with TambahSiswaView", () => {
    render(<TambahSiswaPage />);
    expect(screen.getByTestId("tambah-siswa-view")).toBeInTheDocument();
    expect(screen.getByTestId("tambah-siswa-view")).toHaveTextContent("Tambah Siswa View");
  });

  it("renders TambahSiswaPage wrapper fallback during suspension", () => {
    shouldSuspend = true;
    const { container } = render(<TambahSiswaPage />);
    expect(container.querySelector(".form-page")).toBeInTheDocument();
    expect(container.querySelector(".skeleton")).toBeInTheDocument();
  });
});
