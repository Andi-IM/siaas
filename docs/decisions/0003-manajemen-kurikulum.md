# ADR 0003: Hierarchical Curriculum & Subject Management

*   **Status**: accepted
*   **Decider**: Gemini CLI, User
*   **Date**: 2026-06-14

## Context

SIAAS needs to support complex vocational curriculum management, which includes a hierarchical structure from study programs down to specific subjects.

## Decision

We have adopted a hierarchical data structure: **Program Keahlian** (Vocational Program) > **Konsentrasi Keahlian** (Vocational Concentration) > **Mata Pelajaran** (Subject). 

Key architectural and database decisions:
- **Tauri Managed Database**: Persistent storage is managed via a Tauri-invoked SQLite backend using **SeaORM**. CRUD operations for all curriculum levels are implemented in `src-tauri/src/db/commands.rs`.
- **Multi-Semester Mapping**: A junction table `curriculum_subjects` allows a single **Mata Pelajaran** to be assigned to multiple semesters (1-6) within a specific concentration and batch.
- **Restricted Categories**: Subjects are strictly categorized into exactly two groups: **"Kelompok Umum"** and **"Kelompok Kejuruan"**.
- **Weighted Manual Sorting**: To match institutional document formats, subjects are sorted by **Category weight** ("Kelompok Umum" weight 1, "Kelompok Kejuruan" weight 2) followed by a manual **`sequence`** (INTEGER) index.
- **Interface Pattern**: The management interface is a *Single-page Dashboard* with a *Master-Detail Drill-down* pattern. Full CRUD is provided via modal forms.

Additionally, we have implemented **Rekap Data Hasil Belajar** and **Academic Transcript** features:
- **Rekap Data**: A spreadsheet-style grid for multi-semester record auditing with vertical headers for density. Subjects are filtered by semester but maintain their hierarchical weighted order.
- **Academic Transcript**: A dual-mode view separating interactive management from a formal document layout.
- **Print Optimization**: Official documents use *Times New Roman*, 10pt-11pt sizing, and strict A4 Portrait layout constraints to match Indonesian vocational standards.

## Implementation Plan

- **Affected paths**: 
  - Backend: `src-tauri/src/db/entities/`, `src-tauri/src/db/commands.rs`, `src-tauri/src/db/migrations.rs`
  - Frontend: `src/lib/types.ts`, `src/lib/data.ts`, `src/app/kurikulum/page.tsx`, `src/app/rekap/page.tsx`, `src/app/siswa/transkrip/StudentTranscriptView.tsx`
- **Pattern**: 
  - **Data Access**: Asynchronous Tauri `invoke` calls in `data.ts` with local storage fallbacks for browser-only environments.
  - **UI Interaction**: Multi-select checkbox groups for semester mapping and numeric sequence inputs for document positioning.
  - **Sorting**: Weight-based category sorting functions implemented in both Rust and TypeScript to ensure consistency.

## Verification

- [x] Curriculum data persists across application restarts in SQLite.
- [x] Subjects can be mapped to multiple semesters simultaneously.
- [x] "Kelompok Umum" subjects always appear above "Kelompok Kejuruan".
- [x] Subjects follow manual `sequence` numbering within their respective groups.
- [x] Rekap Data and Transcript headers respect the category weight + sequence order.
- [x] Programs, Concentrations, and Subjects can be Created, Updated, and Deleted via modals.
- [x] Layout uses high-density cards and data tables.
- [x] Official print layouts match institutional standards (Times New Roman, A4 Portrait).
