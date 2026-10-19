// Node checks for the town simulation (src/world/life.js): clock, utilities, the visitor's
// bag and money, council actions, elections, and two weeks of a stable economy.
//   node tests/town-simulation.mjs
import assert from 'node:assert/strict';
import { TownLife, timeText, CANDIDATES } from '../src/world/life.js';

// Synthetic households on rows 1–7 (the real town has 188).
const homes = [];
for (let r = 0; r < 7; r++) for (let c = 0; c < 26; c += 2) homes.push({ coordinate: String.fromCharCode(65 + c) + (r + 1), name: `House ${c}-${r}`, door: { x: (c - 12.5) * 26, z: r * 46 - 161 + 4 } });
const run = (t, minutes) => { for (let m = 0; m < minutes; m += 0.5) t.tick(0.5); };

assert.equal(timeText(480), '08:00');
assert.equal(timeText(1440), '00:00');

const t = new TownLife({ homes, minute: 7 * 60 });
assert.equal(t.villagers.length, 38);
run(t, 120);
assert.equal(t.time(), '09:00');
assert.ok(t.civic.supply.ok && t.civic.supply.power >= t.civic.supply.powerDemand, 'the grid powers the town');
assert.ok(t.civic.supply.waterOk, 'the taps run');

// The visitor's bag: purchases come off the shelf and out of the wallet, with tax to the council.
const me = t.civic.player, bakery = t.place('bakery');
const loaves = bakery.out.bread, wallet = me.wallet, treasury = t.civic.treasury, till = bakery.till;
assert.match(t.buyItem('bakery', 'bread'), /in your bag/);
assert.equal(bakery.out.bread, loaves - 1);
assert.equal(me.wallet, wallet - 5);
assert.equal(me.bag.bread, 1, 'purchases stay in the bag');
assert.ok(Math.abs((t.civic.treasury - treasury) + (bakery.till - till) - 5) < 1e-9, 'the price splits between tax and till');
assert.match(t.sellItem('bakery', 'bread'), /buys it back for \$3/);
assert.equal(me.bag.bread, 0);
assert.equal(me.wallet, wallet - 2, 'buy-back pays 60%');
assert.match(t.sellItem('bakery', 'bread'), /don't have/, 'cannot resell what you no longer own');
t.buyItem('bakery', 'pie'); assert.match(t.eatItem('pie'), /eat/);

// Bank, post, council.
run(t, 30);   // 9:30, the bank is open
assert.match(t.bank('withdraw', 50), /Withdrew \$50/);
assert.match(t.postLetter('Mabel'), /posted/);
assert.match(t.vote(CANDIDATES[1]), /vote/);
assert.match(t.vote(CANDIDATES[0]), /already voted/);
t.civic.services.roads = 40;
assert.match(t.repair('roads'), /Request lodged/);
assert.equal(t.civic.services.roads,40,'button cannot magically repair roads');
run(t,210);
assert(t.civic.services.roads>=75,'a working crew completed the authorised repair');
assert(t.civic.government.orders.some(w=>w.service==='roads'&&w.status==='done'));


// Two weeks: the town keeps eating, stays powered, holds elections and keeps its books.
let blackout = 0, minMeals = Infinity;
const mayors = new Set([t.civic.mayor]);
for (let d = 0; d < 14; d++) {
  for (let m = 0; m < 1440; m += 0.5) { t.tick(0.5); if (!t.civic.supply.ok) blackout++; }
  if (t.yesterday) minMeals = Math.min(minMeals, t.yesterday.meals);
  mayors.add(t.civic.mayor);
}
assert.equal(blackout, 0, 'no blackouts while fuel deliveries keep up');
assert.ok(minMeals >= 80, `at least 80 meals a day (worst ${minMeals})`);
assert.ok(t.civic.treasury > 1000, `the council stays solvent ($${Math.round(t.civic.treasury)})`);
assert.ok(t.villagers.filter((v) => v.wallet < 5).length <= 6, 'most villagers can pay their way');
assert.ok(t.civic.letters[0].delivered, 'the posted letter was delivered');
assert.ok(t.civic.government.elections.length>=2, 'two registered resident elections were held');
assert.ok(t.civic.government.publicLife.contacts.length>0,'public political conversations must happen naturally during the simulated fortnight');
assert.ok(t.civic.government.elections[0].roll.length>0,'real villagers voted');

// Save and restore keeps the books and the visitor's bag.
const copy = new TownLife({ homes });
copy.restore(JSON.parse(JSON.stringify(t.snapshot())));
assert.equal(copy.day, t.day); assert.equal(copy.civic.player.wallet, t.civic.player.wallet); assert.equal(Math.round(copy.civic.treasury), Math.round(t.civic.treasury));
console.log(`PASS: town simulation — 38 villagers, utilities, bag and bank, council, elections (mayors ${[...mayors].join(', ')}), 14 stable days (worst ${minMeals} meals), restore`);

// Brakes must look down a new road segment after turning, not behind the vehicle.
{
 const turning=new TownLife({homes,minute:480}), truck=turning.trucks[0];
 turning.villagers=[];truck.path=[{x:truck.x+30,z:truck.z}];truck.heading=0;
 turning.obstacles=[{x:truck.x+5,z:truck.z}];
 assert.equal(turning.blocked(truck),true,'brakes after turning');
 turning.obstacles=[{x:truck.x-5,z:truck.z}];
 assert.equal(turning.blocked(truck),false,'does not brake for obstacle behind');
}
