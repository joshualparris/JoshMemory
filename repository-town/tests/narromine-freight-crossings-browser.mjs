// Timetabled freight and level crossings: a game-driven freight starts from the line end and runs,
// the crossing it approaches lowers its booms (which then block the road), and a parked train
// does not close the Dandaloo Street crossing next to the yard.
//   node tools/serve.mjs dist/public 8091 && node tests/narromine-freight-crossings-browser.mjs
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const b = await chromium.launch(), p = await b.newPage(), errors = [];
p.on('pageerror', e => errors.push(e.message));
await p.goto(process.env.TOWN_URL || 'http://127.0.0.1:8091/');
await p.waitForFunction(() => window.__town?.train, null, { timeout: 90000 });
const t0 = await p.evaluate(() => window.__town.train());
assert.ok(t0.crossings.length >= 5, 'level crossings where mapped streets cross the track: ' + t0.crossings.length);
assert.equal(t0.crossings.find(c => c.street === 'Dandaloo Street')?.closed, false, 'a parked train does not close Dandaloo Street');
assert.equal(t0.crossings.filter(c => /Rail Level Crossing$/.test(c.name) && c.ref).length, 7, 'all 7 crossings carry their official names: ' + t0.crossings.map(c => c.name).join('; '));
assert.deepEqual(Object.fromEntries(t0.crossings.map(c => [c.ref, c.control])), { 716: 'lights', 717: 'boom', 718: 'stop', 1107: 'stop', 1108: 'stop', 1109: 'stop', 1867: 'stop' }, 'protection from the NSW register');
assert.match(await p.evaluate(() => window.__town.runFreight(0)), /Grain train/);
await p.waitForFunction(() => { const t = window.__town.train(); return t.crossings.some(c => c.closed && c.down > 0.6); }, null, { timeout: 30000 });
const stopOnly = await p.evaluate(() => window.__town.trainColliders().filter(c => c.boom).length);
const t1 = await p.evaluate(() => window.__town.train());
const shut = t1.crossings.find(c => c.closed);
assert.ok(t1.freight && t1.freight.speedKmh > 0, 'freight moving: ' + JSON.stringify(t1.freight));
assert.equal(stopOnly, 0, 'McNamaras Lane has stop signs only: nothing physically blocks the road');
// Dandaloo Street has real half booms: run the player's train onto it.
await p.evaluate(() => { const c = window.__town.train().cab, nx = -Math.sin(c.heading), nz = Math.cos(c.heading); window.__town.place(c.x + nx * 3, c.z + nz * 3, 0); window.__town.trainBoard(); });
await p.keyboard.down('w'); await p.waitForTimeout(3000); await p.keyboard.up('w');
await p.waitForFunction(() => window.__town.train().crossings.find(c => c.ref === '717').down > 0.6, null, { timeout: 30000 });
assert.ok(await p.evaluate(() => window.__town.trainColliders().some(c => c.boom)), 'Dandaloo Street half booms block the road while a train moves nearby');

assert.deepEqual(errors, []);
await b.close();
console.log(`PASS freight and crossings: ${t0.crossings.length} crossings; ${t1.freight.id} running at ${t1.freight.speedKmh} km/h; ${shut.street} stop signs only; Dandaloo Street booms down for a moving train`);
