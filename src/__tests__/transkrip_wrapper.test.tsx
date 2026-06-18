import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useSearchParams } from "next/navigation";
import * as StudentTranscriptViewModule from "@/app/siswa/transkrip/StudentTranscriptView";
import TranscriptPage from "@/app/siswa/transkrip/page";

vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(),
}));

describe("Transcript Page Wrapper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(StudentTranscriptViewModule, "default").mockImplementation(
      ({ nis }: { nis: string }) => <div data-testid="transcript-view">NIS: {nis}</div>
    );
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

  it("renders Suspense fallback (skeleton) when a lazy child suspends", () => {
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams("?nis=12345") as any);

    const SuspendingComponent = React.lazy(
      () => new Promise<{ default: React.ComponentType<unknown> }>(() => {})
    );

    vi.spyOn(StudentTranscriptViewModule, "default").mockImplementation(
      () => <SuspendingComponent />
    );

    const { container } = render(<TranscriptPage />);

    const skeletons = container.querySelectorAll(".skeleton");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("passes correct nis prop to StudentTranscriptView", () => {
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams("?nis=11111") as any);

    render(<TranscriptPage />);

    const callArgs = vi.mocked(StudentTranscriptViewModule.default).mock.calls[0];
    expect(callArgs[0]).toEqual({ nis: "11111" });
  });

  it("handles URL-encoded NIS value", () => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams("?nis=123%2045") as any
    );

    render(<TranscriptPage />);

    expect(screen.getByTestId("transcript-view")).toHaveTextContent("NIS: 123 45");
  });

  it("extracts NIS correctly from multiple URL parameters", () => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams("?nis=99999&tab=grades&year=2026") as any
    );

    render(<TranscriptPage />);

    expect(screen.getByTestId("transcript-view")).toHaveTextContent("NIS: 99999");
  });
});
