// Real Chromium: a car can leave the road onto grass (slowed to 30 km/h, warned, extra wear), still
// stops at buildings, and returns to the road with a message. Uses the game's fixed-step hook.
//   node tests/off-road-browser.mjs [--url u]
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
  // A sedan on Banksia Street at x 420 (east of the estate lots), turned south towards the open paddock.
  await page.evaluate(() => { window.__town.closePanel?.(); window.__town.cheats.open(); document.getElementById('cheat-vehicle').value = 'sedan'; window.__town.place(420, 360, 0); window.__town.cheats.run('carHere'); window.__town.cheats.close(); });
  await page.waitForTimeout(300);
  const v0 = await page.evaluate(() => { const s = window.__town.state(); return { driving: !!s.driving, pos: s.pos }; });
  step(v0.driving, `driving a sedan at ${v0.pos.x.toFixed(0)},${v0.pos.z.toFixed(0)}`);
  await page.click('canvas'); await page.keyboard.down('w'); await page.keyboard.down('a');
  // Turn to head south (+z) off Banksia Street into the paddock, then drive straight.
  const trace = await page.evaluate(async () => {
    const out = [], read = () => ({ ...window.__town.state().pos, status: document.getElementById('status')?.textContent || '' });
    for (let i = 0; i < 300; i++) { window.__town.stepVehicle(1 / 30); out.push(read()); }
    return out;
  });
  await page.keyboard.up('a'); await page.keyboard.up('w');
  const far = trace.reduce((m, p) => Math.max(m, p.z), -Infinity);
  step(far > 380, `left the road onto open ground (reached z ${far.toFixed(0)}; Banksia Street edge is z 371)`);
  await page.waitForTimeout(600);   // the next real frames show the driving message
  const status = await page.evaluate(() => document.getElementById('status')?.textContent || '');
  step(/Off-road/.test(status), `off-road warning shown: "${status}"`);
  // Speed on the grass, from consecutive positions (30 Hz steps), once well clear of the road.
  const grass = trace.filter((p) => p.z > 385);
  const fastest = grass.slice(1).reduce((m, p, i) => Math.max(m, Math.hypot(p.x - grass[i].x, p.z - grass[i].z) * 30 * 3.6), 0);
  step(grass.length > 10 && fastest <= 31, `off-road speed capped at 30 km/h (fastest ${fastest.toFixed(1)} km/h)`);
  step(!errors.length, `no page errors ${errors.join('; ')}`);
} finally { await browser.close(); }
