// The built master plan (alternative D): every parcel addressed once with NSW-style numbering,
// one connected road network tied into Street 8, bounded driving, and no overlaps.
//   node tests/masterplan-built.mjs
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { PLAN_ROADS, PLAN_PARCELS, PLAN_ROAD_NAMES, PLAN_HOMES, buildMasterplan, onPlannedOrCoreRoad, planJunctions } from '../src/world/masterplan-built.js';
import { CORE_ROADS, graph, rect, overlap, roadRect, frontage } from '../src/world/masterplan-model.js';
import { roadAllows } from '../src/world/player-driving.js';

assert.equal(PLAN_PARCELS.length, 52, '48 homes, campus, park and two employment lots');
assert.equal(PLAN_PARCELS.filter((p) => p.use === 'residential').length, 48);
assert.deepEqual([...new Set(PLAN_PARCELS.filter((p) => p.use === 'residential').map((p) => p.w * p.d))].sort((a, b) => a - b), [560, 700, 840], 'three lot sizes');

// Addresses: unique, every parcel addressed on the road it fronts, odd left / even right,
// numbers ascending away from each road's town end.
const addresses = PLAN_PARCELS.map((p) => p.address);
assert(addresses.every(Boolean), 'every parcel has an address');
assert.equal(new Set(addresses).size, addresses.length, 'addresses are unique');
for (const p of PLAN_PARCELS) {
  const r = PLAN_ROADS.find((x) => x.id === p.roadId);
  assert(frontage(p, r) > 0, `${p.address} physically fronts ${r.name}`);
  assert.equal(p.roadName, PLAN_ROAD_NAMES[r.id]);
  assert.equal(p.number % 2 === 1, p.side === 'left', `${p.address}: odd numbers on the left`);
}
for (const r of PLAN_ROADS) for (const side of ['left', 'right']) {
  const along = r.a.z === r.b.z ? 'x' : 'z', dir = Math.sign(r.b[along] - r.a[along]);
  const lots = PLAN_PARCELS.filter((p) => p.roadId === r.id && p.side === side).sort((a, b) => dir * (a[along] - b[along]));
  lots.forEach((p, i) => assert.equal(p.number, side === 'left' ? 2 * i + 1 : 2 * i + 2, `${r.name} ${side} numbering runs from the town end`));
}
assert.equal(PLAN_PARCELS.find((p) => p.use === 'park').address, '4 Banksia Street');

// Network: one connected component with the existing streets; every link meets Street 8.
const g = graph([...CORE_ROADS, ...PLAN_ROADS]);
assert.equal(g.components.length, 1, 'existing town and new neighbourhood form one road network');
for (const id of ['core-link-0', 'core-link-1', 'core-link-2']) {
  const r = PLAN_ROADS.find((x) => x.id === id);
  assert.equal(r.a.z, 177, `${r.name} starts on Street 8 (Workshop Way)`);
}
assert(planJunctions().length >= 9, 'junction signs at every plan junction');

// No parcel overlaps another parcel or any road reserve.
for (let i = 0; i < PLAN_PARCELS.length; i++) {
  for (let j = i + 1; j < PLAN_PARCELS.length; j++) assert(!overlap(rect(PLAN_PARCELS[i]), rect(PLAN_PARCELS[j])), `${PLAN_PARCELS[i].id} overlaps ${PLAN_PARCELS[j].id}`);
  for (const r of [...CORE_ROADS, ...PLAN_ROADS]) assert(!overlap(rect(PLAN_PARCELS[i]), roadRect(r, true)), `${PLAN_PARCELS[i].id} intrudes into ${r.name || r.id}`);
}

// Driving: new roads are driveable; streets and avenues end where they are drawn.
assert(roadAllows(-208, 300), 'Kurrajong Road is driveable');
assert(roadAllows(100, 277), 'Wattle Street is driveable');
assert(roadAllows(462, 320), 'Saleyards Road is driveable');
assert(roadAllows(0, -145) && roadAllows(52, 0), 'existing street and avenue still driveable');
assert(!roadAllows(900, -145), 'Arcade Avenue no longer extends infinitely east');
assert(!roadAllows(-78, 600), 'avenues no longer extend infinitely south');
assert(!roadAllows(100, 320), 'parcels between streets are not road');
assert.equal(onPlannedOrCoreRoad(0, 0), false, 'between streets is not road');
// A home on every residential lot, wholly inside its own lot with its walls solid.
assert.equal(PLAN_HOMES.length, 48, 'every residential lot has a home');
const built = buildMasterplan(new THREE.Group());
assert(built.colliders.length >= 48, 'homes are solid');
for (const c of built.colliders) {
  const lot = PLAN_PARCELS.find((p) => c.x0 >= p.x - p.w / 2 - 1e-6 && c.x1 <= p.x + p.w / 2 + 1e-6 && c.z0 >= p.z - p.d / 2 - 1e-6 && c.z1 <= p.z + p.d / 2 + 1e-6);
  assert(lot, `house wall ${JSON.stringify(c)} lies inside a single lot`);
  for (const r of PLAN_ROADS) assert(!overlap(c, roadRect(r, true)), `house wall intrudes into ${r.name}`);
}
for (const h of PLAN_HOMES) {
  const p = PLAN_PARCELS.find((q) => q.id === h.parcelId);
  const front = h.facesNorth ? p.z - p.d / 2 : p.z + p.d / 2;
  assert(Math.abs(Math.abs(h.frontZ - front) - 6) < 1e-6, `${h.address} has a 6 m front setback`);
}
console.log('PASS: 48 homes inside their lots, 52 addressed parcels, one connected network tied into Street 8, bounded driving, no overlaps');
