---
name: webdriverio-e2e-best-practices
description: Best practices for writing and debugging WebdriverIO v9 E2E tests, including global expect, matchers, resilient selectors, Next.js + Tauri CSS issues, and test isolation.
source: auto-skill
extracted_at: '2026-06-17T13:18:10.086Z'
---

# WebdriverIO E2E Testing Best Practices

When writing or debugging WebdriverIO (v9+) E2E tests, follow these guidelines to avoid common pitfalls and ensure test resilience.

## 1. Global `expect` (Do Not Import)
In WebdriverIO v9, `expect` is automatically provided as a global by the test runner.
- **Do not** explicitly import it: `import { expect } from 'expect-webdriverio';`
- **Why**: Explicitly importing it causes `expect-webdriverio` to attempt patching the already-initialized global `expect` object, which throws `TypeError: Cannot redefine property: soft` in certain Node.js environments.
- **How to apply**: Simply use `await expect(element).toBeExisting()` without any imports. Ensure all `expect` assertions are `await`ed.

## 2. Correct Text Matchers
WebdriverIO's `expect-webdriverio` has specific matchers for text assertions.
- **Do not use**: `toContainText` or `toHaveTextContaining` (these do not exist and will throw `TypeError: ... is not a function`).
- **Use**: `toHaveText` with a regular expression for partial matching.
  ```javascript
  // Correct
  await expect(element).toHaveText(/Kurikulum/);
  await expect(element).toHaveText(/Pilih program keahlian|Belum ada konsentrasi/);
  ```

## 3. Resilient Selectors (`data-testid`)
Avoid relying on fragile text-based selectors (like `$('*=text')` which can resolve to `partial link text` and fail on non-anchor tags) or strict tag combinations (like `$('p*=text')`).
- **Best Practice**: Add `data-testid` attributes to your React/HTML components for elements that E2E tests need to target, especially empty states or dynamic content.
  ```tsx
  // In React Component
  <p data-testid="empty-program" className="body-sm">Belum ada program keahlian</p>
  ```
  ```javascript
  // In E2E Test
  const emptyState = await $('[data-testid="empty-program"]');
  await expect(emptyState).toBeExisting();
  ```

## 4. Valid CSS Selectors vs XPath
The `button*=text` syntax is **NOT valid CSS** and will throw `invalid selector` errors in WebDriver.
- **Do not use**: `$('dialog button*=Batal')` or `$('button*=Simpan Program')`
- **Use XPath** for text-based element selection:
  ```javascript
  // Correct - XPath for text matching
  const batalBtn = await $('//dialog//button[contains(text(), "Batal")]');
  const simpanBtn = await $('//dialog//button[contains(text(), "Simpan Program")]');
  ```
- **Use CSS attribute selectors** when possible:
  ```javascript
  // Correct - CSS attribute selector
  const tambahBtn = await $('button[title="Tambah Program"]');
  ```

## 5. Dialog/Modal Handling
Do not rely on the `open` attribute selector (`dialog[open]`) which is fragile and can fail due to React rendering timing.
- **Do not use**: `$('dialog[open]')` or `$('dialog[open] button')`
- **Use**: `$('dialog')` combined with `toBeDisplayed()` which handles both DOM existence and CSS visibility:
  ```javascript
  // Correct - wait for dialog to be visible
  const modal = await $('dialog');
  await expect(modal).toBeDisplayed();
  
  // To check if modal is closed
  await expect(modal).not.toBeDisplayed();
  ```

## 6. Wait Strategies (Avoid `browser.pause`)
Hardcoded `browser.pause()` calls are fragile and cause race conditions.
- **Do not use**: `await browser.pause(1000)` after clicks or navigation
- **Use**: WebdriverIO's built-in waiting via `toBeDisplayed()` or `toBeExisting()` which automatically poll until the element appears:
  ```javascript
  // Correct - automatic waiting
  const heading = await $('h1*=Manajemen Kurikulum');
  await expect(heading).toBeDisplayed(); // waits automatically
  ```
- **Exception**: For modal screenshots, use `dialog[open]` to confirm the dialog is active, then wait for internal content to render before capturing (see §6).

## 6. Modal Screenshot Timing — Wait for Internal Content

When taking screenshots of React modals (native `<dialog>` with conditionally-rendered form content), `saveScreenshot` immediately after `dialog[open]` detection will capture the dialog **before** React finishes rendering the form inside it — producing a screenshot with an empty or partially-rendered modal.

### The Problem

```javascript
// ❌ BAD — screenshot taken before form inputs render
const modal = await $('dialog[open]');
await expect(modal).toBeDisplayed();
await browser.saveScreenshot('modal.png'); // empty modal!
```

