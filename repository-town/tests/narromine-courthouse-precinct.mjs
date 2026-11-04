import assert from 'node:assert/strict';
import * as THREE from 'three';
import { OSM, PLACES, toWorld } from '../src/world/narromine-layout.js';
import { buildNarromine } from '../src/world/narromine.js';
import { NARROMINE_LIDAR } from '../src/world/narromine-lidar-data.js';
import {
  worldToGeo,
  geoToWorld,
  NARROMINE_COURTHOUSE_DISAMBIGUATION,
  NARROMINE_COURTHOUSE_CADASTRAL_LOTS,
  NARROMINE_COURTHOUSE_BUILDINGS,
  NARROMINE_COURTHOUSE_ACCESS,
  NARROMINE_COURTHOUSE_INTEGRATION_SPEC,
  NARROMINE_COURTHOUSE_PRECINCT_GEOJSON,
} from '../src/world/narromine-courthouse-evidence.js';
import { buildNarromineCourthousePrecinct } from '../src/world/narromine-courthouse-precinct.js';

function inPoly([x, z], poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i];
    const [xj, zj] = poly[j];
    const intersect =
      zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi + 1e-12) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

// 1. Coordinate round-trip accuracy
{
  const pt = [-4585.8, -777.8];
  const geo = worldToGeo(pt);
  const back = geoToWorld(geo);
  assert.ok(Math.hypot(back[0] - pt[0], back[1] - pt[1]) < 0.05, 'worldToGeo/geoToWorld round-trip within 5cm');
}

// 2. Statutory & cadastral building disambiguation verification
{
  const { sites } = NARROMINE_COURTHOUSE_DISAMBIGUATION;
  assert.equal(sites.formerCourthouse35Burraway.address, '35 Burraway Street, Narromine NSW 2821');
  assert.equal(sites.formerCourthouse35Burraway.cadastralLot, 'Lot 6, Section 17, DP 758759');
  assert.equal(sites.formerCourthouse35Burraway.lepItem, 'I5');
  assert.equal(sites.formerCourthouse35Burraway.lepName, 'Courthouse (former)');

  assert.equal(sites.operationalCourthouse47Merilba.address, '47 Merilba Street, Narromine NSW 2821');
  assert.equal(sites.operationalCourthouse47Merilba.cadastralLot, 'Lot 10, Section 17, DP 758759');

  assert.equal(
    sites.policeStation49Merilba.address,
    '49 Merilba Street (corner Burraway & Merilba Streets), Narromine NSW 2821'
  );
  assert.equal(sites.policeStation49Merilba.cadastralLot, 'Lot 5, Section 17, DP 758759');
  assert.equal(sites.policeStation49Merilba.osmIndex, 174);

  assert.equal(sites.hubNSpoke37Burraway.address, '37 Burraway Street, Narromine NSW 2821');
  assert.equal(sites.hubNSpoke37Burraway.cadastralLot, 'Lot 2 & Lot 12, Section 17, DP 758759');
  assert.ok(sites.hubNSpoke37Burraway.officialName.includes('Hub n Spoke'));
}

// 3. Verify Police Station (osm:174) matches surveyed OSM footprint & 2011 NSW Spatial Services LiDAR
{
  const osm174 = OSM.buildings[174];
  assert.ok(osm174, 'OSM.buildings[174] exists');
  const police = NARROMINE_COURTHOUSE_BUILDINGS.find((b) => b.id === 'narromine-police-station');
  assert.ok(police, 'narromine-police-station exists');
  const osmWorldPts = osm174.pts.map(toWorld);
  assert.equal(police.footprintWorld.length, osmWorldPts.length);
  for (let i = 0; i < osmWorldPts.length; i++) {
    const d = Math.hypot(
      police.footprintWorld[i][0] - osmWorldPts[i][0],
      police.footprintWorld[i][1] - osmWorldPts[i][1]
    );
    assert.ok(d < 0.05, `Police vertex ${i} matches OSM world coord (diff=${d})`);
  }
  assert.deepEqual(
    [
      police.lidar.surveyYear,
      police.lidar.groundAHDm,
      police.lidar.eaveProxyM,
      police.lidar.ridgeProxyM,
      police.lidar.medianRoofM,
      police.lidar.points,
      police.lidar.densityPtsPerM2,
    ],
    NARROMINE_LIDAR.heights['osm:174'],
    'Police station LiDAR metadata matches surveyed NARROMINE_LIDAR.heights["osm:174"]'
  );
  assert.deepEqual(NARROMINE_COURTHOUSE_INTEGRATION_SPEC.suppressedOsmBuildingIndices, [174]);
}

