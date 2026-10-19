// Walking backwards through a door must not spin the player: facing is kept as they cross it.
//   node tests/door-facing.mjs [--url http://localhost:8091/]
import { chromium } from 'playwright';
const i = process.argv.indexOf('--url');
const URL = i >= 0 ? process.argv[i + 1] : 'http://localhost:8091/';
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 900, height: 560 } });
const problems = [];
page.on('pageerror', (e) => problems.push('page error: ' + e.message));
await page.goto(URL);
await page.waitForFunction(() => window.__town && document.getElementById('loading').hidden, null, { timeout: 90000 });
await page.evaluate(() => window.__town.life.setTime(12 * 60));
const st = () => page.evaluate(() => window.__town.state());
const angle = (a, b) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));

async function hold(key, pred, ms) {
  await page.keyboard.down(key);
  const t0 = Date.now(); let s = await st();
  while (Date.now() - t0 < ms && !pred(s)) { await page.waitForTimeout(100); s = await st(); }
  await page.keyboard.up(key);
  return s;
}
// Walk out of the building backwards (still facing the room), then forwards, and compare the facing.
for (const id of ['bakery', 'bank', 'store']) {
  for (const mode of ['backward', 'forward']) {
    await page.evaluate((x) => { window.__town.exitShop(); window.__town.enterShop(x); }, id);
    await page.waitForTimeout(300);
    let s = await st();
    if (s.mode !== 'house') { problems.push(`${id}: could not enter`); continue; }
    // Interior exit is at +z; facing into the room is yaw 0, facing the door is yaw PI.
    const yaw = mode === 'backward' ? 0 : Math.PI;
    await page.evaluate((y) => window.__town.place(0, 4.6, y), yaw);
    await page.waitForTimeout(100);
    const before = (await st()).yaw;
    s = await hold(mode === 'backward' ? 's' : 'w', (q) => q.mode === 'town', 6000);
    if (s.mode !== 'town') { problems.push(`${id} ${mode}: did not leave`); continue; }
    // Outside, facing into the building means walking direction matches the interior's inward direction.
    const south = await page.evaluate((x) => window.__town.shops().find((p) => p.id === x)?.side === 'south', id);
    const expect = before + (south ? Math.PI : 0);
    const diff = angle(s.yaw, expect);
    console.log(`${id} ${mode}: yaw before ${before.toFixed(2)} after ${s.yaw.toFixed(2)} (expected ${expect.toFixed(2)})`);
    if (diff > 0.3) problems.push(`${id} ${mode}: facing changed by ${diff.toFixed(2)} rad when leaving`);
  }
}
await browser.close();
if (problems.length) { console.log(JSON.stringify({ problems }, null, 1)); process.exit(1); }
console.log('PASS: facing is kept when walking in and out of buildings, forwards and backwards');
