# 🛠️ Technical Debt & Roadmap Risks

This document tracks known technical limitations, architectural "shortcuts," and testing gaps that may impact the system as it scales. It serves as a guide for future resource allocation and business decision-making.

---

## 🟥 High Priority: Scalability & Reliability

### 1. SQLite Concurrency & Locking
- **Current State**: Using SQLite with WAL mode. Tests are run in-memory and sequentially.
- **Risk**: In production, high-frequency write operations (e.g., simultaneous large Excel imports) may trigger `database is locked` errors due to SQLite's file-locking mechanism.
- **Business Impact**: Potential UX frustration during peak administrative periods.
- **Mitigation**: Implement a retry strategy with exponential backoff or a dedicated write-queue for heavy operations.

### 2. Scalability of UI Lists
- **Current State**: Student lists and curriculum tables are rendered in full without pagination or virtualization.
- **Risk**: As the student database grows (e.g., >2,000 students), the initial load time and scrolling performance of the "Daftar Siswa" page will degrade.
- **Business Impact**: Perception of application "sluggishness" after 1-2 years of usage.
- **Mitigation**: Implement **Virtual Scrolling** (e.g., `@tanstack/react-virtual`) or server-side pagination in the next major update.

---

## 🟧 Moderate Priority: Environment & Testing

### 3. Headless vs. Real Browser Testing
- **Current State**: Frontend tests use `happy-dom` (simulated browser).
- **Risk**: CSS/Layout regressions in specific browser engines (Chromium vs. others) are not detected.
- **Business Impact**: Visual bugs that may look unprofessional to clients on different screens.
- **Mitigation**: Integrate **Playwright** for E2E testing in real browser environments for mission-critical routes.

---

## 🟦 Low Priority: Maintenance & Maintenance

### 4. Migration Error Recovery
- **Current State**: Migrations assume a clean or valid state.
- **Risk**: If a user manually edits the `sias.db` file and corrupts the schema, the auto-migration tool may fail and prevent the app from starting.
- **Business Impact**: High support ticket volume for "Database Corrupted" issues.
- **Mitigation**: Implement a database "Repair/Reset" utility and automated daily backups within the app.

### 5. Code Coverage "Ghost Lines"
- **Current State**: Sea-ORM entities show 0% coverage despite being tested.
- **Risk**: Reliance on line coverage metrics may mask a lack of actual behavioral testing for new entities.
- **Business Impact**: False sense of security if coverage targets are met while behavioral tests are skipped.
- **Mitigation**: Maintain the mandatory manual audit of **Behavioral Integration Tests** as defined in ADR 0012.

---

## ✅ Resolved Technical Debt

### 1. Environment Disparity (Linux CI vs. Windows Prod)
- **Resolution Date**: June 16, 2026
- **Resolution**: Updated GitHub Actions configuration (`ci.yml`) to run on `windows-latest` for both frontend linting/testing and Rust backend compilation/testing. This ensures all path resolutions and compiler behaviors are verified under Windows native environments on every push and pull request.

---

## 📈 Decision Guidance for Management

- **Short Term (0-3 Months)**: Focus on **Constraint #2** (List Performance / Pagination) as the school starts populating data.
- **Mid Term (3-9 Months)**: Focus on **Constraint #1** (SQLite Concurrency & Locking) to ensure reliability under heavy concurrent workloads.
- **Long Term**: Transition to Playwright for high-fidelity E2E visual assurance.

---
*Last Updated: Tuesday, June 16, 2026*
