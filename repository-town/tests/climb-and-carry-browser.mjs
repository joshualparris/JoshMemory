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
  // Outside: use the actual roof collider rather than assuming a fixed street
  // position or a certain number of rendered frames. At software-WebGL speeds a
  // 900 ms sidestep can advance only one frame and leave us in the door sensor.
  await page.evaluate(() => { window.__town.cheats.open(); document.getElementById('cheat-jump').value = '8'; window.__town.cheats.run('jump'); window.__town.cheats.close(); });
  const roofStart = await page.evaluate(() => {
    const t = window.__town;
    if (!t.travel('A1') || t.state().mode !== 'town') return null;
    const front = t.state().pos;
    // Check both solid wings beyond the doorway, keeping the house entrance open
    // and using measured collision tops, not a magic -153 world-Z threshold.
    for (const dx of [-5.2, 5.2, -4.3, 4.3, -3.6, 3.6]) {
      for (const back of [9, 10, 11, 12, 13, 14]) {
        const x = front.x + dx, roofZ = front.z - back;
        const roof = t.probeStatic(x, roofZ, 0.08);
        if (!Number.isFinite(roof?.top) || roof.top <= 3) continue;
        const startZ = roofZ + 3.0;
        if (t.probeStatic(x, startZ, 0.36)) continue;
        t.place(x, startZ, 0);
        return { x, startZ, roofZ, roofTop: roof.top, sideOffset: dx };
      }
    }
    return null;
  });
  step(!!roofStart, `found a solid A1 roof and clear outdoor jump approach (${JSON.stringify(roofStart)})`);
  if (roofStart) {
    await page.click('canvas');
    await page.keyboard.down('w');
    // Physically approach the solid wall from the front, without walking through
    // the entrance: movement is position-gated, independent of runner frame rate.
    const approached = await page.waitForFunction(
      ({ roofZ }) => {
        const s = window.__town.state();
        return s.mode === 'town' && s.pos.z < roofZ + 1.15;
      },
      { roofZ: roofStart.roofZ }, { timeout: 16000 }
    ).then(() => true).catch(() => false);
    step(approached, 'walked up to the real roof wall while staying outdoors');
    if (approached) {
      await page.keyboard.press('Space');
      // Release forward only when the player is genuinely over a physical roof;
      // otherwise continued motion walks straight off the far side.
      const reachedRoof = await page.waitForFunction(() => {
        const s = window.__town.state(), roof = window.__town.probeStatic(s.pos.x, s.pos.z, 0.08);
        return s.mode === 'town' && Number.isFinite(roof?.top) && roof.top > 3 && s.y > roof.top + 0.2;
      }, null, { timeout: 16000 }).then(() => true).catch(() => false);
      await page.keyboard.up('w');
      const landed = reachedRoof && await page.waitForFunction(() => {
        const s = window.__town.state(), roof = window.__town.probeStatic(s.pos.x, s.pos.z, 0.08);
        return s.mode === 'town' && Number.isFinite(roof?.top) && roof.top > 3 && Math.abs(s.y - roof.top) < 0.15;
      }, null, { timeout: 18000 }).then(() => true).catch(() => false);
      const landing = await page.evaluate(() => {
        const s = window.__town.state(), roof = window.__town.probeStatic(s.pos.x, s.pos.z, 0.08);
        return { mode: s.mode, x: s.pos.x, y: s.y, z: s.pos.z, roofTop: roof?.top ?? null };
      });
      step(reachedRoof, `cheat jump crossed the real roof surface (${JSON.stringify(landing)})`);
      step(landed, `physically landed on roof at matching height (${JSON.stringify(landing)})`);
    } else {
      await page.keyboard.up('w');
    }
  }
  step(!errors.length, `no page errors ${errors.join('; ')}`);
} finally { await browser.close(); }
