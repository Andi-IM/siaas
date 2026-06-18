# 0016: Transcript Layout and Frontend PDF Export

**Status:** accepted (PDF Export removed)
**Date:** 2026-06-16
**Updated:** 2026-06-18 (Consolidated with ADR 0017 and translated to English)

## Context and Problem Statement

The school requires a secondary transcript layout to act as a diploma supplement ("Transkrip Nilai"). Unlike the 3-Year Program transcript which lists grades across 6 semesters, this layout presents a single aggregated final grade column per subject.

Specific aggregation rules apply to the Vocational Subjects (Kelompok Kejuruan):
1. **Dasar-dasar Program Keahlian**: The score must be calculated exclusively as the average of grades from Semester 1 and Semester 2.
2. **Konsentrasi Keahlian**: Derived using a specific formula: `Final Score = (Avg of Core Subjects in Smt 3 + Avg of Core Subjects in Smt 4 + Avg of Core Subjects in Smt 6 + UKK Score) / 4`. Semester 5 is intentionally excluded.
3. **Other Subjects**: Averaged across all their active semesters.

The application must also support direct PDF export (WYSIWYG) that is identical to the print layout, allowing administrators to save transcripts as standalone files.

## Decision

We have implemented a cross-stack solution:

1. **Database Schema Extension**: Added a `transcript_group` column to the `subjects` table. Allowed values: `UMUM`, `KEJURUAN_UMUM`, `KEJURUAN_DASAR`, `KEJURUAN_KONSENTRASI`, `UKK`.
2. **Aggregation Logic**:
   - `KEJURUAN_DASAR`: Capped to Semesters 1 & 2.
   - `KEJURUAN_KONSENTRASI`: Aggregated using the specialized formula including S3, S4, S6, and UKK.
   - `UKK`: Standalone exam score pulled into the "Konsentrasi Keahlian" formula.
3. **UI & Presentation**:
   - Implemented a Tabbing pattern in `StudentTranscriptView.tsx` to toggle between "Transkrip 3 Tahun" and "Transkrip Nilai".
   - Calculation logic uses the `transcriptGroup` property from the database for automatic mapping.
4. **Frontend PDF Export**:
   - Utilizes `html2canvas-pro` and `jspdf` libraries.
   - This client-side approach ensures the PDF is 100% identical to the CSS print layout (WYSIWYG).
   - Supports multi-page output via automatic canvas slicing for A4 dimensions.

## Consequences

* **Positive**: High stability as business rules are managed via the database rather than hardcoded string matching.
* **Positive**: Administrators have full control to map new subjects to the correct calculation formula via the UI.
* **Positive**: PDF export results are visually identical to the print layout.
* **Negative**: Introduction of new npm dependencies (`html2canvas-pro`, `jsPDF`).
* **Negative**: PDF output is raster-based (image), so text is not selectable, but visual accuracy is guaranteed.

## Implementation Plan

- **Database**:
  - SQLite migration to add `transcript_group` to the `subjects` table.
  - Updated `seed_academic_core.sql` with appropriate transcript groups.
- **Backend (Rust)**: Updated `Subject` structs and CRUD commands in `src-tauri/src/db`.
- **Frontend**:
  - Updated `MataPelajaran` interface in `src/lib/types.ts`.
  - Implemented aggregation logic in `src/app/siswa/transkrip/StudentTranscriptView.tsx`.
  - Integrated `handleExportPdf` using `jsPDF`.

## Verification

- [x] Database schema verified via SQLite CLI.
- [x] Test cases in `src/__tests__/transkrip_view.test.tsx` validate aggregation formulas (especially KEJURUAN_DASAR and Konsentrasi Keahlian).
- [x] 100% coverage for the page wrapper in `src/__tests__/transkrip_wrapper.test.tsx`.

## Update: PDF Export Removal (2026-06-18)

The PDF export feature has been deprecated and completely removed from the codebase.
- **Reasoning**: To keep the application lightweight, avoid heavy client-side/backend dependencies (`html2canvas-pro` and `jspdf` on the frontend, and `printpdf` on the backend), and rely solely on the browser/system print engine (native printer dialog), which delivers 100% vector-accurate rendering and selectable text.
- **Changes**:
  - Removed `printpdf` dependency in `Cargo.toml`.
  - Removed PDF generation command `export_transcript_pdf` from `commands.rs`.
  - Removed "Simpan PDF" button, handlers, and package imports from `StudentTranscriptView.tsx`.
  - Cleared all associated unit tests and E2E tests.
