// Walks the whole town on foot: every street's sidewalks and every avenue, holding
// W (and Shift to run) like a player. Reports anywhere the walker gets stuck or ends up
// inside a collider, and photographs every house from the sidewalk for visual review.
//   node tests/streetwalk.mjs [--url u] [--shots dir] [--rows 1,2] [--no-photos]
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const URL = opt('--url', 'http://localhost:8080/');
const SHOTS = opt('--shots', null);
const ROWS = opt('--rows', '1,2,3,4,5,6,7,8').split(',').map(Number);
if (!ROWS.length || ROWS.some(row => !Number.isInteger(row) || row < 1 || row > 8)) throw new Error('Use --rows 1,2,...,8');
const PHOTOS = !args.includes('--no-photos');
const LOT_X = 26, LOT_Z = 46, COLS = 26;
const roadZ = (row) => (row - 1) * LOT_Z - 3.5 * LOT_Z + 16;
const houseX = (col) => (col - (COLS - 1) / 2) * LOT_X;
const XMIN = -(COLS / 2) * LOT_X - 4, XMAX = (COLS / 2) * LOT_X + 4;

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1000, height: 620 }, locale: 'en-US' });
const problems = [];
page.on('pageerror', (e) => problems.push(`page error: ${e.message}`));
await page.goto(URL);
await page.waitForFunction(() => window.__town && document.getElementById('loading').hidden, null, { timeout: 60000 });
const st = () => page.evaluate(() => window.__town.state());
const place = (x, z, yaw) => page.evaluate(([x, z, yaw]) => window.__town.place(x, z, yaw), [x, z, yaw]);
const probe = (x, z) => page.evaluate(([x, z]) => window.__town.probe(x, z), [x, z]);
// yaw: forward is (-sin yaw, -cos yaw). +x → -π/2, -x → π/2, +z → π, -z → 0.
const YAW = { '+x': -Math.PI / 2, '-x': Math.PI / 2, '+z': Math.PI, '-z': 0 };

// Holds W+Shift and follows the walker; a leg is stuck when it gains under 0.5 m in 2 s.
async function walk(label, from, axis, dir, to) {
  const [x0, z0] = from;
  await place(x0, z0, YAW[(dir > 0 ? '+' : '-') + axis]);
  if (await probe(x0, z0)) problems.push(`${label}: start point (${x0.toFixed(1)}, ${z0.toFixed(1)}) is inside a collider`);
  await page.keyboard.down('Shift'); await page.keyboard.down('w');
  let last = await st(), lastT = Date.now(), stuckAt = null, steps = 0;
  const along = (s) => (axis === 'x' ? s.pos.x : s.pos.z);
  while ((to - along(last)) * dir > 1) {
    await page.waitForTimeout(250);
    const s = await st();
    if (s.mode !== 'town') { problems.push(`${label}: walked into a house (${s.coordinate}) at ${s.pos.x.toFixed(1)}, ${s.pos.z.toFixed(1)}`); await page.evaluate(() => window.__town.toExit()); break; }
    const off = axis === 'x' ? Math.abs(s.pos.z - z0) : Math.abs(s.pos.x - x0);
    if (off > 1.5) { problems.push(`${label}: pushed sideways ${off.toFixed(1)} m at ${s.pos.x.toFixed(1)}, ${s.pos.z.toFixed(1)}`); }
    if (Math.abs(along(s) - along(last)) > 0.5) { last = s; lastT = Date.now(); continue; }
    if (Date.now() - lastT > 2000) {
      stuckAt = [s.pos.x, s.pos.z];
      problems.push(`${label}: stuck at ${s.pos.x.toFixed(1)}, ${s.pos.z.toFixed(1)}`);
      if (SHOTS) await page.screenshot({ path: `${SHOTS}/stuck-${label.replace(/\W+/g, '_')}-${steps}.png` });
      // Step past the obstacle and carry on so one blockage doesn't hide the rest.
      const nx = axis === 'x' ? s.pos.x + dir * 3 : x0, nz = axis === 'z' ? s.pos.z + dir * 3 : z0;
      await place(nx, nz, YAW[(dir > 0 ? '+' : '-') + axis]);
      last = await st(); lastT = Date.now(); steps++;
      if (steps > 30) break;
    }
  }
  await page.keyboard.up('w'); await page.keyboard.up('Shift');
  return stuckAt;
}

const built = new Set(await page.evaluate(() => window.__town.houses.map((h) => h.coordinate)));
const t0 = Date.now();
for (const row of ROWS) {
  const z = roadZ(row);
  await walk(`street ${row} north sidewalk →`, [XMIN, z - 5.3], 'x', 1, XMAX);
  await walk(`street ${row} south sidewalk ←`, [XMAX, z + 5.3], 'x', -1, XMIN);
  if (PHOTOS && SHOTS) {
    // Every house from its sidewalk: standing 9 m in front of the lot, facing the front door.
    for (let col = 0; col < COLS; col++) {
      const coord = String.fromCharCode(65 + col) + row;
      if (!built.has(coord)) continue;
      await place(houseX(col), z - 3.5, YAW['-z']);
      await page.waitForTimeout(450);
      await page.screenshot({ path: `${SHOTS}/house-${coord}.png` });
    }
  }
  console.log(`street ${row} done (${((Date.now() - t0) / 1000).toFixed(0)}s, ${problems.length} problems so far)`);
}
// Avenues every 5 columns, end to end.
for (let c = 0; !args.includes('--no-avenues') && c <= COLS; c += 5) {
  const x = (c - COLS / 2) * LOT_X;
  await walk(`avenue x=${x}`, [x, roadZ(1) - 8], 'z', 1, roadZ(8) + 8);
}
console.log(problems.length ? `\nPROBLEMS (${problems.length}):\n` + problems.join('\n') : '\nNo problems: every street and avenue walked end to end.');
await browser.close();
if (problems.length) process.exitCode = 1;
