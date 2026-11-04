import assert from 'node:assert/strict';
import { KIERATHS_PHASE1_GEOJSON as fc, KIERATHS_PHASE1_TOPOLOGY as topo } from '../src/world/narromine-kieraths-site-audit.js';
import { KIERATHS_SHOPS } from '../src/world/narromine-kieraths-data.js';

assert.equal(fc.type, 'FeatureCollection');
const lookup = new Map(fc.features.map(f => [f.properties.id, f]));
assert.equal(lookup.size, fc.features.length, 'feature identifiers unique');
for (const id of ['dandaloo-76', 'dandaloo-82', 'narromine-post-office']) {
  assert.equal(lookup.get(id)?.properties.confidence, 'traced-boundary', id + ' has cadastre source');
  assert.equal(lookup.get(id).geometry.type, 'Polygon');
}
assert.equal(topo.planRegistration.startsWith('UNREGISTERED'), true,
  'never label schematic alignment as measured until registered');
assert.deepEqual(topo.unitIds, [1,2,3,4,5,6,7,8,9,10]);
assert.equal(KIERATHS_SHOPS.length, 10);
for (const unit of topo.unitIds) {
  const f = lookup.get('kieraths-unit-' + unit);
  assert.equal(f.properties.confidence, 'estimated', 'unit '+unit+' is not surveyed');
  assert.equal(f.geometry.type, 'Polygon');
}
for (const f of fc.features) {
  assert(['traced-boundary','estimated','historical-unverified'].includes(f.properties.confidence));
  const coords = f.geometry.type === 'Point' ? [f.geometry.coordinates]
    : f.geometry.type === 'LineString' ? f.geometry.coordinates : f.geometry.coordinates[0];
  for (const [lon, lat] of coords) {
    assert(Number.isFinite(lon) && Number.isFinite(lat), 'finite geographic coordinates');
    assert(lon > 148.23 && lon < 148.25 && lat > -32.24 && lat < -32.22,
      'all site features in central Narromine; reject swapped [lat,lon]');
  }
  if (f.geometry.type === 'Polygon') {
    assert.deepEqual(coords[0], coords.at(-1), 'valid closed GeoJSON rings');
    assert(coords.length >= 4, 'polygon ring minimum four positions');
  }
  if (f.properties.id.startsWith('historical-aerial-mass-'))
    assert.equal(f.properties.render, false, 'outdated aerial mass must never turn into scene geometry');
}
assert.equal(lookup.get('kieraths-walkway').geometry.type, 'LineString');
assert.equal(lookup.get('kieraths-rear-arch').properties.note.includes('Distinct'), true);
assert.equal(topo.circulation.openToSky, true);
console.log('PASS Kieraths Phase 1: ' + fc.features.length +
  ' WGS84 GIS features; three cadastral lot boundaries; ten explicitly estimated shop polygons; distinct rear arch and street awning.');
