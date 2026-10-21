// Guard against repeating the General Store's coplanar shelf regression.
// Run from repository-town with: node tests/z-fighting-source.mjs
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';
const root = new URL('../src/world/', import.meta.url);
const files = readdirSync(root).filter(name => name.endsWith('.js'));
let checked = 0;
for (const name of files) {
  const source = readFileSync(new URL(name, root), 'utf8');
  const placements = new Set();
  for (const line of source.split('\n')) {
    // Detect identical, literal box placements; a common source of depth fighting.
    const matches = [...line.matchAll(/\bbox\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,/g)];
    for (const match of matches) {
      const key = match.slice(1, 7).join(',');
      assert(!placements.has(key), name + ': duplicate literal box at ' + key);
      placements.add(key);
    }
  }
  checked++;
}
const store = readFileSync(new URL('store-interior.js', root), 'utf8');
assert(!/solid\(0\.5, 2\.1, len, x, 1\.05, zc/.test(store), 'Do not put shelving slabs inside a solid wall carcass');
assert(!/solid\(1\.0, 1\.7, 5\.4, gx/.test(store), 'Do not restore solid gondola carcasses');
assert(/box\(0\.78, 0\.04, 5\.16, gx/.test(store), 'Keep gondola shelf slabs clear of frame posts');
console.log('Z-fighting source guards passed (' + checked + ' world modules scanned).');
