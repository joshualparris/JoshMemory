// Regression for the real Narromine road-flicker video (4 November 2026).
// No asphalt / sidewalk pairs may share positive-area coplanar surfaces.
import assert from 'node:assert/strict';
import { STREETS, HIGHWAY } from '../src/world/narromine-layout.js';
import { roadQuad, subtractConvex, buildDisjointRoadSurfaces } from '../src/world/narromine-road-surfaces.js';

const area = pts => Math.abs(pts.reduce((s, a, i) => {
  const b = pts[(i + 1) % pts.length];
  return s + a[0] * b[1] - b[0] * a[1];
}, 0)) / 2;
const box = pts => pts.reduce((r, [x, z]) => ({
  x0: Math.min(r.x0, x), x1: Math.max(r.x1, x),
  z0: Math.min(r.z0, z), z1: Math.max(r.z1, z),
}), { x0: Infinity, x1: -Infinity, z0: Infinity, z1: -Infinity });
const nearBoxes = (a, b) => a.x0 < b.x1 - 1e-5 && b.x0 < a.x1 - 1e-5 &&
  a.z0 < b.z1 - 1e-5 && b.z0 < a.z1 - 1e-5;
const overlapArea = (a, b) =>
  Math.max(0, area(a) - subtractConvex(a, b).reduce((s, p) => s + area(p), 0));

// A three-way junction that provably overlaps under the old box-strip renderer.
const sample = buildDisjointRoadSurfaces([
  { kind: 'trunk', width: 8, pts: [[-20,0],[0,0],[20,0]] },
  { kind: 'residential', width: 6, pts: [[0,-20],[0,20]] },
  { kind: 'service', width: 4, pts: [[-12,-12],[12,12]] },
]);
assert(sample.asphalt.length > 3 && sample.footpaths.length > 3);
for (const a of sample.asphalt) for (const b of sample.footpaths)
  assert(overlapArea(a.pts, b.pts) < 1e-3, 'sample road and sidewalk never overlap');
const xStrip = roadQuad(-4,0,4,0,4), zStrip = roadQuad(0,-4,0,4,4);
assert(Math.abs(area(xStrip) - 40) < 1e-3 && overlapArea(xStrip,zStrip) > 15, 'fixture actually crosses');
assert(Math.abs(subtractConvex(xStrip,zStrip).reduce((s,p)=>s+area(p),0) -
  (40-overlapArea(xStrip,zStrip))) < 1e-3, 'convex subtraction conserves area');

const start = Date.now();
const { asphalt, footpaths } = buildDisjointRoadSurfaces(STREETS, { highway: HIGHWAY });
assert(asphalt.length > 500 && footpaths.length > 100, 'real roads and kerbs generated');
assert(asphalt.length + footpaths.length < 20000, 'bounded mobile surface count');
const all = [...asphalt, ...footpaths], index = new Map(), GRID = 64;
const cells = b => {
  const out = [];
  for (let x = Math.floor(b.x0 / GRID); x <= Math.floor(b.x1 / GRID); x++)
    for (let z = Math.floor(b.z0 / GRID); z <= Math.floor(b.z1 / GRID); z++) out.push(`${x},${z}`);
  return out;
};
for (let i = 0; i < all.length; i++) {
  const pts = all[i].pts, bound = box(pts);
  assert(area(pts) > 1e-5 && pts.every(([x,z]) => Number.isFinite(x) && Number.isFinite(z)),
    'no degenerate road pieces');
  const candidates = new Set();
  for (const key of cells(bound)) for (const j of index.get(key) || []) candidates.add(j);
  for (const j of candidates) if (nearBoxes(bound, box(all[j].pts)))
    assert(overlapArea(pts, all[j].pts) < 1e-3, `coplanar road overlap: ${i} / ${j}`);
  for (const key of cells(bound)) {
    if (!index.has(key)) index.set(key, []);
    index.get(key).push(i);
  }
}
const highwayQuad = [[HIGHWAY.x0,HIGHWAY.z-HIGHWAY.width/2],
  [HIGHWAY.x1,HIGHWAY.z-HIGHWAY.width/2],
  [HIGHWAY.x1,HIGHWAY.z+HIGHWAY.width/2],
  [HIGHWAY.x0,HIGHWAY.z+HIGHWAY.width/2]];
for (const surface of all) if (nearBoxes(box(surface.pts), box(highwayQuad)))
  assert(overlapArea(surface.pts, highwayQuad) < 1e-3, 'town roads never overlap highway');
console.log(`PASS Narromine road surfaces: ${STREETS.length} ways; ${asphalt.length} asphalt + ${footpaths.length} footpath faces; ${Date.now()-start} ms`);