React renders in two steps: (1) the `<dialog>` element opens via `.showModal()`, adding the `open` attribute, and (2) the conditional JSX inside the dialog (`{modal.type === "program" && <form>...}`) renders in the same or subsequent tick. `expect(modal).toBeDisplayed()` only waits for the dialog container.

### The Fix

Always wait for a **specific element inside the modal** to be visible before capturing:

```javascript
// ✅ GOOD — wait for form content then screenshot
const modal = await $('dialog[open]');
await expect(modal).toBeDisplayed();

// Wait for the form input to render inside the modal
const inputField = await modal.$('input.form-input');
await expect(inputField).toBeDisplayed();

await browser.saveScreenshot('modal.png'); // fully rendered modal

// Now interact with the form
await inputField.setValue('My Value');
```

For modals with multiple inputs (e.g., a subject form with 3 fields), wait for all of them:

```javascript
const inputs = await modal.$$('input.form-input');
await expect(inputs[0]).toBeDisplayed();
await expect(inputs[1]).toBeDisplayed();
await expect(inputs[2]).toBeDisplayed();
await browser.saveScreenshot('form_modal.png');
```

**Why**: Conditional JSX rendering inside `<dialog>` is a separate React commit from the `.showModal()` call. The `open` attribute appears before form content is mounted, especially for complex forms with checkboxes, selects, and multiple input fields. Waiting for a concrete form element guarantees the modal content is fully rendered.

## 7. Text Case Sensitivity in Selectors (`.toUpperCase()`)

When the frontend applies `.toUpperCase()` to display text, the E2E selector must match the **rendered** case, not the source data case.

```javascript
// ❌ BAD — data is "Semester 2" but DOM renders "SEMESTER 2"
const header = await $('th*=Semester 2'); // won't match

// ✅ GOOD — match the rendered uppercase text
const header = await $('th*=SEMESTER 2');
await expect(header).toBeDisplayed();
```

**Why**: The frontend calls `activeSemesterName.toUpperCase()` in the JSX, so the DOM contains `MATA PELAJARAN (SEMESTER 2)`. The `*=` text selector is case-sensitive in WebDriver — "Semester 2" ≠ "SEMESTER 2".

**How to verify**: When a text-based selector fails, inspect the component's JSX for `.toUpperCase()`, `.toLowerCase()`, or template literal transformations, and match the final rendered string.

## 8. Replace `window.confirm()` with a Proper `<dialog>` Modal

Using the native `window.confirm()` browser API for delete confirmations makes E2E tests fragile — they must mock `window.confirm` via `browser.execute()`, and the test can't verify what the user actually sees.

### The Pattern

Replace `confirm()` with a `<dialog>`-based confirmation modal that follows the same pattern as other modals in the app:

**State**:
```tsx
const [deleteTarget, setDeleteTarget] = useState<{ id: string; nama: string } | null>(null);
```

**Open handler** (instead of calling `confirm()`):
```tsx
const openDeleteModal = (id: string, nama: string) => {
  setDeleteTarget({ id, nama });
  setModal({ type: "deleteSubject", editId: null });
};
```

**Confirm handler** (the actual delete):
```tsx
const handleDeleteSubject = async () => {
  if (!deleteTarget) return;
  await deleteSubject(deleteTarget.id);
  // refresh data...
  setDeleteTarget(null);
  closeModal();
};
```

**Modal markup** (inside the existing `<dialog>`):
```tsx
{modal.type === "deleteSubject" && (
  <div className="confirm-dialog__inner">
    <h2>Hapus Mata Pelajaran</h2>
    <p>Hapus <strong>{deleteTarget?.nama}</strong>? Data tidak dapat dikembalikan.</p>
    <div className="confirm-dialog__actions">
      <button className="btn btn--danger" onClick={handleDeleteSubject}>Hapus</button>
      <button className="btn btn--secondary" onClick={closeModal}>Batal</button>
    </div>
  </div>
)}
```

**E2E test** (no `window.confirm` mock needed):
```javascript
const deleteBtn = await row.$('button[title="Hapus"]');
await deleteBtn.click();

// Wait for modal content
const modal = await $('dialog[open]');
await expect(modal).toBeDisplayed();
await expect(modal.$('h2*=Hapus')).toBeDisplayed();

// Confirm deletion
const confirmBtn = await modal.$('button.btn--danger');
await confirmBtn.click();

// Verify modal closes and row is removed
await expect(modal).not.toBeDisplayed();
await expect(deletedRow).not.toBeExisting();
```

**Why**: `window.confirm()` requires `browser.execute()` mocking in E2E tests, which can't verify the dialog text shown to the user. A `<dialog>` modal is: (1) fully testable, (2) visually consistent with other app modals, (3) capturable in screenshots for documentation.

