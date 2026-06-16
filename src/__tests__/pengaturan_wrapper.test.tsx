import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import * as PengaturanViewModule from "@/app/pengaturan/PengaturanView";
import PengaturanPage from "@/app/pengaturan/page";
import { PengaturanFallback } from "@/app/pengaturan/fallback";

let shouldSuspend = false;

describe("Pengaturan Page Wrapper", () => {
  beforeEach(() => {
    shouldSuspend = false;
    vi.spyOn(PengaturanViewModule, "default").mockImplementation(() => {
      if (shouldSuspend) throw new Promise(() => {});
      return <div data-testid="pengaturan-view">Pengaturan View</div>;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders PengaturanPage wrapper with PengaturanView", () => {
    render(<PengaturanPage />);
    expect(screen.getByTestId("pengaturan-view")).toBeInTheDocument();
    expect(screen.getByTestId("pengaturan-view")).toHaveTextContent("Pengaturan View");
  });

  it("renders PengaturanPage wrapper fallback during suspension", () => {
    shouldSuspend = true;
    const { container } = render(<PengaturanPage />);
    expect(container.querySelector(".skeleton")).toBeInTheDocument();
  });

  it("renders PengaturanFallback correctly by itself", () => {
    const { container } = render(<PengaturanFallback />);
    expect(container.querySelector(".skeleton")).toBeInTheDocument();
  });
});
