# ADR 0004: Adopt Tauri for Native Windows Distribution

*   **Status**: accepted
*   **Decider**: Gemini CLI, User
*   **Date**: 2026-06-14

## Context

SIAAS is designed as an offline-native application for school administration. To provide the best user experience for administrative staff in Indonesian schools, the application needs to run as a native Windows desktop application (.exe) rather than just a browser-based tool. 

Key requirements:
- Small installer size (easy to distribute via USB/local network).
- High performance on standard office hardware.
- Access to native system features (e.g., local printing, file system) if needed in the future.
- Minimal resource consumption.

## Decision

We will adopt **Tauri** as the framework for native Windows desktop distribution. 

Tauri was chosen over Electron because:
1. **Lightweight**: Uses the native WebView2 (Edge/Chromium) already present in Windows, resulting in significantly smaller binaries (~5MB vs 100MB+ for Electron).
2. **Security**: Built with Rust, providing a more secure bridge between the frontend and native system.
3. **Performance**: Lower memory and CPU footprint compared to bundling a full Chromium instance.

## Implementation Plan

1. **Next.js Configuration**:
   - Update `next.config.ts` to use `output: 'export'`.
   - Set `images: { unoptimized: true }` to support static export.
2. **Tauri Integration**:
   - Install Tauri CLI: `npm install -D @tauri-apps/cli`.
   - Initialize Tauri: `npx tauri init`.
   - Configure `tauri.conf.json` to point to the `out` directory produced by `next build`.
3. **Build Pipeline**:
   - Create a development script for running Tauri with Next.js hot-reload.
   - Create a production build script to generate the `.exe` installer.

## Consequences

- **Next.js Restrictions**: Since we are using `output: 'export'`, we cannot use server-side features like API Routes (Node.js), Middleware (server-side), or SSR. The application must remain purely client-side or use Tauri "commands" (Rust) for backend logic.
- **Environment**: Developers will need to install the Rust toolchain (and WebView2 for older Windows versions).
- **Positive**: Professional desktop feel, high speed, and extremely portable installer.

## Verification

- [x] `npm run build` generates a valid `out` directory.
- [x] `npx tauri dev` successfully opens the application window with hot-reloading.
- [x] `npx tauri build` produces a functional `.exe` installer for Windows.
- [x] The application remains fully functional in an offline environment.

## More Information

### 2026-06-14: Dependency Resolution
During implementation, a version conflict was encountered in the Rust dependency graph between `brotli` and `alloc-no-stdlib`. This was resolved by adding a `[patch.crates-io]` block in `Cargo.toml` pointing to the Dropbox GitHub repository and pinning the `brotli` version to `=8.0.3`.
