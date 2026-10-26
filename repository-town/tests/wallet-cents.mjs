// The visitor's wallet holds whole cents: wages are paid to the cent, and
// buying, selling back or ordering must not leave float noise such as
// $1.0099999999999998 in the wallet or in shop messages.
//   node tests/wallet-cents.mjs
import assert from 'node:assert/strict';
import { TownLife, GOODS } from '../src/world/life.js';

const homes = [];
for (let r = 0; r < 7; r++) for (let c = 0; c < 26; c += 2) homes.push({ coordinate: String.fromCharCode(65 + c) + (r + 1), name: 'Home', door: { x: (c - 12.5) * 26, z: r * 46 - 157 } });
const t = new TownLife({ homes, minute: 12 * 60, seed: 20261020 });
const store = t.place('store');
const clerk = t.villagers.find((v) => v.work === 'store');
Object.assign(clerk, { step: { kind: 'work', at: 'store' }, path: [], x: store.front.x, z: store.front.z });
store.stock.bread = 10; store.till = 500;
const me = t.civic.player;
const exactCents = (n) => Number.isFinite(n) && Math.round(n * 100) / 100 === n;

me.wallet = 5.01;
assert.match(t.buyItem('store', 'bread'), /You buy/);
assert.equal(me.wallet, Math.round((5.01 - GOODS.bread.price) * 100) / 100);
assert(exactCents(me.wallet), 'wallet after a purchase is whole cents: ' + me.wallet);
const sold = t.sellItem('store', 'bread');
assert.match(sold, /buys it back/);
assert(exactCents(me.wallet), 'wallet after a buyback is whole cents: ' + me.wallet);
for (let i = 0; i < 20; i++) { me.wallet = (703 + i) / 100; store.stock.bread = 10; t.buyItem('store', 'bread'); assert(exactCents(me.wallet), 'wallet ' + me.wallet); }
console.log('✓ purchases and buybacks keep the wallet to whole cents');
