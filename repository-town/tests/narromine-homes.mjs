// Narromine residents' homes: every household's house can be entered and has the rooms people need,
// a bed for every resident, and a fridge whose contents follow the household's Coles shopping.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createNarrominePopulation } from '../src/world/narromine-population.js';
import { buildNarromineHomeInterior, createNarromineHomeIndex, fridgeAt, homeDoor } from '../src/world/narromine-homes.js';
const pop = createNarrominePopulation(), index = createNarromineHomeIndex(pop);
let beds = 0;
for (const home of pop.homes) {
  const b = buildNarromineHomeInterior(pop, home, () => new THREE.Object3D(), 3, 19 * 60);
  const types = b.placedProps.map(o => o.type);
  for (const need of ['fridge', 'stove', 'shower', 'toilet', 'washingMachine', 'kitchenSink']) assert(types.includes(need), home.id + ' has ' + need);
  const people = b.household.members.length, bedProps = types.filter(t => t === 'bed').length;
  assert(bedProps >= Math.ceil(people / 2), home.id + ': enough beds for ' + people + ' people (' + bedProps + ')');
  beds += bedProps;
  const d = homeDoor(home); assert(Math.hypot(d.x - home.x, d.z - home.z) <= Math.hypot(home.w, home.d) / 2 + 0.5, 'door on the house wall');
  assert(index.near(d)?.home === home, 'door lookup finds ' + home.id);
}
// The fridge empties between shops and is full straight after one.
const hh = pop.households[0];
let low = null, high = null;
for (let day = 2; day <= 14; day++) for (const m of [8 * 60, 20 * 60]) { const f = fridgeAt(pop, hh, day, m); if (!low || f.daysSinceShop > low.daysSinceShop) low = f; if (!high || f.daysSinceShop < high.daysSinceShop) high = f; }
assert(high.items.milk > low.items.milk, 'milk is used up between shops and restocked at Coles');
console.log(`PASS Narromine homes: ${pop.homes.length} enterable homes with kitchen, bathroom and laundry; ${beds} beds; fridge ${high.items.milk} L milk after a shop, ${low.items.milk} L ${low.daysSinceShop} days later`);
