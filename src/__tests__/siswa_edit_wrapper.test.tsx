import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useSearchParams } from "next/navigation";

// Mock the navigation hooks (aligned with siswa_edit.test.tsx)
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: vi.fn(() => new URLSearchParams("?nis=12345"))
}));

let shouldSuspend = false;

import * as EditSiswaViewModule from "@/app/siswa/edit/EditSiswaView";
import EditPage from "@/app/siswa/edit/page";

describe("Siswa Edit Page Wrapper", () => {
  beforeEach(() => {
    vi.spyOn(EditSiswaViewModule, "default").mockImplementation(({ nis }: { nis: string }) => {
      if (shouldSuspend) throw new Promise(() => {});
      return <div data-testid="edit-siswa-view">NIS: {nis}</div>;
    });
  });

  it("renders EditPage wrapper correctly", () => {
    render(<EditPage />);
    const editView = screen.getByTestId("edit-siswa-view");
    expect(editView).toBeInTheDocument();
    expect(editView).toHaveTextContent("NIS: 12345");
  });

  it("renders EditPage wrapper fallback during suspension", () => {
    shouldSuspend = true;
    const { container } = render(<EditPage />);
    expect(container.querySelector(".form-page")).toBeInTheDocument();
    shouldSuspend = false; // Reset
  });

  it("renders EditPage correctly when nis is missing", () => {
    (useSearchParams as any).mockReturnValueOnce(new URLSearchParams(""));
    render(<EditPage />);
    const editView = screen.getByTestId("edit-siswa-view");
    expect(editView).toHaveTextContent("NIS:"); // Empty nis
  });
});
