// Real Chromium: summoning several cheat vehicles in the same place parks each on its own clear
// spot, and every model (sedan, Ferrari-style supercar, GT, muscle car, motorbike) drives off
// instead of sitting at 0 km/h with the engine revving.
//   node tests/cheat-cars-browser.mjs [--url u]
import { chromium } from 'playwright';
const URL = process.argv.includes('--url') ? process.argv[process.argv.indexOf('--url') + 1] : (process.env.TOWN_URL || 'http://localhost:8091/');
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const step = (ok, what) => { console.log((ok ? '✓ ' : '✗ ') + what); if (!ok) process.exitCode = 1; };
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } }), errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(() => sessionStorage.setItem('town-cheats', '1'));
  await page.route('**/api/npc-chat', (r) => r.abort('connectionrefused'));
  await page.goto(URL); await page.waitForFunction(() => window.__town && document.getElementById('loading').hidden, null, { timeout: 90000 });
  await page.evaluate(() => window.__town.closePanel?.());
  const parked = [];
  for (const model of ['sedan', 'supercar', 'gt', 'muscle', 'motorbike']) {
    // Every summon from the same spot: the old cheat stacked each new car on the previous one.
    const r = await page.evaluate((m) => {
      if (window.__town.state().driving) window.__town.leaveVehicle();
      window.__town.cheats.open(); window.__town.cheats.run('goNew');
      document.getElementById('cheat-vehicle').value = m; window.__town.cheats.run('carHere'); window.__town.cheats.close();
      return { driving: window.__town.state().driving, pos: window.__town.state().pos };
    }, model);
    parked.push(r.pos);
    await page.click('canvas'); await page.keyboard.down('w');
    const out = await page.evaluate(() => { const p0 = window.__town.state().pos; for (let i = 0; i < 90; i++) window.__town.stepVehicle(1 / 30); const p1 = window.__town.state().pos; return { moved: Math.hypot(p1.x - p0.x, p1.z - p0.z) }; });
    await page.keyboard.up('w');
    await page.evaluate(() => { for (let i = 0; i < 150; i++) window.__town.stepVehicle(1 / 30); });
    step(!!r.driving && out.moved > 5, `${model}: summoned at ${r.pos.x.toFixed(0)},${r.pos.z.toFixed(0)} and drove ${out.moved.toFixed(1)} m`);
  }
  // Summon twice from the same spot without driving: the second car must park clear of the first.
  const gap = await page.evaluate(() => {
    if (window.__town.state().driving) window.__town.leaveVehicle();
    window.__town.cheats.open(); window.__town.cheats.run('goNew');
    window.__town.cheats.run('car'); window.__town.cheats.run('car'); window.__town.cheats.close();
    const cars = window.__town.life.ledger().civic.motor.owned.filter((v) => v.cheat).slice(-2);
    return Math.hypot(cars[0].x - cars[1].x, cars[0].z - cars[1].z);
  });
  step(gap >= 6, `two cars summoned in the same place park ${gap.toFixed(1)} m apart, not on top of each other`);
  step(!errors.length, `no page errors ${errors.join('; ')}`);
} finally { await browser.close(); }
