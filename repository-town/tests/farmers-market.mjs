// Farmers' market rules and layout: markets fall on the 1st and 3rd Saturday mornings only; the
// twelve 3 m sites, coffee van, sizzle and info tent fit inside the square without covering the
// fountain, benches or trees; every serving spot is clear; buying charges the right price, puts
// produce in the bag, feeds you, refuses when closed or short of money, and wine is 18+.
//   node tests/farmers-market.mjs
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { isMarketDay, marketOpen, nextMarketDay, marketLayout, servePoint, buyAtStall, STALLS, FOOD, buildFarmersMarket } from '../src/world/farmers-market.js';
import { townDate } from '../src/world/town-calendar.js';

// Day 1 is Monday 26 October 2026. 31 Oct is the 5th Saturday (no market); 7 and 21 Nov are 1st and 3rd.
assert.equal(isMarketDay(6), false, 'Saturday 31 October is the 5th Saturday: no market');
assert.equal(townDate(13).label, 'Saturday 7 November 2026'); assert.equal(isMarketDay(13), true);
assert.equal(isMarketDay(20), false, '2nd Saturday: no market');
assert.equal(isMarketDay(27), true, 'Saturday 21 November: 3rd Saturday');
assert.equal(nextMarketDay(1), 13);
for (let d = 1; d < 400; d++) if (isMarketDay(d)) { const t = townDate(d); assert(t.weekday === 6 && (t.dayOfMonth <= 7 || (t.dayOfMonth >= 15 && t.dayOfMonth <= 21)), t.label); }
assert(marketOpen(13, 8 * 60) && marketOpen(13, 11 * 60 + 59) && !marketOpen(13, 12 * 60) && !marketOpen(13, 7 * 60 + 59));

// Layout inside the 24 x 30 m plaza (x ±12, z -19..11), clear of the fountain, benches and trees.
const L = marketLayout(), keepClear = [
  { x0: -2.7, x1: 2.7, z0: -6.7, z1: -1.3, what: 'fountain' },
  ...[[-6, -4], [6, -4], [0, 3], [0, -11]].map(([x, z]) => ({ x0: x - 1.1, x1: x + 1.1, z0: z - .45, z1: z + .45, what: 'bench' })),
  ...[[-11.2, -13.6], [11.2, -13.6], [-9, 5], [9, 5], [-9, -4.5], [9, -4.5]].map(([x, z]) => ({ x0: x - .3, x1: x + .3, z0: z - .3, z1: z + .3, what: 'tree trunk' })),
];
const footprint = (s, half) => ({ x0: s.x - half, x1: s.x + half, z0: s.z - half, z1: s.z + half });
const overlaps = (a, b) => a.x0 < b.x1 && a.x1 > b.x0 && a.z0 < b.z1 && a.z1 > b.z0;
const sites = [...L.stalls.map((s) => ({ ...s, half: 1.55 })), { ...L.food[1], half: 1.55 }, { ...L.info, half: 1.05 }];
for (const s of sites) {
  const f = footprint(s, s.half);
  assert(f.x0 >= -12 && f.x1 <= 12 && f.z0 >= -19 && f.z1 <= 11, `${s.name || 'info tent'} inside the square`);
  for (const k of keepClear) assert(!overlaps(f, k), `${s.name || 'info tent'} clear of the ${k.what}`);
}
for (let i = 0; i < sites.length; i++) for (let j = i + 1; j < sites.length; j++) assert(!overlaps(footprint(sites[i], sites[i].half), footprint(sites[j], sites[j].half)), `${sites[i].name} and ${sites[j].name} do not overlap`);
assert.equal(L.stalls.length, 10); assert.equal(STALLS.length + FOOD.length, 12, 'twelve sites with food');

// Serving spots are clear of every market collider (built for real) and of the fountain and benches.
const m = buildFarmersMarket(new THREE.Group(), { x: 0, z: 0 });
m.update(13, 9 * 60);
for (const sp of m.spots) {
  for (const c of m.colliders) assert(!(sp.pos.x > c.x0 - .35 && sp.pos.x < c.x1 + .35 && sp.pos.z > c.z0 - .35 && sp.pos.z < c.z1 + .35), `${sp.label}: customers can stand at the serving spot`);
  for (const k of keepClear) assert(!(sp.pos.x > k.x0 - .35 && sp.pos.x < k.x1 + .35 && sp.pos.z > k.z0 - .35 && sp.pos.z < k.z1 + .35), `${sp.label}: serving spot clear of the ${k.what}`);
}
assert(m.root.visible); m.update(14, 9 * 60); assert(!m.root.visible, 'packed away on Sunday');
assert(m.colliders.every((c) => c.top < 0), 'packed-away tables do not block');

// Buying.
const logs = [], life = { day: 13, minute: 9 * 60, civic: { player: { wallet: 50, hunger: 60, fatigue: 40, bag: {} } }, log: (t) => logs.push(t) };
assert.match(buyAtStall(life, 'veg', 0), /Trish hands you the tomatoes/);
assert.equal(life.civic.player.wallet, 44); assert.equal(life.civic.player.bag.veg, 1);
buyAtStall(life, 'sizzle', 1); assert.equal(life.civic.player.hunger, 20, 'bacon and egg roll feeds you');
buyAtStall(life, 'coffee', 0); assert.equal(life.civic.player.fatigue, 25, 'coffee perks you up');
life.civic.player.age = 16; assert.match(buyAtStall(life, 'wine', 0), /over-18s/);
life.civic.player.wallet = 3; assert.match(buyAtStall(life, 'honey', 0), /\$12\.00; you have \$3\.00/);
life.minute = 13 * 60; life.civic.player.wallet = 100; assert.match(buyAtStall(life, 'honey', 0), /market is closed/);
console.log(`PASS: 1st and 3rd Saturday 8-12, ${sites.length + 1} sites inside the square clear of fountain, benches and trees, serving spots clear, purchases, 18+ wine, closed market`);
