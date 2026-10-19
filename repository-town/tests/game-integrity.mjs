// Fail early when a packed HTML game has merge conflicts or missing entry files.
// This is a structural gate, not a substitute for Chromium gameplay tests.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import zlib from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'data/games.json'), 'utf8')).games;
const seen = new Set();
const broken = [];
let valid = 0;
for (const game of manifest) {
  const dir = path.join(root, 'games', game.id);
  const entry = path.join(dir, 'index.html');
  if (seen.has(game.id)) broken.push(`duplicate game ID: ${game.id}`);
  seen.add(game.id);
  if (!fs.existsSync(entry)) { broken.push(`${game.id}: missing index.html`); continue; }
  const html = fs.readFileSync(entry, 'utf8');
  if (/^(?:<<<<<<< |=======\s*$|>>>>>>> )/m.test(html)) broken.push(`${game.id}: unresolved merge conflict`);
  const docs = (html.match(/<!doctype\s+html\s*>/gi) || []).length;
  if (docs !== 1) broken.push(`${game.id}: found ${docs} HTML doctypes; expected one`);
  if (!/<html\b/i.test(html) || !/<\/html>/i.test(html)) broken.push(`${game.id}: incomplete HTML shell`);
  if (html.trim().length < 150) broken.push(`${game.id}: suspiciously short page`);
  if (game.kind === 'godot') {
    const wasmGz = path.join(dir, 'index.wasm.gz');
    const wasm = path.join(dir, 'index.wasm');
    const pck = path.join(dir, 'index.pck');
    // The 40+ MB .wasm is ignored; a clean Git checkout contains its tracked
    // .wasm.gz instead. Validate that the archive actually decompresses to a
    // WebAssembly module. tools/build.mjs restores it before publishing.
    let restored = null;
    if (!fs.existsSync(wasmGz)) broken.push(`${game.id}: missing tracked index.wasm.gz`);
    else try {
      restored = zlib.gunzipSync(fs.readFileSync(wasmGz));
      if (restored.length < 1024 || restored.subarray(0, 4).toString('hex') !== '0061736d')
        broken.push(`${game.id}: invalid WebAssembly payload in index.wasm.gz`);
    } catch (e) { broken.push(`${game.id}: corrupt index.wasm.gz (${e.message})`); }
    if (fs.existsSync(wasm)) {
      const built = fs.readFileSync(wasm);
      if (built.subarray(0, 4).toString('hex') !== '0061736d') broken.push(`${game.id}: invalid index.wasm header`);
      else if (restored && !built.equals(restored)) broken.push(`${game.id}: local WebAssembly differs from tracked archive`);
    }
    if (!fs.existsSync(pck)) broken.push(`${game.id}: missing index.pck`);
  }
  valid++;
}
// Catch the exact regression Work found: an AA page with conflict markers and
// two app shells. This game also needs its offline fetch shim and runnable JS.
const aa = fs.readFileSync(path.join(root,'games/hub-aa-game-adventure/index.html'),'utf8');
assert(aa.includes('Injected first into every packed game'), 'AA Game Adventure lost offline runtime shim');
assert(aa.includes('id="game-canvas"'), 'AA Game Adventure lost its canvas');
assert(aa.includes('Gt();'), 'AA Game Adventure lost inlined game startup');
assert(!aa.includes('<<<<<<<'), 'AA Game Adventure has conflict markers');
if (broken.length) { console.error(broken.join('\n')); process.exitCode = 1; }
else console.log(`PASS: ${valid} packed game shells intact; conflict-free AA with offline runtime and bundled JS`);
