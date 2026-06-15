# ADR 0005: Adopt SeaORM for SQLite Database Management

*   **Status**: accepted
*   **Decider**: Antigravity, User
*   **Date**: 2026-06-15

## Context

SIAAS requires local database persistence to store academic administration data (students, grades, majors, batches, semesters, subjects, and curriculum maps) offline-native.

In our initial iteration, we implemented this using raw SQL queries with the `rusqlite` crate and synchronous connection pooling (`r2d2`). While this approach was functional, it introduced significant drawbacks:
- **High Boilerplate**: Manual mapping of database rows to Rust struct fields was verbose and error-prone, particularly for the 29-field student record.
- **Maintenance Overhead**: Lack of compilation-level check for SQL queries made refactoring schema columns brittle.
- **Synchronous Overhead**: Blocking SQL connections required managing thread delegation in the Tauri state to prevent UI stuttering.

To ensure developer efficiency, type-safe data access, and a clean async architecture that integrates natively with Tauri v2 commands, we needed a robust Object-Relational Mapping (ORM) solution.

## Decision

We will adopt **SeaORM** with the `sqlx-sqlite` driver as the Object-Relational Mapping (ORM) framework to manage the SQLite database.

We chose SeaORM because:
1. **Type-Safety**: Replaces raw SQL with a strongly typed query builder, detecting typos and schema mismatches at compile time.
2. **Async-Native**: Integrates perfectly with Tauri's async runtime, allowing us to implement database command handlers as async Rust functions.
3. **Automatic Mappings**: Handles serializing and deserializing of Entity Models automatically, removing the need for a separate custom mapping layer.
4. **Relational Support**: Natively defines entity relations (`belongs_to`, `has_many`) and handles foreign key cascading/restrictions.

To prevent long compilation times and maintain control over table structures, we will continue to use raw SQL scripts for schema migrations executed in transactions via SeaORM's raw query interface, rather than setting up the code-based `sea-orm-migration` project template.

## Implementation Plan

1. **Cargo Configuration**:
   - Add `sea-orm` (with `sqlx-sqlite`, `runtime-tokio-native-tls`, `macros` features) and `tokio` to [Cargo.toml](file:///d:/01_Projects/sias/src-tauri/Cargo.toml).
   - Remove `rusqlite` and `r2d2` crates.
2. **Entity Definition**:
   - Create a submodule [entities/](file:///d:/01_Projects/sias/src-tauri/src/db/entities) containing defined SeaORM Entity Models for `majors`, `batches`, `semesters`, `subjects`, `students`, `curriculum_subjects`, and `student_grades`.
   - Add detailed rustdoc comments on each column and relation to provide context.
3. **Database Connection Setup**:
   - Update [mod.rs](file:///d:/01_Projects/sias/src-tauri/src/db/mod.rs) to establish an async `DatabaseConnection`.
   - Execute standard SQLite PRAGMAs (`foreign_keys = ON`, `journal_mode = WAL`, `synchronous = NORMAL`) right after connection setup.
4. **Migration Adaptations**:
   - Update `MigrationManager` in [migrations.rs](file:///d:/01_Projects/sias/src-tauri/src/db/migrations.rs) to execute the SQL migrations asynchronously in transactions using SeaORM.
5. **Commands Integration**:
   - Convert all Tauri commands in [commands.rs](file:///d:/01_Projects/sias/src-tauri/src/db/commands.rs) to async and query/insert data using SeaORM ActiveModels.
6. **Application Wireup**:
   - Refactor [lib.rs](file:///d:/01_Projects/sias/src-tauri/src/lib.rs) to open the database asynchronously using Tauri's async runtime on setup and store the `DatabaseConnection` in state.

## Consequences

- **Asynchronous Flow**: Developers must write database-related Rust code as async functions and utilize `.await` on queries.
- **Dependency Footprint**: SeaORM and Tokio increase the initial compilation time and binary size slightly, though this is negligible for a desktop application distribution.
- **SQLite Parameter Constraint**: The `foreign_keys`, `journal_mode`, and `synchronous` pragmas cannot be parsed in the SQLx sqlite URL string and must be executed as manual SQL PRAGMA statements on connection.

## Verification

- [x] Compilation completes warning-free.
- [x] All database integration tests in `db_tests.rs` pass successfully.
- [x] SQLite constraints (RESTRICT delete for Major referenced by Students, CASCADE delete for Major referenced by Curriculum Subjects) are enforced.
- [x] Parameterized SQL statements block SQL injection attempts.
