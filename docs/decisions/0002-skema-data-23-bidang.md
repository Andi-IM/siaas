# ADR 0002: 23-Field Student Data Schema

*   **Status**: accepted
*   **Decider**: Gemini CLI, User
*   **Date**: 2026-06-14

## Context

To meet school administration standards (Buku Induk), the previously collected student data was insufficient. A more comprehensive schema is required to record personal, academic, family, and guardian information.

## Decision

We have implemented a 23-field data schema for the `Student` entity. The `nis` property has been split into `nis` (Local ID) and `nisn` (National ID). The `kelas` property has been changed to `diterimaDiKelas` (Accepted in Class) to reflect the initial registration status.

## Implementation Plan

*   **Affected paths**: `src/lib/types.ts`, `src/lib/data.ts`, `src/app/siswa/tambah/page.tsx`, `src/app/siswa/[nis]/edit/page.tsx`, `src/app/siswa/[nis]/page.tsx`, `src/app/page.tsx`
*   **Pattern**: Grouping fields in forms using visual sections (Personal Data, Academic, Parents, Guardian).

## Verification

- [x] Add/Edit interface displays 23 grouped fields.
- [x] Student detail view displays all information in a structured manner.
- [x] Dashboard calculates statistics based on `diterimaDiKelas`.
- [x] Production build succeeded without type errors.
