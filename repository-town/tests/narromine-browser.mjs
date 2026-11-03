// Real Chromium: drive a sedan west from the end of Street 4 along the Mitchell Highway to Narromine.
// The road stays driveable the whole way, the open highway allows 100 km/h, the trip takes about
// 90 s of game time, Narromine is hidden in Repository Town and shown on arrival, and the Royal
// Hotel on Dandaloo Street gives its sourced fact. Search "Narromine" also teleports there.
//   node tests/narromine-browser.mjs [--url u]
import { chromium } from 'playwright';
const URL = process.argv.includes('--url') ? process.argv[process.argv.indexOf('--url') + 1] : (process.env.TOWN_URL || 'http://localhost:8091/');
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const step = (ok, what) => { console.log((ok ? '✓ ' : '✗ ') + what); if (!ok) process.exitCode = 1; };
try {
  const page = await browser.newPage({ viewport: { width: 1100, height: 700 } }), errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(() => sessionStorage.setItem('town-cheats', '1'));
  await page.route('**/api/npc-chat', (r) => r.abort('connectionrefused'));
  await page.goto(URL); await page.waitForFunction(() => window.__town && document.getElementById('loading').hidden, null, { timeout: 90000 });
  // A sedan at the west end of Street 4 (z -7), facing west (yaw +π/2 heads -x in this game).
  await page.evaluate(() => { window.__town.closePanel?.(); window.__town.life.setTime(10 * 60); window.__town.cheats.open(); document.getElementById('cheat-vehicle').value = 'sedan'; window.__town.place(-330, -7, Math.PI / 2); window.__town.cheats.run('carHere'); window.__town.cheats.close?.(); });
  await page.waitForTimeout(300);
  const start = await page.evaluate(() => { const s = window.__town.state(); return { driving: !!s.driving, pos: s.pos, hidden: !window.__town.narromineVisible() }; });
  step(start.driving, `driving a sedan at ${start.pos.x.toFixed(0)},${start.pos.z.toFixed(0)}`);
  step(start.hidden, 'Narromine is not drawn while in Repository Town');
  await page.click('canvas'); await page.keyboard.down('w');
  const trip = await page.evaluate(async () => {
    const out = { seconds: 0, maxKmh: 0, offRoad: 0, end: null, minZ: 1e9, maxZ: -1e9 }; let last = { ...window.__town.state().pos };
    while (out.seconds < 240) {
      window.__town.stepVehicle(1 / 30); out.seconds += 1 / 30;
      const p = window.__town.state().pos, kmh = Math.hypot(p.x - last.x, p.z - last.z) * 30 * 3.6; last = { ...p };
      out.maxKmh = Math.max(out.maxKmh, kmh); out.minZ = Math.min(out.minZ, p.z); out.maxZ = Math.max(out.maxZ, p.z);
      if (!window.__town.onRoad(p.x, p.z)) out.offRoad++;
      if (p.x < -2872) break;   // the real Mitchell Highway starts at x -2870
    }
    out.end = { ...window.__town.state().pos };
    return out;
  });
  await page.keyboard.up('w');
  step(trip.end.x < -2872, `reached Narromine's edge, where the real Mitchell Highway begins (x ${trip.end.x.toFixed(0)}), in ${trip.seconds.toFixed(0)} s`);
  step(trip.seconds > 70 && trip.seconds < 130, `the trip takes about 90 s (${trip.seconds.toFixed(0)} s)`);
  step(trip.maxKmh > 90 && trip.maxKmh < 102, `open highway allows 100 km/h (top ${trip.maxKmh.toFixed(0)} km/h)`);
  step(trip.offRoad === 0, `stayed on a driveable road all the way (${trip.offRoad} off-road steps; z ${trip.minZ.toFixed(1)}..${trip.maxZ.toFixed(1)})`);
  // Software WebGL may need several frames to build/show the now-detailed real town.
  await page.waitForFunction(() => window.__town.narromineVisible(), null, { timeout: 12000 }).catch(() => {});
  step(await page.evaluate(() => window.__town.narromineVisible()), 'Narromine is drawn on arrival');
  // Park, get out and read the Royal Hotel's fact at its door.
  await page.evaluate(() => { for (let i = 0; i < 90; i++) window.__town.stepVehicle(1 / 30); window.__town.leaveVehicle(); });
  await page.evaluate(() => { const r = window.__town.narrominePlace('Royal Hotel'); window.__town.place(r.x + 2.2, r.z, Math.PI / 2); });   // beside the mapped Royal Hotel, facing it (-x)
  await page.waitForFunction(() => /Royal Hotel/.test(document.getElementById('prompt').textContent), null, { timeout: 5000 }).catch(() => {});
  step(/Royal Hotel/.test(await page.evaluate(() => document.getElementById('prompt').textContent)), 'the Royal Hotel offers its prompt');
  await page.keyboard.press('e');
  await page.waitForFunction(() => /1890/.test(document.getElementById('panel-body').textContent), null, { timeout: 4000 }).catch(() => {});
  step(/1890/.test(await page.evaluate(() => document.getElementById('panel-body').textContent)), 'its panel gives the sourced 1890 Cobb & Co fact');
  // Search fast-travels too.
  await page.evaluate(() => { window.__town.closePanel?.(); window.__town.place(0, 0, 0); });
  await page.fill('#search', 'Narromine'); await page.evaluate(() => document.getElementById('search-form').requestSubmit());
  await page.waitForTimeout(300);
  const after = await page.evaluate(() => window.__town.state().pos);
  const royal = await page.evaluate(() => window.__town.narrominePlace('Royal Hotel'));
  step(Math.hypot(after.x - royal.x, after.z - royal.z) < 30, `search "Narromine" lands on Dandaloo Street by the Royal Hotel (${after.x.toFixed(0)},${after.z.toFixed(0)})`);
  await page.screenshot({ path: process.env.SHOT || '/dev/null' }).catch(() => {});
  step(!errors.length, `no page errors ${errors.join('; ')}`);
} finally { await browser.close(); }
