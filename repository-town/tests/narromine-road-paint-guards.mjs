import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { REGION } from '../src/world/narromine-layout.js';
import { NARROMINE_FURNITURE } from '../src/world/narromine-furniture-data.js';
import { shouldRenderMappedPaint } from '../src/world/narromine-road-paint-guards.js';

assert(shouldRenderMappedPaint(REGION.x0, REGION.z0, REGION), 'inside map');
assert(shouldRenderMappedPaint(REGION.x0 - 3.9, REGION.z0, REGION), 'guard band protects boundary paint');
assert(!shouldRenderMappedPaint(REGION.x0 - 4.1, REGION.z0, REGION), 'exclude distant westward paint');
assert(!shouldRenderMappedPaint(REGION.x1 + 10, REGION.z1 + 10, REGION), 'exclude distant other corners');
assert(!shouldRenderMappedPaint(NaN, REGION.z0, REGION), 'never render invalid position');
assert(!shouldRenderMappedPaint(0, 0, null), 'require explicit map boundaries');

let generated = 0, visible = 0, culled = 0;
for (const pts of NARROMINE_FURNITURE.laned) {
  let carry = 0;
  for (let i = 1; i < pts.length; i++) {
    const [ax, az] = pts[i - 1], [bx, bz] = pts[i];
    const len = Math.hypot(bx - ax, bz - az);
    if (len < 0.5) continue;
    const ux = (bx - ax) / len, uz = (bz - az) / len;
    for (let d = carry; d + 3 <= len; d += 12) {
      const x = ax + ux * (d + 1.5), z = az + uz * (d + 1.5);
      generated++;
      if (shouldRenderMappedPaint(x, z, REGION)) visible++;
      else culled++;
    }
    carry = (carry - len) % 12;
    if (carry < 0) carry += 12;
  }
}
assert(generated > 5000, 'fixture includes long OSM ways beyond Narromine');
assert(visible > 300, 'preserves real tagged-lane lines inside Narromine');
assert(culled > 4000, 'stops thousands of off-map paint boxes from being rendered');
assert(visible + culled === generated, 'all dash candidates accounted for');
const sceneSource = readFileSync(new URL('../src/world/narromine.js', import.meta.url), 'utf8');
assert.match(sceneSource, /shouldRenderMappedPaint\(mx, mz, REGION\)/, 'scene clips the actual paint meshes');
assert.match(sceneSource, /const centre = st\.kind !== 'trunk' && !nearLine\(NARROMINE_FURNITURE\.laned, st\.pts\[0\]/,
  'keep the existing inferred main road paint unchanged until verified against photos');
console.log(`PASS Narromine OSM paint extent: ${visible} in-town dashes preserved, ${culled} off-map dashes culled (of ${generated}).`);
