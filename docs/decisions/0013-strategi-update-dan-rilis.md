# ADR 0013: Update Delivery, Database Migration, Release CI/CD, and Cloud Run Telemetry Strategy

## Status
Proposed

## Context
SIAAS is designed as an offline-native application (Desktop/Windows) for school administrations in Indonesia, which often have limited internet access. SIAAS stores its data locally using SQLite. Updating the application is a high-risk operation because it involves releasing a new binary and migrating the local SQLite schema, where migration failures could lead to permanent loss of the student master book (Buku Induk).

Furthermore, we need a secure and controlled way to handle update deliveries and receive bug reports from production environments without exposing sensitive repository credentials in the client application.

The main challenges to solve:
1. Ensure data safety if schema migration fails.
2. Distribute updates without disrupting the UX (SIAAS anti-cloud gimmick principle).
3. Automate the creation of installers (.msi) to reduce human error during version releases.
4. Establish a secure communication channel for live production telemetry and bug reporting that automatically creates GitHub Issues.

## Decision
We are adopting a four-layered strategy:

1. **Data Safety via Auto-Backup Before Migration**:
   Before `MigrationManager` is executed, the system must duplicate the `sias.db` file into a specific folder (e.g., `backup/sias_YYYYMMDD_HHMM.db`). If a migration process corrupts the database structure, the application provides a recovery function from the backup.
2. **Cloud Run API Service for Delivery and Bug Reporting**:
   We will deploy a lightweight backend service to Google Cloud Run. This service will act as a secure proxy/gateway.
   - **Update Delivery**: It will expose a `GET /updater` endpoint that returns the dynamically generated `updater.json`, allowing us to control phased rollouts or track update requests before redirecting to the actual GitHub Release binaries.
   - **Bug Reporting**: It will expose a `POST /issues` endpoint to receive crash reports or user-submitted bugs. The Cloud Run service will securely hold a GitHub Personal Access Token (PAT) and use the GitHub API to create an issue in the repository.
3. **Updates via Tauri Updater**:
   The application will integrate the `tauri-plugin-updater` in the background, configured to poll the new Cloud Run `/updater` endpoint. Update messages are only displayed when the new installer is ready and downloaded.
4. **CI/CD via GitHub Actions (Release Workflow)**:
   We will add a new workflow `.github/workflows/release.yml` triggered on pushing tags `v*.*.*`. The CI will cross-compile for Windows, sign the installer, and publish it to GitHub Releases. Another workflow will handle continuous deployment to Google Cloud Run.

## Consequences
- **Positive**: Bug reporting becomes automated and centralized in GitHub Issues without exposing GitHub tokens in the client. Update delivery can be monitored and controlled (e.g., phased rollouts) via the Cloud Run proxy.
- **Negative**: Introduces a minor cloud dependency (Cloud Run) and infrastructure cost, though it will be negligible for these specific use cases. Requires setting up Google Cloud authentication and GitHub tokens in the Cloud Run environment.

## References
- Tauri v2 Updater Plugin Documentation
- Offline-Native Strategy (PRODUCT.md)
- Google Cloud Run Documentation
