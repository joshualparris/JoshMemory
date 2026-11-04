// Unit, geometry, provenance, and footpath-walkability tests for the First Verified Correction Release:
//   - Royal Hotel (123 Dandaloo Street, NR-SITE-royal-hotel: DISC-NR-001, DISC-NR-002, DISC-NR-003)
//   - Church at 86 Dandaloo Street (NR-SITE-dandaloo-86) & His and Hers Clip Joint (88 Dandaloo Street, NR-SITE-dandaloo-88: DISC-NR-010)
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {
  ROYAL_HOTEL_ID,
  DANDALOO_86_ID,
  DANDALOO_88_ID,
  ROYAL_HOTEL_REPLACED_IDS,
  ROYAL_FRAME_YAW,
  NARROMINE_ROYAL_HOTEL_PROVENANCE,
  royalToWorld,
  buildNarromineRoyalHotel,
} from '../src/world/narromine-royal-hotel.js';
import { buildNarromine } from '../src/world/narromine.js';

// 1. Provenance & replacement ID contract
assert.equal(ROYAL_HOTEL_ID, 'royal-hotel');
assert.equal(DANDALOO_86_ID, 'dandaloo-86');
assert.equal(DANDALOO_88_ID, 'dandaloo-88');
assert(ROYAL_HOTEL_REPLACED_IDS.has('royal-hotel'));
assert(ROYAL_HOTEL_REPLACED_IDS.has('dandaloo-86'));
assert(ROYAL_HOTEL_REPLACED_IDS.has('dandaloo-88'));

assert.deepEqual(NARROMINE_ROYAL_HOTEL_PROVENANCE.royalHotel.discrepancyIdsResolved, [
  'DISC-NR-001',
  'DISC-NR-002',
  'DISC-NR-003',
]);
assert.deepEqual(NARROMINE_ROYAL_HOTEL_PROVENANCE.dandaloo86And88.discrepancyIdsResolved, [
  'DISC-NR-010',
]);
assert(
  NARROMINE_ROYAL_HOTEL_PROVENANCE.royalHotel.surveyedEvidence.length >= 3 &&
    NARROMINE_ROYAL_HOTEL_PROVENANCE.royalHotel.estimatedDetails.length >= 1,
  'Provenance must explicitly separate surveyed evidence from estimated facade details'
);

// 2. Surveyed cadastral frame orientation (~8.51° E of N)
const yawDeg = (ROYAL_FRAME_YAW * 180) / Math.PI;
assert(
  yawDeg > 8.2 && yawDeg < 8.8,
  `Royal Hotel street frame yaw should match 8.51° cadastre frontage (got ${yawDeg.toFixed(2)}°)`
);

const [swX, swZ] = royalToWorld(0, 0);
const [nwX, nwZ] = royalToWorld(20.44, 0);
const frontageLen = Math.hypot(nwX - swX, nwZ - swZ);
assert(
  Math.abs(frontageLen - 20.44) < 0.05,
  `Royal Hotel front wing length should be 20.44m (got ${frontageLen.toFixed(2)}m)`
);

