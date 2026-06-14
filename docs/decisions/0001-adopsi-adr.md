# ADR 0001: Adoption of Architecture Decision Records (ADR)

*   **Status**: accepted
*   **Decider**: Gemini CLI
*   **Date**: 2026-06-14

## Context

The SIAAS (Sistem Informasi Administrasi Akademik Siswa) project is evolving rapidly with various schema changes and new features. A structured way is needed to record the rationale behind architecture and technical decisions so that future AI agents and human developers can understand the project's history.

## Decision

We are adopting the use of Architecture Decision Records (ADR) to document significant decisions in this project. ADRs are stored in the `docs/decisions/` directory using the Markdown format.

## Consequences

*   **Positive**: Transparency of decisions, simplifies onboarding for new developers/AI agents, prevents rework due to lack of context.
*   **Task**: Every major decision must be preceded or followed by the creation of an ADR.
