import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useSearchParams } from "next/navigation";

// Mock the navigation hooks
vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(() => new URLSearchParams("?nis=12345"))
}));

let shouldSuspend = false;

// Mock the child component
vi.mock("@/app/siswa/detail/StudentDetailView", () => ({
  default: ({ nis }: { nis: string }) => {
    if (shouldSuspend) throw new Promise(() => {});
    return <div data-testid="student-detail-view">NIS: {nis}</div>;
  }
}));

import DetailPage from "@/app/siswa/detail/page";

describe("Siswa Detail Page Wrapper", () => {
  it("renders DetailPage wrapper correctly", () => {
    render(<DetailPage />);
    const detailView = screen.getByTestId("student-detail-view");
    expect(detailView).toBeInTheDocument();
    expect(detailView).toHaveTextContent("NIS: 12345");
  });

  it("renders DetailPage wrapper fallback during suspension", () => {
    shouldSuspend = true;
    const { container } = render(<DetailPage />);
    expect(container.querySelector(".form-page")).toBeInTheDocument();
    shouldSuspend = false; // Reset
  });

  it("renders DetailPage correctly when nis is missing", () => {
    (useSearchParams as any).mockReturnValueOnce(new URLSearchParams(""));
    render(<DetailPage />);
    const detailView = screen.getByTestId("student-detail-view");
    expect(detailView).toHaveTextContent("NIS:"); // Empty nis
  });
});
