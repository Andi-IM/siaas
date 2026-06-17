import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function seedRekapData() {
    // Determine absolute paths relative to this file
    // In debug mode, the database is in src-tauri/target/debug/sias_dev.db
    const dbPath = path.resolve(__dirname, '../../../src-tauri/target/debug/sias_dev.db');
    
    const scripts = [
        'seed_academic_core.sql',
        'seed_students.sql',
        'seed_grades.sql'
    ];
    
    scripts.forEach(script => {
        const sqlPath = path.resolve(__dirname, '../../../scripts/', script);
        try {
            // Run sqlite3 CLI to seed the database
            // .read command in sqlite3 is cross platform
            execSync(`sqlite3 "${dbPath}" ".read '${sqlPath.replace(/\\/g, '/')}'"`);
            console.log(`Successfully seeded ${script}.`);
        } catch (error) {
            console.error(`Error seeding ${script}:`, error.message);
            if (error.stdout) console.error(error.stdout.toString());
            if (error.stderr) console.error(error.stderr.toString());
        }
    });
}
