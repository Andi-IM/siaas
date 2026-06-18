---
name: tauri-e2e-bypass-dialogs
description: Pattern for bypassing native file dialogs (open/save) in Tauri E2E tests by creating #[cfg(debug_assertions)] gated Tauri commands that accept file paths as string parameters.
source: auto-skill
extracted_at: '2026-06-17T12:40:13.634Z'
---

# Bypassing Native File Dialogs in Tauri E2E Tests

When testing features like Excel import/export in a Tauri desktop app via WebdriverIO, native file dialogs (`rfd::FileDialog`) block the test runner because WebDriver cannot interact with OS-level dialogs.

**The pattern**: pair every production Tauri command that opens a file dialog with a `#[cfg(debug_assertions)]` variant that accepts a file path string, then call it from E2E tests via `window.__TAURI_INTERNALS__.invoke()`.

## Step 1: Create the debug-only Tauri command

In `src-tauri/src/db/commands.rs` (or equivalent), add a test variant gated behind `#[cfg(debug_assertions)]`:

```rust
// Production command — opens native file dialog
#[tauri::command]
pub async fn import_grades_from_excel(
    state: State<'_, tokio::sync::RwLock<DatabaseConnection>>,
) -> Result<String, String> {
    let db_guard = state.read().await;
    let db = &*db_guard;

    let file_path = rfd::FileDialog::new()
        .add_filter("Excel Files", &["xlsx"])
        .pick_file();

    let path = match file_path {
        Some(p) => p,
        None => return Err("Batal memilih berkas".to_string()),
    };

    import_grades_from_excel_core(db, &path).await.map_err(|e| e.to_string())
}

// E2E test variant — accepts path directly, no dialog
#[cfg(debug_assertions)]
#[tauri::command]
pub async fn import_grades_from_excel_test(
    state: State<'_, tokio::sync::RwLock<DatabaseConnection>>,
    path: String,
) -> Result<String, String> {
    let db_guard = state.read().await;
    let db = &*db_guard;
    let path_buf = std::path::PathBuf::from(path);
    import_grades_from_excel_core(db, &path_buf).await.map_err(|e| e.to_string())
}
```

**Why `#[cfg(debug_assertions)]`**: The test command is compiled out of release builds, preventing accidental exposure of an endpoint that accepts arbitrary file paths.

## Step 2: Register both commands

In `src-tauri/src/lib.rs`, add both the production and test commands to the `invoke_handler`:

```rust
.invoke_handler(tauri::generate_handler![
    db::commands::import_grades_from_excel,
    db::commands::import_grades_from_excel_test,   // test-only
    db::commands::export_grades_to_excel,
    db::commands::export_grades_to_excel_test,     // test-only
])
```

## Step 3: Call from E2E tests

In the WebdriverIO spec, use `browser.execute()` to invoke the command through Tauri's internal bridge:

```javascript
it('should handle Import Excel without UI picker', async () => {
    const result = await browser.execute(async (filePath) => {
        return await window.__TAURI_INTERNALS__.invoke(
            'import_grades_from_excel_test',
            { path: filePath }
        );
    }, excelInputPath);

    await expect(result).toContain('Berhasil');

    // Refresh the page so React re-fetches data after the direct DB mutation
    await browser.refresh();
    // Re-select filters since refresh resets component state
    await (await $('#select-program')).selectByVisibleText('Teknik Mesin');
    await (await $('#select-konsentrasi')).selectByVisibleText('Teknik Pemesinan');
});
```

**Why `browser.refresh()`**: Calling a Tauri command directly via `__TAURI_INTERNALS__` mutates the database but does not trigger React state updates. A full page refresh ensures the UI reflects the imported data.

## Export variant

For export (save dialog), the same pattern applies — accept `major_id` (or equivalent data identifier) and `path`:

```rust
#[cfg(debug_assertions)]
#[tauri::command]
pub async fn export_grades_to_excel_test(
    state: State<'_, tokio::sync::RwLock<DatabaseConnection>>,
    major_id: String,
    path: String,
) -> Result<String, String> {
    let db_guard = state.read().await;
    let db = &*db_guard;
    let path_buf = std::path::PathBuf::from(path);
    export_grades_to_excel_core(db, &major_id, &path_buf).await.map_err(|e| e.to_string())
}
```

```javascript
it('should handle Export Excel without UI picker', async () => {
    const majorId = await (await $('#select-konsentrasi')).getValue();

    const result = await browser.execute(async (mid, filePath) => {
        return await window.__TAURI_INTERNALS__.invoke(
            'export_grades_to_excel_test',
            { majorId: mid, path: filePath }
        );
    }, majorId, excelOutputPath);

    await expect(result).toContain('Berhasil');

    // Verify file was written to disk (fs runs in Node.js test context)
    const fileExists = fs.existsSync(excelOutputPath);
    expect(fileExists).toBe(true);

    // Clean up
    if (fileExists) fs.unlinkSync(excelOutputPath);
});
```

## File path resolution

Resolve the test input file relative to the spec file's directory using `__dirname`:
```javascript
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const excelInputPath = path.resolve(__dirname, '../../../src-tauri/tests/test_excel.xlsx');
```

The path must be absolute because the Tauri backend resolves it on the filesystem, not relative to the WebView origin.