// Real browser check of St Mary's Anglican Church, Narromine: the porch doors outside are reachable
// and clear of the building, walking to them enters the nave, the pews, history and east-window
// plaques are there, the west doorway returns you to the porch, and a reload inside restores you.
//   node tests/narromine-st-marys-browser.mjs [--url u]
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const URL = process.argv.includes('--url') ? process.argv[process.argv.indexOf('--url') + 1] : (process.env.TOWN_URL || 'http://localhost:8091/');
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
try {
  const page = await browser.newPage({ viewport: { width: 1180, height: 760 } }), errors = [];
  page.on('pageerror', (e) => errors.push(String(e.message)));
  await page.route('**/api/npc-chat', (r) => r.abort('connectionrefused'));
  await page.goto(URL);
  await page.waitForFunction(() => window.__town && document.getElementById('loading')?.hidden, null, { timeout: 90000 });
  await page.evaluate(() => window.__town.closePanel?.());
  const e = await page.evaluate(() => window.__town.stMarysEntrance());
  assert(e.radius > 0, 'the porch door was located on the modelled church');
  assert(await page.evaluate((e) => !window.__town.probeStatic(e.outside.x, e.outside.z, 0.36) && !window.__town.probeStatic(e.x, e.z, 0.36), e), 'the path to the porch doors is clear of walls and fences');

  await page.evaluate((e) => window.__town.place(e.outside.x, e.outside.z, e.outside.yaw), e);
  await page.waitForTimeout(300);
  assert.equal((await page.evaluate(() => window.__town.state())).mode, 'town', 'standing on the path outside does not enter');
  await page.evaluate((e) => window.__town.place(e.x, e.z, e.yaw), e);
  await page.waitForFunction(() => window.__town.state().mode === 'house', null, { timeout: 12000 });
  let state = await page.evaluate(() => window.__town.state());
  assert.equal(state.coordinate, 'NARROMINE-ST-MARYS', 'walking to the porch doors enters St Mary\'s');
  for (const key of ['history', 'east-window', 'chancel-arch', 'model']) assert(state.interactables.some((x) => x.key === 'st-marys-anglican:' + key), 'has ' + key);

  assert(await page.evaluate(() => window.__town.approach('st-marys-anglican:history')), 'the foundation-stone plaque can be reached');
  await page.keyboard.press('e');
  await page.waitForFunction(() => /Foundation stones/.test(window.__town.state().panel?.title || ''), null, { timeout: 5000 });
  assert(/22 May 1929/.test(await page.evaluate(() => document.body.innerText)), 'history panel gives the sourced 1929 foundation date');
  await page.evaluate(() => window.__town.closePanel?.());

  // Walk the length of the tiled aisle to the communion rail without hitting anything.
  const aisle = await page.evaluate(() => { const out = []; for (let z = 3.4; z > -14.0; z -= 0.5) out.push(window.__town.probeStatic(0, z, 0.3)); return out; });
  assert(aisle.every((hit) => !hit), 'the centre aisle is open from the door to the communion rail');
  assert(await page.evaluate(() => window.__town.probeStatic(2.6, -14.6, 0.3)), 'the communion rail is solid either side of its gate');

  await page.evaluate(() => window.__town.place(0, 5.1, Math.PI));
  await page.waitForFunction(() => window.__town.state().mode === 'town', null, { timeout: 12000 });
  state = await page.evaluate(() => window.__town.state());
  assert(Math.hypot(state.pos.x - e.returnPose.x, state.pos.z - e.returnPose.z) < 0.2, 'leaving returns you to the porch path');
  assert(await page.evaluate(() => !window.__town.probeStatic(window.__town.state().pos.x, window.__town.state().pos.z, 0.36)), 'the return spot is clear');

  await page.evaluate((e) => window.__town.place(e.x, e.z, e.yaw), e);
  await page.waitForFunction(() => window.__town.state().coordinate === 'NARROMINE-ST-MARYS', null, { timeout: 12000 });
  await page.reload();
  await page.waitForFunction(() => window.__town && document.getElementById('loading')?.hidden, null, { timeout: 90000 });
  assert.equal((await page.evaluate(() => window.__town.state())).coordinate, 'NARROMINE-ST-MARYS', 'reload restores you inside the church');
  await page.evaluate(() => window.__town.place(0, 5.15, Math.PI));
  await page.waitForFunction(() => window.__town.state().mode === 'town', null, { timeout: 12000 });
  assert(!errors.length, 'no page errors: ' + errors.join('; '));
  console.log("PASS St Mary's: porch entry, sourced history plaque, open aisle, solid rail, exit to the porch path, reload");
} finally { await browser.close(); }
