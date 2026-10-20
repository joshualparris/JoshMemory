// Walk into the Fire & Rescue station through its front door and use everything inside, in the
// real browser build: node tests/fire-station.mjs [--url u] [--shots dir]
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

// Mid-morning: the firefighter is on shift.
await T(() => { window.__town.life.setTime(9 * 60); window.__town.life.run(90); });
const site = (await T(() => window.__town.shops())).find((s) => s.id === 'fire');
// Step onto the shopfront door sensor, as for every High Street building (src/main.js).
await T((s) => window.__town.place(s.door.x, s.door.z + 0.4, 0), site);
const entered = await until(() => window.__town.state().mode === 'house', 12000);
check(entered, 'walked in through the station\'s front door');
const s = await T(() => window.__town.state());
check(s.rooms === 5, `five rooms: engine bay, PPE and decon, BA room, watchroom, mess (${s.rooms})`);
const things = s.interactables.filter((x) => x.do !== 'npc');
check(things.length >= 19, `${things.length} things to use`);
let used = 0;
for (const x of things) {
  const ok = await T((k) => window.__town.approach(k), x.key);
  const near = ok && await until(`window.__town.state().near === ${JSON.stringify(x.key)}`, 2500);
  if (!near) { check(false, `${x.label} can be reached (${x.room})`); continue; }
  await page.keyboard.press('e');
  const opened = await until(() => !!window.__town.state().panel, 3000);
  const panel = (await T(() => window.__town.state())).panel;
  if (!opened) { check(false, `${x.label} opens`); continue; }
  used++;
  if (x.key === 'fire:board') {
    check(/Fire danger rating today: (No rating|Moderate|High|Extreme|Catastrophic)/.test(panel.text), `station board shows today's fire danger rating ("${(panel.text.match(/Fire danger rating today: [A-Za-z ]+/) || [''])[0]}")`);
    check(/Crew:/.test(panel.text), 'station board lists the crew');
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'fire-board.png') });
  }
  await T(() => window.__town.closePanel());
}
check(used === things.length, `used all ${used} of ${things.length}`);
const crew = (await T(() => window.__town.state())).people || [];
check(crew.some((p) => /firefighter/.test(p.activity || p.name || '')) || s.interactables.some((x) => x.do === 'npc'), 'the firefighter on shift is in the station');
const out = await T(() => window.__town.exitShop());
check(out && (await T(() => window.__town.state())).mode === 'town', 'walked back out');
check(!errors.length, `no page errors${errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''}`);
await browser.close();
console.log(fails.length ? `\n${fails.length} FAILED` : '\nAll fire station checks passed.');
process.exit(fails.length ? 1 : 0);
