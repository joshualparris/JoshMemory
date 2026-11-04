// Verification suite for the Narromine Railway Station precinct reconstruction:
// validates OSM/LiDAR provenance, WGS84 GeoJSON integrity, building dimensions,
// platform-to-track alignment, collision-free road/pedestrian access, and
// Three.js geometry generation & draw-call performance.
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import * as THREE from 'three';
import { OSM, STREETS, toWorld } from '../src/world/narromine-layout.js';
import { NARROMINE_LIDAR } from '../src/world/narromine-lidar-data.js';
import {
  NARROMINE_RAILWAY_HERITAGE,
  NARROMINE_RAILWAY_BUILDINGS,
  NARROMINE_RAILWAY_PLATFORM,
  NARROMINE_RAILWAY_FORECOURT,
  NARROMINE_RAILWAY_TRACKS,
  NARROMINE_RAILWAY_PRECINCT_GEOJSON,
  NARROMINE_RAILWAY_INTEGRATION_SPEC,
  worldToGeo,
} from '../src/world/narromine-railway-evidence.js';
import {
  buildNarromineRailwayPrecinct,
  quadFrame,
} from '../src/world/narromine-railway-precinct.js';

// ── 1. Heritage & Statutory Provenance Checks ───────────────────────────────
assert.equal(NARROMINE_RAILWAY_HERITAGE.officialName, 'Narromine Railway Station');
assert.equal(NARROMINE_RAILWAY_HERITAGE.cadastralLot, 'Lot 4, DP 1012153');
assert.equal(NARROMINE_RAILWAY_HERITAGE.lepListing.itemNumber, 'I11');
assert.equal(NARROMINE_RAILWAY_HERITAGE.lepListing.evidenceLevel, 'surveyed');
assert.equal(NARROMINE_RAILWAY_HERITAGE.distanceFromSydneyKm, 497.554);
assert.equal(NARROMINE_RAILWAY_HERITAGE.operationalStatus.passengerTrainsActive, false);
assert.equal(NARROMINE_RAILWAY_HERITAGE.operationalStatus.coachStopActive, true);
assert.equal(NARROMINE_RAILWAY_HERITAGE.operationalStatus.walkInInteriorImplemented, false);

// ── 2. Authoritative OSM Footprint & NSW LiDAR Cross-Verification ───────────
assert.equal(NARROMINE_RAILWAY_BUILDINGS.length, 3, 'station building, eastern goods office, and western crossing hut');

for (const bld of NARROMINE_RAILWAY_BUILDINGS) {
  assert.equal(bld.evidenceLevel, 'surveyed', `${bld.id} footprint/height must be surveyed`);
  assert(['photo-matched', 'estimated'].includes(bld.facadeEvidenceLevel));
  assert.equal(bld.openingsEvidenceLevel, 'estimated', `${bld.id} window/door rhythm is explicitly estimated`);

  // Cross-check against raw OSM building vertices
  const osmBld = OSM.buildings[bld.osmIndex];
  assert(osmBld, `OSM building index ${bld.osmIndex} exists`);
  const osmWorldPts = osmBld.pts.map(toWorld);
  assert.equal(bld.footprintWorld.length, osmWorldPts.length, `${bld.id} vertex count matches OSM`);
  for (let i = 0; i < osmWorldPts.length; i++) {
    const d = Math.hypot(
      bld.footprintWorld[i][0] - osmWorldPts[i][0],
      bld.footprintWorld[i][1] - osmWorldPts[i][1]
    );
    assert(d < 0.05, `${bld.id} vertex ${i} matches authoritative OSM world coordinates (diff=${d})`);
  }

  // Cross-check against authoritative NSW Spatial Services LiDAR data
  const lidarTuple = NARROMINE_LIDAR.heights['osm:' + bld.osmIndex];
  assert(lidarTuple, `LiDAR tuple exists for osm:${bld.osmIndex}`);
  const [year, ground, eave, ridge, median, points, density] = lidarTuple;
  assert.equal(bld.lidar.surveyYear, year);
  assert.equal(bld.lidar.groundAHDm, ground);
  assert.equal(bld.lidar.eaveProxyM, eave);
  assert.equal(bld.lidar.ridgeProxyM, ridge);
  assert.equal(bld.lidar.medianRoofM, median);
  assert.equal(bld.lidar.points, points);
  assert.equal(bld.lidar.densityPtsPerM2, density);
}