// 4. Verify each building footprint sits inside its surveyed NSW Cadastral Lot (Section 17, DP 758759)
{
  const lot6 = NARROMINE_COURTHOUSE_CADASTRAL_LOTS.find((l) => l.lotId === '6/17/DP758759').ringWorld;
  const lot5 = NARROMINE_COURTHOUSE_CADASTRAL_LOTS.find((l) => l.lotId === '5/17/DP758759').ringWorld;
  const lot10 = NARROMINE_COURTHOUSE_CADASTRAL_LOTS.find((l) => l.lotId === '10/17/DP758759').ringWorld;
  const lot2 = NARROMINE_COURTHOUSE_CADASTRAL_LOTS.find((l) => l.lotId === '2/17/DP758759').ringWorld;

  const [formerCourt, police, localCourt, hubNSpoke] = NARROMINE_COURTHOUSE_BUILDINGS;

  for (const pt of formerCourt.footprintWorld) {
    assert.ok(inPoly(pt, lot6), `Former Courthouse corner ${JSON.stringify(pt)} inside Lot 6 Sec 17 DP 758759`);
  }
  for (const pt of formerCourt.lockupWorld) {
    assert.ok(inPoly(pt, lot6), `Former Courthouse lock-up corner ${JSON.stringify(pt)} inside Lot 6 Sec 17 DP 758759`);
  }
  assert.ok(inPoly(police.centreWorld, lot5), 'Police Station centre inside Lot 5 Sec 17 DP 758759');
  for (const pt of police.garageWorld) {
    assert.ok(inPoly(pt, lot5), `Police garage corner ${JSON.stringify(pt)} inside Lot 5 Sec 17 DP 758759`);
  }
  for (const pt of localCourt.spineWorld) {
    assert.ok(inPoly(pt, lot10), `Local Court spine corner ${JSON.stringify(pt)} inside Lot 10 Sec 17 DP 758759`);
  }
  for (const pt of localCourt.eastWingWorld) {
    assert.ok(inPoly(pt, lot10), `Local Court east wing corner ${JSON.stringify(pt)} inside Lot 10 Sec 17 DP 758759`);
  }
  assert.ok(inPoly(hubNSpoke.centreWorld, lot2), 'Hub n Spoke centre inside Lot 2 Sec 17 DP 758759');
}

// 5. GeoJSON FeatureCollection validity
{
  assert.equal(NARROMINE_COURTHOUSE_PRECINCT_GEOJSON.type, 'FeatureCollection');
  assert.ok(NARROMINE_COURTHOUSE_PRECINCT_GEOJSON.features.length >= 8);
  for (const feat of NARROMINE_COURTHOUSE_PRECINCT_GEOJSON.features) {
    assert.equal(feat.type, 'Feature');
    assert.equal(feat.geometry.type, 'Polygon');
    const ring = feat.geometry.coordinates[0];
    assert.ok(ring.length >= 4, `Feature ${feat.properties.id} has closed polygon ring`);
    assert.deepEqual(ring[0], ring[ring.length - 1], `Feature ${feat.properties.id} ring is closed`);
    for (const [lon, lat] of ring) {
      assert.ok(lon > 148.24 && lon < 148.243, `Valid Narromine longitude ${lon}`);
      assert.ok(lat < -32.232 && lat > -32.235, `Valid Narromine latitude ${lat}`);
    }
  }
}

