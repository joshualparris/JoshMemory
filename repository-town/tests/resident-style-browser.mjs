// Real Chromium: Settings → Resident style. Every style loads, residents near the player wear the
// chosen model (far ones keep the block figure), switching back to Classic removes every model,
// and the Settings panel lists each style with the current one checked.
//   node tests/resident-style-browser.mjs [--url u]
import { chromium } from 'playwright';
const URL = process.argv.includes('--url') ? process.argv[process.argv.indexOf('--url') + 1] : (process.env.TOWN_URL || 'http://localhost:8091/');
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const step = (ok, what) => { console.log((ok ? '✓ ' : '✗ ') + what); if (!ok) process.exitCode = 1; };
try {
  const page = await browser.newPage({ viewport: { width: 1000, height: 640 } }), errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route('**/api/npc-chat', (r) => r.abort('connectionrefused'));
  await page.goto(URL); await page.waitForFunction(() => window.__town && document.getElementById('loading').hidden, null, { timeout: 90000 });
  await page.evaluate(() => { window.__town.closePanel?.(); window.__town.residentStyle('classic'); window.__town.life.setTime(8 * 60 + 20); window.__town.life.run(15); });
  const spot = await page.evaluate(() => {
    const ps = window.__town.state().people.filter((x) => !x.inside); let best = null, bn = 0;
    for (const a of ps) { const n = ps.filter((q) => Math.hypot(q.x - a.x, q.z - a.z) < 12).length; if (n > bn) { bn = n; best = a; } }
    return best && { x: best.x, z: best.z };
  });
  step(!!spot, 'found residents out in the town at 08:35');
  for (const style of ['cartoon', 'mannequin', 'mannequin-grey']) {
    await page.evaluate((s) => window.__town.residentStyle(s), style);
    const ok = await page.evaluate(() => window.__town.residentStyleReady());
    await page.evaluate((sp) => window.__town.place(sp.x, sp.z + 7, 0), spot);
    await page.waitForFunction(() => window.__town.residentStyle().wearing > 0, null, { timeout: 8000 }).catch(() => {});
    const s = await page.evaluate(() => window.__town.residentStyle());
    step(ok && s.style === style && s.wearing > 0, `${style}: model loaded and ${s.wearing} nearby residents wear it`);
  }
  const total = await page.evaluate(() => window.__town.state().people.length);
  step((await page.evaluate(() => window.__town.residentStyle().wearing)) < total, 'residents far from the player keep the light block figure');
  await page.evaluate(() => window.__town.residentStyle('classic')); await page.waitForTimeout(300);
  step((await page.evaluate(() => window.__town.residentStyle().wearing)) === 0, 'Classic removes every model');
  await page.evaluate(() => document.getElementById('btn-settings').click());
  const ui = await page.evaluate(() => [...document.querySelectorAll('#resident-style-options button')].map((b) => ({ t: b.textContent, on: b.getAttribute('aria-checked') })));
  step(ui.length === 4 && ui.filter((b) => b.on === 'true').length === 1 && /Classic/.test(ui.find((b) => b.on === 'true').t), `Settings lists ${ui.length} resident styles with Classic checked`);
  await page.evaluate(() => [...document.querySelectorAll('#resident-style-options button')].find((b) => /Cartoon/.test(b.textContent)).click());
  await page.waitForFunction(() => /Cartoon on/.test(document.getElementById('resident-style-status').textContent), null, { timeout: 8000 }).catch(() => {});
  step(/Cartoon on/.test(await page.evaluate(() => document.getElementById('resident-style-status').textContent)), 'choosing Cartoon in Settings confirms it is on');
  step(await page.evaluate(() => localStorage.getItem('town-resident-style') === 'cartoon'), 'the choice is saved on this device');
  step(!errors.length, `no page errors ${errors.join('; ')}`);
} finally { await browser.close(); }
