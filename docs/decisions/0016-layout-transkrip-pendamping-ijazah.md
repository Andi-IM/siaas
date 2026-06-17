# 16. Layout Transkrip Nilai & Transcript Group Schema

Date: 2026-06-16
Updated: 2026-06-17

## Status

Accepted

## Context

The school requires a secondary transcript layout to act as a diploma supplement ("Transkrip Nilai"). Unlike the 3-Year Program transcript which lists grades across 6 semesters, this layout presents a single aggregated final grade column per subject.

Specific aggregation rules apply to the Vocational Subjects (Kelompok Kejuruan):
1. **Dasar-dasar Program Keahlian**: The score must be calculated exclusively as the average of grades from Semester 1 and Semester 2.
2. **Konsentrasi Keahlian**: Derived using a specific formula that merges the core vocational skills. The final score is calculated as:
   `Final Score = (Avg of Core Subjects in Smt 3 + Avg of Core Subjects in Smt 4 + Avg of Core Subjects in Smt 6 + UKK Score) / 4`. Note that Semester 5 is intentionally excluded (as it is historically allocated for industrial internships/PKL).
3. **Other Vocational Subjects** (e.g., Matematika, B. Inggris, PKL, PKWU) are averaged across all their active semesters.

Originally, a frontend string-matching approach was considered to identify which subjects belong to the "Core Subjects" (Konsentrasi Keahlian). However, for a reliable offline-native application, hardcoding business rules based on subject names in the presentation layer is fragile. The administration requires "full control" to dynamically assign subjects to their respective calculation formulas.

Additionally, the transcript page needs to support direct PDF file export (distinct from the browser print dialog) so that administrators can save official transcript documents as standalone files without relying on the print dialog's "Save as PDF" option.

## Decision

1. **Schema Extension**: We will extend the `subjects` table in the database with a new column named `transcript_group`.
2. **Allowed Values**: The `transcript_group` will explicitly declare how a subject behaves in the diploma transcript:
   - `UMUM`: Ordinary subject (averaged across all 6 semesters).
   - `KEJURUAN_UMUM`: Common vocational subjects (averaged across all 6 semesters).
   - `KEJURUAN_DASAR`: Foundational vocational subjects. Averages are capped to Semesters 1 & 2.
   - `KEJURUAN_KONSENTRASI`: Core vocational subjects. These are aggregated, and their averages for Smt 3, Smt 4, and Smt 6 are pulled into the final "Konsentrasi Keahlian" formula.
   - `UKK`: The standalone Competency Exam subject, pulled directly into the "Konsentrasi Keahlian" formula.
3. **Backend & Tooling**: 
   - A new SQLite migration script will be created to add the `transcript_group` column and backfill existing subjects to the correct group.
   - The Rust `Subject` structs and CRUD operations will be updated.
4. **UI Refactoring**: 
   - The "Tambah/Edit Mata Pelajaran" form will include a select dropdown for `transcript_group`, granting the administration full authority over transcript layout mappings.
   - `StudentTranscriptView.tsx` will introduce a Tab Navigation to toggle between modes. The calculation logic will strictly group subjects by their `transcriptGroup` database property instead of performing string exclusion.
5. **PDF Export**: 
   - Client-side PDF generation using `html2canvas-pro` and `jspdf` npm packages.
   - The "Simpan PDF" button captures the existing print layout at 2x resolution using `html2canvas-pro`, converts it to an A4 portrait PDF via `jspdf`, and triggers a direct file download — no print dialog involved.
   - Multi-page support: if the transcript content exceeds one A4 page, the canvas is sliced into page-sized segments automatically.
   - This approach is distinct from the "Cetak Transkrip" button which opens the native print dialog for physical printing.
6. **Naming Convention**: The UI label for the secondary transcript mode is "Transkrip Nilai" (previously referred to as "Pendamping Ijazah" during early design discussions).

## Consequences

- Increased initial development cost: Requires touching the database, Rust backend, API commands, UI forms, and the transcript renderer.
- High stability and flexibility: The school can now add entirely new vocational subjects and simply select "KEJURUAN_KONSENTRASI" to automatically route its grades into the complex aggregation formula without needing a software update.
- The `seed_academic_core.sql` script must be updated to insert initial data with the appropriate `transcript_group`.
- Two additional npm dependencies (`html2canvas-pro`, `jspdf`) are introduced for client-side PDF generation. These are well-maintained, widely-used libraries with no backend changes required.
- PDF export quality is rasterized (image-based), which is acceptable for fixed-layout official documents but means text is not selectable within the PDF.
