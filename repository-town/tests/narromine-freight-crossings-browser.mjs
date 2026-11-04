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
assert.match(await p.evaluate(() => window.__town.runFreight(0)), /Grain train/);
await p.waitForFunction(() => { const t = window.__town.train(); return t.crossings.some(c => c.closed && c.down > 0.6); }, null, { timeout: 30000 });
const t1 = await p.evaluate(() => window.__town.train());
const shut = t1.crossings.find(c => c.closed);
assert.ok(t1.freight && t1.freight.speedKmh > 0, 'freight moving: ' + JSON.stringify(t1.freight));
const boomBlocks = await p.evaluate(() => window.__town.trainColliders().some(c => c.boom));
assert.ok(boomBlocks, 'lowered booms block the road');
assert.deepEqual(errors, []);
await b.close();
console.log(`PASS freight and crossings: ${t0.crossings.length} crossings; ${t1.freight.id} running at ${t1.freight.speedKmh} km/h; ${shut.street} booms down`);
