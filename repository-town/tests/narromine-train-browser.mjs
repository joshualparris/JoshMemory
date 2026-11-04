// Drive the Narromine grain train: walk up, board, power along the yard loop, keep under the yard
// limit, brake to a stop, step down; the parked train blocks walking; screenshots desktop + phone.
//   node tools/serve.mjs dist/public 8091 && node tests/narromine-train-browser.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium, devices } from 'playwright';
const URL = process.env.TOWN_URL || 'http://127.0.0.1:8091/';
fs.mkdirSync('test-results', { recursive: true });
const browser = await chromium.launch();
for (const [name, opts] of [['desktop', { viewport: { width: 1280, height: 800 } }], ['android', devices['Pixel 7']]]) {
  const ctx = await browser.newContext(opts), page = await ctx.newPage(), errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(URL);
  await page.waitForFunction(() => window.__town?.train, null, { timeout: 90000 });
  const t0 = await page.evaluate(() => window.__town.train());
  assert.ok(t0.track.sleepers > 12000 && t0.track.railSegments > 100, 'sleepers and rails on the mapped lines: ' + JSON.stringify(t0.track));
  assert.equal(t0.cars, 7, 'locomotive and six grain hoppers');
  // The train is solid: standing on the loco's centre is blocked.
  const blocked = await page.evaluate(() => { const c = window.__town.train().cab; return window.__town.probeWithMoving(c.x, c.z, 0.4); });
  assert.ok(blocked, 'the parked train blocks walking');
  // Walk up to the cab and board.
  await page.evaluate(() => { const c = window.__town.train().cab, nx = -Math.sin(c.heading), nz = Math.cos(c.heading); window.__town.place(c.x + nx * 3, c.z + nz * 3, 0); });
  await page.waitForFunction(() => window.__town.trainNear(), null, { timeout: 5000 });
  assert.match(await page.evaluate(() => window.__town.trainBoard()), /cab/);
  const start = await page.evaluate(() => window.__town.train().head);
  // Power for a few seconds with W, then brake with S.
  await page.keyboard.down('w'); await page.waitForTimeout(6000); await page.keyboard.up('w');
  const moving = await page.evaluate(() => window.__town.train());
  assert.ok(moving.speedKmh >= 3, 'train accelerates: ' + moving.speedKmh);
  assert.ok(moving.limitKmh === 25, 'yard limit applies on the loop: ' + moving.limitKmh);
  assert.match(await page.textContent('#prompt'), /km\/h · limit 25/);
  await page.screenshot({ path: `test-results/narromine-train-${name}.png` });
  await page.keyboard.down('s'); await page.waitForFunction(() => window.__town.train().speedKmh === 0, null, { timeout: 30000 }); await page.keyboard.up('s');
  const stopped = await page.evaluate(() => window.__town.train().head);
  assert.ok(Math.hypot(stopped.x - start.x, stopped.z - start.z) > 3, 'train moved along the track');
  assert.match(await page.evaluate(() => window.__town.trainExit()), /stepped down/);
  assert.equal(await page.evaluate(() => window.__town.train().driving), false);
  assert.deepEqual(errors, [], name + ' page errors');
  console.log(`  ${name}: drove ${Math.round(Math.hypot(stopped.x - start.x, stopped.z - start.z))} m at up to ${moving.speedKmh} km/h on the ${moving.line}`);
  await ctx.close();
}
await browser.close();
console.log('PASS Narromine grain train: board, drive, yard limit, brake, step down, solid when parked, desktop + phone');
