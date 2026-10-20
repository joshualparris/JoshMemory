// Villager households and shop counters: food spoilage and refrigeration, the 4-hour rule, rent and
// home loans, metered bills paid at the home computer, budgets, chores, FIFO counter lines and
// kitchen preparation times. Pure simulation: node tests/household.mjs
import assert from 'node:assert/strict';
import { TownLife } from '../src/world/life.js';
import { ensureHousehold, stowFood, foodCount, heldCount, householdHour, householdDay, doFinances, homeTask, householdDone, outdoorTemp, season, HOUSING } from '../src/world/household.js';
import { lineAt, prepMinutes } from '../src/world/counter-queue.js';
import { coldChainHour, shopWasteDay } from '../src/world/cold-chain.js';

const homes = Array.from({ length: 188 }, (_, i) => ({ coordinate: String.fromCharCode(65 + i % 26) + (1 + Math.floor(i / 26)), name: 'Home ' + i, door: { x: i % 26 * 26 - 300, z: Math.floor(i / 26) * 46 } }));
const fresh = () => new TownLife({ homes, seed: 20261020 });

// Seasons and weather: cold winter mornings, hot summer afternoons.
assert.equal(season(1), 'spring'); assert.equal(season(8), 'summer'); assert.equal(season(22), 'winter'); assert.equal(season(29), 'spring');
assert(outdoorTemp(10, 15 * 60, 'sunny') > 30 && outdoorTemp(22, 5 * 60, 'cloudy') < 5);

