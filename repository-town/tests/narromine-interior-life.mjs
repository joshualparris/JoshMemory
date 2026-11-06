// Regression for the Narromine interior complaints: doors on real walls,
// collision-safe resident movement, non-overlapping rooms, detached mowers,
// and exterior-facing windows. Runs without a GPU or a network connection.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { buildInterior } from '../src/world/interior.js';
import { homeDoor, buildNarromineHomeInterior } from '../src/world/narromine-homes.js';
import { createNarrominePopulation, whoIsAt } from '../src/world/narromine-population.js';
import { createNarromineWorkplaceIndex, buildNarromineWorkplaceInterior } from '../src/world/narromine-workplaces.js';
import { buildNarromineColesInterior } from '../src/world/narromine-coles.js';

const label = () => new THREE.Object3D();
const hub = buildInterior({ repo: 'narromine-hub-geometry-regression', noBedroom: true,
  int: { layout: 'hub', walls: 0xeeeeee, floor: 0x777777, height: 3,
    rooms: Array.from({ length: 10 }, (_, i) => ({
      name: 'Room ' + i, w: 8 + i % 4, d: 8 + i % 3,
      props: [['chair', 'Seat ' + i]]
    })) } }, label);
for (let i = 0; i < hub.rooms.length; i++) for (let j = i + 1; j < hub.rooms.length; j++) {
  const a = hub.rooms[i], b = hub.rooms[j];
  const overlapX = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0);
  const overlapZ = Math.min(a.z1, b.z1) - Math.max(a.z0, b.z0);
  assert(overlapX <= .01 || overlapZ <= .01, 'hub rooms ' + i + '/' + j + ' must not overlap');
}
assert.equal(hub.rooms.length, 10);

const pop = createNarrominePopulation();
let awake = 0, outbuildings = 0;
for (const home of pop.homes.slice(0, 40)) {
  const d = homeDoor(home), c = Math.cos(home.yaw), s = Math.sin(home.yaw);
  const localX = (d.x - home.x) * c - (d.z - home.z) * s;
  const localZ = (d.x - home.x) * s + (d.z - home.z) * c;
  assert(Math.abs(Math.abs(localX) - home.w / 2) < .01 && Math.abs(localZ) < .01 ||
    Math.abs(Math.abs(localZ) - home.d / 2) < .01 && Math.abs(localX) < .01,
  home.id + ' doorway is exactly at midpoint of a rotated exterior wall');
  const b = buildNarromineHomeInterior(pop, home, label, 3, 19 * 60);
  assert(!b.rooms.some(r => /shed|garage|workshop/i.test(r.name)),
    home.id + ' garage/workshop must not be part of indoor rooms');
  assert(!b.placedProps.some(o => o.type === 'mower'), home.id + ' has no indoor lawn mower');
  assert(Array.isArray(b.people) && b.people.every(p => p.plan?.collisionWorld),
    home.id + ' awake figures use collision-aware movement');
  assert(b.people.every(p => !p.plan.collisionWorld.hits(p.pos.x, p.pos.z, .4)),
    home.id + ' awake people start clear of furniture and walls');
  awake += b.people.length;
  if (b.outbuilding) {
    outbuildings++;
    assert.equal(b.outbuilding.modelledOutside, false, 'do not invent mapped detached sheds');
  }
}
assert(awake > 0, 'there are awake household residents to animate');

const ix = createNarromineWorkplaceIndex(pop);
const entry = ix.list.find(e => e.workplace.staff > 1 && e.workplace.staff < 12 &&
  e.workplace.kind !== 'school') || ix.list[0];
const work = buildNarromineWorkplaceInterior(pop, entry, label, 2, 11 * 60);
assert(Array.isArray(work.people) && work.people.every(p => p.plan?.collisionWorld),
  'workplace staff must be actual animated walkers');

const roster = whoIsAt(pop, 'coles', 2, 11 * 60);
const coles = buildNarromineColesInterior(label, 2, 11 * 60, roster);
assert(coles.windows.length >= 2, 'Coles storefront is visible from indoors');
assert.equal(coles.people.length, roster.staff.length + roster.visitors.length,
  'Coles roster entries connect to rendered, animated people');
assert(coles.people.every(p => p.plan?.collisionWorld),
  'Coles shoppers, queue and staff share store collision system');
assert(coles.people.some(p => p.activity.includes('browsing') || p.activity.includes('restocking')),
  'some Coles people have activities that take them through the shop');
console.log('PASS Narromine interior life: 10-room hub non-overlapping; 40 doors on walls; ' +
  awake + ' awake home actors; ' + outbuildings + ' external outbuilding inventories; ' +
  coles.people.length + ' Coles actors');
