// Unit & geospatial integration tests for the North-West Dandaloo Street
// Heritage, Civic & Commercial Block (38–68 Dandaloo Street, Narromine NSW 2821 —
// comparison screenshots #31–#44 and #47–#50).
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { CollisionWorld } from '../src/engine/collision.js';
import { BUILDINGS, FILL_SHOPS, onNarromineRoad } from '../src/world/narromine-layout.js';
import { NARROMINE_LIDAR } from '../src/world/narromine-lidar-data.js';
import { buildNarromine } from '../src/world/narromine.js';
import {
  NARROMINE_NW_DANDALOO_INTEGRATION_SPEC,
  NARROMINE_NW_DANDALOO_BUILDINGS,
} from '../src/world/narromine-nw-dandaloo-evidence.js';
import {
  buildNarromineNwDandalooBlock,
  edgeFrame,
} from '../src/world/narromine-nw-dandaloo-block.js';

// 1. Feature-scoped coordination boundary checks
assert.deepEqual(
  NARROMINE_NW_DANDALOO_INTEGRATION_SPEC.suppressedOsmBuildingIndices,
  [179, 180, 183, 184, 185],
  'suppresses only the 5 unclaimed mapped West Dandaloo OSM buildings (52–68 Dandaloo St)'
);
assert(
  !NARROMINE_NW_DANDALOO_INTEGRATION_SPEC.suppressedOsmBuildingIndices.includes(186),
  'explicitly excludes osm:186 (50 Dandaloo St Physiotherapy, claimed in PR #338)'
);
assert.deepEqual(
  NARROMINE_NW_DANDALOO_INTEGRATION_SPEC.suppressedFillShopNames,
  ['Narromine Baptist Church', 'Narromine Battlers Mate', 'Aqua West'],
  'replaces the 3 generic FILL_SHOPS boxes on North-West Dandaloo St (38–44 Dandaloo St)'
);

// 2. Verify surveyed OSM footprints, 2023 LiDAR heights, and east-facing street orientations
assert.equal(NARROMINE_NW_DANDALOO_BUILDINGS.length, 8, '8 reconstructed buildings in 38–68 Dandaloo St block');
for (const b of NARROMINE_NW_DANDALOO_BUILDINGS) {
  assert(b.id && b.name && b.address && b.provenance, `${b.id} carries complete provenance`);
  for (const [x, z] of b.pts) {
    assert(x > -4820 && x < -4745 && z > -1155 && z < -970, `${b.id} vertex [${x}, ${z}] lies in NW Dandaloo corridor`);
  }
  const front = edgeFrame(b.pts, b.frontageEdge[0], b.frontageEdge[1]);
  assert(front.nx > 0.90, `${b.id} Dandaloo Street frontage faces east toward Dandaloo St (nx=${front.nx.toFixed(3)})`);

  if (b.osmIndex !== null) {
    const mapped = BUILDINGS.find((m) => m.osmIndex === b.osmIndex);
    assert(mapped, `osm:${b.osmIndex} exists in BUILDINGS`);
    assert.deepEqual(b.pts, mapped.pts, `osm:${b.osmIndex} matches surveyed OSM polygon vertices`);
    const lidar = NARROMINE_LIDAR.heights['osm:' + b.osmIndex];
    assert(lidar, `osm:${b.osmIndex} has surveyed NSW LiDAR record`);
    assert.equal(b.lidar.eaveM, lidar[2], `osm:${b.osmIndex} eave height matches LiDAR`);
    assert.equal(b.lidar.ridgeM, lidar[3], `osm:${b.osmIndex} ridge height matches LiDAR`);
    assert.equal(b.lidar.medianM, lidar[4], `osm:${b.osmIndex} median height matches LiDAR`);
  } else {
    const fill = FILL_SHOPS.find((f) => f.name === b.replaceFillShopName);
    assert(fill, `${b.id} corresponds to mapped FILL_SHOPS entry ${b.replaceFillShopName}`);
  }
}

// 3. Standalone builder verification
const standalone = buildNarromineNwDandalooBlock();
assert(standalone.group instanceof THREE.Group, 'standalone build returns a THREE.Group');
assert(standalone.group.children.length >= 15, `standalone group has merged colour meshes (${standalone.group.children.length})`);
assert(standalone.stats.geometryCount > 240, `detailed architectural geometry count (${standalone.stats.geometryCount})`);
assert(standalone.colliders.length >= 20, `sliced building colliders generated (${standalone.colliders.length})`);

// 4. Full Narromine integration & footpath walkability verification
const rootParent = new THREE.Group();
const built = buildNarromine(rootParent);
const world = new CollisionWorld(built.colliders);

// Verify that the Dandaloo Street carriageway and western footpath along 38–68 Dandaloo St
// (from z = -975 north to z = -1145) remain completely unobstructed by building colliders.
const footpathWaypoints = [
  [-4772.0, -980.0],  // Outside 68 Dandaloo St (Wardi Insurance & Ag Commodities)
  [-4770.0, -1000.0], // Outside 60–62 Dandaloo St (Macquarie Clothing verandah)
  [-4766.5, -1019.5], // Outside 56 Dandaloo St (Narromine Men's Shed canopy)
  [-4761.0, -1052.0], // Outside 58 Dandaloo St (Narromine USMC portico & flagpoles)
  [-4760.0, -1074.5], // Outside 52 Dandaloo St (Red-brick cottage fence)
  [-4754.5, -1104.5], // Outside 44 Dandaloo St (Narromine Baptist Church front hedge)
  [-4752.5, -1118.5], // Outside 42 Dandaloo St (Narromine Battlers Mate)
  [-4748.5, -1141.5], // Outside 38–40 Dandaloo St (Aqua Westroyal-blue awning)
];
for (const [wx, wz] of footpathWaypoints) {
  assert(!world.hits(wx, wz, 0.28), `West Dandaloo footpath/verandah clear of colliders at [${wx}, ${wz}]`);
}

// Verify Dandaloo Street western carriageway remains driveable and collider-free along the entire block
for (let z = -975; z >= -1145; z -= 10) {
  const t = (z - (-956.5)) / (-1186.5 - (-956.5));
  const roadX = -4769.5 + (-4735.5 - (-4769.5)) * t;
  assert(onNarromineRoad(roadX, z), `Dandaloo Street driveable at [${roadX.toFixed(1)}, ${z}]`);
  assert(!world.hits(roadX, z, 0.4), `Dandaloo Street roadway free of building colliders at [${roadX.toFixed(1)}, ${z}]`);
}

console.log(
  `PASS Narromine NW Dandaloo Block: ${standalone.stats.buildingCount} buildings (osm:179,180,183,184,185 + 38–44 Dandaloo St), ` +
    `${standalone.stats.geometryCount} architectural geometries, ${standalone.colliders.length} sliced colliders, and unobstructed footpath/roadway.`
);
