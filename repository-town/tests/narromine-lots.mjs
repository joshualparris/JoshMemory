// Cadastre lot outlines: structure, placement in the game world, and an independent cross-check
// against the separately-fetched public-venue lots (narromine-public-lots.js).
import assert from 'node:assert/strict';
import { narromineLots, NARROMINE_LOTS } from '../src/world/narromine-lots.js';
import { NARROMINE_PUBLIC_LOTS } from '../src/world/narromine-public-lots.js';
import { OSM, geoToWorld, toWorld } from '../src/world/narromine-layout.js';

const lots = narromineLots();
assert(lots.length > 1500, `expected >1500 lot outlines, got ${lots.length}`);
assert(Buffer.byteLength(JSON.stringify(NARROMINE_LOTS)) < 200 * 1024, 'lot data stays under 200 KB');

const area = (r) => Math.abs(r.reduce((s, p, i) => { const q = r[(i + 1) % r.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0)) / 2;
const E = OSM.extent, M = 40;
let withLabel = 0;
for (const l of lots) {
  assert(l.pts.length >= 3, `ring has 3+ points (${l.label})`);
  assert(area(l.pts) >= 1, `ring has area (${l.label})`);
  assert(l.pts.every(([x, z]) => Number.isFinite(x) && Number.isFinite(z)), `finite coordinates (${l.label})`);
  if (l.plan) withLabel++;
}
assert(withLabel / lots.length > 0.99, 'almost every lot carries a plan label');
// Every ring touches the town extent (the converter clips to it); a wrong projection would fail this.
const touches = (l) => { const xs = l.pts.map((p) => p[0]), zs = l.pts.map((p) => p[1]); return Math.max(...xs) >= E.x0 - M && Math.min(...xs) <= E.x1 + M && Math.max(...zs) >= E.z0 - M && Math.min(...zs) <= E.z1 + M; };
assert(lots.every(touches), 'all lot outlines lie in the town extent');

// Same projection as the rest of the town: decoded local metres + toWorld must equal geoToWorld on lat/lon.
const probe = geoToWorld(OSM.anchor.lat, OSM.anchor.lon), local0 = toWorld([0, 0]);
assert(Math.hypot(probe[0] - local0[0], probe[1] - local0[1]) < 1e-6, 'anchor maps to local origin');

// Independent cross-check: each public-venue lot's centroid should fall inside a decoded lot
// (or within a few metres of one), proving the lots land where separately-sourced data says they do.
const inPoly = (x, z, r) => { let c = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) if ((r[i][1] > z) !== (r[j][1] > z) && x < ((r[j][0] - r[i][0]) * (z - r[i][1])) / (r[j][1] - r[i][1]) + r[i][0]) c = !c; return c; };
const world = lots.map((l) => ({ l, pts: l.pts.map(toWorld) }));
let checked = 0, hit = 0; const misses = [];
for (const v of NARROMINE_PUBLIC_LOTS) {
  const g = v.polygon.map(([lon, lat]) => geoToWorld(lat, lon));
  const cx = g.reduce((a, p) => a + p[0], 0) / g.length, cz = g.reduce((a, p) => a + p[1], 0) / g.length;
  checked++;
  if (world.some((w) => inPoly(cx, cz, w.pts))) hit++; else misses.push(v.id);
}
assert(checked >= 1, 'public lots present to cross-check');
assert(hit / checked >= 0.8, `public-venue lot centroids fall inside decoded lots: ${hit}/${checked}; misses: ${misses.join(', ')}`);
console.log(`narromine-lots ok: ${lots.length} outlines, ${hit}/${checked} public-venue centroids matched`);
