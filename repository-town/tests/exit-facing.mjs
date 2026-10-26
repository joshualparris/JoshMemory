// Leaving a building puts you on the street looking out over it, not staring back at the door.
//   node tests/exit-facing.mjs [--url u]
import { chromium } from 'playwright';
const args = process.argv.slice(2);
const URL = args.includes('--url') ? args[args.indexOf('--url') + 1] : 'http://localhost:8091/';
const fails = [];
const check = (ok, what) => { console.log(`${ok ? '✓' : '✗'} ${what}`); if (!ok) fails.push(what); };
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 900, height: 560 } });
await page.goto(URL);
await page.waitForFunction(() => window.__town && document.getElementById('loading').hidden, null, { timeout: 60000 });
const T = (f, a) => page.evaluate(f, a);
await T(() => window.__town.life.setTime(10 * 60));
// How squarely the view points away from the door: 1 = straight out, -1 = straight back at it.
const away = (s, door) => { const dx = s.pos.x - door.x, dz = s.pos.z - door.z, d = Math.hypot(dx, dz) || 1; return (-Math.sin(s.yaw) * dx - Math.cos(s.yaw) * dz) / d; };
const walkOut = async () => {
  await T(() => window.__town.toExit());
  await page.keyboard.down('w');
  await page.waitForFunction(() => window.__town.state().mode === 'town', null, { timeout: 8000 }).catch(() => null);
  await page.keyboard.up('w');
  return T(() => window.__town.state());
};
const shops = await T(() => window.__town.shops());
for (const id of ['bakery', 'power']) {
  const site = shops.find((s) => s.id === id);
  // Walking out through the door, the way a player does.
  await T((id) => window.__town.enterShop(id), id); await page.waitForTimeout(300);
  let s = await walkOut();
  check(s.mode === 'town' && away(s, site.door) > 0.7, `walking out of the ${site.name}: facing the street (${away(s, site.door).toFixed(2)})`);
  // Using Exit while facing back into the room.
  await T((id) => window.__town.enterShop(id), id); await page.waitForTimeout(300);
  await T(() => window.__town.exitShop());
  s = await T(() => window.__town.state());
  check(s.mode === 'town' && away(s, site.door) > 0.7, `Exit from inside the ${site.name}: facing the street (${away(s, site.door).toFixed(2)})`);
}
// The 2026 row 2-7 north-facing infill must return to the REAL street side
// (-Z). Try available staffed sites; access rules remain enforced.
const infill = shops.filter(s => s.side === 'north');
let infillExercised = false;
for (const site of infill) {
  if (!await T(id => window.__town.enterShop(id), site.id)) continue;
  infillExercised = true;
  let s = await walkOut();
  check(s.mode === 'town' && s.pos.z < site.door.z - 2 && away(s, site.door) > 0.7,
    `walking out of new ${site.name}: outside FRONT door facing northern road`);
  await T(id => window.__town.enterShop(id), site.id);
  s = await T(() => window.__town.state());
  if (s.mode === 'house') {
    await T(() => window.__town.exitShop());
    s = await T(() => window.__town.state());
    check(s.mode === 'town' && s.pos.z < site.door.z - 2 && away(s, site.door) > 0.7,
      `Exit button at ${site.name}: front footpath, not back wall`);
  }
  break;
}
check(infill.length > 0 && infillExercised, 'at least one new northern infill building was entered and exited');

// A house: walk in, walk back out.
await T(() => window.__town.travel('A1')); await page.waitForTimeout(500);
const front = await T(() => window.__town.state());
await page.keyboard.down('w'); await page.waitForFunction(() => window.__town.state().mode === 'house', null, { timeout: 20000 }); await page.keyboard.up('w');
const s = await walkOut();
check(s.mode === 'town' && Math.cos(s.yaw - Math.PI) > 0.7 && s.pos.z > front.pos.z - 6, `walking out of house A1: facing the street (yaw ${s.yaw.toFixed(2)})`);
await browser.close();
console.log(fails.length ? `\n${fails.length} FAILED` : '\nAll exit-facing checks passed.');
process.exit(fails.length ? 1 : 0);
