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
