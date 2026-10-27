// The built master plan (alternative D): every parcel addressed once with NSW-style numbering,
// one connected road network tied into Street 8, bounded driving, and no overlaps.
//   node tests/masterplan-built.mjs
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { PLAN_ROADS, PLAN_PARCELS, PLAN_ROAD_NAMES, PLAN_HOMES, buildMasterplan, homeWalkway, onPlannedOrCoreRoad, planJunctions } from '../src/world/masterplan-built.js';
import { CORE_ROADS, graph, rect, overlap, roadRect, frontage } from '../src/world/masterplan-model.js';
import { roadAllows } from '../src/world/player-driving.js';

assert.equal(PLAN_PARCELS.length, 199, '195 homes plus campus, park and two employment lots');
assert.equal(PLAN_PARCELS.filter((p) => p.use === 'residential').length, 195);
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
assert.equal(PLAN_HOMES.length, 195, 'every UN member and observer state has a home');
assert.equal(new Set(PLAN_HOMES.map(h => h.country)).size, 195, 'unique countries');
assert.equal(new Set(PLAN_HOMES.map(h => h.design.w.toFixed(4))).size, 195, 'all designs are geometrically distinct');
assert(PLAN_HOMES.every(h => h.tradition && h.style), 'country-specific architecture cues are recorded');
assert.equal(PLAN_HOMES.filter(h => h.parcelId.startsWith('home-')).length, 48, 'original lot IDs survive');
assert.equal(PLAN_HOMES.filter(h => /-west-/.test(h.parcelId)).length, 147, 'three new street rows');
for (const id of ['local-south','local-north']) {
  const road = PLAN_ROADS.find(r => r.id === id);
  assert.equal(road.a.x, -1330, id + ' extends west');
}
assert(PLAN_ROADS.some(r => r.name === 'Grevillea Street'));
assert(onPlannedOrCoreRoad(-700,277) && onPlannedOrCoreRoad(-700,367) && onPlannedOrCoreRoad(-700,457), 'all western streets driveable');

for (const h of PLAN_HOMES) {
 const w=homeWalkway(h);
 assert(w.lengthM>2 && w.lengthM<17, h.address+' must have an actual footpath link');
 assert(w.z0<=h.frontZ && w.z1>=h.frontZ, h.address+' entry joins path');
}
const built = buildMasterplan(new THREE.Group());
assert(built.colliders.length >= 48, 'homes are solid');
assert.equal(built.homeColliders.length + built.lampColliders.length, built.colliders.length);
for (const c of built.homeColliders) {
  const lot = PLAN_PARCELS.find((p) => c.x0 >= p.x - p.w / 2 - 1e-6 && c.x1 <= p.x + p.w / 2 + 1e-6 && c.z0 >= p.z - p.d / 2 - 1e-6 && c.z1 <= p.z + p.d / 2 + 1e-6);
  assert(lot, `house wall ${JSON.stringify(c)} lies inside a single lot`);
  for (const r of PLAN_ROADS) assert(!overlap(c, roadRect(r, true)), `house wall intrudes into ${r.name}`);
}
for (const h of PLAN_HOMES) {
  const p = PLAN_PARCELS.find((q) => q.id === h.parcelId);
  const front = h.facesNorth ? p.z - p.d / 2 : p.z + p.d / 2;
  assert(Math.abs(Math.abs(h.frontZ - front) - 6) < 1e-6, `${h.address} has a 6 m front setback`);
}
console.log('PASS: 195 country-inspired homes inside their lots, 199 addressed parcels, connected driveable streets, no overlaps');
