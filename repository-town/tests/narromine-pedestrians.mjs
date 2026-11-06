// Narromine on foot and parked: residents without a car for a leg walk it on the footpath (children to and
// from school), and cars parked at busy places (schools, Coles) each have their own kerb space.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createNarromineTraffic } from '../src/world/narromine-traffic.js';
import { createNarrominePedestrians } from '../src/world/narromine-pedestrians.js';
const group = new THREE.Group(), traffic = createNarromineTraffic(group, { models: false });
const { commute, graph } = traffic, pop = commute.population;
const ped = createNarrominePedestrians(commute, graph.nodes, graph.adj, null), walks = ped.walks(2);
assert(walks.length > 300, 'hundreds of walks on a school day: ' + walks.length);
const hours = new Array(24).fill(0); for (const w of walks) hours[Math.floor(w.depart / 60)]++;
assert(hours[8] > 100 && hours[15] > 100, 'children walk to school at 8 and home at 3');
for (const w of walks) {
  const p = pop.people[+w.person.slice(3)];
  assert(p.age >= 5 && w.length <= 2500, 'walkers are 5+ and walk at most 2.5 km');
  assert(!(pop.households[+p.household.slice(3)].schoolRun?.kids.includes(p.id) && w.purpose === 'travel'), 'school-run children ride, not walk, in the morning');
}
assert(ped.walks(6).filter(w => w.purpose === 'travel').length < hours[8], 'fewer walks on Saturday');
// The walker is on the footpath: beside the road, not in it.
const w = walks[0], at = ped.placeOnRoute(w, 30), n = graph.nodes;
let near = Infinity; for (let i = 1; i < w.path.length; i++) { const a = n[w.path[i - 1]], b = n[w.path[i]], dx = b.x - a.x, dz = b.z - a.z, L = dx * dx + dz * dz || 1, t = Math.max(0, Math.min(1, ((at.x - a.x) * dx + (at.z - a.z) * dz) / L)); near = Math.min(near, Math.hypot(at.x - a.x - dx * t, at.z - a.z - dz * t)); }
assert(near > 3, 'walker is beside the road, ' + near.toFixed(1) + ' m from its centreline');
// Parked cars near the high school at 10:30 on a Tuesday don't overlap.
const school = pop.workplaces.find(x => x.name === 'Narromine High School');
traffic.update(0.1, { x: school.x, z: school.z }, 10 * 60 + 30, 2);
const parked = traffic.parked.filter(c => c.parked);
// Independent oriented-rectangle SAT oracle (the runtime has its own implementation).
// Centre spacing is not an overlap test: cars have length, width and direction.
function overlap(a, b) {
  const ua = [Math.sin(a.yaw), Math.cos(a.yaw)], ub = [Math.sin(b.yaw), Math.cos(b.yaw)];
  const axes = [ua, [-ua[1], ua[0]], ub, [-ub[1], ub[0]]];
  for (const axis of axes) {
    const project = c => {
      const forward = [Math.sin(c.yaw), Math.cos(c.yaw)];
      return (c.L || 4.4) / 2 * Math.abs(axis[0] * forward[0] + axis[1] * forward[1]) +
        0.95 * Math.abs(axis[0] * forward[1] - axis[1] * forward[0]);
    };
    const separation = Math.abs((a.x - b.x) * axis[0] + (a.z - b.z) * axis[1]);
    if (separation >= project(a) + project(b) + 0.1) return false;
  }
  return true;
}
assert(overlap({ x: 0, z: 0, yaw: 0, L: 4.4 }, { x: 0, z: 3, yaw: 0, L: 4.4 }),
  'regression oracle detects cars overlapping lengthways despite centres 3 m apart');
assert(!overlap({ x: 0, z: 0, yaw: 0, L: 4.4 }, { x: 2.9, z: 0, yaw: 0, L: 4.4 }),
  'regression oracle accepts non-touching vehicles parked 2.9 m side-by-side');
let overlaps = 0;
const collisions = [];
for (let i = 0; i < parked.length; i++) for (let j = i + 1; j < parked.length; j++) {
  if (overlap(parked[i], parked[j])) { overlaps++; if (collisions.length < 8) collisions.push([parked[i].carId, parked[j].carId]); }
}
assert(parked.length > 40, 'cars are parked around the school: ' + parked.length);
assert.equal(overlaps, 0, 'parked vehicle footprints overlap: ' + overlaps + ' of ' + parked.length + '; examples ' + JSON.stringify(collisions));
// Same-weekday next week must allow the same household car to run the new day's
// trip; a stale trip-ID Set used to make cars disappear forever after day one.
const rollover = createNarromineTraffic(new THREE.Group(), { models: false });
const chosen = rollover.commute.trips(2).find(t => t.purpose === 'dropoff' && t.length > 500);
assert(chosen, 'an actual primary-school drop-off with a route longer than 500 m');
const origin = rollover.graph.nodes[chosen.path[0]];
const time = chosen.depart + 0.25; // first 15 seconds of its genuine road journey
const observer = { x: origin.x, z: origin.z };
rollover.update(0.1, observer, time, 2, 2);
const first = rollover.cars.find(c => c.trip === chosen.id);
assert(first, 'school-run car spawns on the first Tuesday');
rollover.update(0.1, observer, time, 2, 9);
const second = rollover.cars.filter(c => c.trip === chosen.id);
assert.equal(second.length, 1, 'same car trip reappears exactly once on the following Tuesday');
assert.notEqual(second[0].id, first.id, 'the new day spawns a fresh physical vehicle');
rollover.update(0.1, observer, time, 2, 9);
assert.equal(rollover.cars.filter(c => c.trip === chosen.id).length, 1,
  'same-day repeated frames never create a duplicate car');
console.log(`PASS Narromine pedestrians and parking: ${walks.length} weekday walks (${hours[8]} at 8 am, ${hours[15]} at 3 pm); ${parked.length} parked cars near the high school, ${overlaps} overlaps`);
