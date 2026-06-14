# ADR 0003: Hierarchical Curriculum & Subject Management

*   **Status**: accepted
*   **Decider**: Gemini CLI, User
*   **Date**: 2026-06-14

## Context

SIAAS needs to support complex vocational curriculum management, which includes a hierarchical structure from study programs down to specific subjects.

## Decision

We have adopted a hierarchical data structure: **Program Keahlian** (Vocational Program) > **Konsentrasi Keahlian** (Vocational Concentration) > **Mata Pelajaran** (Subject). The management interface is implemented as a *Single-page Dashboard* with a *Master-Detail Drill-down* pattern for input efficiency. Full CRUD capabilities are provided via modal-based forms.

Additionally, we have implemented **Rekap Data Hasil Belajar** and **Academic Transcript** features:
- **Rekap Data**: A spreadsheet-style grid for multi-semester record auditing with vertical headers for density.
- **Academic Transcript**: A dual-mode view separating interactive management from a formal document layout.
- **Print Optimization**: Official documents use *Times New Roman*, 10pt-11pt sizing, and strict A4 Portrait layout constraints to match institutional standards.

## Implementation Plan

*   **Affected paths**: `src/lib/types.ts`, `src/lib/data.ts`, `src/app/kurikulum/page.tsx`, `src/app/rekap/page.tsx`, `src/app/siswa/[nis]/transkrip/page.tsx`, `src/components/sidebar.tsx`
*   **Pattern**: Instant client-side click-to-drill interactions, modal-driven creation/editing, and CSS Media Queries for print-only formal layouts.

## Verification

- [x] Curriculum menu appears in the sidebar.
- [x] Users can navigate from Program to Concentration.
- [x] Subject list automatically filters based on the selected concentration.
- [x] Programs, Concentrations, and Subjects can be Created and Edited via modals.
- [x] Subjects can be Deleted with confirmation.
- [x] Rekap Data provides a high-density grid with horizontal scrolling and print support.
- [x] Academic Transcript renders a professional A4 Portrait document when printed.
- [x] Layout uses high-density cards and data tables.
