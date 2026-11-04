// Geometry regression checks for the evidence-led Dandaloo Street surface plan.
// Do not treat estimated lamp/bay/tree placements as measured survey observations.
import assert from 'node:assert/strict';
import { STREETS } from '../src/world/narromine-layout.js';
import { LANDSCAPED_BANDS, findDandalooCarriageways, roadXAtZ,
  planDandalooStreetscape } from '../src/world/narromine-dandaloo-streetscape-data.js';

const [west, east] = findDandalooCarriageways(STREETS);
assert(west && east && west !== east, 'two independently mapped dual carriageways');
const plan = planDandalooStreetscape(STREETS);
assert(plan.medians.length >= 30, 'planted median follows the mapped split over both blocks');
assert.equal(plan.kerbs.length, 4 * plan.medians.length, 'median and external kerb edges');
assert.equal(plan.pavers.length, 2 * plan.medians.length, 'both shop-front footpaths');
assert(plan.parking.length >= 60, 'angled bay markings along each block and each side');
assert(plan.trees.length >= 10 && plan.lamps.length >= 8, 'town trees and swan-neck lamps');
assert(plan.trees.filter(t => t.kind === 'palm').length >= 1, 'additional north median palm');
assert(!plan.trees.some(t => Math.abs(t.z + 889) < 4 && t.where === 'median'),
  'do not duplicate the existing Kierath\'s median palm');
const inBand = z => LANDSCAPED_BANDS.some(b => z <= b.upperZ && z >= b.lowerZ);
for (const m of plan.medians) {
  for (const [x, z] of m.pts) {
    assert(inBand(z), 'median fragment remains in its intersection-safe block');
    const w = roadXAtZ(west, z), e = roadXAtZ(east, z);
    assert(w !== null && e !== null, 'OSM centreline sampled');
    assert(x >= w + west.width / 2 + 0.40 - 1e-4,
      'median must not enter west mapped asphalt at z=' + z);
    assert(x <= e - east.width / 2 - 0.40 + 1e-4,
      'median must not enter east mapped asphalt at z=' + z);
  }
}
for (const z of [-853, -956, -1184]) {
  assert(!plan.medians.some(m => m.pts.some(p => Math.abs(p[1] - z) < 7)),
    'mapped crossing buffered at z=' + z);
}
for (const t of [...plan.trees, ...plan.lamps]) {
  assert(inBand(t.z), 'planting/lighting remains away from mapped cross streets');
  assert(Number.isFinite(t.x) && Number.isFinite(t.z), 'finite landmark coordinates');
}
const paved = plan.pavers.flatMap(p => p.pts);
assert(paved.every(p => Number.isFinite(p[0]) && Number.isFinite(p[1])),
  'all paver vertices finite');
assert.match(plan.source.confidence.medianFootprint, /requires survey/,
  'estimated dimensions must be flagged in provenance');
console.log('PASS Dandaloo streetscape: ' + plan.medians.length +
  ' median polygons, ' + plan.parking.length + ' parking separators, ' +
  plan.trees.length + ' trees, ' + plan.lamps.length + ' heritage lamps; intersections clear');

// South Dandaloo (single carriageway): kerbs follow the mapped edge; nothing is placed on the road.
{
  const { planDandalooSouth, findDandalooSouth, SOUTH_RANGE } = await import('../src/world/narromine-dandaloo-streetscape-data.js');
  const { onNarromineRoad } = await import('../src/world/narromine-layout.js');
  const s = planDandalooSouth(STREETS), road = findDandalooSouth(STREETS);
  assert(s.kerbs.length >= 120, 'kerbs both sides along the south stretch (' + s.kerbs.length + ')');
  // OSM road geometry cannot prove individual trees, lamps or power pole sites.
  // Unsupported uniform 22/44/40-m spacing is intentionally never rendered.
  assert.equal(s.trees.length, 0, 'no invented roadside tree rows');
  assert.equal(s.lamps.length, 0, 'no invented swan-neck lamp rows');
  assert.equal(s.poles.length, 0, 'no invented utility-pole rows');
  for (const t of [...s.trees, ...s.lamps, ...s.poles]) {
    assert(t.z >= SOUTH_RANGE.upperZ - 6 && t.z <= SOUTH_RANGE.lowerZ + 6, 'inside the south stretch');
    const cx = roadXAtZ(road, t.z); assert(Math.abs(t.x - cx) > road.width / 2, 'verge item is off the Dandaloo carriageway at z=' + t.z.toFixed(0));
  }
  // Drivability: kerb-to-kerb centre line stays a road.
  for (let z = SOUTH_RANGE.upperZ + 2; z < SOUTH_RANGE.lowerZ; z += 5) assert(onNarromineRoad(roadXAtZ(road, z), z), 'road still driveable at z=' + z);
  assert(s.poles.every(p => p.x > roadXAtZ(road, p.z)), 'power line on the east verge');
  console.log(`PASS south Dandaloo streetscape: ${s.kerbs.length} kerb runs, ${s.trees.length} trees, ${s.lamps.length} lamps, ${s.poles.length} poles; road clear`);
}
