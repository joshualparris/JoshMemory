// NSW small-business establishment grants: paid once at 8:00 on day 1 from the finite NSW
// treasury into each private business's till, journalled, and never paid twice (even after a save).
import assert from 'node:assert/strict';
import { TownLife } from '../src/world/life.js';
import { fin, STARTUP_GRANT } from '../src/world/finance.js';

const homes = [];
for (let r = 0; r < 7; r++) for (let c = 0; c < 26; c += 2) homes.push({ coordinate: String.fromCharCode(65 + c) + (r + 1), name: 'House', door: { x: (c - 12.5) * 26, z: r * 46 - 161 + 4 } });

const t = new TownLife({ homes, minute: 7 * 60 + 58, seed: 11 });
const biz = t.privateBusinesses();
const tills = () => biz.reduce((n, p) => n + p.till, 0);
const ids = biz.map((p) => p.id);
for (const id of ['store', 'bakery', 'cafe', 'pub', 'garden', 'coop', 'dealership', 'hotel']) assert.ok(ids.includes(id), id + ' is a private business');
for (const id of ['hall', 'school', 'clinic', 'police', 'court', 'tafe', 'farmhouse', 'bank']) assert.ok(!ids.includes(id), id + ' gets no business grant');

t.tick(1);                                                  // 7:59: not yet
assert.equal(fin(t).startupGrantsPaid, undefined, 'nothing before 8:00');
const stateBefore = fin(t).state, tillsBefore = tills();
t.tick(1);                                                  // 8:00
const paid = stateBefore - fin(t).state;
assert.ok(fin(t).startupGrantsPaid, 'grants paid at 8:00 on day 1');
assert.ok(Math.abs(tills() - tillsBefore - paid) < 0.01, 'every dollar leaves the NSW treasury and lands in a till');
for (const p of biz) {
  const staff = t.villagers.filter((v) => v.work === p.id).length;
  assert.ok(p.till >= STARTUP_GRANT.base, `${p.name} has at least $${STARTUP_GRANT.base}`);
  assert.ok(fin(t).entries.some((e) => e.debit === 'nsw' && e.credit === 'business:' + p.id && e.amount === STARTUP_GRANT.base + STARTUP_GRANT.perStaff * staff), `${p.name} grant journalled`);
}

const snap = JSON.parse(JSON.stringify(t.snapshot()));
const u = new TownLife({ homes, minute: 7 * 60, seed: 11 }); u.restore(snap);
const again = fin(u).state;
u.tick(1);
assert.equal(fin(u).state, again, 'a restored town is not paid twice');
t.tick(24 * 60);
assert.ok(t.day === 2 && fin(t).entries.filter((e) => e.memo.endsWith('establishment grant')).length <= biz.length, 'paid only once');
console.log(`PASS: NSW establishment grants — $${Math.round(paid)} to ${biz.length} businesses at 8:00 day 1, once, from the NSW treasury`);