## 9. Test Isolation with `beforeEach`
Tests can leave state (open dialogs, filled forms) that affects subsequent tests.
- **How to apply**: Use `beforeEach` to clean up state before each test:
  ```javascript
  beforeEach(async () => {
      try {
          const openDialog = await $('dialog[open]');
          if (await openDialog.isExisting()) {
              const closeBtn = await $('dialog[open] .icon-btn');
              if (await closeBtn.isExisting()) {
                  await closeBtn.click();
                  await browser.pause(500);
              }
          }
      } catch (e) {
          // Ignore errors in cleanup
      }
  });
  ```

## 9b. Database Reset Between E2E Tests (SQLite)
When E2E tests mutate database records (insert, update, delete), subsequent tests may fail because they inherit leftover data. **UI cleanup alone is not enough** — the database must be reset.

### The Problem
```javascript
// Test A inserts a student → Test B tries to insert same unique NIS → UNIQUE constraint failure
// Test C expects "Belum ada data" → but Test A left data behind → false negative
```

### The Fix: Truncate + Re-seed in `beforeEach`

Create a helper function that (1) truncates mutable tables and (2) re-applies SQL seed scripts:

```javascript
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resetDatabase() {
    const dbPath = path.resolve(__dirname, '../../../src-tauri/target/debug/sias_dev.db');
    const scriptsDir = path.resolve(__dirname, '../../../scripts/');

    // 1. Truncate mutable data tables (in dependency order)
    const truncateTables = [
        'DELETE FROM student_grades;',
        'DELETE FROM students;',
        'DELETE FROM student_batches;',
    ];

    truncateTables.forEach(sql => {
        try {
            execSync(`sqlite3 "${dbPath}" "${sql.replace(/"/g, '\\"')}"`);
        } catch (error) {
            console.error('Truncate failed:', error.message);
        }
    });

    // 2. Re-seed from scratch
    const scripts = [
        'seed_academic_core.sql',
        'seed_students.sql',
        'seed_grades.sql',
    ];

    scripts.forEach(script => {
        const sqlPath = path.join(scriptsDir, script).replace(/\\/g, '/');
        try {
            execSync(`sqlite3 "${dbPath}" ".read '${sqlPath}'"`);
        } catch (error) {
            console.error(`Seed ${script} failed:`, error.message);
        }
    });
}

// In your describe block:
beforeEach(async () => {
    resetDatabase();
    // Also close any open dialogs (from §9)
});
```

### Key Details
- **Truncate order matters**: Delete child tables (foreign keys) before parent tables to avoid FK constraint errors.
- **Re-seed all scripts**: Don't skip `seed_academic_core.sql` — it creates reference data (programs, concentrations, semesters) that `seed_students.sql` and `seed_grades.sql` depend on.
- **Path handling**: On Windows, replace backslashes in SQL paths before passing to `sqlite3 .read`.
- **When to use**: Only needed for tests that **mutate** database records (CRUD operations). Read-only tests (navigation, rendering) don't need it.
- **Performance trade-off**: `sqlite3` CLI calls add ~200-500ms per test. Keep the truncate list minimal — only truncate tables your tests actually modify.

## 10. Next.js Static Export + Tauri: CSS Not Rendering
**Critical**: When using Next.js `output: 'export'` with Tauri, CSS will NOT render if `assetPrefix` is set to an absolute URL.

### The Problem
```typescript
// next.config.ts - WRONG for Tauri
const nextConfig: NextConfig = {
  output: 'export',
  assetPrefix: isProd ? undefined : `http://localhost:3000` // ❌ Breaks in Tauri
};
```
This generates HTML with `<link rel="stylesheet" href="http://localhost:3000/_next/static/css/...">`. When Tauri loads the HTML from the filesystem (`file://` protocol), the dev server isn't running, so CSS files fail to load → **no styling**.

### The Solution
Remove `assetPrefix` entirely for static exports. Assets must use relative paths:
```typescript
// next.config.ts - CORRECT for Tauri
const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // No assetPrefix - assets use relative paths for file:// protocol
};
```
This generates `<link rel="stylesheet" href="/_next/static/css/...">` which works correctly with Tauri's filesystem loading.

### How to Diagnose
- **Symptom**: E2E screenshots show unstyled HTML (blue links, default fonts, no layout)
- **Check**: Open the generated `out/*.html` file and look at `<link rel="stylesheet">` hrefs
- **Fix**: If hrefs start with `http://localhost:3000`, remove `assetPrefix` from `next.config.ts`

## 11. UI Semantic Consistency for Tests
If an E2E test asserts that an empty state message exists (e.g., "Belum ada program keahlian"), ensure the UI component actually renders this message when the data array is empty.
- **How to apply**: When a test fails with `no such element` for an expected empty state, check the component code. Add the missing fallback UI (e.g., a conditional render when `array.length === 0`) and pair it with a `data-testid` for the test to reliably find it.