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

## 🟧 Moderate Priority: Architecture & Testing

### 3. Headless vs. Real Browser Testing
- **Current State**: Frontend tests use `happy-dom` (simulated browser).
- **Risk**: CSS/Layout regressions in specific browser engines (Chromium vs. others) are not detected.
- **Business Impact**: Visual bugs that may look unprofessional to clients on different screens.
- **Mitigation**: Integrate **Playwright** for E2E testing in real browser environments for mission-critical routes.

### 4. Client-Side Data Caching (State Management)
- **Current State**: Direct `useEffect` fetch from Tauri backend on every component mount without a caching layer.
- **Risk**: UI flickering and redundant SQLite I/O during navigation, degrading the "fluid" app experience.
- **Business Impact**: Reduced perceived quality compared to modern desktop/web applications.
- **Mitigation**: Implement a caching layer (e.g., `TanStack Query` or `SWR`) to persist data within the session.

### 5. Form Logic & Validation Redundancy
- **Current State**: Manual state handling and validation logic in every `View.tsx` component.
- **Risk**: High maintenance overhead and inconsistent validation behavior across different modules.
- **Business Impact**: Slower feature delivery and increased risk of bugs as the number of forms grows.
- **Mitigation**: Standardize form management using a library like `React Hook Form` with `Zod` for schema-based validation.

### 6. Component Hierarchy & Prop Drilling
- **Current State**: Heavy reliance on localized state within View components without a global sharing mechanism.
- **Risk**: Deeply nested components will require "prop drilling," making the code rigid and difficult to refactor.
- **Business Impact**: Increased complexity and regression risk during UI evolution.
- **Mitigation**: Introduce `React Context` for shared concerns (e.g., global filters or user session data).

---

## 🟦 Low Priority: Maintenance & Maintenance

### 7. Migration Error Recovery
- **Current State**: Migrations assume a clean or valid state.
- **Risk**: If a user manually edits the `sias.db` file and corrupts the schema, the auto-migration tool may fail and prevent the app from starting.
- **Business Impact**: High support ticket volume for "Database Corrupted" issues.
- **Mitigation**: Implement a database "Repair/Reset" utility and automated daily backups within the app.

### 8. Code Coverage "Ghost Lines"
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

- **Short Term (0-3 Months)**: Focus on **Constraint #2** (Pagination) and **Constraint #5** (Form Standardization) as the school starts populating data to ensure dev speed.
- **Mid Term (3-9 Months)**: Focus on **Constraint #1** (SQLite Concurrency) and **Constraint #4** (Caching) to ensure reliability and fluidity under load.
- **Long Term**: Transition to Playwright for high-fidelity E2E visual assurance and address **Constraint #6** (Global State) as features scale.

---
*Last Updated: Thursday, June 18, 2026*
