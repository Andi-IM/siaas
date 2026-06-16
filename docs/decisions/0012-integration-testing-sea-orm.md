# ADR 0012: Integration Testing Strategy for Sea-ORM Entities

## Status
Proposed

## Context
The SIAS project manages complex academic data with tight inter-entity relationships using SQLite and Sea-ORM. While Rust guarantees type safety at the code level, data integrity at the database level (such as foreign key constraints, uniqueness, and schema synchronization) requires empirical verification. Currently, basic testing infrastructure exists but does not cover all primary entities and is not yet integrated into the CI/CD pipeline.

## Decision
We decided to standardize and mandate integration testing for the database layer with the following provisions:

1.  **Database Isolation**: Each test suite will use an in-memory SQLite database (`:memory:`) to ensure total isolation between tests, fast execution, and avoid residual files in development/CI environments.
2.  **CRUD Coverage**: Every primary entity (e.g., `Programs`, `Majors`, `Students`, etc.) must have at least one test scenario covering Create, Read, Update, and Delete operations.
3.  **Relation & Constraint Verification**: Tests must validate the behavior of inter-entity relationships, especially `ON DELETE CASCADE` and `ON DELETE RESTRICT` constraints as defined in the schema.
4.  **Reusable Infrastructure**: Utilize the `setup_test_db()` helper for connection initialization and automatic migration execution before each test run.
5.  **CI Automation**: Add a `cargo test` stage to GitHub Actions to ensure every backend code change is automatically validated.

## Consequences
*   **Positive**: Increased system reliability against accidental database schema changes.
*   **Positive**: Simplifies refactoring of the entity layer due to the presence of a safety net.
*   **Negative**: CI execution time will increase due to Rust compilation and database test execution.
*   **Negative**: Maintenance of mock data within test files is required as the schema evolves.

## References
- [ADR 0005: Adopt SeaORM for SQLite Database Management](0005-adopt-sea-orm.md)
- [ADR 0010: Rust Error Handling and Transaction Safety](0010-rust-error-handling-dan-transaction-safety.md)
- [ADR 0011: Coverage Gap Closure - Read Operations](0011-coverage-gap-closure-read-operations.md)
