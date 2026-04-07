const fs = require('fs');
const path = require('path');

const ARCHIVE_DIR = path.resolve(__dirname, '..', 'test-archives');
const MAX_ARCHIVES = 5;

// Create timestamped archive folder
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const archivePath = path.join(ARCHIVE_DIR, timestamp);

if (!fs.existsSync(ARCHIVE_DIR)) {
  fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
}

// Copy directories if they exist
const sources = ['test-results', 'playwright-report'];
let copied = false;

for (const src of sources) {
  const srcPath = path.resolve(__dirname, '..', src);
  if (fs.existsSync(srcPath)) {
    const destPath = path.join(archivePath, src);
    fs.cpSync(srcPath, destPath, { recursive: true });
    copied = true;
  }
}

if (copied) {
  console.log(`Archived to: ${archivePath}`);
} else {
  console.log('No test results to archive.');
  process.exit(0);
}

// Keep only last N archives
const archives = fs.readdirSync(ARCHIVE_DIR)
  .filter(f => fs.statSync(path.join(ARCHIVE_DIR, f)).isDirectory())
  .sort();

if (archives.length > MAX_ARCHIVES) {
  const toRemove = archives.slice(0, archives.length - MAX_ARCHIVES);
  for (const dir of toRemove) {
    const dirPath = path.join(ARCHIVE_DIR, dir);
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`Removed old archive: ${dir}`);
  }
}

console.log(`Archives kept: ${Math.min(archives.length, MAX_ARCHIVES)}`);
