import assert from 'node:assert/strict';
import { TownLife } from '../src/world/life.js';
import { advanceLivestockDay, productiveHerdFraction } from '../src/world/livestock.js';

const homes = Array.from({ length: 188 }, (_, i) => ({
  coordinate: String.fromCharCode(65 + i % 26) + (1 + Math.floor(i / 26)),
  name: `House ${i}`,
  door: { x: i % 26 * 26, z: Math.floor(i / 26) * 46 },
}));
const life = new TownLife({ homes, seed: 17 });
const herds = life.civic.livestock.herds;

assert.deepEqual(
  [herds.sheep.animals.length, herds.dairy.animals.length, herds.coop.animals.length],
  [12, 7, 16],
  'simulation herds match the animals rendered in each paddock',
);
assert.equal(life.livestockReport('dairy').feed, 'hay');
assert.equal(life.livestockReport('coop').feed, 'grain');
assert.equal(productiveHerdFraction(life, 'dairy'), 1);

const sheep = life.place('sheep');
sheep.stock.hay = 0;
life.yesterday = { waterCutHours: 8 };
for (let day = 0; day < 7; day++) advanceLivestockDay(life);
assert.equal(productiveHerdFraction(life, 'sheep'), 0, 'persistent feed and water stress stops livestock production');
assert(life.news().some((event) => /Animal welfare concern/.test(event.text)), 'welfare decline is recorded for the player');
assert.equal(life.livestockReport('sheep').feedStock, 0);

sheep.stock.hay = 100;
life.yesterday = { waterCutHours: 0 };
const depletedHealth = life.livestockReport('sheep').health;
advanceLivestockDay(life);
assert(life.livestockReport('sheep').health > depletedHealth, 'feeding and restored water allow gradual recovery');
for (let day = 0; day < 30; day++) advanceLivestockDay(life);
assert(productiveHerdFraction(life, 'sheep') > 0, 'healthy feed and water restore production over time');

const saved = life.snapshot();
const resumed = new TownLife({ homes, seed: 17 });
assert.equal(resumed.restore(saved), true);
assert.deepEqual(resumed.civic.livestock, life.civic.livestock, 'animal identity, health, condition and feed state survive save/load');
console.log('PASS: livestock counts match visible herds; feed/water stress affects welfare and production; recovery and save/load persist');
