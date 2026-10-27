// Node checks for the town simulation (src/world/life.js): clock, utilities, the visitor's
// bag and money, council actions, elections, and two weeks of a stable economy.
//   node tests/town-simulation.mjs
import assert from 'node:assert/strict';
import { TownLife, timeText, CANDIDATES, ROSTER_SIZE} from '../src/world/life.js';

// 188 unique synthetic homes for the full paid roster.
const homes = [];
for (let r = 0; r < 8; r++) for (let c = 0; c < 26; c++) { if(r===7 && c>=6)continue; homes.push({ coordinate: String.fromCharCode(65 + c) + (r + 1), name: `House ${c}-${r}`, door: { x: (c - 12.5) * 26, z: r * 46 - 161 + 4 } }); }
const run = (t, minutes) => { for (let m = 0; m < minutes; m += 0.5) t.tick(0.5); };

assert.equal(timeText(480), '08:00');
assert.equal(timeText(1440), '00:00');

// A save resumes the same seeded simulation: random state, positions, routes, trucks and parcels.
{
  const a = new TownLife({ homes, minute: 7 * 60, seed: 12345 });
  run(a, 180);
  const checkpoint = JSON.parse(JSON.stringify(a.snapshot()));
  const b = new TownLife({ homes, minute: 7 * 60, seed: 999 });
  assert.equal(b.restore(checkpoint), true);
  run(a, 90); run(b, 90);
  assert.deepEqual(b.snapshot(), a.snapshot(), 'restore must continue deterministically from the checkpoint');
  // Old saves (no sim block) still load; future or malformed saves are rejected without touching the town.
  const old = { ...checkpoint }; delete old.sim; 
  assert.equal(new TownLife({ homes }).restore(JSON.parse(JSON.stringify(old))), true);
  const before = JSON.stringify(b.snapshot());
  assert.equal(b.restore({ ...checkpoint, saveVersion: 99 }), false);
  assert.equal(b.restore({ day: -1, minute: 5 }), false);
  assert.equal(b.restore({ ...checkpoint, sim: { ...checkpoint.sim, trucks: [] } }), false);
  assert.equal(JSON.stringify(b.snapshot()), before, 'a rejected save changes nothing');
}

const t = new TownLife({ homes, minute: 7 * 60 });
assert.equal(t.villagers.length, ROSTER_SIZE);
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
let blackout = 0, minMeals = Infinity, firstOutage=null;
const mayors = new Set([t.civic.mayor]);
for (let d = 0; d < 14; d++) {
  for (let m = 0; m < 1440; m += 0.5) { t.tick(0.5); if (!t.civic.supply.ok) {
    blackout++;
    if(!firstOutage) firstOutage={day:t.day,date:t.dateLabel(),minute:t.minute,weather:t.civic.weather,
      powerStock:t.place('power').stock.fuel,depotFuel:t.place('depot').out.fuel,
      powerService:t.civic.services.power,generated:t.civic.supply.power,
      demand:t.civic.supply.powerDemand,gridUnserved:t.civic.powerGrid?.unserved,
      faultLines:t.civic.powerLines,affected:t.civic.powerGrid?.affected?.slice(0,5),
      trucks:t.trucks.map(q=>({state:q.state,job:q.job&&{from:q.job.from,to:q.job.to,good:q.job.good}}))};
  } }
  if (t.yesterday) minMeals = Math.min(minMeals, t.yesterday.meals);
  mayors.add(t.civic.mayor);
}
assert.equal(blackout, 0, 'no blackouts while fuel deliveries keep up. FIRST_OUTAGE='+JSON.stringify(firstOutage));
assert.ok(minMeals >= 80, `at least 80 meals a day (worst ${minMeals})`);
assert.ok(t.civic.treasury > 1000, `the council stays solvent ($${Math.round(t.civic.treasury)})`);
const cashPoor=t.villagers.filter(v=>v.wallet<5);
assert.ok(cashPoor.length<=6,'most villagers can pay their way. POOR_RESIDENTS='+JSON.stringify(cashPoor.map(v=>({id:v.id,job:v.job,work:v.work,day:t.day,wallet:v.wallet,savings:v.savings||0,wageArrears:v.wageArrears||0,activity:v.activity,spent:v.household?.spent}))));
assert.ok(t.civic.letters[0].delivered, 'the posted letter was delivered');
assert.ok(t.civic.government.elections.length>=2, 'two registered resident elections were held');
assert.ok(t.civic.government.publicLife.contacts.length>0,'public political conversations must happen naturally during the simulated fortnight');
assert.ok(t.civic.government.elections[0].roll.length>0,'real villagers voted');

// Save and restore keeps the books and the visitor's bag.
const copy = new TownLife({ homes });
copy.restore(JSON.parse(JSON.stringify(t.snapshot())));
assert.equal(copy.day, t.day); assert.equal(copy.civic.player.wallet, t.civic.player.wallet); assert.equal(Math.round(copy.civic.treasury), Math.round(t.civic.treasury));
console.log(`PASS: town simulation — ${ROSTER_SIZE} villagers, utilities, bag and bank, council, elections (mayors ${[...mayors].join(', ')}), 14 stable days (worst ${minMeals} meals), restore`);

// Brakes must look down a new road segment after turning, not behind the vehicle.
{
 const turning=new TownLife({homes,minute:480}), truck=turning.trucks[0];
 turning.villagers=[];truck.path=[{x:truck.x+30,z:truck.z}];truck.heading=0;
 turning.obstacles=[{x:truck.x+5,z:truck.z}];
 assert.equal(turning.blocked(truck),true,'brakes after turning');
 turning.obstacles=[{x:truck.x-5,z:truck.z}];
 assert.equal(turning.blocked(truck),false,'does not brake for obstacle behind');
}
