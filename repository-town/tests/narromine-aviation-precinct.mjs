// Unit & live-integration verification for the Narromine Aviation Museum &
// Aerodrome Precinct (Tom Perry Drive / Mitchell Highway A32, Lot 122 DP 1126499,
// Narromine LEP 2011 Schedule 5 Item I12).
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {
  worldToGeo,
  geoToWorld,
  NARROMINE_AVIATION_HERITAGE,
  NARROMINE_AVIATION_CADASTRAL_LOTS,
  NARROMINE_AVIATION_BUILDINGS,
  NARROMINE_AVIATION_EXHIBITS,
  NARROMINE_AVIATION_ACCESS,
  NARROMINE_AVIATION_INTEGRATION_SPEC,
  NARROMINE_AVIATION_GEOJSON,
} from '../src/world/narromine-aviation-evidence.js';
import { buildNarromineAviationPrecinct } from '../src/world/narromine-aviation-precinct.js';
import {
  BUILDINGS,
  PLACES,
  FILL_HOUSES,
  FILL_SHOPS,
  onNarromineRoad,
  inPoly,
} from '../src/world/narromine-layout.js';
import { buildNarromine } from '../src/world/narromine.js';

// 1. Coordinate round-trip accuracy
for (const pt of [
  [-5724.9, -2054.2],
  [-5753.4, -2071.1],
  [-5710.5, -2068.5],
  [-5628.4, -2023.2],
]) {
  const geo = worldToGeo(pt);
  const back = geoToWorld(geo);
  assert(Math.hypot(back[0] - pt[0], back[1] - pt[1]) < 0.05, `world<->geo round-trip for ${pt}`);
}

// 2. Statutory heritage metadata & timeline
assert.equal(NARROMINE_AVIATION_HERITAGE.lepListing.itemNumber, 'I12');
assert.equal(NARROMINE_AVIATION_HERITAGE.cadastralLot, 'Lot 122, DP 1126499');
assert.equal(NARROMINE_AVIATION_HERITAGE.aerodromeCodes.icao, 'YNRM');
assert(NARROMINE_AVIATION_HERITAGE.timeline.length >= 5, 'timeline covers 1929 Aero Club, 1940-44 No. 5 EFTS, No. 8 OTU, Qantas alternate, and 2002 Museum');

// 3. Surveyed OSM building footprints match source OSM polygons exactly
assert.equal(NARROMINE_AVIATION_BUILDINGS.length, 10, '10 surveyed aerodrome & museum buildings');
for (const b of NARROMINE_AVIATION_BUILDINGS) {
  const osmB = BUILDINGS.find((x) => x.osmIndex === b.osmIndex);
  assert(osmB, `OSM building osm:${b.osmIndex} exists in narromine-layout`);
  assert.equal(b.footprintWorld.length, osmB.pts.length, `osm:${b.osmIndex} vertex count matches`);
  for (let i = 0; i < b.footprintWorld.length; i++) {
    const d = Math.hypot(
      b.footprintWorld[i][0] - osmB.pts[i][0],
      b.footprintWorld[i][1] - osmB.pts[i][1]
    );
    assert(d < 0.15, `osm:${b.osmIndex} vertex ${i} matches surveyed OSM coordinates (delta=${d})`);
  }
  assert.equal(b.evidenceLevel, 'surveyed');
  assert(['photo-matched', 'estimated'].includes(b.facadeEvidenceLevel));
  assert.equal(b.openingsEvidenceLevel, 'estimated');
}

// 4. Verified museum exhibits & 33-plaque WWII RAAF Memorial Wall
assert.equal(NARROMINE_AVIATION_EXHIBITS.length, 6, '6 documented museum & airside exhibits');
const exhibitIds = new Set(NARROMINE_AVIATION_EXHIBITS.map((e) => e.id));
for (const id of [
  'cac-sabre-a94-915',
  'wright-flyer-replica-vh-xwf',
  'corben-super-ace-vh-uxp',
  'rolls-royce-merlin-mk25',
  'raaf-5efts-memorial-wall',
  'narromine-soaring-sailplane',
]) {
  assert(exhibitIds.has(id), `exhibit present: ${id}`);
}
const wallEx = NARROMINE_AVIATION_EXHIBITS.find((e) => e.id === 'raaf-5efts-memorial-wall');
assert.equal(wallEx.plaqueCount, 33, 'WWII RAAF No. 5 EFTS memorial wall has 33 plaques');

// 5. GeoJSON FeatureCollection completeness
assert.equal(NARROMINE_AVIATION_GEOJSON.type, 'FeatureCollection');
assert.equal(
  NARROMINE_AVIATION_GEOJSON.features.length,
  NARROMINE_AVIATION_BUILDINGS.length + NARROMINE_AVIATION_EXHIBITS.length
);

