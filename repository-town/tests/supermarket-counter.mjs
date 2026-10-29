// The Corner Grocer (F7-N supermarket) sells groceries through the normal
// shop path: real trucks restock it from the town's supply chain, a staffed
// checkout sells from finite stock, and the counter panel offers Buy buttons.
// Regression for the 2026-10-29 playtest: the checkout had a cashier but nothing
// to buy. This is counter trading only; RTBUILD-006's full interior/operating
// acceptance remains open.
import assert from 'node:assert/strict';
import { TownLife } from '../src/world/life.js';
import { placePanel } from '../src/ui/townpanels.js';
import { shopService } from '../src/world/shop-attendance.js';

const homes = [];
for (let r = 0; r < 8; r++) for (let c = 0; c < 26; c++) if (homes.length < 188) homes.push({ coordinate: String.fromCharCode(65 + c) + (r + 1), name: 'Home', door: { x: (c - 12.5) * 26, z: r * 46 - 157 } }); // full-size town: expansion staff exist
const t = new TownLife({ homes, minute: 6 * 60, seed: 20261029 });
const shop = t.place('supermarket');
assert.ok(shop, 'supermarket exists');
assert.deepEqual([...shop.sells].sort(), ['bread', 'coffee', 'eggs', 'flour', 'fruit', 'milk', 'tea', 'veg']);
assert.ok(shop.target && shop.target.eggs > 0, 'supermarket has restock targets, so trucks deliver to it');

// Trucks restock it over a day of genuine simulation.
for (const g of Object.keys(shop.stock)) shop.stock[g] = 0;
for (let m = 0; m < 14 * 60; m += 0.5) t.tick(0.5);
const delivered = Object.values(shop.stock).reduce((a, b) => a + b, 0);
assert.ok(delivered > 0, 'supply trucks restocked the supermarket: ' + JSON.stringify(shop.stock));

// A staffed checkout sells finite stock through buyItem. Run the real clock
// until the rostered cashier is physically at the till (no shortcuts).
let svc = shopService(t, shop);
for (let i = 0; i < 24 * 120 && !svc.available; i++) { t.tick(0.5); svc = shopService(t, shop); }
assert.ok(svc.available, 'the cashier reaches the checkout during opening hours: ' + svc.message);
const good = shop.sells.find((g) => (shop.stock[g] || 0) > 0);
assert.ok(good, 'something is in stock');
const me = t.civic.player; me.wallet = 100;
const before = { stock: shop.stock[good], wallet: me.wallet, bag: me.bag[good] || 0 };
const buy = (placePanel(t, 'supermarket').actions || []).find((a) => a.label.startsWith('Buy '));
assert.ok(buy, 'the checkout panel offers Buy buttons');
assert.match(t.buyItem('supermarket', good), /You buy/);
assert.equal(shop.stock[good], before.stock - 1, 'one unit leaves the shelf');
assert.equal(me.bag[good], before.bag + 1, 'it goes into the bag');
assert.ok(me.wallet < before.wallet, 'the player pays');
// With nobody at the till, nothing is sold.
t.minute = 23 * 60; assert.doesNotMatch(t.buyItem('supermarket', good), /You buy/);
console.log('supermarket-counter: restocked by trucks (' + JSON.stringify(shop.stock) + ') and sells at the checkout.');
