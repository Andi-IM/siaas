import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useSearchParams } from "next/navigation";
import * as StudentTranscriptViewModule from "@/app/siswa/transkrip/StudentTranscriptView";
import TranscriptPage from "@/app/siswa/transkrip/page";

let shouldSuspend = false;

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(),
}));

describe("Transcript Page Wrapper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    shouldSuspend = false;
    vi.spyOn(StudentTranscriptViewModule, "default").mockImplementation(({ nis }: { nis: string }) => {
      if (shouldSuspend) throw new Promise(() => {});
      return <div data-testid="transcript-view">NIS: {nis}</div>;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders TranscriptPage with NIS from search params", () => {
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams("?nis=12345") as any);
    
    render(<TranscriptPage />);
    
    expect(screen.getByTestId("transcript-view")).toBeInTheDocument();
    expect(screen.getByTestId("transcript-view")).toHaveTextContent("NIS: 12345");
  });

  it("renders TranscriptPage with empty NIS if param is missing", () => {
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams("") as any);
    
    render(<TranscriptPage />);
    
    expect(screen.getByTestId("transcript-view")).toBeInTheDocument();
    expect(screen.getByTestId("transcript-view")).toHaveTextContent("NIS:");
  });

  it("renders Suspense fallback (skeleton) when content is loading/suspending", () => {
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams("?nis=12345") as any);
    
    shouldSuspend = true;
    const { container } = render(<TranscriptPage />);
    
    // Check for skeletons in fallback
    const skeletons = container.querySelectorAll(".skeleton");
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
