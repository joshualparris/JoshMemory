// Narromine workplaces: each mapped business with a building opens to an interior fitted out for its work,
// with the residents on shift at their stations (and pupils in class at schools); closed when it is closed.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createNarrominePopulation } from '../src/world/narromine-population.js';
import { createNarromineWorkplaceIndex, buildNarromineWorkplaceInterior, OWN_INTERIOR } from '../src/world/narromine-workplaces.js';
const pop = createNarrominePopulation(), ix = createNarromineWorkplaceIndex(pop), L = () => new THREE.Object3D();
assert(ix.list.length >= 70, 'most workplaces have a building: ' + ix.list.length);
let staffed = 0; const looks = new Set();
for (const e of ix.list) {
  assert(!OWN_INTERIOR.has(e.workplace.kind));
  const b = buildNarromineWorkplaceInterior(pop, e, L, 2, 11 * 60);
  assert(b.interactables.some(o => o.act?.station), e.workplace.name + ' has workstations');
  const rostered = pop.people.filter(p => p.workplace === e.workplace.id).length;
  assert(b.staff.length <= rostered, 'only its own staff');
  if (b.staff.length) staffed++;
  assert(!b.rooms.some(r => r.name === 'Bedroom'), e.workplace.name + ' has no bedroom');
  assert(e.workplace.staffBasis, e.workplace.name + ' says where its staff number comes from');
  looks.add(JSON.stringify([b.rooms.map(r => [r.name, Math.round(r.w * 10), Math.round(r.d * 10)]), b.placedProps.map(p => p.type).sort()]));
  const night = buildNarromineWorkplaceInterior(pop, e, L, 2, 2 * 60);
  if (e.workplace.closes - e.workplace.opens < 20 * 60) assert.equal(night.staff.length, 0, e.workplace.name + ' is empty at 2 am');
}
assert.equal(looks.size, ix.list.length, 'no two workplaces have the same interior');
const station = pop.workplaces.find(w => w.kind === 'railway_station');
assert(!station, 'the unstaffed coach stop has no daily staff');
const high = ix.list.find(e => e.workplace.name === 'Narromine High School'), school = buildNarromineWorkplaceInterior(pop, high, L, 2, 10 * 60 + 30);
assert(school.staff.length > 20 && school.pupils > 20, 'the high school has teachers and pupils in class');
assert.equal(buildNarromineWorkplaceInterior(pop, high, L, 6, 10 * 60 + 30).pupils, 0, 'no class on Saturday');
const hospital = ix.list.find(e => e.workplace.kind === 'hospital');
assert(buildNarromineWorkplaceInterior(pop, hospital, L, 2, 3 * 60).staff.length > 0, 'the hospital has night staff at 3 am');
console.log(`PASS Narromine workplaces: ${ix.list.length} fitted-out workplaces, ${staffed} staffed at 11 am Tuesday; high school ${school.staff.length} staff and ${school.pupils} pupils at 10:30`);
