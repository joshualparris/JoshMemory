// Windows: every building has them, and the town keeps moving outside while you look out.
//   node tests/windows.mjs [--url u]
import { chromium } from 'playwright';
const args = process.argv.slice(2);
const URL = args[args.indexOf('--url') + 1] && args.includes('--url') ? args[args.indexOf('--url') + 1] : 'http://localhost:8091/';
const fails = [];
const check = (ok, what) => { console.log(`${ok ? '✓' : '✗'} ${what}`); if (!ok) fails.push(what); };
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 900, height: 560 } });
const errors = []; page.on('pageerror', (e) => errors.push(e.message));
await page.goto(URL);
await page.waitForFunction(() => window.__town && document.getElementById('loading').hidden, null, { timeout: 60000 });
const T = (f, a) => page.evaluate(f, a);
const shot = async () => (await page.screenshot({ clip: { x: 300, y: 120, width: 300, height: 200 } })).toString('base64');

// A three-storey building: windows on every floor; the street is visible from the top one.
await T(() => window.__town.life.setTime(10 * 60));
await T(() => window.__town.travel('X7')); await page.waitForTimeout(500);
await page.keyboard.down('w'); await page.waitForFunction(() => window.__town.state().mode === 'house', null, { timeout: 20000 }); await page.keyboard.up('w');
const floors = (await T(() => window.__town.state())).floors;
for (let f = 0; f < floors; f++) {
  await T((f) => window.__town.setFloor(f), f); await page.waitForTimeout(200);
  const s = await T(() => window.__town.state());
  check(s.floor === f && s.windows >= 3, `X7 floor ${f + 1} has ${s.windows} windows`);
}
check(await T(() => window.__town.lookOut(0)), 'stand at a top-floor window');
await page.waitForTimeout(800);
const day = await shot();
// Night falls outside the same window.
await T(() => window.__town.life.setTime(22 * 60)); await page.waitForTimeout(800);
check(day !== await shot(), 'the view out of the window follows the time of day');
// Shops: display windows onto the street.
await T(() => window.__town.goPlace('bakery')); await page.waitForTimeout(300);
await T(() => window.__town.life.setTime(10 * 60));
check(await T(() => window.__town.enterShop('bakery')), 'enter the Bakery');
const shopWindows = (await T(() => window.__town.state())).windows;
check(shopWindows >= 4 && await T(() => window.__town.lookOut(0)), `Bakery has ${shopWindows} windows`);
// Outside keeps living: on the high street at 7am, villagers in view move while the player stays in.
// (setTime only moves the clock; run() lets the morning actually happen so people are out.)
// 06:30 + 30 minutes: the 07:00 commute, now that staff are at work before their shops open.
await T(() => { window.__town.life.setTime(6 * 60 + 30); window.__town.life.run(30); });
await page.waitForTimeout(1000);
const before = await T(() => window.__town.townFigures().filter((f) => f.visible));
await page.waitForTimeout(4000);
const after = await T(() => window.__town.townFigures());
const moved = before.filter((b) => { const a = after.find((x) => x.key === b.key); return a && Math.hypot(a.x - b.x, a.z - b.z) > 0.3; });
check(before.length >= 3 && moved.length > 0, `villagers outside keep moving while you are indoors (${moved.length} of ${before.length} in view moved)`);
await T(() => window.__town.exitShop());
check(!errors.length, `no page errors${errors.length ? ': ' + errors.join(' | ') : ''}`);
await browser.close();
console.log(fails.length ? `\n${fails.length} FAILED` : '\nAll window checks passed.');
process.exit(fails.length ? 1 : 0);
