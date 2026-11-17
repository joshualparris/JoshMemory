// Plays the Kettle Cove draft through its real UI: arrow keys to walk, E to talk, number keys to
// answer, with Playwright's virtual clock. Day 1 gathers clues and lets midnight reset the day;
// Day 2 uses what was learned to bring Gus home and light the lamp (the best ending).
// Routes are planned on the game's own map code.   node tests/playtest-kettle-cove.mjs [--shots dir]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = path.join(root, 'game-src/kettle-cove/index.html');
const url = pathToFileURL(file).href;
const shotsAt = process.argv.indexOf('--shots');
const shots = shotsAt > 0 ? process.argv[shotsAt + 1] : null;

// Rebuild the cove from the game's source so routes match what the game builds.
const src = fs.readFileSync(file, 'utf8');
const cut = (a, b) => src.slice(src.indexOf(a), src.indexOf(b));
const W = new Function(`${cut('function hash(x, y, s = 0)', 'function rr(')}
${cut('const TILE = 32, MW = 44, MH = 30;', '/* ---------- people ---------- */')}
buildMap();
return { MW, MH, at, inMap, SOLID, DECOR_SOLID, OBJECTS, NPCS, START };`)();
const PHASES = ['morning', 'morning', 'afternoon', 'afternoon', 'evening', 'evening', 'night', 'night'];
const DIRS = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
const note = (s) => console.log(s);
await page.clock.install();
await page.goto(url);
await page.clock.runFor(400);

let pos = { ...W.START };
const visible = (sel) => page.evaluate((s) => !document.querySelector(s).hidden, sel);
const dayLine = () => page.textContent('#dayLine');
async function bell() { const m = /bell (\d) of 8/.exec(await dayLine()); return m ? Number(m[1]) : 0; }
function npcsAt(phase) {
  const occ = new Map();
  for (const n of W.NPCS) { const s = n.where[phase]; if (s) occ.set(`${s[0]},${s[1]}`, n.id); }
  return occ;
}
async function walkable() {
  const occ = npcsAt(PHASES[(await bell()) - 1]);
  return (x, y) => W.inMap(x, y) && !W.SOLID.has(W.at(x, y)) && !W.DECOR_SOLID.has(y * W.MW + x)
    && !occ.has(`${x},${y}`) && !W.OBJECTS.some((o) => o.x === x && o.y === y);
}
async function route(tx, ty) {
  const ok = await walkable();
  const goals = new Set(Object.values(DIRS).map(([dx, dy]) => `${tx + dx},${ty + dy}`).filter((k) => { const [x, y] = k.split(',').map(Number); return ok(x, y) || (x === pos.x && y === pos.y); }));
  const q = [[pos.x, pos.y]]; const prev = new Map([[`${pos.x},${pos.y}`, null]]);
  while (q.length) {
    const [x, y] = q.shift();
    if (goals.has(`${x},${y}`)) {
      const steps = [];
      for (let k = `${x},${y}`; prev.get(k); k = prev.get(k).from) steps.unshift(prev.get(k).key);
      return { steps, end: [x, y] };
    }
    for (const [key, [dx, dy]] of Object.entries(DIRS)) {
      const nx = x + dx, ny = y + dy, k = `${nx},${ny}`;
      if (prev.has(k) || !ok(nx, ny)) continue;
      prev.set(k, { from: `${x},${y}`, key });
      q.push([nx, ny]);
    }
  }
  throw new Error(`no route to ${tx},${ty}`);
}
async function tap(key, ms = 40) { await page.keyboard.down(key); await page.clock.runFor(ms); await page.keyboard.up(key); }
async function goTo(tx, ty) {
  const { steps, end } = await route(tx, ty);
  for (const key of steps) { await tap(key); await page.clock.runFor(190); }
  pos = { x: end[0], y: end[1] };
  const face = Object.entries(DIRS).find(([, [dx, dy]]) => pos.x + dx === tx && pos.y + dy === ty)[0];
  await tap(face);
  await page.clock.runFor(80);
  return steps.length;
}
async function choices() { return page.$$eval('#dlgChoices .choice', (bs) => bs.map((b) => ({ label: b.querySelector('.lab').textContent, off: b.disabled }))); }
async function say(part) {
  const cs = await choices();
  const i = cs.findIndex((c) => c.label.includes(part) && !c.off);
  if (i < 0) throw new Error(`no reply containing "${part}" (offered: ${cs.map((c) => c.label).join(' | ')})`);
  await page.keyboard.press(String(i + 1));
  await page.clock.runFor(80);
}
async function settle() {
  for (let i = 0; i < 6 && await visible('#levelScreen'); i++) {
    const skill = ['charm', 'wits', 'grit'][i % 3];
    await page.click(`#levelScreen [data-skill="${skill}"]`);
    await page.clock.runFor(60);
  }
}
async function talkTo(id, replies, expectName) {
  const ent = W.NPCS.find((n) => n.id === id) || W.OBJECTS.find((o) => o.id === id);
  const spot = ent.where ? ent.where[PHASES[(await bell()) - 1]] : [ent.x, ent.y];
  if (!spot) throw new Error(`${id} is not around at bell ${await bell()}`);
  const steps = await goTo(spot[0], spot[1]);
  await page.keyboard.press('e');
  await page.clock.runFor(120);
  const name = await page.textContent('#dlgName');
  if (!(await visible('#dialog')) || (expectName && name !== expectName)) throw new Error(`talking to ${id}: dialog shows "${name}"`);
  const before = await bell();
  for (const r of replies) await say(r);
  await settle();
  note(`  ${ent.name}: walked ${steps} tiles, replies [${replies.join(' → ')}], bell ${before} → ${await bell()}`);
}
async function clues() { await page.keyboard.press('n'); await page.clock.runFor(60); const h = await page.$$eval('#noteBody h3', (hs) => hs.map((x) => x.textContent)); await page.keyboard.press('Escape'); await page.clock.runFor(60); return h.find((x) => x.startsWith('Clues')); }