// 3. Standalone builder geometry & height verification (2023 LiDAR: Royal Hotel ridge 6.37m, 86 Dandaloo St ridge 9.35m)
{
  const town = new THREE.Group();
  const colliders = [];
  const pushedByCol = new Map();
  let maxRoyalY = 0;
  let maxChurchY = 0;
  let totalVerts = 0;

  const recordGeo = (c, g) => {
    const pos = g.attributes.position;
    totalVerts += pos.count;
    const isTreeCrown = c === 0x5c7c42 || c === 0x5d7d43;
    for (let i = 0; i < pos.count; i++) {
      const vy = pos.getY(i);
      const vz = pos.getZ(i);
      if (!isTreeCrown && vz > -565 && vz < -505 && vy > maxRoyalY) maxRoyalY = vy;
      if (!isTreeCrown && vz > -875 && vz < -848 && vy > maxChurchY) maxChurchY = vy;
    }
    pushedByCol.set(c, (pushedByCol.get(c) || 0) + 1);
  };

  const push = (c, g) => recordGeo(c, g);
  const box = (c, w, h, d, x, y, z, ry = 0) => {
    const g = new THREE.BoxGeometry(w, h, d);
    if (ry) g.rotateY(ry);
    g.translate(x, y, z);
    recordGeo(c, g);
  };
  const flatPoly = (c, pts, y = 0.04) => {
    if (pts.length < 3) return;
    const sh = new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z)));
    const g = new THREE.ShapeGeometry(sh);
    g.rotateX(-Math.PI / 2);
    g.translate(0, y, 0);
    recordGeo(c, g);
  };
  const plane = () => {};
  const boardTexture = () => null;

  buildNarromineRoyalHotel({ push, box, flatPoly, plane, boardTexture, town, colliders });

  assert(totalVerts > 2500, `Expected rich 3D geometry (>2500 vertices), got ${totalVerts}`);
  assert(
    maxRoyalY >= 6.35 && maxRoyalY <= 8.0,
    `Royal Hotel peak height (hip roof 6.37m + chimney pots 7.89m) out of range: ${maxRoyalY.toFixed(2)}m`
  );
  assert(
    maxChurchY >= 9.3 && maxChurchY <= 10.5,
    `86 Dandaloo St church gable peak (LiDAR 9.35m + cross finial) out of range: ${maxChurchY.toFixed(2)}m`
  );
  // Check that the 0x7a241e painted roof sign backing plate and 0xf0f2f0 rooftop AC units are present
  assert(pushedByCol.has(0x7a241e), 'Royal Hotel roof sign backing plate & blade sign colour 0x7a241e must be built');
  assert(pushedByCol.has(0xf0f2f0), 'Royal Hotel southern deck rooftop AC condenser units (0xf0f2f0) must be built');
}

// 4. Full buildNarromine integration & footpath walkability verification
{
  const scene = new THREE.Scene();
  const nar = buildNarromine(scene, null);
  nar.update({ x: -4805, z: -542 });
  const { colliders } = nar;

  const PLAYER_R = 0.35;
  const hits = (x, z) =>
    colliders.some(
      (c) => x + PLAYER_R > c.x0 && x - PLAYER_R < c.x1 && z + PLAYER_R > c.z0 && z - PLAYER_R < c.z1
    );

  // 4a. Walk the entire length of the Royal Hotel Dandaloo Street verandah footpath (s = 0 .. 20.4m at e = -1.85m)
  for (let s = 0.5; s <= 20.0; s += 1.0) {
    const [fx, fz] = royalToWorld(s, -1.85);
    assert(
      !hits(fx, fz),
      `Royal Hotel verandah footpath must be walkable at s=${s.toFixed(1)}m (world ${fx.toFixed(2)}, ${fz.toFixed(2)})`
    );
  }

  // 4b. Solid interior of the Royal Hotel front bar wing (s = 10.0m, e = 3.5m) must block walk-through
  {
    const [wx, wz] = royalToWorld(10.0, 3.5);
    assert(hits(wx, wz), 'Royal Hotel front building interior must have active solid colliders');
  }

  // 4c. Southern asphalt drive-through carpark lane (s = -9.5m, e = 2.0 .. 38.0m) must be unobstructed
  for (let e = 2.0; e <= 38.0; e += 3.0) {
    const [dx, dz] = royalToWorld(-9.5, e);
    assert(
      !hits(dx, dz),
      `Royal Hotel southern drive-through must be unobstructed at e=${e.toFixed(1)}m`
    );
  }

  // 4d. Dandaloo Street footpath in front of 86 & 88 Dandaloo Street (x = -4792.5, z = -866 .. -834) must be walkable
  for (let z = -866; z <= -834; z += 2.0) {
    assert(
      !hits(-4792.5, z),
      `Dandaloo Street footpath in front of 86–88 Dandaloo St must be walkable at z=${z}`
    );
  }
}

console.log('PASS narromine-royal-hotel (Royal Hotel 123 Dandaloo St + 86–88 Dandaloo St geometry, LiDAR heights, provenance & footpath walkability)');