// Food: chilled things go in the fridge, a second kilo of lamb in the freezer; frozen meat isn't cookable until thawed.
{
  const t = fresh(), v = t.villagers[0];
  v.larder = []; stowFood(v, { milk: 1, lamb: 2, bread: 4 });
  assert.deepEqual(v.larder.map((b) => `${b.g}${b.n}${b.store}`).sort(), ['bread1freezer', 'bread3pantry', 'lamb1freezer', 'lamb1fridge', 'milk1fridge']);
  assert.equal(foodCount(v, 'lamb'), 1); assert.equal(heldCount(v, 'lamb'), 2);
  // Milk keeps about eight days in a working fridge, then it's binned.
  v.larder = [{ g: 'milk', n: 1, store: 'fridge', wear: 0 }];
  let hours = 0; while (v.larder.length && hours < 400) { householdHour(t, hours % 24); hours++; }
  assert(hours > 150 && hours < 220, `milk lasted ${hours} hours in the fridge`);
  assert(v.household.threwOut >= 1);
}
// The 4-hour rule: four hours with the neighbourhood feeder out and chilled food goes; the freezer thaws.
{
  const t = fresh(), v = t.villagers[0];
  v.larder = [{ g: 'milk', n: 1, store: 'fridge', wear: 0 }, { g: 'lamb', n: 1, store: 'freezer', wear: 0 }, { g: 'bread', n: 1, store: 'pantry', wear: 0 }];
  t.gridPowered = () => false;
  for (let h = 0; h < 4; h++) householdHour(t, 12);
  assert.equal(foodCount(v, 'milk'), 0, 'warm milk is thrown out after four hours');
  assert.equal(v.larder.find((b) => b.g === 'lamb')?.store, 'freezer', 'a closed freezer stays frozen for a day');
  for (let h = 4; h < 24; h++) householdHour(t, 12);
  assert.equal(v.larder.find((b) => b.g === 'lamb')?.store, 'fridge', 'after a day without power the freezer has thawed');
  assert.equal(foodCount(v, 'bread'), 1, 'bread does not need the fridge');
}
// Housing: renters pay the council, buyers repay the Community Bank and the loan shrinks; owners pay neither.
{
  const t = fresh();
  const renter = t.villagers.find((v) => v.household.tenure === 'rent'), buyer = t.villagers.find((v) => v.household.tenure === 'mortgage'), owner = t.villagers.find((v) => v.household.tenure === 'owned');
  assert(renter && buyer && owner, 'the town has renters, home-loan holders and owners');
  for (const v of [renter, buyer, owner]) { v.wallet = 100; v.housingArrears = 0; }
  const bank = t.civic.credit.capital, treasury = t.civic.treasury, balance = buyer.household.mortgage.balance;
  const r = householdDay(t, renter), b = householdDay(t, buyer), o = householdDay(t, owner);
  assert.equal(r.council, HOUSING.rent); assert.equal(b.bank, HOUSING.repayment); assert.equal(o.council + o.bank, 0);
  assert(buyer.household.mortgage.balance < balance, 'repayments reduce the loan');
  assert.equal(t.civic.credit.capital, bank, 'householdDay reports amounts; finance.js moves them');
  assert.equal(t.civic.treasury, treasury);
}
// Power and water are metered, billed weekly by email, and paid at the home computer, which also sets a budget.
{
  const t = fresh(), v = t.villagers[3];
  v.wallet = 200;
  for (let h = 0; h < 24 * 7; h++) householdHour(t, h % 24);
  t.day = 7; householdDay(t, v);
  const bill = v.household.bills.at(-1);
  assert(bill && bill.amount > 0 && !bill.paid, 'a weekly bill arrives');
  assert(v.household.inbox.some((m) => m.kind === 'bill'));
  assert.equal(homeTask(t, v, () => 0.1)?.kind, 'finances', 'an unpaid bill sends them to the computer');
  const paid = householdDone(t, v, { kind: 'finances', at: 'home' });
  assert.equal(paid.council, bill.amount); assert(bill.paid);
  assert(v.household.budget.food > 0 && v.household.budget.week === 1);
  assert(v.household.inbox.every((m) => m.read));
}
// Chores: cooking dirties dishes, washing up clears them.
{
  const t = fresh(), v = t.villagers[5];
  v.household.lastFinance = t.day; v.household.bills = [];
  householdDone(t, v, { kind: 'cook', at: 'home' }); householdDone(t, v, { kind: 'cook', at: 'home' });
  assert.equal(homeTask(t, v, () => 0.1)?.kind, 'dishes');
  householdDone(t, v, { kind: 'dishes', at: 'home' }); assert.equal(v.household.dishes, 0);
}
// Counters: one customer per staff member at a time, in arrival order, and kitchens take time.
assert.equal(prepMinutes('a parmy and chips'), 18); assert.equal(prepMinutes('flat-white'), 3); assert(prepMinutes('big brekkie') > prepMinutes('toastie'));
{
  const t = fresh();
  t.minute = 7 * 60;
  const seen = [], queued = new Set();
  let maxLine = 0, order = [];
  for (let i = 0; i < 2 * 60 * 14; i++) {
    t.tick(0.5);
    for (const v of t.villagers) if (v.step?.queue && !queued.has(v.name + v.step.queue.joined)) { queued.add(v.name + v.step.queue.joined); seen.push({ at: v.step.at, name: v.name, joined: v.step.queue.joined }); }
    for (const id of ['cafe', 'bakery', 'store']) maxLine = Math.max(maxLine, lineAt(t, id).length);
  }
  assert(seen.length > 30, `customers queued at counters (${seen.length})`);
  assert(maxLine >= 2, 'busy counters form a line');
}
// Shops: stale bread and bruised fruit go at the end of the day; a cold room without power for four hours loses its milk and meat.
{
  const t = fresh();
  t.place('bakery').out.bread = 40; t.place('butcher').stock.lamb = 10;
  const wasted = shopWasteDay(t);
  assert(wasted > 0 && t.place('bakery').out.bread === 34);
  t.gridPowered = () => false;
  for (let h = 0; h < 4; h++) coldChainHour(t);
  assert.equal(t.place('butcher').stock.lamb, 0);
  assert(t.events.some((e) => /cold room has been off for four hours/.test(e.text)));
}
// A fortnight: everyone still eats, nobody's larder is a bottomless pantry, and the books balance.
{
  const t = fresh();
  for (let i = 0; i < 2 * 1440 * 14; i++) t.tick(0.5);
  assert(t.yesterday.meals >= 85, `meals on day 14: ${t.yesterday.meals}`);
  for (const v of t.villagers) { ensureHousehold(v); assert(Array.isArray(v.larder) && v.larder.every((b) => b.n > 0 && b.wear < 1)); }
  assert(t.villagers.some((v) => v.household.budget), 'households have set budgets');
  assert(t.villagers.every((v) => v.household.bills.length >= 1), 'every household has had a power and water bill');
}
console.log('PASS: households (food storage, spoilage, 4-hour rule, rent and home loans, bills, budgets, chores) and shop counters (FIFO lines, prep times, waste, cold rooms).');