// Verify main station building (osm:29 / NR-OSM-0030) dimensions and stepped geometry
const station = NARROMINE_RAILWAY_BUILDINGS[0];
const swCorner = station.footprintWorld[0];
const neCorner = station.footprintWorld[1];
const forecourtEdgeLen = Math.hypot(neCorner[0] - swCorner[0], neCorner[1] - swCorner[1]);
assert(
  Math.abs(forecourtEdgeLen - 32.16) < 0.05,
  `Station forecourt wall length is 32.16 m (got ${forecourtEdgeLen.toFixed(2)} m)`
);
const pavNE = station.footprintWorld[4];
const pavSW = station.footprintWorld[5];
const pavEdgeLen = Math.hypot(pavSW[0] - pavNE[0], pavSW[1] - pavNE[1]);
assert(
  Math.abs(pavEdgeLen - 15.49) < 0.05,
  `Central platform pavilion length is 15.49 m (got ${pavEdgeLen.toFixed(2)} m)`
);
assert.equal(station.lidar.eaveProxyM, 3.45, '2023 LiDAR station eave height 3.45 m');
assert.equal(station.lidar.ridgeProxyM, 5.85, '2023 LiDAR station ridge height 5.85 m');

// ── 3. Platform, Forecourt & Track Orientation / Geometry Checks ────────────
const spineFrame = quadFrame(station.partsWorld[0].pts);
const platFrame = quadFrame(NARROMINE_RAILWAY_PLATFORM.ptsWorld);
const yawDiffDeg = Math.abs(spineFrame.yaw - platFrame.yaw) * (180 / Math.PI);
assert(yawDiffDeg < 1.0, `Platform is parallel to station spine (diff=${yawDiffDeg.toFixed(2)}°)`);
assert.equal(NARROMINE_RAILWAY_PLATFORM.configuration, 'single-side-platform');
assert.equal(NARROMINE_RAILWAY_PLATFORM.configurationEvidenceLevel, 'surveyed');
assert.equal(NARROMINE_RAILWAY_PLATFORM.geometryEvidenceLevel, 'estimated');

// Verify platform lies on the south-east (+n) trackside of the station spine
// and north-west of the RAIL[2] running track
const signedNormalDist = (x, z) =>
  (x - spineFrame.cx) * spineFrame.nx + (z - spineFrame.cz) * spineFrame.nz;
const platNormalDist = signedNormalDist(platFrame.cx, platFrame.cz);
assert(
  platNormalDist > 3.5 && platNormalDist < 9.5,
  `Platform sits on the SE trackside of the station building (normal offset=${platNormalDist.toFixed(2)} m)`
);
const mainTrack = NARROMINE_RAILWAY_TRACKS.find((t) => t.railIndex === 2);
assert(mainTrack, 'Main Western running track RAIL[2] present in precinct');
for (const [tx, tz] of mainTrack.ptsWorld.slice(0, 3)) {
  const trackNormalDist = signedNormalDist(tx, tz);
  assert(
    trackNormalDist > platNormalDist,
    `Main running track sits SE of the platform coping (track=${trackNormalDist.toFixed(2)} m vs platform=${platNormalDist.toFixed(2)} m)`
  );
}

// ── 4. GeoJSON RFC 7946 Validation ──────────────────────────────────────────
assert.equal(NARROMINE_RAILWAY_PRECINCT_GEOJSON.type, 'FeatureCollection');
const featureIds = new Set();
for (const f of NARROMINE_RAILWAY_PRECINCT_GEOJSON.features) {
  assert(f.properties.id, 'every GeoJSON feature has an id');
  assert(!featureIds.has(f.properties.id), `unique feature id: ${f.properties.id}`);
  featureIds.add(f.properties.id);
  assert(
    ['surveyed', 'photo-matched', 'estimated'].includes(f.properties.confidence),
    `valid confidence tag on ${f.properties.id}`
  );
  const coords =
    f.geometry.type === 'Point'
      ? [f.geometry.coordinates]
      : f.geometry.type === 'LineString'
        ? f.geometry.coordinates
        : f.geometry.coordinates[0];
  for (const [lon, lat] of coords) {
    assert(Number.isFinite(lon) && Number.isFinite(lat), `finite [lon, lat] on ${f.properties.id}`);
    assert(
      lon > 148.234 && lon < 148.246 && lat > -32.239 && lat < -32.230,
      `${f.properties.id} coordinate [${lon}, ${lat}] lies inside Narromine railway corridor`
    );
  }
  if (f.geometry.type === 'Polygon') {
    assert.deepEqual(coords[0], coords.at(-1), `${f.properties.id} polygon ring is closed`);
    assert(coords.length >= 4, `${f.properties.id} polygon ring has >= 4 positions`);
  }
}

