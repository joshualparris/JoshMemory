import assert from 'node:assert/strict';
import { KIERATHS_PHASE1_GEOJSON as fc, KIERATHS_PHASE1_TOPOLOGY as topo } from '../src/world/narromine-kieraths-site-audit.js';
import { KIERATHS_SHOPS, KIERATHS_EMBEDDED_UNITS } from '../src/world/narromine-kieraths-data.js';
import { schematicPixelToGeo, KIERATHS_SCHEMATIC_TIES, KIERATHS_SCHEMATIC_UNITS, KIERATHS_SCHEMATIC_REGISTRATION } from '../src/world/narromine-kieraths-schematic.js';

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
assert.equal(KIERATHS_SHOPS.length, 7);
assert.deepEqual(topo.separateExteriorShopIds, [1,2,3,4,8,9,10]);
assert.deepEqual(KIERATHS_EMBEDDED_UNITS, [5,6,7]);
for (const unit of topo.unitIds) {
  const f = lookup.get('kieraths-unit-' + unit);
  if (KIERATHS_EMBEDDED_UNITS.includes(unit)) { assert(!f, 'embedded M01 unit '+unit+' is not a fabricated exterior polygon'); continue; }
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
assert.equal(KIERATHS_SCHEMATIC_REGISTRATION.surveyed, false);
assert.equal(KIERATHS_SCHEMATIC_REGISTRATION.measuredRmsResidualMetres, null);
for (const tie of KIERATHS_SCHEMATIC_TIES)
  schematicPixelToGeo(tie.pixel).forEach((value, axis) => assert(Math.abs(value - tie.geo[axis]) < 1e-9,
    'provisional parcel tie remains deterministic'));
assert.equal(KIERATHS_SCHEMATIC_UNITS.length, 8, '7 outlined units plus embedded M01 5–7 zone');
for (const u of KIERATHS_SCHEMATIC_UNITS) {
  const f = lookup.get('schematic-unit-' + u.id);
  assert(f && f.properties.confidence === 'estimated', 'schematic unit ' + u.id + ' has explicitly estimated geocoordinates');
}
assert(lookup.get('schematic-unit-5–7').properties.ambiguous,
  'diagram groups 5–7 in blue M01 major-tenancy area: no separate exterior units asserted');
assert.equal(lookup.get('kieraths-walkway').geometry.type, 'LineString');
assert.equal(lookup.get('kieraths-rear-arch').properties.note.includes('Distinct'), true);
assert.equal(topo.circulation.openToSky, true);
console.log('PASS Kieraths Phase 1: ' + fc.features.length +
  ' WGS84 GIS features; three cadastral lot boundaries; seven exterior shop polygons plus M01-embedded units 5–7; distinct rear arch and street awning.');