try {
  await page.click('#newBtn');
  await page.clock.runFor(900);
  if (!(await visible('#dialog'))) throw new Error('the ferryman did not greet you at the start');
  note(`Day 1 starts: ${await dayLine()}`);
  note(`  Old Mosk greets you on arrival: "${(await page.textContent('#dlgText')).slice(0, 70)}…"`);
  for (const r of ['Funny how?', 'Back', 'Who are you?', 'Back', 'Leave']) await say(r);
  await settle();
  await talkTo('ada', ['Heard anything about the lighthouse keeper?', 'Back', 'Did Gus buy anything before he vanished?', 'Back', 'Leave'], 'Ada Fitch');
  await talkTo('wren', ['Who is your grandpa?', 'Marigold wasn’t his fault', 'Leave'], 'Wren Penhale');
  await talkTo('cottage', ['Search the workbench', 'Leave'], 'Penhale Cottage');
  await talkTo('teo', ['Can you mend this lens?', 'Leave'], 'Teodor Vass');
  await talkTo('wren', ['What are you winding?', 'Leave'], 'Wren Penhale');
  await talkTo('dot', ['Gossip, please.', 'Leave'], 'Dot Mallory');
  note(`  notebook: ${await clues()} · ${await dayLine()}`);
  await page.keyboard.press('t');
  await page.clock.runFor(200);
  if (!(await visible('#nightScreen'))) throw new Error(`waiting at bell 8 did not reach midnight (${await dayLine()})`);
  note(`  Midnight: "${await page.textContent('#nightWake')}"`);
  if (shots) await page.screenshot({ path: path.join(shots, 'kettle-midnight.png') });
  await page.click('#dawnBtn');
  await page.clock.runFor(900);
  pos = { ...W.START };
  note(`Day 2 starts: ${await dayLine()}`);
  if (!(await visible('#dialog'))) throw new Error('the ferryman did not greet you on day 2');
  for (const r of ['Whistle three short notes', 'Gus Penhale, I presume.', 'Wren winds your compass', 'Leave']) await say(r);
  await settle();
  note('  Old Mosk turns out to be Gus, and agrees to come home if the lamp is lit');
  await talkTo('wren', ['Who is your grandpa?', 'Marigold wasn’t his fault', 'Leave'], 'Wren Penhale');
  await talkTo('cottage', ['Search the workbench', 'Leave'], 'Penhale Cottage');
  await talkTo('teo', ['Can you mend this lens?', 'Leave'], 'Teodor Vass');
  await talkTo('nell', ['I need the lighthouse key.', 'Gus wrote it in his logbook', 'Leave'], 'Nell Barrow');
  await talkTo('teo', ['Is the lens ready?', 'Leave'], 'Teodor Vass');
  await talkTo('light', ['Light the lamp.'], 'The Kettle Light');
  await page.clock.runFor(3600);
  if (!(await visible('#endScreen'))) throw new Error('no ending screen after lighting the lamp');
  const end = await page.evaluate(() => ({ h: document.querySelector('#endHeading').textContent, stats: [...document.querySelectorAll('#endStats div')].map((d) => d.textContent).join(' · ') }));
  note(`Ending: ${end.h} · ${end.stats}`);
  if (end.h !== 'The Keeper Comes Home') errors.push(`expected the best ending, got "${end.h}"`);
  if (shots) await page.screenshot({ path: path.join(shots, 'kettle-ending.png') });
} catch (e) {
  errors.push(`playthrough: ${e.message}`);
  if (shots) await page.screenshot({ path: path.join(shots, 'kettle-failure.png') });
}

await browser.close();
console.log(errors.length ? `\nPROBLEMS:\n- ${errors.join('\n- ')}` : '\nPASS: two-day playthrough to the best ending with no errors');
process.exitCode = errors.length ? 1 : 0;
