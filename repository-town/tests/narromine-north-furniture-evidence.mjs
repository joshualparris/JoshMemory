// NR-REAL-001: actual planner + renderer, without a WebGL context.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { STREETS } from '../src/world/narromine-layout.js';
import { planDandalooStreetscape } from '../src/world/narromine-dandaloo-streetscape-data.js';
import { buildDandalooStreetscape } from '../src/world/narromine-dandaloo-streetscape.js';

const plan = planDandalooStreetscape(STREETS);
// Baseline daebdd0: preserve every existing non-furniture surface coordinate.
const surfaces = JSON.stringify([plan.medians, plan.kerbs, plan.pavers, plan.parking]);
assert.equal(createHash('sha256').update(surfaces).digest('hex'),
  'bad7de94f8604a6f971a342d9d5e5c789467a830469c56757ecdccc7011c3807',
  'NR-REAL-001 must not move road, median, paving, kerb or parking geometry');
let solidGeometry = 0, boxes = 0, polygons = 0, strips = 0;
const built = buildDandalooStreetscape({
  streets: STREETS,
  push: (_colour, geometry) => { solidGeometry++; geometry.dispose(); },
  box: () => boxes++, flatPoly: () => polygons++, strip: () => strips++,
  clear: () => true,
});
assert.equal(solidGeometry + boxes, 0,
  'no unsupported tree/lamp/hedge/pole geometry emitted by either streetscape band');
assert.equal(plan.trees.length, 0, 'no invented north tree coordinates');
assert.equal(plan.lamps.length, 0, 'no invented north lamp coordinates');
assert.equal(polygons, plan.medians.length + plan.pavers.length, 'surface renderer remains active');
assert.equal(strips, plan.kerbs.length + plan.parking.length + built.south.kerbs.length,
  'all existing kerbs and parking separators still render');
console.log('PASS NR-REAL-001: unsupported furniture suppressed; surface geometry unchanged');
