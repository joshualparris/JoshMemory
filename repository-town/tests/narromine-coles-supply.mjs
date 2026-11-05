// Coles Narromine stock: households' shops take food off the shelves; the morning truck and the midday
// bread-and-milk van fill them back up. Totals match what residents eat.
import assert from 'node:assert/strict';
import { createNarrominePopulation } from '../src/world/narromine-population.js';
import { createColesSupply } from '../src/world/narromine-coles-supply.js';
const pop = createNarrominePopulation(), c = createColesSupply(pop);
const open = c.stockAt(2, 6 * 60 + 5), evening = c.stockAt(2, 20 * 60 + 59), before = c.stockAt(2, 4 * 60);
for (const k of Object.keys(open)) {
  assert.equal(open[k], c.capacity[k], k + ' is full after the morning delivery');
  assert(evening[k] < open[k], k + ' sells during the day');
  assert(evening[k] > 0, k + ' does not run out');
  assert(before[k] < open[k], k + ' is restocked by the truck');
}
assert(c.stockAt(2, 11 * 60 + 30).milk > c.stockAt(2, 10 * 60 + 55).milk, 'the midday van tops up milk');
assert.equal(c.stockAt(2, 11 * 60 + 30).eggs <= c.stockAt(2, 10 * 60 + 55).eggs, true, 'the van brings no eggs');
const milkPerPerson = c.shops(2).reduce((s, x) => s + x.n, 0) * 1 / pop.people.length;
assert(milkPerPerson > 0.25 && milkPerPerson < 0.7, 'milk sold per resident per day is realistic: ' + milkPerPerson.toFixed(2) + ' L');
console.log(`PASS Coles supply: shelves full at opening (${open.milk} L milk), ${evening.milk} L left at 9 pm; ${milkPerPerson.toFixed(2)} L of milk sold per resident on a Tuesday`);
