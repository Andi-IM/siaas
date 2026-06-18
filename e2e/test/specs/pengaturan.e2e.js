import { expect, browser, $ } from '@wdio/globals';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const importDbPath = path.resolve(__dirname, '../seeds/sias_db.db');
const exportDbPath = path.resolve(__dirname, '../temp/exported_sias_db.db');

describe('Pengaturan (Settings) Page E2E', () => {
    const imgDir = path.resolve(process.cwd(), '../docs/user-guide/images');
    const tempDir = path.resolve(__dirname, '../temp');

    before(async () => {
        if (!fs.existsSync(imgDir)) {
            fs.mkdirSync(imgDir, { recursive: true });
        }
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
    });

    beforeEach(async () => {
        // Clear cached mocked postMessage to prevent stale references
        await browser.execute(() => {
            window.__originalPostMessage = null;
        });

        // Inject E2E mock invoke function to safely intercept and mock file dialog actions
        await browser.execute((importPath, exportPath) => {
            window.__E2E_MOCK_INVOKE__ = async (cmd, args) => {
                console.log('E2E SafeInvoke Intercepted:', cmd, args);
                
                if (cmd === 'save_file_dialog') {
                    return { path: exportPath, name: 'exported_sias_db.db' };
                }
                
                if (cmd === 'open_file_dialog') {
                    return { path: importPath, name: 'sias_db.db' };
                }
                
                // Allow database commands to run natively since they take path arguments directly now
                return window.__TAURI_INTERNALS__.invoke(cmd, args);
            };
        }, importDbPath, exportDbPath);
    });

    after(async () => {
        // Keep exported database file for validation as requested by user
        if (fs.existsSync(exportDbPath)) {
            console.log(`Database successfully exported to: ${exportDbPath}`);
        }
    });

    it('1. should navigate to Pengaturan page and verify sections', async () => {
        const settingsLink = await $('a.nav-item[href="/pengaturan"]');
        await settingsLink.click();

        const heading = await $('h1*=Pengaturan Sistem');
        await expect(heading).toBeDisplayed();

        const dbCardHeader = await $('h2*=Manajemen Basis Data');
        await expect(dbCardHeader).toBeDisplayed();

        const bugCardHeader = await $('h2*=Pelaporan Kendala & Bug');
        await expect(bugCardHeader).toBeDisplayed();

        await browser.saveScreenshot(path.join(imgDir, 'pengaturan_main.png'));
    });

    it('2. should trigger database export successfully with mocked Tauri command', async () => {
        const exportBtn = await $('button[data-testid="export-db-button"]');
        await expect(exportBtn).toBeDisplayed();
        await exportBtn.click();

        // Wait for success message
        const statusMsg = await $('div[data-testid="status-message"]');
        await statusMsg.waitForDisplayed({ timeout: 10000 });
        await expect(statusMsg).toHaveText(expect.stringContaining('Basis data berhasil diekspor!'));

        // Verify database file was actually exported to disk
        const fileExists = fs.existsSync(exportDbPath);
        expect(fileExists).toBe(true);

        await browser.saveScreenshot(path.join(imgDir, 'pengaturan_export_success.png'));
    });

    it('3. should handle database import successfully with mocked Tauri command', async () => {
        const importBtn = await $('button[data-testid="import-db-button"]');
        await expect(importBtn).toBeDisplayed();

        // Mock window.confirm to return true
        await browser.execute(() => {
            window.confirm = () => true;
        });

        await importBtn.click();

        // Wait for success message
        const statusMsg = await $('div[data-testid="status-message"]');
        await statusMsg.waitForDisplayed({ timeout: 10000 });
        await expect(statusMsg).toHaveText(expect.stringContaining('Basis data berhasil diimpor!'));

        await browser.saveScreenshot(path.join(imgDir, 'pengaturan_import_success.png'));
    });

    it('4. should cancel database reset flow', async () => {
        const resetBtn = await $('button[data-testid="reset-db-button"]');
        await expect(resetBtn).toBeDisplayed();
        await resetBtn.click();

        const cancelResetBtn = await $('button[data-testid="cancel-reset-button"]');
        await expect(cancelResetBtn).toBeDisplayed();

        await browser.saveScreenshot(path.join(imgDir, 'pengaturan_reset_cancel.png'));

        await cancelResetBtn.click();
        await expect(cancelResetBtn).not.toBeExisting();
    });

    it('5. should execute database reset successfully with mocked Tauri command', async () => {
        const resetBtn = await $('button[data-testid="reset-db-button"]');
        await expect(resetBtn).toBeDisplayed();
        await resetBtn.click();

        const confirmResetBtn = await $('button[data-testid="confirm-reset-button"]');
        await expect(confirmResetBtn).toBeDisplayed();
        await confirmResetBtn.click();

        // Wait for success message
        const statusMsg = await $('div[data-testid="status-message"]');
        await statusMsg.waitForDisplayed({ timeout: 10000 });
        await expect(statusMsg).toHaveText(expect.stringContaining('Basis data berhasil direset dan dibuat ulang dari awal!'));

        await browser.saveScreenshot(path.join(imgDir, 'pengaturan_reset_success.png'));
    });

    it('6. should open bug report modal and submit a report', async () => {
        const openBugBtn = await $('button[data-testid="open-bug-report-button"]');
        await expect(openBugBtn).toBeDisplayed();
        await openBugBtn.click();

        const modalHeading = await $('h2*=Laporkan Bug / Kendala');
        await expect(modalHeading).toBeDisplayed();

        const titleInput = await $('input[data-testid="bug-title-input"]');
        await titleInput.setValue('E2E Bug Title');

        const bodyInput = await $('textarea[data-testid="bug-body-input"]');
        await bodyInput.setValue('E2E Bug Description and system error report detail.');

        await browser.saveScreenshot(path.join(imgDir, 'pengaturan_bug_report_filled.png'));

        // Mock fetch response for bug submission to prevent sending actual external request
        await browser.execute(() => {
            window.fetch = () => Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ status: 'success' })
            });
        });

        const submitBtn = await $('button[data-testid="submit-bug-report-button"]');
        await submitBtn.click();

        const successMsg = await $('div[data-testid="bug-report-success"]');
        await successMsg.waitForDisplayed({ timeout: 10000 });
        await expect(successMsg).toBeDisplayed();

        await browser.saveScreenshot(path.join(imgDir, 'pengaturan_bug_report_success.png'));

        // Wait for it to close automatically
        await successMsg.waitForDisplayed({ reverse: true, timeout: 5000 });
        await expect(modalHeading).not.toBeExisting();
    });
});
