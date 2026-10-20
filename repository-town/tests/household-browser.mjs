// Walk into a villager's own home and use their appliances in the real browser build.
//   node tests/household-browser.mjs [--url u] [--shots dir]
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
const shot = async (name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };

// A day of town life first, so the household has meals, dishes, email and food in the fridge.
await T(() => { window.__town.life.setTime(6 * 60); window.__town.life.run(60 * 14); });
const who = await T(() => window.__town.life.describe(0));
const coord = who.home.split(' ')[0];
await T((c) => window.__town.travel(c), coord);
await sleep(300); await shot('home-front');
await page.keyboard.down('w');
const entered = await until(() => window.__town.state().mode === 'house', 9000);
await page.keyboard.up('w');
check(entered, `walked into ${who.name}'s home at ${coord}`);
const s = await T(() => window.__town.state());
const uses = s.interactables.filter((x) => x.do === 'household');
check(uses.length === 12, `${uses.length} household appliances to use (fridge, pantry, oven, sink, plates, shower, laundry, freezer, switchboard, TV, air conditioner, computer)`);
for (const [label, expect] of [['Fridge', /fridge/i], ['Home computer', /computer/], ['Chest freezer', /freezer/], ['Switchboard', /switchboard/], ['Air conditioner', /air conditioner/]]) {
  const x = uses.find((u) => u.label === label);
  if (!x) { check(false, `${label} present`); continue; }
  await T((k) => window.__town.approach(k), x.key);
  await until(`window.__town.state().near === ${JSON.stringify(x.key)}`, 2500);
  await page.keyboard.press('e');
  const opened = await until(() => !!window.__town.state().panel, 3000);
  const panel = (await T(() => window.__town.state())).panel;
  check(opened && expect.test(panel?.title || '') && panel.title.startsWith(who.name), `${label} opens ${who.name}'s panel ("${panel?.title}")`);
  if (label === 'Fridge') check(/Humming|No power/.test(panel.text), 'the fridge reports its power and contents');
  if (label === 'Home computer') check(/Inbox/.test(panel.text) && /Payslip|bill|Budget/i.test(panel.text), 'the computer shows the household email, bills and budget');
  await shot('home-' + label.toLowerCase().replace(/ /g, '-'));
  await T(() => window.__town.closePanel());
}
check(!errors.length, `no page errors${errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''}`);
await browser.close();
console.log(fails.length ? `\n${fails.length} FAILED` : '\nAll household browser checks passed.');
process.exit(fails.length ? 1 : 0);
