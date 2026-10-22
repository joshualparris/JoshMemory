// Real-browser check that leaving a building never traps the player.
// Walks in through the front door, walks out through the exit like a player, then checks the
// ground around the exit point (including live truck colliders) connects to open street.
//   node tests/exit-stuck.mjs [--url u] [--rows 8] [--shops] [--houses] [--all] [--times 7,12,18]
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const URL = opt('--url', 'http://localhost:8091/');
const ROWS = opt('--rows', '1,8').split(',').map(Number);
const TIMES = opt('--times', '7,12,18').split(',').map(Number);
const ALL = args.includes('--all');
const ONLY = opt('--only', '') ? opt('--only', '').split(',') : null;   // restrict shops to these ids
const DO_SHOPS = ALL || args.includes('--shops') || !args.includes('--houses');
const DO_HOUSES = ALL || args.includes('--houses') || !args.includes('--shops');

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 900, height: 560 }, locale: 'en-US' });
const problems = [];
page.on('pageerror', (e) => problems.push(`page error: ${e.message}`));
await page.goto(URL);
await page.waitForFunction(() => window.__town && document.getElementById('loading').hidden, null, { timeout: 90000 });
await page.evaluate(() => { window.__town.life.speed(1); });
const st = () => page.evaluate(() => window.__town.state());

// Walk (hold W) until the predicate on state() holds or the time runs out.
async function walkUntil(pred, ms) {
  await page.keyboard.down('w');
  const t0 = Date.now(); let s = await st();
  while (Date.now() - t0 < ms && !pred(s)) { await page.waitForTimeout(120); s = await st(); }
  await page.keyboard.up('w');
  return s;
}

// Breadth-first search over the live collision world from the player's spot.
const reach = () => page.evaluate(() => {
  const s = window.__town.state(), step = 0.5, R = 30;
  const x0 = s.pos.x, z0 = s.pos.z; if (window.__town.probe(x0, z0)) return { inside: true, reach: 0, cells: 0 };
  const seen = new Set(['0,0']), q = [[0, 0]]; let max = 0;
  for (let i = 0; i < q.length; i++) {
    const [gx, gz] = q[i]; max = Math.max(max, Math.hypot(gx, gz) * step);
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = gx + dx, nz = gz + dz, k = nx + ',' + nz;
      if (seen.has(k) || Math.hypot(nx, nz) * step > R) continue;
      if (window.__town.probe(x0 + nx * step, z0 + nz * step)) continue;
      seen.add(k); q.push([nx, nz]);
    }
  }
  return { inside: false, reach: max, cells: q.length };
});

async function setClock(hour) { await page.evaluate((h) => window.__town.life.setTime(h * 60), hour); await page.evaluate(() => window.__town.life.run(20)); }

async function exitCheck(label, enterFn, awayYaw = Math.PI) {
  // Get inside: stand at the doorstep facing the door and walk in.
  await enterFn();
  let s = await st();
  if (s.mode !== 'house') { problems.push(`${label}: could not walk in (mode ${s.mode})`); return; }
  await page.evaluate(() => window.__town.toExit());
  s = await walkUntil((q) => q.mode === 'town', 6000);
  if (s.mode !== 'town') { problems.push(`${label}: walked at the exit for 6 s but never left (pos ${s.pos.x.toFixed(1)}, ${s.pos.z.toFixed(1)})`); await page.evaluate(() => window.__town.exitShop?.()); return; }
  const out = { x: s.pos.x, z: s.pos.z };
  const r = await reach();
  if (r.inside) problems.push(`${label}: placed INSIDE a collider at (${out.x.toFixed(1)}, ${out.z.toFixed(1)})`);
  else if (r.reach < 20) problems.push(`${label}: boxed in after exit — only ${r.reach.toFixed(1)} m of open ground (${r.cells} cells) at (${out.x.toFixed(1)}, ${out.z.toFixed(1)})`);
  // Does a player who keeps walking get re-pulled inside, or stall? Walk ahead then sideways.
  await page.evaluate(([x, z, y]) => window.__town.place(x, z, y), [out.x, out.z, awayYaw]);
  // Software rendering can run at a few frames a second (movement is dt-clamped), so wait for real
  // progress — up to 8 s — rather than judging by a fixed 1.5 s.
  await page.keyboard.down('w');
  for (let i = 0; i < 65; i++) { await page.waitForTimeout(120); s = await st(); if (s.mode !== 'town' || Math.hypot(s.pos.x - out.x, s.pos.z - out.z) > 3) break; }
  await page.keyboard.up('w');
  s = await st();
  if (s.mode !== 'town') problems.push(`${label}: re-entered the building by itself after leaving`);
  else if (Math.hypot(s.pos.x - out.x, s.pos.z - out.z) < 3) {
    // A delivery truck standing in the lane ahead is an ordinary obstacle: the player must be able
    // to step along the footpath instead. Only flag a spot where sideways escape fails as well.
    let escaped = false;
    for (const yaw of [Math.PI / 2, -Math.PI / 2]) {
      await page.evaluate(([x, z, y]) => window.__town.place(x, z, y), [out.x, out.z, yaw]);
      await page.keyboard.down('w'); await page.waitForTimeout(2500); await page.keyboard.up('w');
      const q = await st(); if (q.mode === 'town' && Math.hypot(q.pos.x - out.x, q.pos.z - out.z) > 3) escaped = true;
    }
    if (!escaped) problems.push(`${label}: stuck — walking forward for 8 s only moved ${Math.hypot(s.pos.x - out.x, s.pos.z - out.z).toFixed(2)} m from exit and could not sidestep either`);
  }
}

const t0 = Date.now(); let checked = 0;
for (const hour of TIMES) {
  await setClock(hour);
  if (DO_SHOPS) {
    for (const sh of (await page.evaluate(() => window.__town.shops())).filter((x) => !ONLY || ONLY.includes(x.id))) {
      await exitCheck(`${sh.id}@${hour}h`, async () => {
        await page.evaluate((id) => window.__town.goPlace(id), sh.id);
        await walkUntil((q) => q.mode === 'house', 5000);
      }, sh.side === 'south' ? 0 : Math.PI);
      checked++;
    }
  }
  if (DO_HOUSES) {
    const coords = (await page.evaluate(() => window.__town.houses.map((h) => h.coordinate))).filter((c) => ALL || ROWS.includes(Number(c.slice(1))) || (args.includes('--edge') && 'AZ'.includes(c[0])));
    for (const c of coords) {
      await exitCheck(`${c}@${hour}h`, async () => {
        await page.evaluate((c) => window.__town.travel(c), c);
        await walkUntil((q) => q.mode === 'house', 5000);
      });
      checked++;
    }
  }
}
await browser.close();
console.log(JSON.stringify({ checked, seconds: Math.round((Date.now() - t0) / 1000), problems }, null, 2));
process.exit(problems.length ? 1 : 0);
