// Walk into the researched High Street buildings (Fire & Rescue, Power Station) through their front
// doors and use everything inside, in the real browser build:
//   node tests/walk-in-buildings.mjs [--url u] [--shots dir]
import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
const args = process.argv.slice(2), opt = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
const URL = opt('--url', 'http://localhost:8091/'), SHOTS = opt('--shots', null);
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
const fails = [], check = (ok, what) => { console.log(`${ok ? '✓' : '✗'} ${what}`); if (!ok) fails.push(what); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1100, height: 700 } });
const errors = []; page.on('pageerror', (e) => errors.push(e.message));
await page.goto(URL);
await page.waitForFunction(() => window.__town && document.getElementById('loading').hidden, null, { timeout: 90000 });
const T = (f, a) => page.evaluate(f, a);
const until = async (fn, ms) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await T(fn)) return true; await sleep(100); } return false; };

// Mid-morning: the staff are on shift.
await T(() => { window.__town.life.setTime(9 * 60); window.__town.life.run(90); });
const BUILDINGS = {
  fire: { rooms: 5, things: 19, panel: [[/Fire danger rating today: (No rating|Moderate|High|Extreme|Catastrophic)/, "the station board shows today's fire danger rating"], [/Crew:/, 'the station board lists the crew']], board: 'fire:board' },
  power: { rooms: 5, things: 16, panel: [[/Supply:/, 'the SCADA desk shows supply and demand'], [/Fuel|fuel/, 'and the fuel stock']], board: 'power:scada' },
};
for (const [id, want] of Object.entries(BUILDINGS)) {
  const site = (await T(() => window.__town.shops())).find((s) => s.id === id);
  // Step onto the shopfront door sensor from the street side (src/world/civic-entrance.js):
  // legacy High Street shops open toward +Z, north/south-side sites toward -Z.
  const street = site.side === 'south' || site.side === 'north' ? -1 : 1;
  await T(([s, d]) => window.__town.place(s.door.x, s.door.z + d * 0.4, d > 0 ? 0 : Math.PI), [site, street]);
  const entered = await until(() => window.__town.state().mode === 'house', 12000);
  check(entered, `${id}: walked in through the front door`);
  if (!entered) continue;
  const s = await T(() => window.__town.state());
  check(s.rooms === want.rooms, `${id}: ${s.rooms} rooms (want ${want.rooms})`);
  const things = s.interactables.filter((x) => x.do !== 'npc');
  check(things.length >= want.things, `${id}: ${things.length} things to use`);
  let used = 0;
  for (const x of things) {
    const ok = await T((k) => window.__town.approach(k), x.key);
    const near = ok && await until(`window.__town.state().near === ${JSON.stringify(x.key)}`, 2500);
    if (!near) { check(false, `${id}: ${x.label} can be reached (${x.room})`); continue; }
    await page.keyboard.press('e');
    const opened = await until(() => !!window.__town.state().panel, 3000);
    const panel = (await T(() => window.__town.state())).panel;
    if (!opened) { check(false, `${id}: ${x.label} opens`); continue; }
    used++;
    if (x.key === want.board) {
      for (const [re, what] of want.panel) check(re.test(panel.text), `${id}: ${what}`);
      if (SHOTS) await page.screenshot({ path: path.join(SHOTS, `${id}-panel.png`) });
    }
    await T(() => window.__town.closePanel());
  }
  check(used === things.length, `${id}: used all ${used} of ${things.length}`);
  check(s.interactables.some((x) => x.do === 'npc'), `${id}: someone on shift is there to talk to`);
  const out = await T(() => window.__town.exitShop());
  check(out && (await T(() => window.__town.state())).mode === 'town', `${id}: walked back out`);
}
check(!errors.length, `no page errors${errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''}`);
await browser.close();
console.log(fails.length ? `\n${fails.length} FAILED` : '\nAll walk-in building checks passed.');
process.exit(fails.length ? 1 : 0);
