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
let overlaps = 0; for (let i = 0; i < parked.length; i++) for (let j = i + 1; j < parked.length; j++) if (Math.hypot(parked[i].x - parked[j].x, parked[i].z - parked[j].z) < 2.4) overlaps++;   // closer than a car width plus a gap
assert(parked.length > 40, 'cars are parked around the school: ' + parked.length);
assert(overlaps <= parked.length * 0.02, 'parked cars do not stack on each other: ' + overlaps + ' overlaps of ' + parked.length);
console.log(`PASS Narromine pedestrians and parking: ${walks.length} weekday walks (${hours[8]} at 8 am, ${hours[15]} at 3 pm); ${parked.length} parked cars near the high school, ${overlaps} overlaps`);
