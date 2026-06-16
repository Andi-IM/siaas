# 0007: View-Wrapper Pattern to Avoid Istanbul Ghost Lines

**Status:** accepted
**Date:** 2026-06-16

## Context and Problem Statement

During the testing of the Next.js App Router-based SIAAS application using Vitest and the Istanbul coverage provider, we discovered coverage anomalies in the form of *ghost lines*. These *ghost lines* falsely report empty lines or lines that cannot actually be executed as uncovered.

Analysis showed that this issue is an effect of double-instrumentation and statement map overriding by Istanbul when parallel workers in Vitest dynamically execute files through tests while simultaneously scanning them statically. This often occurs on Next.js *page wrapper* files (like those only containing a `Suspense` boundary) when the inner component (View) is directly mocked with a static path.

## Decision

To ensure valid test coverage and achieve 100%, we are adopting the **View-Wrapper Pattern (Single Source of Compilation)** for every page route:

1. **Module Separation**: The `app/[feature]/page.tsx` file is purely used as a *thin wrapper* (such as a `Suspense` boundary or minimalist layout).
2. **Core Component in View**: All main logic is moved to a separate component ending with `View.tsx` (e.g., `TambahSiswaView.tsx`).
3. **Testing Pattern (Crucial)**: 
   - In the main integration test (e.g., `siswa_add.test.tsx`), **do not only render the `View` component**. Instead, import and **render the `Wrapper` component (`page.tsx`)** so that the worker loads and compiles the wrapper file simultaneously within the same flow.
   - In the separate wrapper-specific test file, avoid using static `vi.mock("@/app/...")`. Use a native import `import * as ViewModule from "./View"` and mock it using `vi.spyOn(ViewModule, "default")`.
4. **Fallback Location**: Move Fallback components (such as Skeleton Loading) outside of `page.tsx` (e.g., exported from the `View` file) to keep the `page.tsx` wrapper as concise as possible.

## Consequences

*   **Positive:** Accurate (eliminates ghost lines) and representative coverage reports.
*   **Positive:** Cleaner separation of concerns between asynchronous boundaries (in `page.tsx`) and client interaction logic (in `[Page]View.tsx`).
*   **Negative:** A slight addition of boilerplate when creating a new page because it always requires two files (Page and View) and a separate wrapper test.

## Implementation Plan

- **Affected paths**: This pattern is applied to all Next.js route pages (such as `src/app/siswa/tambah`, `src/app/siswa/detail`, `src/app/siswa/edit`, dan `src/app/pengaturan`).
- **Pattern**: Rendering the main `page.tsx` component inside the unit test file of the `[Page]View` component.
- This policy is **mandatory** for all new page modules to prevent regressions in test coverage percentages.

## Verification

- [x] `npm run test:coverage` shows 100% statements, branches, functions, and lines on the refactored features (`tambah`, `edit`, `detail`).
- [x] The number of ghost lines (like lines 397-766 in a file < 100 lines) no longer appears in the coverage report.
