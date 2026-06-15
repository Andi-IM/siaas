# ADR 0006: Native Excel (XLSX) Import & Export with Custom Styling

*   **Status**: accepted
*   **Decider**: Antigravity, User
*   **Date**: 2026-06-15

## Context

SIAAS requires importing and exporting student records and academic grades via Microsoft Excel (`.xlsx`) files. Administrators are used to maintaining grades in spreadsheets matching a pre-defined institutional layout.

Key requirements:
- **Offline-Native Parsing**: All file parsing, generation, and native dialogs must run in the Tauri (Rust) backend, keeping the Next.js frontend free from file system APIs and heavy Excel parsing bundles.
- **Dynamic Headers**: Column definitions must dynamically match semesters and subjects currently defined in the SQLite database, rather than using hardcoded headers.
- **Visual Faithfulness**: Exported spreadsheets must match the precise formatting, colors, typography, column widths, row heights, and cell merges of the school's official template (`reference.xlsx`).

## Decision

We will implement native Excel import and export in the **Tauri (Rust) backend** using native system dialogs, un-bundled webview dependencies, and static-checked Rust libraries.

We adopt the following backend dependencies:
1. **`rfd` (Rust File Dialogs)**: With default features disabled (to avoid Wayland scanner dependencies on Windows) to launch native platform dialogs for opening (`pick_file`) and saving (`save_file`) Excel files.
2. **`calamine`**: A fast, pure-Rust Excel/OpenDocument reader to parse workbook cells using `Data` enum values.
3. **`rust_xlsxwriter`**: A modern Rust library to generate `.xlsx` spreadsheets, allowing precise control over cells, merging ranges, column widths, row heights, typography, and color palette formatting.

### Column Mapping and Parsing Rules
- **Import**: Parsed dynamically starting at column index 6. The semester index is extracted from Row 5 (index 4, e.g. "SEMESTER 1") and the subject code from Row 6 (index 5, e.g. "PAPB"), which are matched case-insensitively to the active SQLite schema.
- **Export**: Generates columns matching the curriculum subjects sorted by semester. Adjacent cells under the same semester sequence are merged horizontally.

### Visual Styling specifications
- **Fonts**: `Aptos Narrow` size 11 Bold for titles; `Aptos Narrow` size 9 (Bold for headers, Regular for grades); `Times New Roman` size 9 for student details (No, Name, Birthplace, Date, NIS, NISN).
- **Background Fills**:
  - Title block: `#FFDE75`
  - Student details: `#CFECF7` (NO, NAMA, Tempat, Tanggal)
  - Student registration: `#B8DCAB` (NIS, NISN)
  - Semester header groupings: `#D1E1D3`
  - SMT 5 / PKL header: `#E5FDFF`
  - Alternating subject codes: `#FDFDFD` / `#DCEDD5`
  - Number row (Row 7) and student detail records: `#FFFFCC`
  - Even semester grades: `#ECD5E9`
- **Sizing**: Columns widths (NO: 4.57, NAMA: 24.43, Tempat: 11.29, Tanggal: 16.71, NIS: 7.57, NISN: 9.29, Grades: 6.29); Row heights (titles: 20.0, headers: 25.0, numbers: 18.0, students: 20.0).

## Implementation Plan

1. **Cargo Configuration**:
   - Add `rfd = { version = "0.15", default-features = false }`, `calamine = "0.26"`, and `rust_xlsxwriter = "0.64.0"` to [Cargo.toml](file:///d:/01_Projects/sias/src-tauri/Cargo.toml).
2. **Commands Implementation**:
   - Implement `import_grades_from_excel` and `export_grades_to_excel` commands in [commands.rs](file:///d:/01_Projects/sias/src-tauri/src/db/commands.rs).
   - Implement formatting and cell-merging inside the helper `populate_excel`.
   - Register commands in [lib.rs](file:///d:/01_Projects/sias/src-tauri/src/lib.rs).
3. **Frontend Wrapping**:
   - Define wrapper methods in [data.ts](file:///d:/01_Projects/sias/src/lib/data.ts) that invoke Tauri commands.
   - Wire handlers to buttons in [page.tsx](file:///d:/01_Projects/sias/src/app/rekap/page.tsx) with automatic page refreshing on successful imports.
4. **Integration Testing**:
   - Add cargo unit test `test_populate_excel_and_parse` checking workbook generation structure and parsing consistency.

## Consequences

- **Backend Logic confinement**: All parsing overhead and OS-level file saving tasks run safely inside the compiled Rust binary, keeping Next.js focused purely on UI representation.
- **Strict Template Requirements**: Import files must follow the row constraints (titles: row 1-3, headers: row 5-6, numbers: row 7, student records: row 8+).
- **Better User Experience**: Uses the user's native OS file save/open dialogs rather than custom web dialogs.

## Verification

- [x] Cargo check compiles clean and warning-free.
- [x] Next.js builds successfully.
- [x] Round-trip Excel generation and parsing unit test passes successfully.
- [x] Validated native save dialog outputs are properly styled and readable in Microsoft Excel.
