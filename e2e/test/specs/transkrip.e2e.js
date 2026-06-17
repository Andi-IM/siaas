import { expect, browser, $ } from '@wdio/globals';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { seedRekapData } from '../seeds/rekap_seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Reset the database to a clean seeded state.
 * Truncates mutable data tables and re-seeds.
 */
function resetDatabase() {
    const dbPath = path.resolve(__dirname, '../../../src-tauri/target/debug/sias_dev.db');
    const scriptsDir = path.resolve(__dirname, '../../../scripts/');

    // Delete mutable data to prevent test overlap
    const truncateTables = [
        'DELETE FROM student_grades;',
        'DELETE FROM students;',
        'DELETE FROM batches;',
    ];

    truncateTables.forEach(sql => {
        try {
            execSync(`sqlite3 "${dbPath}" "${sql.replace(/"/g, '\\"')}"`);
        } catch (error) {
            console.error('Truncate failed:', error.message);
        }
    });

    // Re-seed from scratch to ensure clean state
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

describe('Transkrip Nilai Siswa E2E Tests', () => {
    const imgDir = path.resolve(process.cwd(), '../docs/user-guide/images');

    before(async () => {
        seedRekapData();

        if (!fs.existsSync(imgDir)) {
            fs.mkdirSync(imgDir, { recursive: true });
        }
    });

    beforeEach(async () => {
        // Reset database to clean seeded state before each test
        resetDatabase();
    });

    // ── Navigation to Transkrip Page ─────────────────────────
    it('should navigate to Transkrip page from Rekap', async () => {
        // Go to Rekap first
        const rekapLink = await $('a.nav-item[href="/rekap"]');
        await rekapLink.click();

        const heading = await $('h1*=Rekap Data Hasil Belajar');
        await expect(heading).toBeDisplayed();

        // Select filters
        const programSelect = await $('#select-program');
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

        // Click first student name link
        const firstStudentLink = await $('.table-link');
        await expect(firstStudentLink).toBeDisplayed();

        const studentName = await firstStudentLink.getText();
        await firstStudentLink.click();

        // Wait for transkrip page to load
        await browser.waitUntil(async () => {
            const url = await browser.getUrl();
            return url.includes('/siswa/transkrip');
        }, { timeout: 5000, timeoutMsg: 'Did not navigate to transkrip page' });

        // Verify transkrip page renders
        const transkripHeading = await $('h1*=Transkrip Nilai');
        await expect(transkripHeading).toBeDisplayed();

        // Verify student name appears in the subtitle
        const subtitle = await $('p*=' + studentName);
        await expect(subtitle).toBeDisplayed();
    });

    // ── Transkrip 3 Tahun (6 Semesters) ──────────────────────
    it('should display transkrip 3 tahun with 6 semesters', async () => {
        // Navigate to transkrip via URL
        const student = { nis: '10001' }; // Ahmad Fauzi from seed
        await browser.url(`http://tauri.localhost/siswa/transkrip?nis=${student.nis}`);

        // Wait for page to load
        const transkripHeading = await $('h1*=Transkrip Nilai');
        await expect(transkripHeading).toBeDisplayed();

        // Verify the table has semester columns (S1-S6 headers)
        const s1Header = await $('th*=S1');
        const s2Header = await $('th*=S2');
        const s3Header = await $('th*=S3');
        const s4Header = await $('th*=S4');
        const s5Header = await $('th*=S5');
        const s6Header = await $('th*=S6');

        await expect(s1Header).toBeDisplayed();
        await expect(s2Header).toBeDisplayed();
        await expect(s3Header).toBeDisplayed();
        await expect(s4Header).toBeDisplayed();
        await expect(s5Header).toBeDisplayed();
        await expect(s6Header).toBeDisplayed();

        // Verify category sections exist
        const kelompokUmum = await $('td*=A. Kelompok Umum');
        const kelompokKejuruan = await $('td*=B. Kelompok Kejuruan');

        await expect(kelompokUmum).toBeDisplayed();
        await expect(kelompokKejuruan).toBeDisplayed();

        // Verify AVG column exists
        const avgHeader = await $('th*=AVG');
        await expect(avgHeader).toBeDisplayed();

        // Verify rows have data (grades should be visible, not all "—")
        const gradeCells = await $$('.data-table tbody tr');
        await expect(gradeCells.length).toBeGreaterThan(2); // At least categories + subject rows
    });

    // ─ Transkrip Nilai (Student Info & Grades) ──────────────
    it('should display correct student info and grade values', async () => {
        await browser.url('http://tauri.localhost/siswa/transkrip?nis=10001');

        const transkripHeading = await $('h1*=Transkrip Nilai');
        await expect(transkripHeading).toBeDisplayed();

        // Verify student name "Ahmad Fauzi" appears
        const studentSubtitle = await $('p*=Ahmad Fauzi');
        await expect(studentSubtitle).toBeDisplayed();

        // Verify NISN value appears in subtitle (from seed: 0011223341)
        const nisnDisplay = await $('p*=0011223341');
        await expect(nisnDisplay).toBeDisplayed();

        // Verify specific subjects appear (from seed data)
        // Seed includes subjects like PAI, PKn, etc. for Kelompok Umum
        const pknRow = await $('td*=Pendidikan Pancasila dan Kewarganegaraan');
        const paiRow = await $('td*=Pendidikan Agama dan Budi Pekerti');

        // At least one of these should appear based on seed
        const hasPkn = await pknRow.isExisting();
        const hasPai = await paiRow.isExisting();
        expect(hasPkn || hasPai).toBe(true);

        // Verify AVG values are displayed (formatted numbers like "XX.XX")
        const avgCells = await $$('.table-data[style*="color: var(--primary)"]');
        await expect(avgCells.length).toBeGreaterThan(0);
    });

    // ── Simpan PDF ──────────────────────────────────────────
    it('should handle Simpan PDF', async () => {
        const outputPath = path.resolve(__dirname, '../../../src-tauri/tests/transkrip_test.pdf');

        // Navigate to transkrip page
        await browser.url('http://tauri.localhost/siswa/transkrip?nis=10001');

        const transkripHeading = await $('h1*=Transkrip Nilai');
        await expect(transkripHeading).toBeDisplayed();

        // Verify the Simpan PDF button exists and is visible
        const simpanPdfBtn = await $('button*=Simpan PDF');
        await expect(simpanPdfBtn).toBeDisplayed();
        await expect(simpanPdfBtn).toBeEnabled();

        // Invoke the Tauri command directly to bypass the file dialog
        const result = await browser.execute(async (filePath) => {
            return await window.__TAURI_INTERNALS__.invoke('export_transcript_pdf_test', {
                nis: '10001',
                path: filePath,
            });
        }, outputPath);

        await expect(result).toContain('Berhasil');

        // Verify the PDF file was created
        const fileExists = fs.existsSync(outputPath);
        expect(fileExists).toBe(true);

        // Verify file size is reasonable (> 1KB)
        if (fileExists) {
            const stats = fs.statSync(outputPath);
            expect(stats.size).toBeGreaterThan(1000);
        }

        // Cleanup
        if (fileExists) {
            fs.unlinkSync(outputPath);
        }

        // Verify the Download icon is present
        const downloadIcon = await simpanPdfBtn.$('svg.lucide-download');
        await expect(downloadIcon).toBeDisplayed();
    });

    // ─ Cetak Transkrip (Print Preview) ─────────────────────
    it('should handle Cetak Transkrip (print preview)', async () => {
        await browser.url('http://tauri.localhost/siswa/transkrip?nis=10001');

        const transkripHeading = await $('h1*=Transkrip Nilai');
        await expect(transkripHeading).toBeDisplayed();

        // Mock window.print to verify it gets called
        await browser.execute(() => {
            window.print = () => { window.printCalled = true; };
        });

        // Click the Cetak Transkrip button
        const cetakBtn = await $('button*=Cetak Transkrip');
        await expect(cetakBtn).toBeDisplayed();
        await expect(cetakBtn).toBeEnabled();
        await cetakBtn.click();

        // Verify window.print was called
        const printCalled = await browser.execute(() => window.printCalled);
        expect(printCalled).toBe(true);

        // Verify the Printer icon is present on the button
        const printerIcon = await cetakBtn.$('svg.lucide-printer');
        await expect(printerIcon).toBeDisplayed();
    });

    // ── Print Layout (3-Year Official Format) ────────────────
    it('should verify print-only layout exists for official 3-year transcript', async () => {
        await browser.url('http://tauri.localhost/siswa/transkrip?nis=10001');

        const transkripHeading = await $('h1*=Transkrip Nilai');
        await expect(transkripHeading).toBeDisplayed();

        // The print-only div exists in the DOM but is hidden with display:none
        // We verify it exists and contains the correct structure
        const printOnlyDiv = await $('.print-only');
        await expect(printOnlyDiv).toBeExisting();

        // Verify the print title exists
        const printTitle = await printOnlyDiv.$('h2*=TRANSKRIP NILAI');
        await expect(printTitle).toBeExisting();

        // Verify school name in print layout
        const schoolName = await printOnlyDiv.$('div*=SMK NEGERI 1 SUMATERA BARAT');
        await expect(schoolName).toBeExisting();

        // Verify student name in print layout
        const printStudentName = await printOnlyDiv.$('div*=AHMAD FAUZI');
        await expect(printStudentName).toBeExisting();

        // Verify the print table has KELAS X, XI, XII headers
        const kelasX = await printOnlyDiv.$('th*=KELAS X');
        const kelasXi = await printOnlyDiv.$('th*=KELAS XI');
        const kelasXii = await printOnlyDiv.$('th*=KELAS XII');

        await expect(kelasX).toBeExisting();
        await expect(kelasXi).toBeExisting();
        await expect(kelasXii).toBeExisting();
    });

    // ── Transkrip for Different Students ─────────────────────
    it('should load different student transkrip when accessed via different NIS', async () => {
        // Load first student
        await browser.url('http://tauri.localhost/siswa/transkrip?nis=10001');
        let subtitle1 = await $('p*=Ahmad Fauzi');
        await expect(subtitle1).toBeDisplayed();

        // Load second student (different konsentrasi)
        await browser.url('http://tauri.localhost/siswa/transkrip?nis=10003');
        await browser.refresh();

        const subtitle2 = await $('p*=Citra Lestari');
        await expect(subtitle2).toBeDisplayed();

        // Verify the page updates with different data
        expect(await subtitle1.isDisplayed()).toBe(false);
    });

    // ── Transkrip for Non-existent Student ───────────────────
    it('should show empty state for non-existent student', async () => {
        await browser.url('http://tauri.localhost/siswa/transkrip?nis=99999');

        // Should show "Siswa tidak ditemukan"
        await browser.waitUntil(async () => {
            const notFound = await $('p*=Siswa tidak ditemukan');
            return await notFound.isExisting();
        }, { timeout: 5000, timeoutMsg: 'Empty state not displayed for non-existent student' });

        const notFoundText = await $('p*=Siswa tidak ditemukan');
        await expect(notFoundText).toBeDisplayed();

        // Should have "Kembali ke Rekap Data" button
        const backBtn = await $('a*=Kembali ke Rekap Data');
        await expect(backBtn).toBeDisplayed();
    });
});
