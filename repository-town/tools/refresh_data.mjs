// One-command data refresh: runs harvest_evidence.py + repo_data.py and prints a summary.
// Pass flags like --fetch-missing, --pull, or --clone-dir <dir> through to harvest_evidence.py.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { TOWN, loadRepoData } from './lib.mjs';

const args = process.argv.slice(2);
const before = loadRepoData();
const beforeReadable = Object.values(before).filter((v) => !v?.unreachable).length;

console.log('1/2 Harvesting repository evidence (tools/harvest_evidence.py)...');
execFileSync('python3', ['-I', path.join(TOWN, 'tools', 'harvest_evidence.py'), ...args], {
  cwd: TOWN,
  stdio: 'inherit',
});

console.log('2/2 Building in-game Repository Archive (tools/repo_data.py)...');
execFileSync('python3', ['-I', path.join(TOWN, 'tools', 'repo_data.py')], {
  cwd: TOWN,
  stdio: 'inherit',
});

const after = loadRepoData();
const total = Object.keys(after).length;
const afterReadable = Object.values(after).filter((v) => !v?.unreachable).length;
const unreachable = total - afterReadable;
const newlyReadable = Object.keys(after).filter((k) => before[k]?.unreachable && !after[k]?.unreachable);

const dataPath = path.join(TOWN, 'data', 'repo-data.json');
const sizeKb = Math.round(fs.statSync(dataPath).size / 1024);

console.log(`\nRefresh complete: ${afterReadable}/${total} readable (${unreachable} unreachable), ${sizeKb} KB.`);
if (newlyReadable.length) {
  console.log(`Newly readable (${newlyReadable.length}): ${newlyReadable.join(', ')}`);
} else if (afterReadable !== beforeReadable) {
  console.log(`Readable count changed: ${beforeReadable} -> ${afterReadable}`);
}
