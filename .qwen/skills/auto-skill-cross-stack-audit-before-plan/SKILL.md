---
name: cross-stack-audit-before-plan
description: Audit a multi-layer codebase end-to-end before finalizing a plan, to avoid planning work that already exists
source: auto-skill
extracted_at: '2026-06-16T16:16:13.609Z'
---

When planning a feature that spans database → backend → frontend layers, always audit the full stack before finalizing the plan. This prevents double-counting work that's already done and produces an accurate "remaining work" breakdown.

## Procedure

### Step 1: Identify all layers and entry points
Given a plan document, list every file/layer mentioned:
- Database: migrations, seed scripts, schema
- Backend: entity models, core logic, Tauri/API commands, tests
- Frontend: TypeScript types, data/service layer, UI components

### Step 2: Read the deepest layer first (database)
- Check migrations for the column/feature being added
- Check seed scripts for initial data setup
- Note what's already present vs what's proposed

### Step 3: Move up to backend
- Read the entity model — does it already have the new field?
- Read core logic (`core.rs` or equivalent) — are CRUD functions updated?
- Read command layer (`commands.rs` or equivalent) — are invoke handlers updated?
- Check existing tests — do they already cover the new field?

### Step 4: Check frontend types
- Read `types.ts` — is the interface updated?
- Read the data/service layer — does the mapping include the new field in both read and write directions?

### Step 5: Check UI components
- Read the relevant view/component files
- Note what UI changes are still needed

### Step 6: Produce a status table

| Item | Path | Status |
|---|---|---|
| Migration N | `src-tauri/src/db/migrations.rs` | **Done** / **Missing** |
| Entity field | `entities/x.rs` | **Done** / **Missing** |
| Core CRUD | `core.rs` | **Done** / **Missing** |
| Command handlers | `commands.rs` | **Done** / **Missing** |
| Frontend types | `types.ts` | **Done** / **Missing** |
| Data layer mapping | `data.ts` / `curriculum-data.ts` | **Done** / **Missing** |
| UI component | `Component.tsx` | **Done** / **Missing** |

### Step 7: Present only the remaining work
Don't restate what's done. Present the refined plan as: "Here's what still needs to be implemented" with tasks scoped to only the missing pieces.

## Why this matters

- In a Tauri/Next.js project, a new database column requires touching 8+ files across Rust, TypeScript, and UI layers. Planning without auditing often duplicates 30-50% of the work.
- The audit also catches inconsistencies (e.g., field exists in entity but not in the frontend type mapping).
- Always verify that read paths AND write paths are both updated — a common gap is `addX()` getting the new field but `updateX()` not.
