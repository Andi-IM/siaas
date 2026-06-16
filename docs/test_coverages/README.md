# Test Coverage Documentation

This folder contains the test coverage reports and execution metrics for the SIAS application. The codebase is tested at two levels:
1. **Rust Backend**: Integration and unit tests covering SQLite migrations, CRUD entities, business logic, SQL injection prevention, and Tauri command controllers.
2. **Next.js Frontend**: Vitest unit/component tests covering React views, page routing wrappers, data management utilities, and modal interactions.

---

## 1. Rust Backend Coverage

Rust coverage is generated using `cargo llvm-cov` on the integration test target.

### Overall Rust Metrics
- **Line Coverage**: **78.27%** (1,444 out of 1,845 executable lines covered)
- **Function Coverage**: **33.47%** (83 out of 248 functions executed)
- **Region Coverage**: **71.49%** (2,109 out of 2,950 regions covered)

### Crate Module Breakdown

| Module / File | Executable Lines | Covered Lines | Line Coverage | Function Coverage | Notes / Context |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `db/commands.rs` | 1,514 | 1,242 | **82.03%** | 36.11% | Core Tauri commands, Excel parser/generator core functions. |
| `db/migrations.rs` | 217 | 193 | **88.94%** | 60.00% | Migration runner and schema setups. |
| `db/mod.rs` | 26 | 9 | **34.62%** | 50.00% | SQLite connection options and WAL configuration. |
| `db/entities/*` | 51 | 0 | **0.00%** | 0.00% | SeaORM auto-generated model declarations (mostly structures & derives). |
| `lib.rs` / `main.rs` | 40 | 0 | **0.00%** | 0.00% | Tauri application entry point and builder. |

### Execution Command
To generate the latest Rust coverage report locally:
```bash
cargo llvm-cov --manifest-path src-tauri/Cargo.toml --ignore-filename-regex "entities|main|lib"
```

---

## 2. Next.js Frontend Coverage

Frontend coverage is generated using `vitest --coverage` with the `istanbul` provider.

### Overall Frontend Metrics
- **Statement Coverage**: **77.15%** (Stmts)
- **Branch Coverage**: **75.13%** (Branch)
- **Function Coverage**: **78.94%** (Funcs)
- **Line Coverage**: **76.82%** (Lines)

### Route & Component Breakdown

| Route / Component Group | Line Coverage | Statement Coverage | Branch Coverage | Status / Notes |
| :--- | :--- | :--- | :--- | :--- |
| `app/page.tsx` (Dashboard) | **100.00%** | 100.00% | 100.00% | Fully tested dashboard indicators. |
| `app/kurikulum/` | **100.00%** | 100.00% | 100.00% | Subject table lists and curriculum allocations. |
| `app/siswa/detail/` | **100.00%** | 100.00% | 100.00% | Student profile details and delete dialogs. |
| `app/siswa/edit/` | **100.00%** | 100.00% | 100.00% | Student info update forms. |
| `app/siswa/tambah/` | **100.00%** | 98.36% | 100.00% | Student add forms and validations. |
| `app/rekap/` (Excel Rekap) | **73.07%** | 71.63% | 58.33% | Excel import/export actions and dialog alerts. |
| `app/siswa/transkrip/` | **0.00%** | 0.00% | 0.00% | Untested transcript table view. |
| `components/` (Sidebar, Nav) | **0.00%** | 0.00% | 0.00% | Navigation menus (mostly layout-only). |

### Execution Command
To generate the latest frontend coverage report:
```bash
npm run test:coverage
```

---

## 3. Maintenance and Target Thresholds
- **Commit Mandate**: All agents must run linting (`npm run lint`), type-checking (`npx tsc --noEmit`), and tests before committing changes to ensure coverage remains stable.
- **Coverage Goal**: Maintain backend line coverage above **75%** and frontend line coverage above **70%**.
