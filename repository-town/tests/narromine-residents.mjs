// Narromine residents: census-calibrated people in real houses, with real workplaces and cars that make
// their own trips (no random driving on side streets).
import assert from 'node:assert/strict';
import { createNarrominePopulation, dayPlan, NARROMINE_CENSUS as C } from '../src/world/narromine-population.js';
import { buildGraph } from '../src/world/narromine-traffic.js';
import { createNarromineCommute } from '../src/world/narromine-commute.js';

const P = createNarrominePopulation();
assert(P.homes.length >= 1000, 'enough real houses: ' + P.homes.length);
const ages = P.people.map(p => p.age).sort((a, b) => a - b), median = ages[ages.length >> 1];
assert(Math.abs(median - C.medianAge) <= 2, 'median age near the census 39: ' + median);
assert(Math.abs(P.people.length / P.homes.length - 2.4) < 0.4, 'about 2.4 people per household (census): ' + (P.people.length / P.homes.length).toFixed(2));
assert(Math.abs(P.cars.length / P.homes.length - 1.8) < 0.25, 'about 1.8 cars per dwelling (census): ' + (P.cars.length / P.homes.length).toFixed(2));
const work = new Set([...P.workplaces.map(w => w.id), 'farm', 'dubbo', 'repotown', 'graincorp']);
for (const p of P.people) {
  assert(p.name && p.home && P.households.some(h => h.id === p.household), 'identity and home: ' + p.id);
  if (p.workplace) assert(work.has(p.workplace) && p.age >= 16, 'real workplace, working age: ' + p.id);
  if (p.age >= 5 && p.age <= 17) assert(p.school, 'school-age child has a school: ' + p.name);
}
for (const h of P.households) { assert.equal(new Set(h.members.map(id => P.people[+id.slice(3)].first)).size, h.members.length, 'unique first names in ' + h.id); assert(!/\d/.test(h.street), 'street name only, no house number: ' + h.street); assert(h.fridge && h.members.length); }
for (const c of P.cars) { const d = P.people[+c.driver?.slice(3)]; if (d) assert(d.age >= 18 && d.household === c.household, 'driver is an adult of the owning household'); }
const coles = P.workplaces.find(w => w.kind === 'supermarket');
assert.equal(P.people.filter(p => p.workplace === coles.id).length, coles.staff, 'Coles is fully staffed');

const commute = createNarromineCommute(buildGraph()), trips = commute.trips(2);
assert(trips.length > 1500, 'a weekday has thousands of trips: ' + trips.length);
const byHour = new Array(24).fill(0); for (const t of trips) byHour[Math.floor(t.depart / 60)]++;
assert(byHour[3] === 0 && byHour[2] === 0, 'nobody drives at 2-3 am');
assert(byHour[7] + byHour[8] > byHour[11] && byHour[16] + byHour[17] > byHour[19] + byHour[20], 'morning and afternoon peaks');
// Each car's trips chain: it leaves from where it last parked.
for (const car of P.cars.slice(0, 300)) {
  const list = trips.filter(t => t.car === car.id); let at = 'home';
  for (const t of list) { assert.equal(t.from, at, car.id + ' leaves from where it parked'); at = t.to; }
  const at3 = commute.carState(car.id, 2, 3 * 60), night = list.some(t => t.depart > 21 * 60);
  assert(at3.parked === 'home' || (night && at3.parked), car.id + ' is at home at 3 am unless its driver works nights');
}
// Nobody drives two cars at once; spare cars stay home.
const byDriver = {}; for (const t of trips) (byDriver[t.person] ??= new Set()).add(t.car);
assert(Object.values(byDriver).every(s => s.size === 1), 'each driver uses one car');
// School run: primary-school children are driven to their own school at 8:25 by a parent from their household.
const drops = trips.filter(t => t.purpose === 'dropoff');
assert(drops.length > 50, 'school drop-offs happen: ' + drops.length);
for (const t of drops) { assert(t.depart === 8 * 60 + 25); for (const k of t.passengers) { const kid = P.people[+k.slice(3)]; assert(kid.age <= 11 && kid.school === t.to && kid.household === P.people[+t.person.slice(3)].household); } }
assert(trips.filter(t => t.purpose !== 'dropoff' && t.passengers?.length).every(t => t.depart >= 15 * 60), 'children ride home only after pick-up');
const weekend = commute.trips(6);
assert.equal(weekend.filter(t => t.purpose === 'dropoff').length, 0, 'no school run on Saturday');
assert(weekend.filter(t => t.purpose === 'travel').length < trips.filter(t => t.purpose === 'travel').length / 2, 'far fewer commutes on Saturday');
console.log(`PASS Narromine residents: ${P.people.length} people, ${P.homes.length} homes, ${P.cars.length} cars, ${P.workers} workers, median age ${median}; ${trips.length} weekday trips (${byHour[7] + byHour[8]} at 7-9 am), ${weekend.length} on Saturday`);
