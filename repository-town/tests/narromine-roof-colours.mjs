// Roof colours for traced footprints come from NSW aerial imagery, not a hash of position.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { NARROMINE_ROOF_COLOURS } from '../src/world/narromine-roof-colours-data.js';
import { NARROMINE_FOOTPRINTS } from '../src/world/narromine-footprints-data.js';
import { FILL_HOUSES } from '../src/world/narromine-layout.js';

const keys = new Set(NARROMINE_FOOTPRINTS.map(([x, z]) => x.toFixed(1) + ',' + z.toFixed(1)));
const all = Object.entries(NARROMINE_ROOF_COLOURS), entries = all.filter(([k]) => !k.startsWith('osm:'));
const osmRoofs = all.filter(([k]) => k.startsWith('osm:'));
assert(osmRoofs.length > 150, `OSM outlines have sampled roofs (${osmRoofs.length})`);
assert(entries.length > 0.75 * NARROMINE_FOOTPRINTS.length, 'most footprints have a sampled roof (the rest are shaded, tree-covered or built after the 2012 imagery)');
for (const [k, c] of entries) {
  assert(keys.has(k), k + ' is a real footprint key');
  assert(Number.isInteger(c) && c >= 0 && c <= 0xffffff, k + ' is a colour');
}
const palette = new Set(all.map(([, c]) => c));
assert(palette.size <= 24, 'clustered palette keeps the town batched (one mesh per colour per tile)');
assert(palette.size >= 12, 'a real range of roof colours, not a handful of stock tones');
// Real Narromine roofs include terracotta tile (red-dominant) and pale Colorbond/zinc.
assert([...palette].some(c => (c >> 16) > (c & 255) + 40), 'terracotta-type colours present');
assert([...palette].some(c => (c >> 16) > 0xd0 && (c & 255) > 0xc0), 'pale metal roofs present');
const drawn = FILL_HOUSES.filter(h => NARROMINE_ROOF_COLOURS[h.x.toFixed(1) + ',' + h.z.toFixed(1)] !== undefined).length;
assert(drawn > 0.75 * FILL_HOUSES.length, `drawn houses use sampled roofs (${drawn}/${FILL_HOUSES.length})`);
const header = fs.readFileSync(new URL('../src/world/narromine-roof-colours-data.js', import.meta.url), 'utf8').slice(0, 1200);
assert.match(header, /NSW Spatial Services/); assert.match(header, /CC BY 4\.0/); assert.match(header, /July 2012/); assert.match(header, /built since/);
const src = fs.readFileSync(new URL('../src/world/narromine.js', import.meta.url), 'utf8');
assert.match(src, /footprintRoof\(roofColour\(h, HOUSE_ROOFS\[h\.tone\]\)/, 'house roofs use the sampled colour, stock tone as fallback');
assert.match(src, /footprintRoof\(roofColour\(f, HOUSE_ROOFS\[2\]\)/, 'named places on footprints too');
console.log(`PASS roof colours: ${entries.length} footprints sampled from NSW imagery, ${palette.size}-colour palette, ${drawn}/${FILL_HOUSES.length} drawn houses coloured`);
