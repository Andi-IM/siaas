import { expect, browser, $ } from '@wdio/globals';
import fs from 'fs';
import path from 'path';

describe('Kurikulum (Curriculum) Full CRUD to Database', () => {
    // Generate unique names to avoid conflicts with seeded data or previous test runs
    const uniqueId = Date.now();
    const programName = `Prog E2E ${uniqueId}`;
    const programNameEdited = `${programName} Edited`;
    const konsentrasiName = `Kons E2E ${uniqueId}`;
    const konsentrasiNameEdited = `${konsentrasiName} Edited`;
    const mapelKode = `E2E${uniqueId.toString().slice(-4)}`;
    const mapelNama = `Mapel E2E ${uniqueId}`;
    const mapelNamaEdited = `${mapelNama} Edited`;

    const imgDir = path.resolve(process.cwd(), '../docs/user-guide/images');

    before(async () => {
        if (!fs.existsSync(imgDir)) {
            fs.mkdirSync(imgDir, { recursive: true });
        }
    });

    beforeEach(async () => {
        // Close any open dialogs if any to ensure clean state
        try {
            const openDialog = await $('dialog[open]');
            if (await openDialog.isExisting()) {
                const closeBtn = await openDialog.$('button[aria-label="Tutup"]');
                if (await closeBtn.isExisting()) {
                    await closeBtn.click();
                    await browser.pause(500);
                }
            }
        } catch (e) {}
    });

    it('1. should navigate to Kurikulum page', async () => {
        const kurikulumButton = await $('a.nav-item[href="/kurikulum"]');
        await kurikulumButton.click();
        
        const heading = await $('h1*=Manajemen Kurikulum');
        await expect(heading).toBeDisplayed();
        await browser.saveScreenshot(path.join(imgDir, 'kurikulum_main.png'));
    });

    // --- PROGRAM KEAHLIAN ---
    it('2. should create a new Program Keahlian and persist it', async () => {
        const tambahProgramBtn = await $('button[title="Tambah Program"]');
        await tambahProgramBtn.click();

        const modal = await $('dialog[open]');
        await expect(modal).toBeDisplayed();
        await browser.saveScreenshot(path.join(imgDir, 'kurikulum_tambah_program_modal.png'));

        const inputField = await modal.$('input.form-input');
        await inputField.setValue(programName);

        const simpanBtn = await modal.$('button=Simpan Program');
        await simpanBtn.click();

        await expect(modal).not.toBeDisplayed();

        // Verify it appears in the list
        const programItem = await $(`//button[contains(., "${programName}")]`);
        await expect(programItem).toBeDisplayed();
        
        // Select the newly created program
        await programItem.click();
        await browser.pause(500);
        await browser.saveScreenshot(path.join(imgDir, 'kurikulum_program_added.png'));
    });

    it('3. should edit the Program Keahlian', async () => {
        const programLi = await $(`//li[.//button[contains(., "${programName}")]]`);
        const btns = await programLi.$$('button');
        await btns[1].click();

        const modal = await $('dialog[open]');
        await expect(modal).toBeDisplayed();
        await browser.saveScreenshot(path.join(imgDir, 'kurikulum_edit_program_modal.png'));

        const inputField = await modal.$('input.form-input');
        await inputField.setValue(programNameEdited);

        const simpanBtn = await modal.$('button=Simpan Program');
        await simpanBtn.click();

        await expect(modal).not.toBeDisplayed();

        const programItemEdited = await $(`//button[contains(., "${programNameEdited}")]`);
        await expect(programItemEdited).toBeDisplayed();
        
        await programItemEdited.click();
    });

    // --- KONSENTRASI KEAHLIAN ---
    it('4. should create a new Konsentrasi and persist it', async () => {
        // Ensure the correct Program is selected before adding a Konsentrasi
        const programItemEdited = await $(`//button[contains(., "${programNameEdited}")]`);
        await programItemEdited.click();

        const tambahKonsentrasiBtn = await $('button[title="Tambah Konsentrasi"]');
        await tambahKonsentrasiBtn.waitForClickable();
        await tambahKonsentrasiBtn.click();

        const modal = await $('dialog[open]');
        await expect(modal).toBeDisplayed();
        await browser.saveScreenshot(path.join(imgDir, 'kurikulum_tambah_konsentrasi_modal.png'));

        const inputField = await modal.$('input.form-input');
        await inputField.setValue(konsentrasiName);

        const simpanBtn = await modal.$('button=Simpan Konsentrasi');
        await simpanBtn.click();

        await expect(modal).not.toBeDisplayed();

        const konsentrasiItem = await $(`//button[contains(., "${konsentrasiName}")]`);
        await expect(konsentrasiItem).toBeDisplayed();
        
        // Select it
        await konsentrasiItem.click();
        await browser.pause(500);
        await browser.saveScreenshot(path.join(imgDir, 'kurikulum_konsentrasi_added.png'));
    });

    it('5. should edit the Konsentrasi', async () => {
        // Ensure the correct Program is selected
        const programItemEdited = await $(`//button[contains(., "${programNameEdited}")]`);
        await programItemEdited.click();

        const konsentrasiLi = await $(`//li[.//button[contains(., "${konsentrasiName}")]]`);
        const btns = await konsentrasiLi.$$('button');
        await btns[1].click();

        const modal = await $('dialog[open]');
        await expect(modal).toBeDisplayed();
        await browser.saveScreenshot(path.join(imgDir, 'kurikulum_edit_konsentrasi_modal.png'));

        const inputField = await modal.$('input.form-input');
        await inputField.setValue(konsentrasiNameEdited);

        const simpanBtn = await modal.$('button=Simpan Konsentrasi');
        await simpanBtn.click();

        await expect(modal).not.toBeDisplayed();

        const konsentrasiItemEdited = await $(`//button[contains(., "${konsentrasiNameEdited}")]`);
        await expect(konsentrasiItemEdited).toBeDisplayed();

        await konsentrasiItemEdited.click();
    });

    // --- MATA PELAJARAN ---
    it('6. should create a new Mata Pelajaran and persist it', async () => {
        // Ensure the correct Program and Konsentrasi are selected
        const programItemEdited = await $(`//button[contains(., "${programNameEdited}")]`);
        await programItemEdited.click();
        const konsentrasiItemEdited = await $(`//button[contains(., "${konsentrasiNameEdited}")]`);
        await konsentrasiItemEdited.click();

        const tambahMapelBtn = await $('button*=Tambah Mapel');
        await tambahMapelBtn.waitForClickable();
        await tambahMapelBtn.click();

        const modal = await $('dialog[open]');
        await expect(modal).toBeDisplayed();
        await browser.saveScreenshot(path.join(imgDir, 'kurikulum_tambah_mapel_modal.png'));

        // Inputs: No Urut, Kode Mapel, Nama Mapel
        const inputs = await modal.$$('input.form-input');
        await inputs[0].setValue('99');
        await inputs[1].setValue(mapelKode);
        await inputs[2].setValue(mapelNama);

        // Select semester checkbox 1 and 2
        const checkboxes = await modal.$$('input[type="checkbox"]');
        await checkboxes[0].click(); // Semester 1
        await checkboxes[1].click(); // Semester 2

        const simpanBtn = await modal.$('button=Simpan Mapel');
        await simpanBtn.waitForClickable();
        await simpanBtn.click();

        await expect(modal).not.toBeDisplayed();

        // Check if mapel is in the table
        const mapelRow = await $(`//tr[td[contains(text(), "${mapelKode}")]]`);
        await expect(mapelRow).toBeDisplayed();
        await expect(mapelRow.$(`td*=${mapelNama}`)).toBeDisplayed();
        await browser.saveScreenshot(path.join(imgDir, 'kurikulum_mapel_added.png'));
    });

    it('7. should edit the Mata Pelajaran', async () => {
        // Ensure the correct Program and Konsentrasi are selected
        const programItemEdited = await $(`//button[contains(., "${programNameEdited}")]`);
        await programItemEdited.click();
        const konsentrasiItemEdited = await $(`//button[contains(., "${konsentrasiNameEdited}")]`);
        await konsentrasiItemEdited.click();

        const mapelRow = await $(`//tr[td[contains(text(), "${mapelKode}")]]`);
        const editBtn = await mapelRow.$('button[title="Edit"]');
        await editBtn.click();

        const modal = await $('dialog[open]');
        await expect(modal).toBeDisplayed();
        await browser.saveScreenshot(path.join(imgDir, 'kurikulum_edit_mapel_modal.png'));

        const inputs = await modal.$$('input.form-input');
        await inputs[2].setValue(mapelNamaEdited);

        const simpanBtn = await modal.$('button=Simpan Mapel');
        await simpanBtn.click();

        await expect(modal).not.toBeDisplayed();

        const editedMapelRow = await $(`//tr[td[contains(text(), "${mapelKode}")]]`);
        await expect(editedMapelRow.$(`td*=${mapelNamaEdited}`)).toBeDisplayed();
    });

    it('8. should delete the Mata Pelajaran', async () => {
        // Ensure the correct Program and Konsentrasi are selected
        const programItemEdited = await $(`//button[contains(., "${programNameEdited}")]`);
        await programItemEdited.click();
        const konsentrasiItemEdited = await $(`//button[contains(., "${konsentrasiNameEdited}")]`);
        await konsentrasiItemEdited.click();

        const mapelRow = await $(`//tr[td[contains(text(), "${mapelKode}")]]`);
        const deleteBtn = await mapelRow.$('button[title="Hapus"]');

        // Mock window.confirm BEFORE clicking
        await browser.execute(() => {
            window.confirm = () => true;
        });

        await deleteBtn.click();
        await browser.pause(500);

        const deletedRow = await $(`//tr[td[contains(text(), "${mapelKode}")]]`);
        await expect(deletedRow).not.toBeExisting();
    });
});