---
status: proposed
date: 2026-06-16
decision-makers: andii
---

# 0011: Close Coverage Gaps on Read Operations and Error Paths

## Context and Problem Statement

ADR-0008 established the `_core` function abstraction pattern, successfully separating business logic from Tauri IPC wrappers. This enabled unit testing of all CRUD operations via the built-in Rust test runner against in-memory SQLite databases.

However, a coverage analysis of `coverage.json` (generated via `cargo-llvm-cov`) reveals a critical blind spot: **all read/query functions (`get_*_core`) in `core.rs` have zero test coverage**, despite being the most frequently called operations in production.

### Current State (measured 2026-06-16)

| Metric | Value |
|:---|---:|
| Overall line coverage | 62.7% (1,178/1,880) |
| `core.rs` line coverage | 78.5% (943/1,201) |
| `core.rs` uncovered lines | 258 |
| `core.rs` uncovered unique `get_*` functions | 8 |
| `error.rs` line coverage | 25.0% (3/12) |
| `migrations.rs` line coverage | 87.7% (193/220) |
| `commands.rs` line coverage | 0% (Tauri-coupled, expected) |

### Problem 1: All read operations are untested

The existing test suite (`tests/db/commands.rs`) thoroughly covers:
- ✅ Create operations (program, major, batch, semester, subject, student, curriculum_subject)
- ✅ Update operations (program, major, subject, student)
- ✅ Delete operations (program, major, subject, student)
- ✅ Grade upsert and batch upsert
- ✅ Excel import and export

But **zero coverage** exists for:
- ❌ `get_students_core` — returns all students, the primary dashboard query
- ❌ `get_subjects_core` — returns subjects sorted by category weight then sequence
- ❌ `get_batches_core` — returns all batches
- ❌ `get_student_grades_core` — returns grades per student (rapor view)
- ❌ `get_grades_by_filter_core` — complex multi-JOIN filter query (major + semester)
- ❌ `get_subjects_by_major_core` — returns subjects grouped with semester assignments
- ❌ `get_curriculum_subjects_core` — returns all curriculum-subject mappings
- ❌ `get_category_weight` — pure function for subject sorting weight

These are the **most frequently executed operations** (every page load triggers at least one), and the most vulnerable to regressions when schema or query logic changes.

### Problem 2: Error conversion paths in `error.rs` are partially untested

Only `From<sea_orm::DbErr>` is covered. The `From<std::io::Error>` conversion and the `serialize_display` serde implementation have zero coverage. If an I/O error occurs during Excel operations, the error may not serialize correctly to the frontend.

### Problem 3: Migration rollback has never been exercised

`MigrationManager::run` is called 23× in tests, but `MigrationManager::rollback` has zero coverage. If a migration fails mid-flight, the rollback path is an unknown.

## Decision

We will **add integration tests for all uncovered read operations, error conversions, and migration rollback** in a phased approach, following the existing test patterns established in `tests/db/commands.rs`.

### Phase 1: Read/Query Functions (highest impact)

Add tests for all 8 uncovered `get_*` functions in `core.rs`:

| Function | Test Strategy |
|:---|:---|
| `get_students_core` | Create 2+ students via `create_student_core`, then assert list contains them |
| `get_subjects_core` | Create subjects with different categories, verify sorted output order |
| `get_batches_core` | Create batches via `create_batch_core`, then assert list |
| `get_student_grades_core` | Reuse `setup_curriculum_and_grade_test_env`, query grades |
| `get_grades_by_filter_core` | Setup curriculum+grades, filter by major_id and semester_sequence |
| `get_subjects_by_major_core` | Create curriculum mappings, verify `MataPelajaranData` grouping and sorting |
| `get_curriculum_subjects_core` | Create mappings, assert all returned |
| `get_category_weight` | Synchronous unit test for all 3 branches |

### Phase 2: Error Path Coverage

Add tests for uncovered error handling:
- `From<std::io::Error> for AppError` — trigger via I/O error construction
- `serialize_display` — serialize `AppError` to JSON and verify output
- Update/delete with non-existent IDs to cover `NotFound` error paths
- Export with empty dataset

### Phase 3: Migration Rollback

Test `MigrationManager::rollback` to verify it executes without error.

### Non-Goals

- **Testing `commands.rs` wrappers**: These are thin Tauri IPC delegates. Testing them requires mocking the Tauri runtime, which adds complexity disproportionate to the value gained. `core.rs` coverage is sufficient for business logic confidence.
- **Testing entity relation boilerplate**: SeaORM-generated `impl Related<T>` traits in entity files are framework code, not business logic.
- **Achieving 100% line coverage**: Some LLVM-counted monomorphized instances and unreachable branches are not worth testing.

## Consequences

- **Good**: All user-facing read operations will have verified correctness, catching regressions early when schema or query logic changes.
- **Good**: The `get_subjects_core` sorting logic (by category weight, then sequence) will be formally verified, preventing silent misordering in the UI.
- **Good**: `get_grades_by_filter_core`'s multi-JOIN query (semester + major + curriculum_subject + student_grades) will be validated against real data, catching any query construction errors.
- **Good**: Error serialization paths will be verified, ensuring the frontend always receives meaningful error messages.
- **Good**: Expected coverage improvement: `core.rs` from 78.5% → ~93%, overall from 62.7% → ~74%.
- **Bad**: ~200 additional lines of test code to maintain. However, these follow the established test patterns and are self-contained.

## Implementation Plan

- **Modified files**: `src-tauri/tests/db/commands.rs`
- **Pattern**: Follow existing test structure — use `setup_test_db()` for DB setup, call `_core` functions directly, assert on returned data.
- **Dependencies**: No new dependencies required. Existing `tokio`, `sea-orm` test infrastructure is sufficient.

### Execution Order

1. Add `get_category_weight` unit test (synchronous, no DB needed)
2. Add `get_batches_core` test
3. Add `get_students_core` test
4. Add `get_subjects_core` test (verify sorting)
5. Add `get_curriculum_subjects_core` test
6. Add `get_subjects_by_major_core` test (complex, depends on curriculum setup)
7. Add `get_student_grades_core` test
8. Add `get_grades_by_filter_core` test (complex, depends on full curriculum + grade setup)
9. Add `error.rs` conversion tests
10. Add `MigrationManager::rollback` test

### Verification

- [ ] `cargo test` — all new and existing tests pass
- [ ] `cargo llvm-cov --json` — `core.rs` coverage ≥ 90%
- [ ] `cargo clippy --all-targets -- -D warnings` — no new warnings
- [ ] No regressions in existing test suite

## Alternatives Considered

- **Mock-based testing with `sea-orm-mock`**: Rejected. In-memory SQLite tests are already established and test the actual SQL behavior, providing higher confidence than mocked responses.
- **Property-based testing with `proptest`**: Considered for `get_category_weight` but overkill for 3 branches. May be revisited for grade validation logic.
- **End-to-end testing via Tauri test harness**: Rejected for this phase. The `_core` pattern (ADR-0008) explicitly enables unit testing without the Tauri runtime.

## More Information

- **Related ADRs**:
  - [0008: Abstract Core Logic from Tauri Commands](0008-abstraksi-core-logic-tauri.md) — establishes the `_core` testing pattern this ADR exercises
  - [0010: Rust Error Handling and Transaction Safety](0010-rust-error-handling-dan-transaction-safety.md) — introduces `AppError` enum whose conversion paths need test coverage
- **Data source**: Coverage analysis from `src-tauri/coverage.json` (generated via `cargo llvm-cov export`)
- **Revisit if**: Coverage drops below 85% on `core.rs` after future feature additions — add tests as part of the feature PR.
