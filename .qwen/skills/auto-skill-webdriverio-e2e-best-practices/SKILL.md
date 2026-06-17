---
name: webdriverio-e2e-best-practices
description: Best practices for writing and debugging WebdriverIO v9 E2E tests, including global expect, matchers, resilient selectors, Next.js + Tauri CSS issues, and test isolation.
source: auto-skill
extracted_at: '2026-06-17T07:20:52.751Z'
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
- **Exception**: Small `browser.pause(500-1000)` is acceptable after navigation clicks to allow React hydration, but prefer waiting for a specific element to appear.

## 7. Test Isolation with `beforeEach`
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

## 8. Next.js Static Export + Tauri: CSS Not Rendering
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

## 9. UI Semantic Consistency for Tests
If an E2E test asserts that an empty state message exists (e.g., "Belum ada program keahlian"), ensure the UI component actually renders this message when the data array is empty.
- **How to apply**: When a test fails with `no such element` for an expected empty state, check the component code. Add the missing fallback UI (e.g., a conditional render when `array.length === 0`) and pair it with a `data-testid` for the test to reliably find it.