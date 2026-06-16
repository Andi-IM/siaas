# 0009: SQLite Connection Consolidation and Success Path Testing

- Status: accepted
- Deciders: Agent, Human
- Date: 2026-06-16

## Context and Problem Statement

The SIAAS Rust backend uses SeaORM for SQLite database access. In [db/mod.rs](file:///d:/01_Projects/sias/src-tauri/src/db/mod.rs), there were two separate functions to connect to the database: `establish_connection` (for production file-based database) and `establish_in_memory_connection` (for in-memory test database). Both functions duplicated the execution of SQLite PRAGMA commands (such as enabling foreign keys, setting journal mode to WAL, and setting synchronous mode to NORMAL).

Furthermore, the integration tests only executed the error paths of `establish_connection`, leaving 4 lines of code (PRAGMA configurations and success return) untested, resulting in incomplete test coverage for `db/mod.rs` (around 84.62% line coverage).

We need to resolve the code duplication to maintain code cleanliness and ensure that all connection logic is thoroughly verified under integration tests.

## Decision Drivers

- **DRY (Don't Repeat Yourself)**: Avoid duplicated SQL pragma strings across connection setup functions.
- **KISS (Keep It Simple, Stupid)**: Do not introduce unnecessary high-level abstractions (like traits or factories) just for SQLite connections.
- **100% Code Coverage**: Ensure that all lines in `db/mod.rs` are executed and verified during `cargo test`.

## Considered Options

1. **Extract private helper function + Add success path integration test (Chosen)**:
   Extract SQLite configuration pragmas into a private helper function `configure_sqlite_pragmas` called by both `establish_connection` and `establish_in_memory_connection`. Write a new integration test that opens a temporary database file using `establish_connection` and verifies its success.
2. **Only add integration test without refactoring**:
   Leave the duplicate code as is and only add the integration test to increase coverage.
3. **Introduce Connection Factory Trait**:
   Introduce a trait abstraction for database connections to allow polymorphism for SQLite and future database providers.

## Decision Outcome

Chosen option: **Option 1**, because it removes duplicate configuration logic, avoids over-engineering by keeping the architecture simple and easy to maintain, and achieves 100% test coverage for `db/mod.rs`.

### Consequences

- **Good**: Code duplication is eliminated. If database PRAGMAs need to change, it only requires modifications in one place.
- **Good**: Test coverage for `db/mod.rs` increases to 100% with a concrete integration test validating physical database file creation and connection.
- **Bad**: The integration test needs to create a temporary database file on disk, which must be cleaned up properly to avoid polluting the workspace.

## Implementation Plan

### Affected Files
- [src-tauri/src/db/mod.rs](file:///d:/01_Projects/sias/src-tauri/src/db/mod.rs): Extract `configure_sqlite_pragmas` helper and call it from both connection functions.
- [src-tauri/tests/db/mod.rs](file:///d:/01_Projects/sias/src-tauri/tests/db/mod.rs): Add `test_establish_connection_success` integration test.

### Verification Plan
- Run `cargo test` to verify all tests pass.
- Run `cargo llvm-cov` to verify that code coverage for `db/mod.rs` reaches 100%.
- Run `cargo clippy --all-targets --all-features -- -D warnings` to verify clean compilation.