// 6. Standalone Three.js geometry generation & draw-call batching
{
  const res = buildNarromineCourthousePrecinct();
  assert.ok(res.group instanceof THREE.Group, 'Returns THREE.Group in standalone mode');
  const meshes = res.group.children.filter((c) => c.isMesh);
  assert.ok(meshes.length >= 10 && meshes.length <= 20, `Expected 10..20 batched meshes, got ${meshes.length}`);

  let totalVerts = 0;
  const bbox = new THREE.Box3();
  for (const m of meshes) {
    const pos = m.geometry.attributes.position;
    const norm = m.geometry.attributes.normal;
    assert.ok(pos && pos.count > 0, 'Mesh has non-empty position attribute');
    assert.ok(norm && norm.count === pos.count, 'Mesh has matching normal attribute');
    for (let i = 0; i < pos.array.length; i++) {
      assert.ok(Number.isFinite(pos.array[i]), 'All vertex positions are finite');
      assert.ok(Number.isFinite(norm.array[i]), 'All vertex normals are finite');
    }
    totalVerts += pos.count;
    bbox.expandByObject(m);
  }
  assert.ok(totalVerts > 600, `Expected > 600 vertices across precinct, got ${totalVerts}`);
  assert.ok(bbox.min.y >= -0.01 && bbox.max.y <= 7.0, `Height bounds [${bbox.min.y.toFixed(2)}, ${bbox.max.y.toFixed(2)}] match LiDAR/heritage envelope`);

  // Verify spots and colliders
  assert.equal(res.spots.length, 4, 'Registers 4 civic/heritage interactive spots');
  for (const s of res.spots) {
    assert.ok(s.pos instanceof THREE.Vector3, `Spot ${s.key} has THREE.Vector3 pos`);
  }
  assert.ok(res.colliders.length >= 15, `Expected >= 15 sliced AABB colliders, got ${res.colliders.length}`);

  // Ensure pedestrian entry points and adjacent streets are 100% clear of building colliders
  const clearPoints = [
    ...Object.values(NARROMINE_COURTHOUSE_ACCESS.pedestrianEntryPointsWorld),
    [-4595.0, -760.0], // Burraway Street carriageway outside 35 Burraway Street
    [-4565.0, -742.0], // Burraway Street carriageway outside 37 Burraway Street
    [-4614.0, -830.0], // Merilba Street carriageway outside 47 Merilba Street
    [-4614.0, -795.0], // Merilba Street carriageway outside 49 Merilba Street
  ];
  for (const [px, pz] of clearPoints) {
    for (const c of res.colliders) {
      const hit = px >= c.x0 && px <= c.x1 && pz >= c.z0 && pz <= c.z1;
      assert.ok(!hit, `Clearance point [${px}, ${pz}] must not intersect collider ${JSON.stringify(c)}`);
    }
  }
}

// 7. Live buildNarromine integration & PLACES verification
{
  const formerPlace = PLACES.find((p) => p.name === 'Former Narromine Courthouse (1898)');
  const courtPlace = PLACES.find((p) => p.name === 'Narromine Courthouse');
  const policePlace = PLACES.find((p) => p.name === 'Narromine Police Station');
  const hubPlace = PLACES.find((p) => p.name === 'HubnSpoke');

  assert.ok(formerPlace, 'Former Narromine Courthouse (1898) registered in PLACES');
  assert.equal(formerPlace.address, '35 Burraway Street');
  assert.match(formerPlace.fact, /I5/);

  assert.ok(courtPlace, 'Narromine Courthouse registered in PLACES');
  assert.equal(courtPlace.address, '47 Merilba Street');
  assert.match(courtPlace.fact, /Lot 10/);

  assert.ok(policePlace, 'Narromine Police Station registered in PLACES');
  assert.equal(policePlace.address, '49 Merilba Street');
  assert.match(policePlace.fact, /osm:174/);

  assert.ok(hubPlace, 'HubnSpoke registered in PLACES');
  assert.equal(hubPlace.address, '37 Burraway Street');
  assert.match(hubPlace.fact, /atrium/);

  const parent = new THREE.Group();
  const live = buildNarromine(parent);
  for (const key of [
    'narromine:former-courthouse-35-burraway',
    'narromine:courthouse-47-merilba',
    'narromine:police-station-49-merilba',
    'narromine:hub-n-spoke-37-burraway',
  ]) {
    assert.ok(live.spots.some((s) => s.key === key), `Live Narromine world includes spot ${key}`);
  }

  for (const [px, pz] of Object.values(NARROMINE_COURTHOUSE_ACCESS.pedestrianEntryPointsWorld)) {
    const blocked = live.colliders.some((c) => px >= c.x0 && px <= c.x1 && pz >= c.z0 && pz <= c.z1);
    assert.ok(!blocked, `Live Narromine world leaves pedestrian entry [${px}, ${pz}] unobstructed`);
  }
}

console.log('PASS narromine-courthouse-precinct: disambiguation, cadastral lots, LiDAR, GeoJSON, 3D geometry & live world integration verified.');
