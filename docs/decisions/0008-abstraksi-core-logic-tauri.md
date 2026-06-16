# 0008: Abstract Core Logic from Tauri Commands for Test Coverage

**Status:** Accepted
**Date:** 2026-06-16

## Context

SIAAS relies on Tauri as a local backend layer (SQLite-based) to avoid dependency on internet connections. Currently, database operation functions are coupled directly with the `#[tauri::command]` macro declarations.

This coupling causes issues regarding Testability:
1. The `#[tauri::command]` macro generates boilerplate code (for serialization and state extraction) that is never executed during pure Rust Integration Testing.
2. Interactions with the OS, such as `rfd::FileDialog` for Excel import/export, are blocking and cannot be automated without user intervention.
3. This limits the test coverage of a crucial file (`commands.rs`) to ~82%, making it difficult to achieve the 100% extreme reliability target set by the Academic Administrative Core.

## Decision

We have decided to **separate pure Rust logic (Core Logic) from the Tauri framework wrappers**.

*   All business functions (CRUD, grade calculations, Excel file processing) will be written as standard Rust functions that accept pure references, such as `&DatabaseConnection`. (Example: `create_program_core`).
*   The `#[tauri::command]` macros will only be used as very thin wrappers responsible for extracting arguments from IPC and calling the `_core` functions (similar to the Controller calling the Service in Clean Architecture).
*   Blocking UI functions (like file pickers) will be abstracted using Dependency Injection or Trait abstraction, allowing them to be mocked in a testing environment.

## Consequences

*   **Increased Coverage:** Core business functions can be fully (100%) reached by the built-in Rust test runner.
*   **Modularity:** If we decide to build an independent CLI or a web server other than Tauri in the future, the `_core` functions can be immediately reused.
*   **Minor Overhead:** There will be a slight increase in lines of code and parameter duplication between the Tauri wrapper and Core function parameters, but it is a worthwhile tradeoff for the stability gained.

## Implementation Plan

- **Affected paths**: `src-tauri/src/db/commands.rs`, `src-tauri/tests/db/commands.rs`
- **Pattern**: 
  - Functions like `create_x` will be split into `create_x_core(db: &DatabaseConnection) -> Result<...>` and `create_x(state: State) -> Result<...>`.
  - In testing environments, developers must exclusively call `create_x_core`.
