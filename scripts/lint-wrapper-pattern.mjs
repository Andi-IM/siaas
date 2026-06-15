import fs from 'fs';
import path from 'path';

// Configuration
const APP_DIR = 'src/app';
const TEST_DIR = 'src/__tests__';
let hasError = false;

// Helper to find files recursively without external dependencies
function getFiles(dir, matchRegex) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    if (item.name === 'node_modules') continue;
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      results = results.concat(getFiles(fullPath, matchRegex));
    } else {
      const normalizedPath = fullPath.replace(/\\/g, '/');
      if (matchRegex && !matchRegex.test(normalizedPath)) continue;
      results.push(normalizedPath);
    }
  }
  return results;
}

// Rule 1: Validate page.tsx wrappers
console.log('Linting Next.js page.tsx wrappers...');
const pages = getFiles(APP_DIR, /\/page\.tsx$/);

for (const pagePath of pages) {
  const content = fs.readFileSync(pagePath, 'utf8');
  
  // Exclude root page or explicitly ignored pages if needed
  const legacyWhitelist = [
    'src/app/page.tsx',
    'src/app/rekap/page.tsx',
    'src/app/siswa/page.tsx'
  ];
  if (legacyWhitelist.includes(pagePath)) continue;
  
  // Heuristic: file should be relatively short (thin wrapper)
  const lines = content.split('\n').length;
  if (lines > 50) {
    console.error(`❌ [ERROR] ${pagePath}: File is too large (${lines} lines). page.tsx must be a thin wrapper. Move logic to a View component.`);
    hasError = true;
  }
  
  // Heuristic: shouldn't use useState/useEffect
  if (content.includes('useState(') || content.includes('useEffect(')) {
    console.error(`❌ [ERROR] ${pagePath}: Contains state/effects. page.tsx must be a thin wrapper. Move logic to a View component.`);
    hasError = true;
  }
}

// Rule 2: Validate vi.mock in wrapper tests
console.log('Linting Vitest wrapper tests...');
const testFiles = getFiles(TEST_DIR, /wrapper\.test\.tsx$/);

for (const testPath of testFiles) {
  const content = fs.readFileSync(testPath, 'utf8');
  
  // Checking for vi.mock("@/app/...View")
  if (content.match(/vi\.mock\(["']@\/app\/.*\/.*View["']/)) {
    console.error(`❌ [ERROR] ${testPath}: Uses static vi.mock for a View component. Use dynamic vi.spyOn(Module, 'default') instead to prevent Istanbul ghost lines.`);
    hasError = true;
  }
}

if (hasError) {
  console.error('\n❌ Architecture linting failed. See ADR 0007 for guidelines.');
  process.exit(1);
} else {
  console.log('\n✅ Architecture linting passed!');
  process.exit(0);
}
