// Real Chromium: walk into a house, pick up a loose object, carry it (it follows the player), put it
// down somewhere else; then outside, set the cheat jump to 8 m and land on a house roof.
//   node tests/climb-and-carry-browser.mjs [--url u]
import { chromium } from 'playwright';
const URL = process.argv.includes('--url') ? process.argv[process.argv.indexOf('--url') + 1] : (process.env.TOWN_URL || 'http://localhost:8091/');
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const step = (ok, what) => { console.log((ok ? '✓ ' : '✗ ') + what); if (!ok) process.exitCode = 1; };
const leaveHouse = async (page) => { await page.evaluate(() => window.__town.toExit()); await page.keyboard.down('w'); await page.waitForFunction(() => window.__town.state().mode === 'town', null, { timeout: 8000 }).catch(() => {}); await page.keyboard.up('w'); };
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } }), errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(() => sessionStorage.setItem('town-cheats', '1'));
  await page.route('**/api/npc-chat', (r) => r.abort('connectionrefused'));
  await page.goto(URL); await page.waitForFunction(() => window.__town && document.getElementById('loading').hidden, null, { timeout: 90000 });
  await page.evaluate(() => window.__town.closePanel?.());
  const coords = await page.evaluate(() => (typeof window.__town.houses === 'function' ? window.__town.houses() : window.__town.houses).map((h) => h.coordinate || h));
  let carryKey = null, coord = null;
  for (const c of coords.slice(0, 40)) {
    await page.evaluate((x) => window.__town.travel(x), c); await page.waitForTimeout(150);
    await page.click('canvas'); await page.keyboard.down('w');
    await page.waitForFunction(() => window.__town.state().mode === 'house', null, { timeout: 9000 }).catch(() => {});
    await page.keyboard.up('w');
    carryKey = await page.evaluate(() => window.__town.state().interactables?.find((i) => i.key?.startsWith('carry:'))?.key || null);
    if (carryKey) { coord = c; break; }
    await leaveHouse(page);
  }
  step(!!carryKey, `found a house with a loose object to pick up (${coord}: ${carryKey})`);
  if (carryKey) {
    const before = await page.evaluate((k) => window.__town.thing(k), carryKey);
    await page.evaluate((k) => window.__town.approach(k), carryKey);
    await page.keyboard.press('e'); await page.waitForTimeout(600);
    await page.waitForFunction(() => /Put down/.test(document.getElementById('prompt').textContent), null, { timeout: 4000 }).catch(() => {});
    let prompt = await page.evaluate(() => document.getElementById('prompt').textContent);
    step(/Put down/.test(prompt) && (await page.evaluate((k) => window.__town.thing(k), carryKey))?.carried, `picked it up: "${prompt}"`);
    // Turn round and walk a couple of metres while carrying.
    await page.keyboard.down('s'); await page.waitForTimeout(700); await page.keyboard.up('s');
    await page.keyboard.press('e');
    await page.waitForFunction((k) => window.__town.thing(k) && !window.__town.thing(k).carried, carryKey, { timeout: 4000 }).catch(() => {});
    const after = await page.evaluate((k) => window.__town.thing(k), carryKey);
    step(!!after && !after.carried && Math.hypot(after.x - before.x, after.z - before.z) > 0.5, `put it down somewhere else (moved ${after ? Math.hypot(after.x - before.x, after.z - before.z).toFixed(2) : '?'} m)`);
    await leaveHouse(page);
  }
  // Outside: big cheat jump onto a house roof.
  await page.evaluate(() => { window.__town.cheats.open(); document.getElementById('cheat-jump').value = '8'; window.__town.cheats.run('jump'); window.__town.cheats.close(); });
  await page.evaluate(() => window.__town.travel('A1')); await page.waitForTimeout(200);
  // Step sideways away from the doorway so the jump meets solid wall and roof, then jump forward.
  await page.click('canvas'); await page.keyboard.down('d'); await page.waitForTimeout(900); await page.keyboard.up('d');
  await page.keyboard.down('w'); await page.waitForFunction(() => window.__town.state().pos.z < -153, null, { timeout: 8000 }).catch(() => {}); await page.keyboard.press('Space');
  let top = 0; const trace = []; for (let i = 0; i < 25; i++) { await page.waitForTimeout(100); const s = await page.evaluate(() => ({ y: window.__town.state().y, z: window.__town.state().pos.z })); trace.push(s.y.toFixed(1) + '@' + s.z.toFixed(1)); top = Math.max(top, s.y); }
  await page.keyboard.up('w');
  await page.waitForTimeout(800);
  const landed = await page.evaluate(() => window.__town.state().y);
  step(top > 4, `cheat jump reaches ${top.toFixed(1)} m`);
  step(landed > 4, `landed on the house roof (standing ${landed.toFixed(2)} m up)`);
  step(!errors.length, `no page errors ${errors.join('; ')}`);
} finally { await browser.close(); }
