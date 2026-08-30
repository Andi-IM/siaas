# [1.7.0](https://github.com/Andi-IM/siaas/compare/v1.6.0...v1.7.0) (2026-08-30)


### Features

* **ui:** add in-app update checker and install prompt ui ([60d013b](https://github.com/Andi-IM/siaas/commit/60d013b601a8edd981a64de65173856496c581f9))

# [1.6.0](https://github.com/Andi-IM/siaas/compare/v1.5.1...v1.6.0) (2026-08-30)


### Bug Fixes

* **ci:** provide tauri v2 signing env vars and include update archive asset ([8f27ff9](https://github.com/Andi-IM/siaas/commit/8f27ff9ac01056094380dbd085346e3b89dc1953))


### Features

* **release:** enable updater artifact generation to sign bundles ([0b0fb25](https://github.com/Andi-IM/siaas/commit/0b0fb251c24e2089365f344e2c3e06fdae63b5be))

## [1.5.1](https://github.com/Andi-IM/siaas/compare/v1.5.0...v1.5.1) (2026-08-30)


### Bug Fixes

* **ci:** fix linker flag config and clean release asset patterns ([c0d1488](https://github.com/Andi-IM/siaas/commit/c0d148899c0e53e2edb8622f33d4317c8d9d8c9a))

# [1.5.0](https://github.com/Andi-IM/siaas/compare/v1.4.0...v1.5.0) (2026-08-30)


### Features

* **ci:** generate and publish updater.json manifest in release assets ([4d58caf](https://github.com/Andi-IM/siaas/commit/4d58caf2e70b553724771bb77d4c24de1170bf3c))

# [1.4.0](https://github.com/Andi-IM/siaas/compare/v1.3.0...v1.4.0) (2026-08-30)


### Bug Fixes

* **ci:** convert bump script to ESM and bypass husky in CI ([31ed327](https://github.com/Andi-IM/siaas/commit/31ed327f1305b1b7bce30a752fdf4eb5fa22a708))


### Features

* **core:** implement ADR-0018 transcript group revision and display rules ([4f8ca30](https://github.com/Andi-IM/siaas/commit/4f8ca305ed8c3231e280f3570429d4c49033cc50))

# [1.3.0](https://github.com/Andi-IM/siaas/compare/v1.2.0...v1.3.0) (2026-06-18)


### Bug Fixes

* **api:** update Dockerfile to use pnpm and node 22 to fix cloud run deployment ([7f2fc72](https://github.com/Andi-IM/siaas/commit/7f2fc7264963554f2f5f66145ab8424fe639c8c4))
* **ci:** enable gtk3 feature for rfd to fix build on linux ([9a537d0](https://github.com/Andi-IM/siaas/commit/9a537d0e1e991776ae013dc2baf4a9537f76b6fe))
* **ci:** update Cargo.lock to sync with rfd gtk3 feature ([7355f6e](https://github.com/Andi-IM/siaas/commit/7355f6e3ca35e65ae7b4e70d91a283aa22c8c646))


### Features

* add database performance benchmarks and system specification documentation ([39734de](https://github.com/Andi-IM/siaas/commit/39734de8f322535164bbb23e69180ee6f26e0c08))
* add E2E test suites for Rekap, Siswa, and Kurikulum modules ([6707b1a](https://github.com/Andi-IM/siaas/commit/6707b1a892db54cb20d490cb27e4cdc5a3969ed4))
* **ci:** optimize Rust compilation and test execution on Windows runner ([e5f1108](https://github.com/Andi-IM/siaas/commit/e5f1108df8f61831db283fae5cc55de6e623247b))
* implement bug reporting modal, backend log retrieval commands, and associated documentation assets ([9b92f61](https://github.com/Andi-IM/siaas/commit/9b92f6100ce3f35467799aaf8f8f378874d187bf))
* implement CI pipelines, add student edit testing, and introduce Kurikulum management modules ([73e684a](https://github.com/Andi-IM/siaas/commit/73e684aeb7f9d76e9afdea824503aafdb33d7583))
* implement curriculum management features, student transcript views, and comprehensive end-to-end testing support with updated documentation. ([1464b14](https://github.com/Andi-IM/siaas/commit/1464b14b911a5f74acee0623536cf8bd3c9b539c))
* implement global application shell layout and design system tokens ([9a556c7](https://github.com/Andi-IM/siaas/commit/9a556c738c26ca1383383203ef40a78fd1bb087b))
* implement student transcript module with PDF export capabilities and expanded documentation ([c2dc984](https://github.com/Andi-IM/siaas/commit/c2dc984f1af2dfa4e3302d8f02b237621f71e742))
* implement transcript layout with PDF export support, add API deployment pipeline, and expand frontend test coverage ([419dd46](https://github.com/Andi-IM/siaas/commit/419dd46bd01b3ef5eacccbe6d47232e67c22336b))
* Merge pull request [#10](https://github.com/Andi-IM/siaas/issues/10) from Andi-IM/dev ([46257fa](https://github.com/Andi-IM/siaas/commit/46257fa3847e1184104882e8f04326e9234b9344))
* Merge pull request [#11](https://github.com/Andi-IM/siaas/issues/11) from Andi-IM/dev ([2dd0d69](https://github.com/Andi-IM/siaas/commit/2dd0d6996d6bf6700984ea345dfb8ddbf4ccdb01))

# [1.2.0](https://github.com/Andi-IM/siaas/compare/v1.1.0...v1.2.0) (2026-06-17)


### Features

* add student seed data and implement StudentTranscriptView component ([9d2f23f](https://github.com/Andi-IM/siaas/commit/9d2f23f0376d0f44be839641efddc56d04998791))
* implement student transcript view with multi-format PDF export support and project documentation ([a958ede](https://github.com/Andi-IM/siaas/commit/a958edeaa2ddf725880fb549f8bf1ae5dc6bf8da))
* Merge pull request [#6](https://github.com/Andi-IM/siaas/issues/6) from Andi-IM/feat/student_transcript ([b67e051](https://github.com/Andi-IM/siaas/commit/b67e0515996ebbc61a95d67902f502f17f2a29cb))
* Merge pull request [#7](https://github.com/Andi-IM/siaas/issues/7) from Andi-IM/dev ([66f0fa1](https://github.com/Andi-IM/siaas/commit/66f0fa15307cf673e0795da5dd31959a64505262))
* Merge pull request [#8](https://github.com/Andi-IM/siaas/issues/8) from Andi-IM/test/student_transcript ([dc93ce8](https://github.com/Andi-IM/siaas/commit/dc93ce88d9ce53d9b847077f5c981587053add70))

# [1.1.0](https://github.com/Andi-IM/siaas/compare/v1.0.0...v1.1.0) (2026-06-16)


### Features

* implement academic curriculum management system with subject database schema, transcript view, and integration test suite ([c222b08](https://github.com/Andi-IM/siaas/commit/c222b08a1e3bc1d0e33e1e35b2d05891557f1706))
* implement core database management commands and initialize Tauri application backend ([45cb3cc](https://github.com/Andi-IM/siaas/commit/45cb3cc84d29f5f37045aaeadcd8ec1d261c6a15))
* implement database seeding scripts for academic core, students, and grades with associated documentation ([1c36699](https://github.com/Andi-IM/siaas/commit/1c366991ddcc944697aacd82f0d89ee5d1b9aa43))
* implement husky pre-commit hook with conditional rust and frontend validation ([df075b7](https://github.com/Andi-IM/siaas/commit/df075b78abcf0ce73fd511440a13c4a3cd84e2e2))
* implement student management views and corresponding unit tests for CRUD operations ([8d7450b](https://github.com/Andi-IM/siaas/commit/8d7450baed5e9bd0dc2f25f84ed33c56f5111dbc))
* implement View-Wrapper pattern, add rekap page, and integrate diagnostic bug reporting system ([6b925e6](https://github.com/Andi-IM/siaas/commit/6b925e6b8851c5682473880e87e4257418cd0783))
* Merge pull request [#5](https://github.com/Andi-IM/siaas/issues/5) from Andi-IM/dev ([f054bf4](https://github.com/Andi-IM/siaas/commit/f054bf4c1b40d455c5cf8a660ca8b2bc814d5363))

# 1.0.0 (2026-06-16)


### Bug Fixes

* correct secret typo GUTHIB -> GITHUB in Cloud Run deploy workflow ([33575af](https://github.com/Andi-IM/siaas/commit/33575afe0248721eb26a4d3a277b920fc911f097))
* exclude services/api from root vitest config and add separate test step in CI and fix typo in deploy workflow ([45a5b57](https://github.com/Andi-IM/siaas/commit/45a5b570f8482610a2045fb05c7c18c983691f1d))


### Features

* add automated pre-commit hook for linting, type-checking, and testing and document mandate for agents ([5903726](https://github.com/Andi-IM/siaas/commit/590372665dd675b1ddce324d90a6d9023d6f175b))
* add Cloud Run deployment workflow and initial Tauri configuration ([c2a3125](https://github.com/Andi-IM/siaas/commit/c2a3125a70be14ddfc024252ac39624f693f2458))
* add database import, export, and app version display to settings ([5d225f6](https://github.com/Andi-IM/siaas/commit/5d225f68782884a94adefdf102349b854729d516))
* add GitHub Actions workflow for Cloud Run deployment and documentation for API service ([92043b9](https://github.com/Andi-IM/siaas/commit/92043b9bd6a92258f472fc92533d8ae6cd452202))
* add GitHub Actions workflow to deploy API service to Cloud Run ([d3cfd2a](https://github.com/Andi-IM/siaas/commit/d3cfd2a965ef83bbb2187c7cf228cbcb55884e6d))
* add pre-commit hook to trigger full test coverage on relevant file changes ([d2be04b](https://github.com/Andi-IM/siaas/commit/d2be04b5faee97be119108cdcbe9fee129b15d91))
* implement actual application log extraction for bug reporting ([85d6f1a](https://github.com/Andi-IM/siaas/commit/85d6f1afe82e6ed550d8e00d1b3e44d89ebe3a06))
* implement automated CI/CD release pipeline with Semantic Release, Tauri versioning, and a new bug report modal. ([a044e14](https://github.com/Andi-IM/siaas/commit/a044e149040a28eb3aa9c1cde19d2ce5b714e4ab))
* implement automated update delivery, bug reporting via Cloud Run, and CI/CD release workflows ([55aae59](https://github.com/Andi-IM/siaas/commit/55aae59a6b861e2553f869b12b880d2ae025fb3c))
* implement core database CRUD commands and project configuration for Tauri backend ([55be14d](https://github.com/Andi-IM/siaas/commit/55be14d95573df71da68d277ad03c9e3a5c03ea6))
* implement core database logic and add comprehensive CRUD entity tests ([17edaf3](https://github.com/Andi-IM/siaas/commit/17edaf32fb4bfe7ec38e78acefd45eaa42ec6597))
* implement core UI components, navigation, domain types, and student transcript view structure ([8358fc0](https://github.com/Andi-IM/siaas/commit/8358fc0283e3f9ad5d105b9c022fd413854b6032))
* implement dashboard UI and configure cross-platform application assets and documentation ([8a53be9](https://github.com/Andi-IM/siaas/commit/8a53be95a53f0f61f073a5e7a82d9bcadafbec0c))
* implement database core with migrations and add Rust best practices documentation modules ([3d3f004](https://github.com/Andi-IM/siaas/commit/3d3f00490c7a96e83597e282d4d008c428be9969))
* implement database reset and bug report settings with view-wrapper pattern ([804cfb3](https://github.com/Andi-IM/siaas/commit/804cfb32bc972ee728b0c4e5be64816876a5cda3))
* implement initial Tauri SQLite backend for student data and curriculum management ([f3c7de8](https://github.com/Andi-IM/siaas/commit/f3c7de84e30e115954a0a9ae680ee1f411b52e4d))
* implement professional academic transcript with A4 print optimization ([de3c899](https://github.com/Andi-IM/siaas/commit/de3c899cc3d5d6bbd6a8295eccaa2527f3ef8ea0)), closes [#A6A6A6](https://github.com/Andi-IM/siaas/issues/A6A6A6)
* implement rate limiting and X-SIAAS-App-Token check on Bug Report endpoint ([e49acfc](https://github.com/Andi-IM/siaas/commit/e49acfca1ee89821cc5d8fca404233daa1b366de))
* implement SeaORM database layer with initial schema entities and migration management ([ddb95dd](https://github.com/Andi-IM/siaas/commit/ddb95ddfb0e979916a382066750f8759ee3aa47e))
* implement SQLite database layer with connection pooling and initial schema migrations ([7b16976](https://github.com/Andi-IM/siaas/commit/7b16976d28c486ca27233a1cb9203705a2c2302e))
* implement student and curriculum management views with associated test suites and helper utilities ([66a8bd7](https://github.com/Andi-IM/siaas/commit/66a8bd78b20d7b263e52d16070d123ea72f1ccfd))
* implement student list management module and establish vitest testing environment ([ba5336a](https://github.com/Andi-IM/siaas/commit/ba5336a953fbba0d846af9c1c7dd10ea54d8614f))
* initial commit for SIAAS (Academic Administrative Core) ([6594737](https://github.com/Andi-IM/siaas/commit/6594737b26a9c8d9da56916c7a9800066f3d1225))
* initialize database layer with SeaORM, custom error handling, and core entity management tests ([7e052ca](https://github.com/Andi-IM/siaas/commit/7e052ca7148f67c45d34e13d1a3c54614e36e206))
* initialize Tauri configuration with build settings and updater endpoints ([774200a](https://github.com/Andi-IM/siaas/commit/774200ae0004e50f4af7ca20d2cb865d76c54956))
* integrate BugReportModal into Sidebar navigation ([d40b53d](https://github.com/Andi-IM/siaas/commit/d40b53d626f559fea166e3776d166efc652aae5d))
* integrate Tauri backend services with data management layer, configure CI/CD pipelines, and optimize Vitest environment. ([1f243ff](https://github.com/Andi-IM/siaas/commit/1f243ff1dc39eee72c8b980f65a6d151cb0a7f3b))
* integrate Tauri for native Windows distribution ([70f6787](https://github.com/Andi-IM/siaas/commit/70f67872e7ff394462ea345282500be8c762cca2))