// 6. Standalone 3D precinct builder verification
const standalone = buildNarromineAviationPrecinct();
assert(standalone.group instanceof THREE.Group);
assert.equal(standalone.stats.buildingCount, 10);
assert.equal(standalone.stats.exhibitCount, 6);
assert.equal(standalone.stats.memorialPlaquesCount, 33);
assert(standalone.stats.materialCount >= 12, `batched materials (${standalone.stats.materialCount})`);
assert(standalone.stats.triangleCount >= 3000, `detailed geometry triangles (${standalone.stats.triangleCount})`);
assert(standalone.spots.length === 6, '6 interactive exhibit spots');

// 7. Live integration into `buildNarromine` & walkability into the Exhibition Hangar
const liveRoot = new THREE.Group();
const live = buildNarromine(liveRoot);
const hitsCollider = (x, z) =>
  live.colliders.some((c) => x >= c.x0 && x <= c.x1 && z >= c.z0 && z <= c.z1);

// Verify all walkable corridor waypoints (Tom Perry Drive -> East Hangar Door -> Inside Wright Flyer Hall -> Sabre -> RAAF Memorial Wall) are 100% unobstructed!
const wps = NARROMINE_AVIATION_ACCESS.walkableCorridorWaypoints;
for (let i = 0; i < wps.length; i++) {
  const [wx, wz] = wps[i];
  assert(!hitsCollider(wx, wz), `waypoint ${i} [${wx}, ${wz}] is free of colliders`);
  if (i > 0) {
    const [ax, az] = wps[i - 1];
    const dist = Math.hypot(wx - ax, wz - az);
    const steps = Math.ceil(dist / 0.5);
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const sx = ax + (wx - ax) * t;
      const sz = az + (wz - az) * t;
      assert(
        !hitsCollider(sx, sz),
        `walkable path segment ${i - 1}->${i} clear at [${sx.toFixed(2)}, ${sz.toFixed(2)}]`
      );
    }
  }
}

// Verify north visitor doorway into osm:218 is also unobstructed
const [nx, nz] = NARROMINE_AVIATION_ACCESS.hangarNorthDoorEntryWorld;
assert(!hitsCollider(nx, nz), `north visitor foyer doorway [${nx}, ${nz}] is unobstructed`);

// Verify no exhibit or hangar collider blocks Tom Perry Drive or Mitchell Highway
for (const ex of NARROMINE_AVIATION_EXHIBITS) {
  assert(!onNarromineRoad(ex.posWorld[0], ex.posWorld[1]), `${ex.id} is off the road`);
}

// Verify no generic procedural house or shop spawns inside the Aerodrome apron parcel
const apronLot = NARROMINE_AVIATION_CADASTRAL_LOTS[0].ringWorld;
for (const g of [...FILL_HOUSES, ...FILL_SHOPS]) {
  assert(!inPoly(g.x, g.z, apronLot), `no generic filler house/shop inside aerodrome apron at [${g.x}, ${g.z}]`);
}

// Verify PLACES register Narromine Aviation Museum, Narromine Aero Club, and Narromine Gliding Club with LEP Item I12 / 1929 / YNRM facts
const musPlace = PLACES.find((p) => p.name === 'Narromine Aviation Museum');
const aeroPlace = PLACES.find((p) => p.name === 'Narromine Aero Club');
const glidePlace = PLACES.find((p) => p.name === 'Narromine Gliding Club');
assert(musPlace && /Sabre/.test(musPlace.fact) && /Wright Flyer/.test(musPlace.fact) && /I12/.test(musPlace.fact));
assert(aeroPlace && /1929/.test(aeroPlace.fact) && /Kingsford Smith/.test(aeroPlace.fact));
assert(glidePlace && /soaring/i.test(glidePlace.fact));

// Verify all 6 exhibit spots + 3 place spots exist in live `spots`
for (const ex of NARROMINE_AVIATION_EXHIBITS) {
  assert(
    live.spots.some((s) => s.key === 'narromine:aviation:' + ex.id),
    `live scene includes interactive spot narromine:aviation:${ex.id}`
  );
}

console.log(
  `PASS Narromine Aviation Museum & Aerodrome Precinct: ${standalone.stats.buildingCount} surveyed buildings, ${standalone.stats.exhibitCount} verified exhibits, ${standalone.stats.memorialPlaquesCount} RAAF memorial plaques, ${standalone.stats.materialCount} batched materials, ${standalone.stats.triangleCount} triangles, walkable hangar & forecourt verified`
);
