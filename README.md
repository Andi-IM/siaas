# SIAAS: Academic Administrative Core

[![codecov](https://codecov.io/gh/Andi-IM/siaas/graph/badge.svg?token=FHYTwuBZYh)](https://codecov.io/gh/Andi-IM/siaas)

Sistem Informasi Administrasi Akademik Siswa (SIAAS) is an offline-native administrative platform designed to digitalize and automate the management of student records in Indonesian schools (Buku Induk). Built for speed, precision, and institutional trust.

## 🚀 Features

- **Dashboard**: Real-time summary of student statistics and recent activities.
- **Student Management (Peserta Didik)**: Comprehensive 23-field record system including academic history, family details, and graduation data.
- **Curriculum & Subjects**: Hierarchical management of Vocational Programs, Concentrations, and Subjects (Master-Detail drill-down).
- **Academic Reports**:
  - **Rekap Data**: Spreadsheet-style grid for multi-semester record auditing with high-density vertical headers.
  - **Academic Transcript**: Professional A4 Portrait documents with official formatting (Excel-style) and print optimization.
- **Native Desktop**: Distributed as a lightweight Windows `.exe` using Tauri.

## 🛠️ Technical Stack

- **Frontend**: Next.js 15.5 (React 19, TypeScript)
- **Styling**: Vanilla CSS (Standardized design system)
- **Desktop**: Tauri (Rust-based bridge)
- **Icons**: Lucide React
- **Documentation**: Architecture Decision Records (ADR) system

## 📦 Getting Started

### Prerequisites
- Node.js (v18+)
- Rust toolchain (`rustup`)
- Visual Studio 2022 Build Tools with "Desktop development with C++" workload

### Development
1. Clone the repository.
2. Install dependencies: `npm install`
3. Run in browser: `npm run dev`
4. Run in desktop: `npx tauri dev`

### Production Build
1. Export static assets: `npm run build`
2. Generate Windows installer: `npx tauri build`

## ⚠️ Application Limitations

As an offline-native desktop application designed specifically for local administrative efficiency and reliability, SIAAS has several operational limitations to note:

1. **Database Concurrency & Locking (SQLite Locking)**:
   - The application utilizes SQLite (with WAL mode), which operates on a file-level locking system.
   - Heavy concurrent write operations (e.g., executing multiple large Excel imports simultaneously) risk triggering `database is locked` errors.
2. **UI List Rendering Scalability (UI Virtualization)**:
   - Student lists and curriculum tables are rendered in full without client-side pagination or virtual scrolling.
   - Page rendering performance may degrade once the dataset grows significantly large (exceeding 2,000 students), particularly on legacy school computer hardware.
3. **Database Corruption & Migration Recovery**:
   - The automated schema migration utility assumes the local SQLite database file is in a structurally valid state.
   - If the database file (`sias.db`) is manually modified or corrupted outside the application, the automatic startup initialization process may fail, preventing the application from launching.
4. **Single-User Architecture Design**:
   - This platform is architected as a local, single-user, offline-first application for independent school administration, rather than a distributed multi-tenant cloud system.


## 🧪 Testing & Coverage

We maintain high testing standards across our core application features. The project uses **Vitest** for testing, **Istanbul** for code coverage, and **Codecov** for tracking coverage history.

[![codecov](https://codecov.io/gh/Andi-IM/siaas/graph/badge.svg?token=FHYTwuBZYh)](https://codecov.io/gh/Andi-IM/siaas)

### Run Commands
- Run all tests: `npm run test`
- Run tests without coverage (fast): `npm run test:fast`
- Run coverage report: `npm run test:coverage`

### Current Coverage of Core Modules

#### Frontend (Next.js) UI Coverage
All core student administration and curriculum modules are fully tested and have achieved **100% line coverage**:

| Fitur / Modul | Stmts % | Branch % | Funcs % | Lines % |
| :--- | :---: | :---: | :---: | :---: |
| **Kurikulum (`app/kurikulum`)** | 100% | 100% | 100% | 100% |
| **Tambah Siswa (`app/siswa/tambah`)** | 100% | 100% | 100% | 100% |
| **Edit Siswa (`app/siswa/edit`)** | 100% | 100% | 100% | 100% |
| **Detail Siswa (`app/siswa/detail`)** | 100% | 100% | 100% | 100% |

#### Backend (Rust) Logic Coverage
The Rust backend modules are protected by integration and unit tests, achieving high logic coverage:

| Module / Scope | Target Area | Logic Coverage (Lines) |
| :--- | :--- | :---: |
| **Core Database Operations (`core.rs`)** | Business rules & CRUD queries | **91.42%** |
| **Backend Error Definitions (`error.rs`)** | Serialization & standard mappings | **100.00%** |
| **Database Schema Migrations (`migrations.rs`)** | Schema setup & target rollback | **96.82%** |

## 📖 Architecture & Decisions (ADR)

All architectural decisions are documented as **Architecture Decision Records (ADRs)** following a structured lifecycle. 

Refer to the central **[Architecture Decision Records Index](docs/decisions/README.md)** to read the complete list of decisions, including database schema designs, Tauri commands abstraction, error handling models, and test coverage strategies.



---
© 2026 SIAAS Project. Built for Academic Institutional Excellence.
