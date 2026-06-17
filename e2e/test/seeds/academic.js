import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function seedAcademicCore() {
    // Determine absolute paths relative to this file
    const dbPath = path.resolve(__dirname, '../../../src-tauri/target/debug/sias_dev.db');
    const sqlPath = path.resolve(__dirname, '../../../scripts/seed_academic_core.sql');
    
    try {
        // Run sqlite3 CLI to seed the database
        // Need to use powershell because the command might run on Windows
        // .read command in sqlite3 is cross platform
        execSync(`sqlite3 "${dbPath}" ".read '${sqlPath.replace(/\\/g, '/')}'"`);
        console.log('Successfully seeded academic core data.');
    } catch (error) {
        console.error('Error seeding academic core data:', error.message);
        if (error.stdout) console.error(error.stdout.toString());
        if (error.stderr) console.error(error.stderr.toString());
    }
}
