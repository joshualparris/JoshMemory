// NR-REAL-004: a named place inside a traced building footprint is drawn on that footprint,
// not on an invented 10 x 14 m box that also hid the real outline.
import assert from 'node:assert/strict';
import { FILL_SHOPS, FILL_HOUSES, FOOTPRINT_ROAD_CONFLICTS, PLACES, STREETS, inPoly } from '../src/world/narromine-layout.js';
import { NARROMINE_FOOTPRINTS } from '../src/world/narromine-footprints-data.js';
import { NARROMINE_NW_DANDALOO_INTEGRATION_SPEC } from '../src/world/narromine-nw-dandaloo-evidence.js';

const byName = Object.fromEntries(FILL_SHOPS.map(s => [s.name, s]));
const onFootprint = FILL_SHOPS.filter(s => !s.generic);
assert.deepEqual(onFootprint.map(s => s.name).sort(), ['Narromine Auto Repairs & Spares', 'St. Andrews - Uniting Church in Australia']);

for (const s of onFootprint) {
  assert.equal(s.source, 'microsoft-footprint');
  const fp = NARROMINE_FOOTPRINTS.find(f => f[0] === s.x && f[1] === s.z);
  assert(fp, s.name + ': geometry is a real traced footprint');
  assert.deepEqual([s.w, s.d, s.yaw], [fp[2], fp[3], fp[4]], s.name + ': exact size and orientation');
  const poi = PLACES.find(p => p.name === s.name);
  assert(inPoly(poi.x, poi.z, s.rect.poly), s.name + ': the named place lies inside its footprint');
  assert(!FILL_HOUSES.some(h => inPoly(h.x, h.z, s.rect.poly)), s.name + ': not also drawn as an anonymous house');
  // No mapped road on or within its half-width of a wall.
  for (const st of STREETS) for (const [x, z] of st.pts) assert(!inPoly(x, z, s.rect.poly), s.name + ': no road vertex inside');
  assert(Math.hypot(...s.frontEdge.toward) > 0.1, s.name + ': front edge faces a street');
}

// Unchanged: NW Dandaloo places (that module replaces them) and places whose footprint sits on a road.
for (const name of NARROMINE_NW_DANDALOO_INTEGRATION_SPEC.suppressedFillShopNames) assert(byName[name]?.generic, name + ' keeps its stand-in');
for (const name of ['Darling Irrigation', 'The Abbey', 'Narromine Car Wash']) assert(byName[name]?.generic, name + ': footprint is on a mapped road, keeps stand-in');
// #403's road-conflict withholding is unchanged.
assert.equal(FOOTPRINT_ROAD_CONFLICTS.length, 94);

console.log(`PASS stand-in shops: ${onFootprint.length} named places on their real footprints; ${FILL_SHOPS.length - onFootprint.length} stand-ins kept with reasons; ${FILL_HOUSES.length} traced buildings drawn`);
