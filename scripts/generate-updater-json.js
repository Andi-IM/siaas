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

const baseBundleDir = path.join(__dirname, '..', 'src-tauri', 'target', 'release', 'bundle');
const rootUpdaterPath = path.join(__dirname, '..', 'updater.json');

// Helper to recursively find files
function findFilesRecursive(dir, filter) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(findFilesRecursive(fullPath, filter));
    } else if (filter(entry.name, fullPath)) {
      results.push(fullPath);
    }
  }
  return results;
}

let signature = '';
let targetFileName = `sias_${version}_x64_en-US.msi.zip`;

// 1. Check if Tauri generated latest.json
const latestJsonFiles = findFilesRecursive(baseBundleDir, (name) => name === 'latest.json' || name === 'updater.json');
if (latestJsonFiles.length > 0) {
  try {
    const content = JSON.parse(fs.readFileSync(latestJsonFiles[0], 'utf8'));
    if (content.platforms && content.platforms['windows-x86_64'] && content.platforms['windows-x86_64'].signature) {
      signature = content.platforms['windows-x86_64'].signature;
    }
  } catch (err) {
    console.warn('Could not parse existing latest.json:', err);
  }
}

// 2. If no signature yet, search for any .sig file
if (!signature) {
  const sigFiles = findFilesRecursive(baseBundleDir, (name) => name.endsWith('.sig'));
  if (sigFiles.length > 0) {
    signature = fs.readFileSync(sigFiles[0], 'utf8').trim();
    targetFileName = path.basename(sigFiles[0]).replace(/\.sig$/, '');
  } else {
    // If no .sig file, check for .msi
    const msiFiles = findFilesRecursive(baseBundleDir, (name) => name.endsWith('.msi'));
    if (msiFiles.length > 0) {
      targetFileName = path.basename(msiFiles[0]);
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
if (signature) {
  console.log(`Signature attached (${signature.substring(0, 15)}...)`);
} else {
  console.log('Note: No signature file found (run in CI with TAURI_PRIVATE_KEY configured).');
}
