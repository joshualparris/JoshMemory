import assert from 'node:assert/strict';
import * as THREE from 'three';
import { BUILDINGS, PLACES, geoToWorld } from '../src/world/narromine-layout.js';
import { NARROMINE_OSM } from '../src/world/narromine-osm-data.js';
import { NARROMINE_LIDAR } from '../src/world/narromine-lidar-data.js';
import { PHYSIO_FACADE, physiotherapyFrontEdge, buildNarrominePhysiotherapyFacade } from '../src/world/narromine-mainstreet-physio.js';
import { readFileSync } from 'node:fs';

// Mapped source & LiDAR provenance are not estimated geometry.
const osm = NARROMINE_OSM.buildings[186];
const mapped = BUILDINGS.find(b => b.osmIndex === PHYSIO_FACADE.osmIndex);
assert.ok(mapped && osm, 'OSM footprint remains in playable BUILDINGS');
assert.equal(PHYSIO_FACADE.businessName, 'Narromine Physiotherapy');
assert.equal(PHYSIO_FACADE.provenance.footprint, 'mapped-osm');
assert.equal(PHYSIO_FACADE.provenance.parapetSilhouette, 'photo-matched-estimated-dimensions');
assert.equal(PHYSIO_FACADE.surveyedLidar.ridgeProxyM, NARROMINE_LIDAR.heights['osm:186'][3]);
assert.equal(PHYSIO_FACADE.surveyedLidar.eaveProxyM, NARROMINE_LIDAR.heights['osm:186'][2]);
const place = PLACES.find(p => p.name === PHYSIO_FACADE.businessName);
assert.ok(place, 'Physiotherapy OSM place name must be normalised');

// Front face directly follows the existing mapped polygon, not a made-up lot.
const face = physiotherapyFrontEdge(mapped);
assert.ok(face.length >= 8 && face.length <= 17);
assert.ok(face.outward[0] > 0.9, 'Dandaloo front faces east');
for (const idx of PHYSIO_FACADE.edge) {
  const transformed = [osm.pts[idx][0] - 2870, osm.pts[idx][1] - 7];
  assert.deepEqual(mapped.pts[idx], transformed, 'OSM geometry is preserved');
}
const photoCoord = geoToWorld(-32.230824, 148.239729);
assert.ok(Math.hypot(...photoCoord.map((v, i) => v - [-4751.3, -1078.2][i])) < 2, 'comparison #45 coordinates agree');

const geometry = [], signs = [];
const result = buildNarrominePhysiotherapyFacade({
  THREE, building: mapped,
  push: (colour, geo) => geometry.push({ colour, geo }),
  addSign: params => signs.push(params),
});
assert.equal(result.collidersAdded, 0, 'no invented collisions or interiors');
assert.equal(result.geometryCount, geometry.length);
assert.ok(geometry.length > 25, 'full canopy/glazing/arched parapet is generated');
assert.equal(signs.length, 1);
const bounds = new THREE.Box3();
for (const { geo } of geometry) {
  geo.computeBoundingBox();
  bounds.union(geo.boundingBox);
}
assert.ok(bounds.max.y <= 8.40, 'silhouette stays near 8.07m LiDAR ridge proxy');
assert.ok(bounds.max.y >= 8.05, 'distinctive photographed raised parapet exists');
assert.ok(bounds.min.y >= 0, 'geometry does not fall below world ground');
assert.ok(bounds.max.x < -4757 && bounds.min.x > -4763, 'decorative relief stays at mapped shop face');
assert.ok(bounds.min.z > -1093 && bounds.max.z < -1078, 'decorative relief spans mapped frontage only');
assert.equal(buildNarrominePhysiotherapyFacade({ THREE, building: BUILDINGS.find(b=>b.osmIndex!==186), push:()=>{} }), null, 'non-target buildings unaffected');

const sceneSource = readFileSync(new URL('../src/world/narromine.js', import.meta.url), 'utf8');
assert.ok(sceneSource.includes('buildNarrominePhysiotherapyFacade({'), 'facade wired into live world');
assert.ok(sceneSource.includes('osmIndex === PHYSIO_FACADE.osmIndex) continue;'), 'generic frontage suppressed for this one site');
console.log('PASS Narromine Physiotherapy specific facade: OSM+LiDAR source binding, silhouette/awning/glazing, no extra collision, live renderer dispatch.');
