import { expect, browser, $ } from '@wdio/globals';
import { seedAcademicCore } from '../seeds/academic.js';
import fs from 'fs';
import path from 'path';

describe('Siswa (Students) Full CRUD to Database', () => {
    const uniqueId = Date.now();
    const nis = `${uniqueId.toString().slice(-5)}`;
    const nisn = `00${uniqueId.toString().slice(-8)}`;
    const studentName = `Siswa E2E ${uniqueId}`;
    const studentNameEdited = `${studentName} Edited`;
    const className = `X TP ${uniqueId.toString().slice(-2)}`;

    const imgDir = path.resolve(process.cwd(), '../docs/user-guide/images');

    before(async () => {
        // Run seed script before any tests to ensure majors and concentrations exist
        seedAcademicCore();
        if (!fs.existsSync(imgDir)) {
            fs.mkdirSync(imgDir, { recursive: true });
        }
    });

    beforeEach(async () => {
        // Close any open dialogs if any
        try {
            const openDialog = await $('dialog[open]');
            if (await openDialog.isExisting()) {
                const closeBtn = await openDialog.$('button[aria-label="Tutup"]');
                if (await closeBtn.isExisting()) {
                    await closeBtn.click();
                    await browser.pause(500);
                }
            }
        } catch {}
    });

    it('1. should navigate to Siswa page and verify list view', async () => {
        const siswaButton = await $('a.nav-item[href="/siswa"]');
        await siswaButton.click();
        
        const heading = await $('h1*=Manajemen Peserta Didik');
        await expect(heading).toBeDisplayed();
        await browser.saveScreenshot(path.join(imgDir, 'siswa_main.png'));
    });

    it('2. should add a new student and persist it', async () => {
        const tambahBtn = await $('a*=Tambah Siswa');
        await tambahBtn.click();

        // Wait for page transition
        const pageHeading = await $('h1*=Tambah Siswa');
        await expect(pageHeading).toBeDisplayed();
        await browser.saveScreenshot(path.join(imgDir, 'siswa_tambah_form.png'));

        // Fill form fields
        const namaInput = await $(`//div[contains(@class, "form-field")][.//label[contains(., "Nama Peserta")]]//input`);
        await namaInput.setValue(studentName);

        const nisInput = await $(`//div[contains(@class, "form-field")][.//label[contains(., "Nomor Induk")]]//input`);
        await nisInput.setValue(nis);

        const nisnInput = await $(`//div[contains(@class, "form-field")][.//label[contains(., "NISN")]]//input`);
        await nisnInput.setValue(nisn);

        const kelasInput = await $(`//div[contains(@class, "form-field")][.//label[contains(., "Diterima di Kelas")]]//input`);
        await kelasInput.setValue(className);

        // Select the first available concentration
        const konsentrasiSelect = await $(`//div[contains(@class, "form-field")][.//label[contains(., "Konsentrasi Keahlian")]]//select`);
        await konsentrasiSelect.waitForExist();
        
        // Wait until at least one option (besides placeholder if any) is available
        await browser.waitUntil(async () => {
            const options = await konsentrasiSelect.$$('option');
            return options.length > 0;
        }, { timeout: 5000 });
        
        await konsentrasiSelect.selectByIndex(1); // Select the first valid option (0 might be placeholder, or 0 if no placeholder)

        await browser.saveScreenshot(path.join(imgDir, 'siswa_tambah_form_filled.png'));

        // Submit form
        const simpanBtn = await $('button=Simpan Siswa');
        await simpanBtn.click();

        // Wait for redirect to list
        const listHeading = await $('h1*=Manajemen Peserta Didik');
        await expect(listHeading).toBeDisplayed();

        // Verify student appears in the table
        const studentRow = await $(`//tr[td[contains(., "${nis}")]]`);
        await expect(studentRow).toBeDisplayed();
        await expect(studentRow.$(`td*=${studentName}`)).toBeDisplayed();
    });

    it('3. should view student details', async () => {
        const studentRow = await $(`//tr[td[contains(., "${nis}")]]`);
        await studentRow.waitForExist({ timeout: 5000 });
        const detailBtn = await studentRow.$('a[aria-label^="Lihat detail"]');
        await detailBtn.click();

        const heading = await $(`h1*=${studentName}`);
        await expect(heading).toBeDisplayed();
        await browser.saveScreenshot(path.join(imgDir, 'siswa_detail.png'));

        // Verify the details shown match what we inputted
        const nisDisplay = await $(`//span[contains(., "${nis}")]`);
        await expect(nisDisplay).toBeDisplayed();

        // Navigate back to list
        const backLink = await $('a[aria-label="Kembali ke daftar siswa"]');
        await backLink.click();
        const listHeading = await $('h1*=Manajemen Peserta Didik');
        await expect(listHeading).toBeDisplayed();
    });

    it('4. should edit the student data', async () => {
        const studentRow = await $(`//tr[td[contains(., "${nis}")]]`);
        await studentRow.waitForExist({ timeout: 5000 });
        const editBtn = await studentRow.$('a[aria-label^="Edit"]');
        await editBtn.click();

        const heading = await $('h1*=Edit Siswa');
        await expect(heading).toBeDisplayed();
        await browser.saveScreenshot(path.join(imgDir, 'siswa_edit_form.png'));

        const namaInput = await $(`//div[contains(@class, "form-field")][.//label[contains(., "Nama Peserta")]]//input`);
        await namaInput.setValue(studentNameEdited);

        const simpanBtn = await $('button=Simpan Perubahan');
        await simpanBtn.click();

        // Should redirect back to detail view
        const detailHeading = await $(`h1*=${studentNameEdited}`);
        await detailHeading.waitForDisplayed({ timeout: 5000 });
        await expect(detailHeading).toBeDisplayed();

        // Navigate back to list
        const backLink = await $('a[aria-label="Kembali ke daftar siswa"]');
        await backLink.click();
        const listHeading = await $('h1*=Manajemen Peserta Didik');
        await expect(listHeading).toBeDisplayed();

        // Verify updated name in list
        const editedRow = await $(`//tr[td[contains(., "${nis}")]]`);
        await editedRow.waitForExist({ timeout: 5000 });
        await expect(editedRow.$(`td*=${studentNameEdited}`)).toBeDisplayed();
    });

    it('5. should delete the student', async () => {
        const studentRow = await $(`//tr[td[contains(., "${nis}")]]`);
        await studentRow.waitForExist({ timeout: 5000 });
        const deleteBtn = await studentRow.$('button[aria-label^="Hapus"]');
        await deleteBtn.click();

        // Wait for the modal dialog to appear
        const modal = await $('dialog[open]');
        await expect(modal).toBeDisplayed();
        await expect(modal.$('h2*=Hapus Siswa')).toBeDisplayed();
        await browser.saveScreenshot(path.join(imgDir, 'siswa_delete_modal.png'));

        // Confirm deletion
        const hapusBtn = await modal.$('button=Hapus');
        await hapusBtn.click();

        // Wait for dialog to disappear
        await expect(modal).not.toBeDisplayed();

        // Verify row is gone
        const deletedRow = await $(`//tr[td[contains(., "${nis}")]]`);
        await expect(deletedRow).not.toBeExisting();
    });
});
