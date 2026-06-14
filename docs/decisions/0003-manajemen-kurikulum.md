# ADR 0003: Hierarchical Curriculum & Subject Management

*   **Status**: accepted
*   **Decider**: Gemini CLI, User
*   **Date**: 2026-06-14

## Context

SIAAS needs to support complex vocational curriculum management, which includes a hierarchical structure from study programs down to specific subjects.

## Decision

We have adopted a hierarchical data structure: **Program Keahlian** (Vocational Program) > **Konsentrasi Keahlian** (Vocational Concentration) > **Mata Pelajaran** (Subject). The management interface is implemented as a *Single-page Dashboard* with a *Master-Detail Drill-down* pattern for input efficiency. Full CRUD capabilities are provided via modal-based forms.

## Implementation Plan

*   **Affected paths**: `src/lib/types.ts`, `src/lib/data.ts`, `src/app/kurikulum/page.tsx`, `src/components/sidebar.tsx`
*   **Pattern**: Instant client-side click-to-drill interactions and modal-driven creation/editing using React state.

## Verification

- [x] Curriculum menu appears in the sidebar.
- [x] Users can navigate from Program to Concentration.
- [x] Subject list automatically filters based on the selected concentration.
- [x] Programs, Concentrations, and Subjects can be Created and Edited via modals.
- [x] Subjects can be Deleted with confirmation.
- [x] Layout uses high-density cards and data tables.
