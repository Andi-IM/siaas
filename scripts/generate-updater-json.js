import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const version = process.argv[2];
if (!version) {
  console.error('No version specified for generate-updater-json');
  process.exit(1);
}

const owner = process.env.GITHUB_REPO_OWNER || 'Andi-IM';
const repo = process.env.GITHUB_REPO_NAME || 'siaas';

const bundleDir = path.join(__dirname, '..', 'src-tauri', 'target', 'release', 'bundle', 'msi');
const rootUpdaterPath = path.join(__dirname, '..', 'updater.json');

// Find signature file and bundle file in bundleDir
let signature = '';
let targetFileName = `sias_${version}_x64_en-US.msi.zip`;

if (fs.existsSync(bundleDir)) {
  const files = fs.readdirSync(bundleDir);
  
  // Look for .sig file
  const sigFile = files.find(f => f.endsWith('.sig'));
  if (sigFile) {
    signature = fs.readFileSync(path.join(bundleDir, sigFile), 'utf8').trim();
    // Corresponding archive is sigFile without .sig
    targetFileName = sigFile.replace(/\.sig$/, '');
  } else {
    // If no .zip exists, check for .msi
    const msiFile = files.find(f => f.endsWith('.msi'));
    if (msiFile) {
      targetFileName = msiFile;
    }
  }
}

const downloadUrl = `https://github.com/${owner}/${repo}/releases/download/v${version}/${targetFileName}`;

const updaterManifest = {
  version: `v${version}`,
  notes: `Release v${version}`,
  pub_date: new Date().toISOString(),
  platforms: {
    'windows-x86_64': {
      signature: signature,
      url: downloadUrl
    }
  }
};

fs.writeFileSync(rootUpdaterPath, JSON.stringify(updaterManifest, null, 2) + '\n');
console.log(`Successfully generated updater.json for version ${version} with download url: ${downloadUrl}`);
