// node tests/footsteps.mjs [--url http://localhost:8091/] — footsteps follow the ground underfoot,
// splash when it rains, land from jumps, and the shop bell / weather sound code runs without errors.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const args = process.argv.slice(2), URL = args.includes('--url') ? args[args.indexOf('--url') + 1] : 'http://localhost:8091/';
const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage({ viewport: { width: 900, height: 600 } });
const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
await p.addInitScript(() => localStorage.setItem('repository-town.sound', 'on'));
await p.goto(URL); await p.waitForFunction(() => window.__town && document.getElementById('loading').hidden, null, { timeout: 90000 });
await p.keyboard.press('Shift'); await p.waitForTimeout(1500);
const dbg = () => p.evaluate(() => window.__town.state().soundDebug);
async function walk(label, x, z, yaw, want, secs = 6) {
  await p.evaluate(([x, z, y]) => window.__town.place(x, z, y), [x, z, yaw]); await p.waitForTimeout(400);
  const before = (await dbg()).steps;
  await p.keyboard.down('w'); await p.waitForTimeout(secs * 1000); await p.keyboard.up('w');
  const after = await dbg();
  console.log(label.padEnd(22), 'steps', after.steps - before, 'surface', after.surface, 'wet', after.wet);
  assert(after.steps - before >= 1, label + ': steps are made while walking');
  assert.equal(after.surface, want, label + ': surface');
}
const ROAD1 = 1 * 46 - 3.5 * 46 + 16;                   // street 2 (z of the carriageway centre), a quiet one
// walk along x so we stay on the same band
await walk('asphalt (street)', -60, ROAD1, -Math.PI / 2, 'asphalt');
await walk('concrete (footpath)', -60, ROAD1 - 5.3, -Math.PI / 2, 'concrete');
await walk('grass (front lawn)', -60, ROAD1 - 14, -Math.PI / 2, 'grass');
await walk('dirt (farm field)', -60, 7 * 46 - 3.5 * 46 + 16 + 8 + 12, -Math.PI / 2, 'dirt');
// a jump lands with a thump
await p.evaluate(() => window.__town.place(-60, 1 * 46 - 3.5 * 46 + 2, 0)); await p.waitForTimeout(300);
const l0 = (await dbg()).landings; await p.keyboard.press('Space'); await p.waitForTimeout(1500);
const l1 = (await dbg()).landings; console.log('landings', l1 - l0); assert(l1 > l0, 'a jump produces a landing thump');
// indoors: tile and timber
await p.evaluate(() => window.__town.enterShop('cafe')); await p.waitForTimeout(800);
await p.keyboard.down('w'); await p.waitForTimeout(6000); await p.keyboard.up('w');
let d = await dbg(); console.log('cafe floor', d.surface); assert.equal(d.surface, 'tile');
await p.evaluate(() => window.__town.exitShop()); await p.waitForTimeout(500);
await p.evaluate(() => window.__town.enterShop('pub')); await p.waitForTimeout(800);
await p.keyboard.down('w'); await p.waitForTimeout(6000); await p.keyboard.up('w');
d = await dbg(); console.log('pub floor', d.surface); assert.equal(d.surface, 'timber');
await p.evaluate(() => window.__town.exitShop());

// weather and time of day: rain makes footsteps wet; every weather and part of the day runs without errors
await p.evaluate(() => { window.__town.life.setWeather('rainy'); window.__town.life.setTime(12 * 60); });
await walk('concrete in the rain', -60, ROAD1 - 5.3, -Math.PI / 2, 'concrete');
assert.equal((await dbg()).wet, true, 'footsteps are wet in the rain');
for (const [w, mins] of [['rainy', 5 * 60 + 30], ['windy', 14 * 60], ['cloudy', 20 * 60], ['sunny', 23 * 60], ['sunny', 6 * 60]]) {
  await p.evaluate(([w, m]) => { window.__town.life.setWeather(w); window.__town.life.setTime(m); }, [w, mins]);
  await p.keyboard.down('w'); await p.waitForTimeout(3500); await p.keyboard.up('w');
  console.log('weather', w, 'at', mins / 60);
}
await p.evaluate(() => window.__town.life.setWeather('sunny'));
assert.deepEqual(errs, [], 'no page errors: ' + errs.slice(0, 3).join(' | '));
await b.close();
console.log('PASS: footsteps change with surface (asphalt, concrete, grass, dirt, tile, timber), jumps land, no errors');
