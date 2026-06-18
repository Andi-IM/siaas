import { expect, browser, $ } from '@wdio/globals';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { seedRekapData } from '../seeds/rekap_seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Rekap Data Hasil Belajar E2E Tests', () => {
    const imgDir = path.resolve(process.cwd(), '../docs/user-guide/images');
    const excelInputPath = path.resolve(__dirname, '../../../src-tauri/tests/test_excel.xlsx');
    const excelOutputPath = path.resolve(__dirname, '../../../src-tauri/tests/rekap_export_test.xlsx');

    before(async () => {
        seedRekapData();

        if (!fs.existsSync(imgDir)) {
            fs.mkdirSync(imgDir, { recursive: true });
        }
    });

    beforeEach(async () => {
        // Close any open dialogs to ensure clean state
        try {
            const openDialog = await $('dialog[open]');
            if (await openDialog.isExisting()) {
                const closeBtn = await openDialog.$('button');
                if (await closeBtn.isExisting()) {
                    await closeBtn.click();
                    await browser.pause(500);
                }
            }
        } catch {
            // No dialog open, continue
        }
    });

    // ── Navigation ──────────────────────────────────────────
    it('should navigate to Rekap page', async () => {
        const rekapLink = await $('a.nav-item[href="/rekap"]');
        await rekapLink.click();

        const heading = await $('h1*=Rekap Data Hasil Belajar');
        await expect(heading).toBeDisplayed();
        await browser.saveScreenshot(path.join(imgDir, 'rekap_main.png'));
    });

    // ── Program Keahlian Dropdown ────────────────────────────
    it('should handle Program Keahlian dropdown', async () => {
        const programSelect = await $('#select-program');
        await expect(programSelect).toBeDisplayed();
        await programSelect.selectByVisibleText('Teknik Mesin');

        // Wait for konsentrasi options to load
        const konsentrasiSelect = await $('#select-konsentrasi');
        await expect(konsentrasiSelect).toBeDisplayed();
        await browser.waitUntil(async () => {
            const options = await konsentrasiSelect.$$('option');
            return options.length > 1;
        }, { timeout: 5000, timeoutMsg: 'Konsentrasi options did not load after selecting program' });
    });

    // ── Konsentrasi Keahlian Dropdown ────────────────────────
    it('should handle Konsentrasi Keahlian dropdown and filter students', async () => {
        const konsentrasiSelect = await $('#select-konsentrasi');
        await konsentrasiSelect.selectByVisibleText('Teknik Pemesinan');

        // Wait for student rows to appear
        await browser.waitUntil(async () => {
            const rows = await $$('.rekap-table tbody tr');
            return rows.length > 0;
        }, { timeout: 5000, timeoutMsg: 'Student rows did not appear after selecting konsentrasi' });

        const rows = await $$('.rekap-table tbody tr');
        const firstStudentName = await rows[0].$('.table-link');
        await expect(firstStudentName).toHaveText(/Ahmad Fauzi/);
    });

    // ── Semester Dropdown ────────────────────────────────────
    it('should handle Semester dropdown', async () => {
        const semesterSelect = await $('#select-semester');
        await expect(semesterSelect).toBeDisplayed();
        await semesterSelect.selectByVisibleText('Semester 2');

        // Header renders activeSemesterName.toUpperCase() → "SEMESTER 2"
        const semesterHeader = await $('th*=SEMESTER 2');
        await expect(semesterHeader).toBeDisplayed();
    });

    // ── Input Nilai (Manual Grade Entry) ─────────────────────
    it('should handle Input Nilai (Manual)', async () => {
        // Enter editing mode
        const inputNilaiBtn = await $('button*=Input Nilai');
        await inputNilaiBtn.click();

        // Verify number inputs appear
        const firstInput = await $('input[type="number"]');
        await expect(firstInput).toBeDisplayed();
        await firstInput.setValue('85.5');

        // Save grades
        const simpanBtn = await $('button*=Simpan Nilai');
        await simpanBtn.click();

        // Verify success toast
        const toast = await $('.toast');
        await expect(toast).toBeDisplayed();
        await expect(toast).toHaveText(/Nilai berhasil disimpan/);

        // Wait for toast to auto-dismiss
        await toast.waitForExist({ reverse: true, timeout: 5000 });
    });

    // ── Import Excel (without UI picker) ─────────────────────
    it('should handle Import Excel without UI picker', async () => {
        const result = await browser.execute(async (filePath) => {
            return await window.__TAURI_INTERNALS__.invoke('import_grades_from_excel_test', { path: filePath });
        }, excelInputPath);

        await expect(result).toContain('Berhasil');

        // Refresh page to reload state after direct Tauri command
        await browser.refresh();

        // Wait for page to reload and re-select filters
        const programSelect = await $('#select-program');
        await expect(programSelect).toBeDisplayed();
        await programSelect.selectByVisibleText('Teknik Mesin');

        await browser.waitUntil(async () => {
            const konsentrasiSelect = await $('#select-konsentrasi');
            const options = await konsentrasiSelect.$$('option');
            return options.length > 1;
        }, { timeout: 5000 });

        const konsentrasiSelect = await $('#select-konsentrasi');
        await konsentrasiSelect.selectByVisibleText('Teknik Pemesinan');

        await browser.waitUntil(async () => {
            const rows = await $$('.rekap-table tbody tr');
            return rows.length > 0;
        }, { timeout: 5000 });
    });

    // ── Export Excel (without UI picker) ─────────────────────
    it('should handle Export Excel without UI picker', async () => {
        const majorId = await (await $('#select-konsentrasi')).getValue();

        const result = await browser.execute(async (mid, filePath) => {
            return await window.__TAURI_INTERNALS__.invoke('export_grades_to_excel_test', { majorId: mid, path: filePath });
        }, majorId, excelOutputPath);

        await expect(result).toContain('Berhasil');

        // Verify file was created
        const fileExists = fs.existsSync(excelOutputPath);
        expect(fileExists).toBe(true);

        // Cleanup
        if (fileExists) {
            fs.unlinkSync(excelOutputPath);
        }
    });

    // ── Cetak Laporan (Print Report) ─────────────────────────
    it('should handle Cetak Laporan', async () => {
        // Mock window.print to avoid opening the system print dialog
        await browser.execute(() => {
            window.print = () => { window.printCalled = true; };
        });

        const cetakBtn = await $('button*=Cetak Laporan');
        await cetakBtn.click();

        const printCalled = await browser.execute(() => window.printCalled);
        expect(printCalled).toBe(true);
    });

    // ── Transkrip Siswa (Student Transcript) ─────────────────
    it('should navigate to Transkrip Siswa', async () => {
        const firstStudentLink = await $('.table-link');
        await expect(firstStudentLink).toBeDisplayed();

        const studentName = await firstStudentLink.getText();
        await firstStudentLink.click();

        // Wait for navigation to transkrip page
        await browser.waitUntil(async () => {
            const url = await browser.getUrl();
            return url.includes('/siswa/transkrip');
        }, { timeout: 5000, timeoutMsg: 'Did not navigate to transkrip page' });

        const transkripHeading = await $('h1*=Transkrip Nilai');
        await expect(transkripHeading).toBeDisplayed();

        // Verify the student name appears on the transkrip page
        const studentNameInTranskrip = await $(`p*=${studentName}`);
        await expect(studentNameInTranskrip).toBeDisplayed();

        await browser.saveScreenshot(path.join(imgDir, 'rekap_transkrip_view.png'));
    });
});