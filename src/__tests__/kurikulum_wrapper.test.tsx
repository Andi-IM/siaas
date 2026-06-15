import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import * as KurikulumViewModule from "@/app/kurikulum/KurikulumView";
import KurikulumPage from "@/app/kurikulum/page";

let shouldSuspend = false;

describe("Kurikulum Page Wrapper", () => {
  beforeEach(() => {
    shouldSuspend = false;
    vi.spyOn(KurikulumViewModule, "default").mockImplementation(() => {
      if (shouldSuspend) throw new Promise(() => {});
      return <div data-testid="kurikulum-view">Kurikulum View</div>;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders KurikulumPage wrapper with KurikulumView", () => {
    render(<KurikulumPage />);
    expect(screen.getByTestId("kurikulum-view")).toBeInTheDocument();
    expect(screen.getByTestId("kurikulum-view")).toHaveTextContent("Kurikulum View");
  });

  it("renders KurikulumPage wrapper fallback during suspension", () => {
    shouldSuspend = true;
    const { container } = render(<KurikulumPage />);
    expect(container.querySelector(".skeleton")).toBeInTheDocument();
  });
});
