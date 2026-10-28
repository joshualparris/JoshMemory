// Every counter panel lists the bag (townpanels bagLine → amount). Building materials bought at the
// hardware counter are not town GOODS; naming them must never throw, or every panel breaks.
import assert from 'node:assert/strict';
import { amount, GOODS } from '../src/world/life.js';
import { HARDWARE } from '../src/world/trade-education.js';
for (const k of Object.keys(HARDWARE)) {
  const text = amount(k, 2);
  assert(!/undefined/.test(text), `${k}: ${text}`);
  if (!GOODS[k]) assert.match(text, new RegExp(HARDWARE[k].name.toLowerCase()), k);
}
assert.doesNotThrow(() => amount('something_new', 3)); assert.match(amount('something_new', 3), /something new/);
assert.equal(amount('pie', 1), '1 pie'); assert.equal(amount('parcel', 2), '2 parcels'); assert.equal(amount('bread', 2), '2 loaves of bread');
console.log('PASS: bag lines name town goods, hardware materials and unknown items without throwing, no "1 pie of pies"');
