// Live scene verification in Chromium; desktop + mobile viewport:
// the player must physically walk from the Dandaloo end through the open-air
// Kierath's courtyard to the rear car park (not just teleport or inspect JSON).
// Usage: node tests/narromine-kieraths-browser.mjs [--mobile] [--url http://localhost:8091/]
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright';
const mobile = process.argv.includes('--mobile');
const index = process.argv.indexOf('--url');
const url = index >= 0 ? process.argv[index + 1] : process.env.TOWN_URL || 'http://localhost:8091/';
const folder = 'test-results/kieraths';
fs.mkdirSync(folder, { recursive: true });
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
try {
  const page = await browser.newPage(mobile
    ? { viewport: { width: 393, height: 852 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 }
    : { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(() => sessionStorage.setItem('town-cheats', '1'));
  await page.route('**/api/npc-chat', r => r.abort('connectionrefused'));
  await page.goto(url);
  await page.waitForFunction(() => window.__town && document.getElementById('loading').hidden, null, { timeout: 90000 });
  const geo = await page.evaluate(async () => {
    const { KIERATHS_ROUTE, KIERATHS_SHOPS, siteToGeo } = await import('./world/narromine-kieraths-data.js');
    const { geoToWorld } = await import('./world/narromine-layout.js');
    return { route: [...KIERATHS_ROUTE].reverse().map(p => geoToWorld(...siteToGeo(p))), shops: KIERATHS_SHOPS.length };
  });
  assert.equal(geo.shops, 7, 'seven separate exterior shop polygons; M01 includes 5–7');
  await page.evaluate(([x, z]) => {
    window.__town.closePanel?.();
    window.__town.life.setTime(12 * 60);
    window.__town.place(x, z, Math.PI / 2);
  }, geo.route[0]);
  await page.waitForTimeout(750);
  const start = await page.evaluate(() => ({ visible: window.__town.narromineVisible(), state: window.__town.state() }));
  assert(start.visible, 'Narromine scene is actually visible, not just defined in data');
  assert(start.state.triangles > 1000, 'the live WebGL scene drew geometry');
  await page.screenshot({ path: `${folder}/${mobile ? 'mobile' : 'desktop'}-dandaloo.png` });
  for (let i = 1; i < geo.route.length; i++) {
    const dest = geo.route[i];
    const status = await page.evaluate(([x, z]) => window.__town.walkTo(x, z), dest);
    assert.equal(status, null, `the game accepted a walk to waypoint ${i} (${status})`);
    await page.waitForFunction(([x, z]) => {
      const p = window.__town.state().pos;
      return Math.hypot(p.x - x, p.z - z) < 1.1;
    }, dest, { timeout: 26000 });
    const p = await page.evaluate(() => window.__town.state().pos);
    assert(Math.hypot(p.x - dest[0], p.z - dest[1]) < 1.1, 'player physically reached waypoint ' + i);
    if (i === 4 || i === geo.route.length - 1)
      await page.screenshot({ path: `${folder}/${mobile ? 'mobile' : 'desktop'}-${i === 4 ? 'courtyard' : 'rear-canopy'}.png` });
  }
  // Turn around without changing position at the rear: verify the historically
  // documented red/yellow shutter and the canopy as approached from the car park.
  await page.evaluate(([x, z]) => window.__town.place(x, z, -Math.PI / 2), geo.route.at(-1));
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${folder}/${mobile ? 'mobile' : 'desktop'}-rear-looking-in.png` });
  assert.deepEqual(errors, [], 'no browser page errors while walking arcade');
  console.log(`PASS Kierath's Shopping Square ${mobile ? 'mobile' : 'desktop'}: 7 distinct exterior units; live WebGL; ${geo.route.length-1} physically walked segments; front/courtyard/rear screenshots; no page errors`);
} finally { await browser.close(); }