// ── 5. Standalone Three.js Build, Collision Clearance & Performance ─────────
const t0 = performance.now();
const built = buildNarromineRailwayPrecinct({
  makeLabel: (text) => {
    const o = new THREE.Object3D();
    o.name = `label:${text}`;
    return o;
  },
});
const buildMs = performance.now() - t0;

assert(built.group instanceof THREE.Group, 'returns a THREE.Group');
assert(built.stats.meshCount >= 8 && built.stats.meshCount <= 25, `batched draw calls (${built.stats.meshCount})`);
assert(built.stats.triangleCount >= 400 && built.stats.triangleCount <= 15000, `efficient triangle budget (${built.stats.triangleCount})`);
assert(buildMs < 250, `fast geometry generation (${buildMs.toFixed(1)} ms)`);
assert(built.spots.some((s) => s.name === 'Narromine Railway Station'), 'registers station heritage spot');
assert(built.spots.some((s) => s.name === 'Narromine Station Coach Stop'), 'registers NSW TrainLink coach stop spot');

// Check every generated mesh buffer for finite coordinates and normals
for (const child of built.group.children) {
  if (!child.isMesh) continue;
  const pos = child.geometry.getAttribute('position');
  const norm = child.geometry.getAttribute('normal');
  assert(pos && pos.count > 0, 'mesh has position attribute');
  assert(norm && norm.count === pos.count, 'mesh has normal attribute');
  for (let i = 0; i < pos.array.length; i++) {
    assert(Number.isFinite(pos.array[i]), 'all vertex coordinates are finite');
    assert(Number.isFinite(norm.array[i]), 'all vertex normals are finite');
  }
}

// Verify colliders do NOT block Narromine Station Access road, pedestrian
// forecourt/platform access points, or the Main Western running track
const hitsCollider = (x, z, radius = 0.25) =>
  built.colliders.some(
    (c) => x + radius > c.x0 && x - radius < c.x1 && z + radius > c.z0 && z - radius < c.z1
  );

const accessRoad = STREETS.find((s) => s.name === 'Narromine Station Access');
assert(accessRoad, 'Narromine Station Access exists in STREETS');
for (const [rx, rz] of accessRoad.pts) {
  assert(!hitsCollider(rx, rz, 0.5), `Narromine Station Access road vertex [${rx}, ${rz}] is clear of colliders`);
}

for (const [key, [px, pz]] of Object.entries(NARROMINE_RAILWAY_FORECOURT.pedestrianEntryPointsWorld)) {
  assert(!hitsCollider(px, pz, 0.35), `pedestrian access point ${key} [${px}, ${pz}] is clear of colliders`);
}

for (const [tx, tz] of mainTrack.ptsWorld) {
  assert(!hitsCollider(tx, tz, 0.5), `Main Western running track point [${tx}, ${tz}] is clear of building colliders`);
}

// Verify station building interior points DO collide (solid exterior mass)
assert(
  hitsCollider(station.centreWorld[0], station.centreWorld[1], 0.2),
  'station building footprint centre is protected by solid colliders'
);

// ── 6. Integrated Callback Mode & Duplicate-Prevention Contract ─────────────
let callbackBoxes = 0;
let callbackPushes = 0;
let callbackStrips = 0;
let callbackPolys = 0;
const integratedColliders = [];
const integratedSpots = [];
buildNarromineRailwayPrecinct({
  box: () => { callbackBoxes++; },
  push: () => { callbackPushes++; },
  strip: () => { callbackStrips++; },
  flatPoly: () => { callbackPolys++; },
  colliders: integratedColliders,
  spots: integratedSpots,
});
assert(callbackBoxes > 50, 'integrated mode emits box primitives');
assert(callbackPushes >= 6, 'integrated mode emits custom roof meshes');
assert(callbackStrips >= 10, 'integrated mode emits track/kerb strips');
assert(callbackPolys >= 1, 'integrated mode emits forecourt polygon');
assert.equal(integratedColliders.length, built.colliders.length, 'collider count matches standalone build');
assert.deepEqual(NARROMINE_RAILWAY_INTEGRATION_SPEC.suppressedOsmBuildingIndices, [28, 29, 198]);

console.log(
  `PASS Narromine Railway Station precinct: ${NARROMINE_RAILWAY_BUILDINGS.length} surveyed LiDAR buildings ` +
  `(osm:29 32.16m×9.10m eave=3.45m ridge=5.85m), ${NARROMINE_RAILWAY_PRECINCT_GEOJSON.features.length} WGS84 GeoJSON features, ` +
  `${built.stats.meshCount} batched meshes (${built.stats.triangleCount} tris in ${buildMs.toFixed(1)} ms), ` +
  `${built.colliders.length} sliced colliders with clear road/platform/track access.`
);
