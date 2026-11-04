// Data-only preservation check for official NSW geographic evidence from #289.
// This does NOT assert any of these records are rendered in the playable town.
import assert from 'node:assert/strict';
import { NARROMINE_CENTERLINES, NARROMINE_GEO_ORIGIN, NARROMINE_ROAD_SOURCE,
  geoToNarromine, narromineToGeo } from '../src/world/narromine-geodata.js';
import { NARROMINE_PUBLIC_GEOCODES, NARROMINE_UNLOCATED_SITES }
  from '../src/world/narromine-public-geocodes.js';
import { NARROMINE_PUBLIC_LOTS } from '../src/world/narromine-public-lots.js';

assert.equal(NARROMINE_CENTERLINES.length, 432, 'original 2026-11-03 road snapshot preserved');
assert.equal(new Set(NARROMINE_CENTERLINES.map(r => r[0])).size, 432, 'NSW road object IDs unique');
assert.match(NARROMINE_ROAD_SOURCE.url, /^https:\/\/beta\.portal\.spatial\.nsw\.gov\.au\//);
assert.equal(NARROMINE_GEO_ORIGIN.sourceCRS, 'GDA2020 / EPSG:7844');
const names = new Set(NARROMINE_CENTERLINES.map(r => r[1]));
for (const n of ['DANDALOO ST', 'BURRAWAY ST', 'NYMAGEE ST']) assert(names.has(n), n);
let segments = 0;
for (const [id, name, points] of NARROMINE_CENTERLINES) {
  assert(Number.isInteger(id) && typeof name === 'string');
  assert(points.length >= 4 && points.length % 2 === 0, 'road has pairs of vertices');
  for (const v of points) assert(Number.isFinite(v), 'road coordinate finite');
  for (let i = 2; i < points.length; i += 2) {
    const d = Math.hypot(points[i] - points[i - 2], points[i + 1] - points[i - 1]);
    assert(d > 0, 'road has no degenerate adjacent vertex');
    segments++;
  }
}
assert.equal(segments, 1741, 'every official road centreline segment preserved');
for (const [x, z] of [[-4500, 277], [-4773.42, 2102.51], [-4000, -900]]) {
  const g = narromineToGeo(x, z), p = geoToNarromine(g.lon, g.lat);
  assert(Math.hypot(p.x - x, p.z - z) < 0.000001, 'lossless local x/z-to-GDA2020 roundtrip');
}
assert.equal(NARROMINE_PUBLIC_GEOCODES.length, 16);
assert.equal(NARROMINE_PUBLIC_LOTS.length, 16);
assert.equal(NARROMINE_UNLOCATED_SITES.length, 5);
const geocodes = new Map(NARROMINE_PUBLIC_GEOCODES.map(p => [p.id, p]));
assert.equal(geocodes.size, NARROMINE_PUBLIC_GEOCODES.length, 'public site IDs unique');
const lotIds = new Set();
for (const lot of NARROMINE_PUBLIC_LOTS) {
  assert(!lotIds.has(lot.id), 'lot id unique'); lotIds.add(lot.id);
  assert(Number.isInteger(lot.nswLotId) && geocodes.has(lot.id));
  assert(lot.polygon.length >= 4, 'each parcel has mapped polygon');
  let twiceArea = 0;
  for (let i = 0; i < lot.polygon.length; i++) {
    const a = lot.polygon[i], b = lot.polygon[(i + 1) % lot.polygon.length];
    assert(a.every(Number.isFinite), 'finite parcel longitude/latitude');
    twiceArea += a[0] * b[1] - b[0] * a[1];
  }
  assert(Math.abs(twiceArea) > 1e-12, 'parcel has nonzero area');
}
for (const place of NARROMINE_PUBLIC_GEOCODES) {
  const [lon, lat] = place.coordinates;
  assert(lon >= 148.215 && lon <= 148.264 && lat >= -32.253 && lat <= -32.214,
    'public address inside declared Narromine source extent');
  assert(/NOT door or footprint/.test(place.accuracy), 'address points are NOT surveyed shop entrances');
}
for (const missing of NARROMINE_UNLOCATED_SITES) assert(!geocodes.has(missing.id),
  'unmatched address remains unresolved, not fabricated');
console.log('PASS NSW Narromine source evidence (not live gameplay): 432 roads, 1741 segments, 16 public addresses/parcels, 5 explicit unknowns');
