// Plays Throughput from a new factory to "Factory certified" through its real UI: tool keys,
// rotation, mouse clicks and belt drags, with Playwright's virtual clock fast-forwarding time.
// Then checks save/continue and the phone touch controls.
//   node tests/playtest-throughput.mjs [--shots dir]
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const url = pathToFileURL(path.join(root, 'games/throughput/index.html')).href;
const shotsAt = process.argv.indexOf('--shots');
const shots = shotsAt > 0 ? process.argv[shotsAt + 1] : null;

// 1920x1200 at zoom 1 shows the whole 40x28 floor: camera x = -160, y = -60.
const VIEW = { width: 1920, height: 1200 };
const sx = (x) => x * 40 + 20 + 160;
const sy = (y) => y * 40 + 20 + 60;
const ARROWS = ['→', '↓', '←', '↑'];
const E = 0, S = 1, Wd = 2, N = 3;
const KEYS = { belt: '1', miner: '2', smelter: '3', assembler: '4', splitter: '5', select: 'q', delete: 'x' };

const browser = await chromium.launch();
const errors = [];
const log = [];
const note = (s) => { log.push(s); console.log(s); };
const watch = (page, tag) => {
  page.on('pageerror', (e) => errors.push(`${tag} pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`${tag} console: ${m.text()}`); });
};

const context = await browser.newContext({ viewport: VIEW });
const page = await context.newPage();
watch(page, 'desktop');
await page.clock.install();
await page.goto(url);
await page.clock.runFor(400);
await page.click('#newBtn');
await page.clock.runFor(300);

let sim = 0;
const run = async (ms) => { await page.clock.runFor(ms); sim += ms / 1000; };
const tool = async (t) => { await page.keyboard.press(KEYS[t]); await run(20); };
const rotNow = () => page.evaluate(() => {
  const b = [...document.querySelectorAll('#tools .tool')].find((t) => t.textContent.includes('Rotate'));
  return b ? b.querySelector('span').textContent : '';
});
async function setRot(d) {
  for (let i = 0; i < 5; i++) { if ((await rotNow()) === ARROWS[d]) return; await page.keyboard.press('r'); await run(10); }
  throw new Error(`could not set rotation ${d}`);
}
async function put(t, x, y, d) {
  await tool(t);
  await setRot(d);
  await page.mouse.click(sx(x), sy(y));
  await run(30);
}
async function belt(x1, y1, x2, y2) {
  await tool('belt');
  await page.mouse.move(sx(x1), sy(y1));
  await page.mouse.down();
  await page.mouse.move(sx(x2), sy(y2), { steps: Math.max(2, (Math.abs(x2 - x1) + Math.abs(y2 - y1)) * 4) });
  await page.mouse.up();
  await run(30);
}
async function info() {
  return page.evaluate(() => ({
    title: document.querySelector('#infoTitle').textContent,
    status: document.querySelector('#infoStatus').textContent,
    body: document.querySelector('#infoBody').textContent,
  }));
}
async function inspect(x, y) {
  await tool('select');
  await page.mouse.click(sx(x), sy(y));
  await run(30);
  return info();
}
async function expectAt(x, y, title) {
  const i = await inspect(x, y);
  if (!i.title.startsWith(title)) throw new Error(`expected "${title}" at ${x},${y} but found "${i.title}"`);
  return i;
}
async function recipe(name) { await page.click(`#infoRecipes button:text-is("${name}")`); await run(30); }
async function assembler(x, y, d, name) {
  await put('assembler', x, y, d);
  await recipe(name);
  const i = await info();
  if (!i.body.includes(name === 'Gear' ? 'gear every' : name.toLowerCase())) throw new Error(`assembler at ${x},${y} did not take recipe ${name}: ${i.body}`);
}
async function face(x, y, dirName) {
  let i = await inspect(x, y);
  for (let k = 0; k < 4 && !i.title.endsWith(dirName); k++) { await page.keyboard.press('r'); await run(20); i = await info(); }
  if (!i.title.endsWith(dirName)) throw new Error(`could not turn ${x},${y} to ${dirName}`);
}
const goal = () => page.evaluate(() => ({
  step: document.querySelector('#goalStep').textContent,
  title: document.querySelector('#goalTitle').textContent,
  need: document.querySelector('#goalNeed').innerText.replace(/\s+/g, ' ').trim(),
  won: !document.querySelector('#winScreen').hidden,
}));
async function until(label, test, maxSec) {
  const t0 = sim;
  for (let s = 0; s < maxSec; s++) {
    await run(1000);
    const g = await goal();
    if (test(g)) { note(`  ✓ ${label} after ${Math.round(sim - t0)} s of play (game clock ${Math.round(sim)} s)`); return g; }
  }
  const g = await goal();
  throw new Error(`${label} not reached within ${maxSec} s. Goal panel: ${g.step} | ${g.title} | ${g.need}`);
}
const stepIs = (n) => (g) => g.step.startsWith(`Milestone ${n} `);
const shot = async (name) => { if (shots) await page.screenshot({ path: path.join(shots, `throughput-${name}.png`) }); };

try {
  // Milestone 1: iron ore into the hub.
  note('Milestone 1 · Strike iron');
  for (const x of [10, 11, 12]) await put('miner', x, 10, S);
  await belt(10, 11, 16, 11);
  await put('belt', 17, 11, S);
  await put('belt', 17, 12, E);
  await expectAt(10, 10, 'Miner, facing south');
  await expectAt(17, 12, 'Belt, facing east');
  await until('milestone 1', stepIs(2), 120);

  note('Milestone 2 · Make plates');
  await put('smelter', 15, 11, E);
  await expectAt(15, 11, 'Smelter, facing east');
  await until('milestone 2', stepIs(3), 240);

  note('Milestone 3 · Gears for days');
  await assembler(16, 11, E, 'Gear');
  await until('milestone 3', stepIs(4), 400);
  await shot('m3');

  note('Milestone 4 · Copper, coiled');
  for (const x of [27, 28, 29]) await put('miner', x, 8, S);
  await belt(29, 9, 26, 9);
  await put('splitter', 25, 9, Wd);
  await put('smelter', 25, 10, S);
  await belt(25, 11, 25, 13);
  await belt(25, 13, 23, 13);
  await put('smelter', 24, 9, Wd);
  await put('belt', 23, 9, Wd);
  await belt(22, 9, 22, 12);
  await assembler(22, 13, Wd, 'Wire');
  await put('belt', 21, 13, Wd);
  await expectAt(25, 9, 'Splitter, facing west');
  await expectAt(25, 13, 'Belt, facing west');
  await until('milestone 4', stepIs(5), 400);

  note('Milestone 5 · First circuits');
  await assembler(22, 14, Wd, 'Circuit');
  await put('belt', 21, 14, Wd);
  for (const x of [27, 28, 29]) await put('miner', x, 17, N);
  await belt(29, 16, 26, 16);
  await put('smelter', 25, 16, Wd);
  await put('belt', 24, 16, Wd);
  await belt(23, 16, 23, 15);
  await put('belt', 23, 14, Wd);
  await face(22, 13, 'south');
  const c5 = await expectAt(22, 14, 'Assembler, facing west');
  note(`  circuit assembler: ${c5.status} · ${c5.body}`);
  await until('milestone 5', stepIs(6), 500);

  note('Milestone 6 · Motor works');
  for (const x of [28, 29, 30]) await put('miner', x, 20, S);
  await belt(30, 21, 26, 21);
  await put('smelter', 25, 21, Wd);
  await belt(24, 21, 23, 21);
  await belt(22, 21, 22, 17);
  await assembler(22, 16, N, 'Gear');
  await assembler(22, 15, Wd, 'Motor');
  await put('splitter', 23, 15, N);
  await put('belt', 21, 15, N);
  await face(22, 14, 'south');
  await until('milestone 6', stepIs(7), 700);
  await shot('m6');

  note('Milestone 7 · Hit the quota');
  await face(22, 14, 'west');
  await until('milestone 7 (factory certified)', (g) => g.won, 700);
  await shot('win');
  const winText = await page.textContent('#winText');
  note(`  win screen: ${winText}`);
  await page.click('#keepBtn');
  await run(300);
  const g = await goal();
  note(`  after Keep building: ${g.step} · ${g.title}`);
  const hub = await inspect(19, 13);
  note(`  hub totals: ${hub.body}`);

  // Save and continue.
  await run(11000);
  await page.reload();
  await page.clock.runFor(400);
  const cont = await page.textContent('#continueBtn');
  if (!cont || !cont.includes('Continue')) throw new Error('no Continue button after reload');
  await page.click('#continueBtn');
  await page.clock.runFor(300);
  const g2 = await goal();
  const mid = await inspect(22, 14);
  note(`  reload + continue: "${cont.trim()}" → ${g2.step}; circuit assembler restored: ${mid.title}`);
} catch (e) {
  errors.push(`desktop playthrough: ${e.message}`);
  await shot('failure');
}

// Phone: touch taps on the tool rail and the floor, and a touch drag to look around.
const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
const mp = await phone.newPage();
watch(mp, 'phone');
try {
  await mp.clock.install();
  await mp.goto(url);
  await mp.clock.runFor(400);
  await mp.tap('#newBtn');
  await mp.clock.runFor(300);
  await mp.tap('#tools .tool:has-text("Belt")');
  await mp.clock.runFor(50);
  await mp.touchscreen.tap(195, 300);
  await mp.clock.runFor(50);
  await mp.tap('#tools .tool:has-text("Select")');
  const cdp = await phone.newCDPSession(mp);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 200, y: 520 }] });
  for (let i = 1; i <= 10; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 200 + i * 15, y: 520 - i * 10 }] }); await mp.clock.runFor(16); }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await mp.clock.runFor(200);
  await mp.touchscreen.tap(195, 300);
  await mp.clock.runFor(100);
  const tapped = await mp.evaluate(() => ({ hidden: document.querySelector('#info').hidden, title: document.querySelector('#infoTitle').textContent }));
  note(`Phone: placed a belt by tap, dragged the floor, tapped again → info panel ${tapped.hidden ? 'hidden (floor moved, tile now empty)' : `shows "${tapped.title}"`}`);
  if (shots) await mp.screenshot({ path: path.join(shots, 'throughput-phone.png') });
} catch (e) {
  errors.push(`phone: ${e.message}`);
}

await browser.close();
console.log(errors.length ? `\nPROBLEMS:\n- ${errors.join('\n- ')}` : '\nPASS: full campaign, save/continue and phone touch with no errors');
process.exitCode = errors.length ? 1 : 0;
