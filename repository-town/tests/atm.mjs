// The bank's 24-hour ATM: withdrawals at any hour from savings, never money from nowhere;
// the teller counter (deposits) still keeps bank hours, and the hotel points short guests to it.
import assert from 'node:assert/strict';
import { TownLife } from '../src/world/life.js';
const homes = Array.from({ length: 188 }, (_, i) => ({ coordinate: String.fromCharCode(65 + i % 26) + (1 + Math.floor(i / 26)), name: 'Home ' + i, door: { x: (i % 26 - 12.5) * 26, z: Math.floor(i / 26) * 46 - 157 } }));
const t = new TownLife({ homes, minute: 23 * 60, seed: 4 }), me = t.civic.player;
me.wallet = 5; me.bank = 70;
assert.match(t.bank('withdraw', 20), /closed/, 'the teller counter keeps bank hours');
assert.match(t.bookHotel(), /24-hour ATM/, 'the hotel tells a short guest where to get cash at night');
assert.match(t.atm(50), /pays out \$50/); assert.equal(me.wallet, 55); assert.equal(me.bank, 20);
assert.match(t.atm(50), /pays out \$20/, 'only what is in savings'); assert.equal(me.wallet + me.bank, 75, 'money conserved');
assert.match(t.atm(20), /nothing to withdraw/);
console.log('PASS: 24-hour ATM withdraws savings at night, conserves money, bank counter hours and hotel hint unchanged');
