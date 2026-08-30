import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const newVersion = process.argv[2];
if (!newVersion) {
  console.error('No version specified');
  process.exit(1);
}

const tauriConfigPath = path.join(__dirname, '..', 'src-tauri', 'tauri.conf.json');

if (!fs.existsSync(tauriConfigPath)) {
  console.error(`Tauri config file not found at: ${tauriConfigPath}`);
  process.exit(1);
}

try {
  const tauriConfig = JSON.parse(fs.readFileSync(tauriConfigPath, 'utf8'));

  // Update the version at the root level
  tauriConfig.version = newVersion;

  // Save the updated configuration back to the file
  fs.writeFileSync(tauriConfigPath, JSON.stringify(tauriConfig, null, 2) + '\n');
  console.log(`Successfully bumped src-tauri/tauri.conf.json to version ${newVersion}`);
} catch (err) {
  console.error('Error updating tauri.conf.json:', err);
  process.exit(1);
}
