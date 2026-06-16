---
status: proposed
date: 2026-06-16
decision-makers: andii
---

# 0010: Adopt Typed Error Handling, Generic Connection Traits, and Transaction Safety

## Context and Problem Statement

ADR-0008 established the `_core` function abstraction pattern: each Tauri IPC command delegates to a `*_core` function that accepts `&DatabaseConnection` instead of `State<'_, DatabaseConnection>`, enabling unit testing without the Tauri runtime.

This pattern has been successfully implemented across all 33 core functions in `src/db/core.rs`. However, a review against Rust best practices (per the project's `rust-best-practices` skill, Chapters 3 & 4) reveals three architectural violations that undermine the reliability and extensibility of the codebase:

### Problem 1: Stringly-Typed Error Handling

All 31 public functions in `core.rs` return `Result<T, String>`, and errors are generated via repetitive `.map_err(|e| e.to_string())` calls (85 occurrences). This violates Chapter 4 of the Rust best practices ("use `thiserror` for library errors") and causes:

- **Loss of programmatic error discrimination.** The frontend cannot distinguish a database constraint violation from a connection timeout or a validation failure — all arrive as opaque strings. This blocks the UI from displaying contextually appropriate error messages (e.g., "Nama program sudah ada" vs "Koneksi database gagal").
- **Redundant heap allocations.** Each `.to_string()` call allocates a new `String` on the heap, even when the error is immediately serialized to JSON for the Tauri IPC bridge.
- **No error hierarchy.** Business validation errors ("Nilai harus berada di antara 0 dan 100") are structurally indistinguishable from infrastructure errors (Sea-ORM `DbErr`).

### Problem 2: Hardcoded `&DatabaseConnection` prevents transaction use

Every `_core` function signature requires `&DatabaseConnection`:

```rust
pub async fn create_program_core(db: &DatabaseConnection, name: impl Into<String>)
```

Sea-ORM's `DatabaseTransaction` is a *separate type* — not a subtype of `DatabaseConnection`. Therefore, no `_core` function can be called inside a `db.transaction(|txn| ...)` block. This is an architectural dead end: adding transaction support later requires changing *every* function signature.

### Problem 3: Missing transaction atomicity on batch operations

Three critical functions perform multiple sequential writes without wrapping them in a database transaction:

1. **`assign_subject_to_semesters_core`** (L627): deletes old curriculum mappings, then inserts new ones in a loop. A mid-loop failure leaves the database with incomplete mappings.
2. **`batch_upsert_grades_core`** (L839): iterates over grades and upserts one by one. A failure at grade N leaves grades 1..N-1 committed and N+1..end uncommitted.
3. **`import_grades_from_excel_core`** (L1011): imports hundreds of student records and grades. Without a transaction, a failure at row 50 of 200 yields a half-imported, inconsistent dataset. Additionally, SQLite without an explicit transaction performs an implicit commit after each INSERT, degrading performance by 10–100× compared to a batched transaction.

## Decision

We will implement three changes in a single coordinated refactor:

### 1. Introduce a typed error enum using `thiserror`

Add a new file `src/db/error.rs` containing:

```rust
use thiserror::Error;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("Database error: {0}")]
    Database(#[from] sea_orm::DbErr),

    #[error("{0}")]
    Validation(String),

    #[error("{entity} with {field} '{value}' not found")]
    NotFound {
        entity: &'static str,
        field: &'static str,
        value: String,
    },

    #[error("{entity} with {field} '{value}' already exists")]
    Duplicate {
        entity: &'static str,
        field: &'static str,
        value: String,
    },

    #[error("Excel error: {0}")]
    Excel(String),
}

// Bridge to Tauri IPC: serialize AppError as a plain String for the frontend
impl From<AppError> for String {
    fn from(err: AppError) -> String {
        err.to_string()
    }
}
```

All `_core` functions will return `Result<T, AppError>` instead of `Result<T, String>`. The Tauri `#[command]` wrappers in `commands.rs` will continue to return `Result<T, String>`, converting via `.map_err(|e| e.to_string())` at the IPC boundary only.

### 2. Genericize connection parameters using `ConnectionTrait`

Change every `_core` function signature from:

```rust
pub async fn create_program_core(db: &DatabaseConnection, ...)
```

to:

```rust
pub async fn create_program_core<C: ConnectionTrait>(db: &C, ...)
```

This allows the same function to be called with either a `&DatabaseConnection` (normal use) or a `&DatabaseTransaction` (within a transaction block).

### 3. Wrap batch operations in transactions

The three identified functions will use `db.begin()` to acquire a `DatabaseTransaction`, pass it through the genericized `_core` helpers, and call `txn.commit()` on success:

```rust
pub async fn assign_subject_to_semesters_core<C: ConnectionTrait>(
    db: &C,
    major_id: &str,
    subject_id: &str,
    semester_sequences: Vec<i32>,
) -> Result<(), AppError> {
    let txn = db.begin().await?;
    // ... all operations use &txn ...
    txn.commit().await?;
    Ok(())
}
```

### Non-Goals

- **Rewriting the frontend error handling.** The IPC bridge will continue to serialize errors as strings. Structured error codes for the frontend can be addressed in a future ADR.
- **Adding `anyhow` for binary-level errors.** `thiserror` alone is sufficient for this library crate.
- **Changing the Tauri command layer (`commands.rs`).** The wrapper functions remain thin delegates; only their return type conversion changes.

## Consequences

- **Good:** Callers can now `match` on `AppError` variants to take different recovery actions (retry on `Database`, show field-specific messages on `Validation`/`NotFound`/`Duplicate`).
- **Good:** Batch operations (`assign_subject_to_semesters`, `batch_upsert_grades`, `import_grades_from_excel`) become atomic — either all writes succeed or none do, preventing corrupt data states.
- **Good:** Excel import performance improves 10–100× on SQLite due to batched transaction commits instead of per-row implicit commits.
- **Good:** All `_core` functions become transaction-compatible without further signature changes.
- **Bad:** `thiserror` adds one new compile-time dependency (zero runtime cost; it's a derive macro).
- **Bad:** Every `_core` function signature changes, requiring updates to all 551 lines of integration tests in `tests/db/commands.rs`. However, the test logic remains identical — only the error assertion patterns change (from string comparison to variant matching).

## Implementation Plan

- **New files**: `src-tauri/src/db/error.rs`
- **Modified files**: `src-tauri/src/db/mod.rs`, `src-tauri/src/db/core.rs`, `src-tauri/src/db/commands.rs`, `src-tauri/tests/db/commands.rs`
- **Dependencies**: Add `thiserror = "2"` to `Cargo.toml` `[dependencies]`
- **Patterns to follow**:
  - `_core` functions return `Result<T, AppError>`
  - `#[tauri::command]` wrappers return `Result<T, String>` and convert at the boundary
  - Use `<C: ConnectionTrait>` for all `_core` function db parameters
  - Transaction-wrapped functions call `db.begin()` and `txn.commit()`
  - Use `AppError::NotFound { entity: "Student", field: "nis", value: nis.into() }` for structured errors
- **Patterns to avoid**:
  - Do NOT use `.map_err(|e| e.to_string())` inside `_core` functions (use `?` with `#[from]` instead)
  - Do NOT use `anyhow` — this is a library crate
  - Do NOT add `thiserror` derive to the Tauri command layer

### Execution Order

1. Add `thiserror = "2"` to `Cargo.toml`
2. Create `src/db/error.rs` with `AppError` enum
3. Update `src/db/mod.rs` to `pub mod error;`
4. Refactor `src/db/core.rs`: change all function signatures and replace `.map_err(|e| e.to_string())` with `?`
5. Update `src/db/commands.rs`: add `.map_err(|e| e.to_string())` at the IPC boundary only
6. Wrap `assign_subject_to_semesters_core`, `batch_upsert_grades_core`, and `import_grades_from_excel_core` in transactions
7. Update `tests/db/commands.rs` to work with the new signatures

### Verification

- [x] `cargo build` compiles without errors
- [x] `cargo clippy --all-targets -- -D warnings` passes with no warnings
- [x] `cargo test` — all existing tests pass
- [x] No `.map_err(|e| e.to_string())` calls remain inside `core.rs` (only in `commands.rs`)
- [x] All `_core` functions use generic `<C: ConnectionTrait>` parameter
- [x] `assign_subject_to_semesters_core`, `batch_upsert_grades_core`, `import_grades_from_excel_core` use explicit transactions
- [x] `AppError` enum has at least variants: `Database`, `Validation`, `NotFound`, `Duplicate`, `Excel`
- [x] Integration tests assert on `AppError` variants (not string comparisons) where applicable

## Alternatives Considered

- **`anyhow` instead of `thiserror`**: Rejected because `anyhow` is designed for application-level error handling (binaries) where error variants don't need to be matched programmatically. Our `_core` layer is a library that needs typed variants.
- **Keep `String` errors but add error codes**: Rejected because it would be a half-measure — still losing type safety internally while adding parsing complexity for string-encoded codes.
- **Separate the transaction refactor into a follow-up ADR**: Rejected because genericizing to `ConnectionTrait` (needed for transactions) and switching to `AppError` (needed for `?` propagation of `DbErr`) are tightly coupled. Doing them together avoids a double-migration of every function signature.

## More Information

- **Related ADRs**: 
  - [0005: Adopt SeaORM](0005-adopt-sea-orm.md) — establishes SeaORM as the ORM layer
  - [0008: Abstract Core Logic from Tauri Commands](0008-abstraksi-core-logic-tauri.md) — establishes the `_core` pattern this ADR builds upon
- **Revisit if**: The frontend needs structured error codes (JSON error objects instead of strings) — at that point, consider extending `AppError` with `serde::Serialize` and removing the string conversion at the IPC boundary.
