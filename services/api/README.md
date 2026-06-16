# SIAS API Service

The backend API service for the SIAS (Sistem Informasi Akademik Sekolah) platform. This service handles core business logic, database interactions, and administrative tasks such as Excel processing.

## 🚀 Tech Stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express
- **Database:** SQLite (managed via Sea-ORM in the Rust core, shared via volume/IPC if applicable)
- **Deployment:** Google Cloud Run (Serverless)
- **CI/CD:** GitHub Actions

## 🛠️ Local Development

### Prerequisites
- Node.js (v22+)
- npm

### Setup
1. Navigate to the API directory:
   ```bash
   cd services/api
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the project:
   ```bash
   npm run build
   ```
4. Start development server:
   ```bash
   npm run dev
   ```

## 🧪 Testing
We use **Vitest** for unit and integration testing of API endpoints.
```bash
npm run test
```

## 🚢 Deployment (Cloud Run)

The service is automatically deployed to **Google Cloud Run** via GitHub Actions whenever changes are pushed to the `main` branch under the `services/api/` directory.

### Environment Variables
The following secrets must be configured in GitHub Actions:
- `GCP_CREDENTIALS`: Service Account JSON key.
- `GITHUB_PAT_ISSUES`: Personal Access Token for GitHub API integration.

### GCP Roles Required for Deployer Service Account:
- Cloud Run Admin
- Service Account User
- Cloud Build Editor
- Artifact Registry Administrator
- Storage Admin (for source uploads)

---
*Maintained by Gemini CLI - Lead Engineering Agent*
