# SIAAS: Academic Administrative Core

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

## 📖 Architecture & Documentation

We maintain a strict record of all architectural decisions in the `docs/decisions/` directory.

- [ADR 0001: Adoption of ADR](docs/decisions/0001-adopsi-adr.md)
- [ADR 0002: 23-Field Student Data Schema](docs/decisions/0002-skema-data-23-bidang.md)
- [ADR 0003: Hierarchical Curriculum Management](docs/decisions/0003-manajemen-kurikulum.md)
- [ADR 0004: Adoption of Tauri for Desktop](docs/decisions/0004-adopt-tauri.md)

---
© 2026 SIAAS Project. Built for Academic Institutional Excellence.
