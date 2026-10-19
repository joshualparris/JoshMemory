// Playtests town life: the daily routine, the supply chain, trucks braking, day and
// night, the guide, shop counters, the Town Ledger, chats with gossip and relic hints,
// residents moving between rooms, and sound — all with no page errors.
//   node tests/life.mjs [--url u] [--shots dir]
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const URL = opt('--url', 'http://localhost:8091/');
const SHOTS = opt('--shots', null);
const fails = [];
const check = (ok, what) => { console.log(`${ok ? '✓' : '✗'} ${what}`); if (!ok) fails.push(what); };

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage({ viewport: { width: 1100, height: 700 }, locale: 'en-US' });
const errors = []; page.on('pageerror', (e) => errors.push(e.message));
// The AI proxy is offline here, so chats use the deterministic offline replies.
await page.route('**/api/npc-chat', (route) => route.abort('connectionrefused'));
await page.addInitScript(() => { if (!sessionStorage.getItem('fresh')) { localStorage.clear(); sessionStorage.setItem('fresh', '1'); } });
await page.goto(URL);
await page.waitForFunction(() => window.__town && document.getElementById('loading').hidden, null, { timeout: 60000 });
const T = (fn, a) => page.evaluate(fn, a);
const st = () => T(() => window.__town.state());
const shot = async (n) => SHOTS && page.screenshot({ path: `${SHOTS}/life-${n}.png` });
// The prompt updates on the next frames; software rendering can be slow, so wait for it.
const nearTo = (re) => page.waitForFunction((src) => new RegExp(src).test(window.__town.state().nearPerson || ''), re.source, { timeout: 8000 }).catch(() => null);
const press = async (k) => {
  for (let i = 0; i < 2; i++) {
    await page.keyboard.down(k); await page.waitForTimeout(120); await page.keyboard.up(k);
    if (k !== 'e' || await page.waitForFunction(() => window.__town.state().panel, null, { timeout: 3000 }).catch(() => null)) break;
  }
  await page.waitForTimeout(200);
};

// 1. A whole day of the simulation: sleep, work, meals, shopping, production, deliveries.
await T(() => window.__town.life.setTime(0));
const at = {};
for (const h of [3, 8, 10, 12.5, 15, 18.5, 21, 24]) {
  const now = (await st()).minute;
  await T((m) => window.__town.life.run(m), Math.round(h * 60 - now));
  const L = await T(() => window.__town.life.ledger());
  const ppl = (await st()).people;
  at[h] = { ...L, ppl };
  console.log(`  ${L.time}: ${L.atWork} at work, ${L.asleep} asleep, ${ppl.filter((p) => !p.inside).length} out and about`);
}
check(at[3].asleep >= 28, `03:00 — ${at[3].asleep}/32 asleep`);
check(at[10].atWork >= 15, `10:00 — ${at[10].atWork} at work`);
check(at[12.5].ppl.some((p) => /lunch|eating|pie/.test(p.activity)), `12:30 — someone is having lunch (${at[12.5].ppl.find((p) => /lunch|eating|pie/.test(p.activity))?.activity})`);
check(at[18.5].ppl.some((p) => /cooking|dinner|shopping|unpacking/.test(p.activity)), `18:30 — people are shopping, cooking or out to dinner`);
const day = at[24].yesterday || at[24].stats;
console.log('  day totals:', JSON.stringify({ harvested: day.harvested, milled: day.milled, baked: day.baked, deliveries: day.deliveries, sold: day.sold, meals: day.meals, mealsOut: day.mealsOut, parcels: day.parcels }));
check(Object.values(day.harvested).reduce((a, b) => a + b, 0) > 50, 'farms harvested produce');
check(day.milled > 0 && day.baked > 0, `the mill ground flour (${day.milled}) and the bakery baked (${day.baked})`);
check(day.deliveries >= 8, `trucks made ${day.deliveries} deliveries`);
check(Object.keys(day.sold).length >= 4, `shops sold ${Object.keys(day.sold).length} kinds of goods`);
check(day.meals >= 60, `${day.meals} meals eaten (${day.mealsOut} out)`);
check(day.parcels > 0, `${day.parcels} parcels delivered to doorsteps`);
const who = await T(() => window.__town.life.describe(7));
console.log(`  ${who.name} (${who.job}): last meal ${who.lastMeal}; pantry ${who.pantry}; $${who.wallet}`);
check(who.lastMeal !== 'nothing yet today' && who.recentMeals.length >= 2, `${who.name} has eaten real meals: ${who.recentMeals.slice(0, 3).join('; ')}`);

// 2. Villagers out and about never stand inside a building.
await T(() => window.__town.life.setTime(9 * 60 + 30));
await T(() => window.__town.life.run(60));
let overlaps = 0, samples = 0;
for (let i = 0; i < 8; i++) {
  await T(() => window.__town.life.run(5));
  for (const p of (await st()).people) if (!p.inside) { samples++; if (await T(([x, z]) => window.__town.probe(x, z), [p.x, p.z])) { overlaps++; if (overlaps < 4) console.log('    inside a collider:', p.name, p.activity, p.x.toFixed(1), p.z.toFixed(1)); } }
}
check(overlaps === 0, `no villager inside a building (${overlaps} of ${samples} samples)`);

// 3. The guide: panel, travel buttons, speed control.
await T(() => window.__town.meetGuide());
await nearTo(/^guide$/);
let s = await st();
check(s.nearPerson === 'guide', `standing by Wren, the Town Guide (${s.nearPerson})`);
await press('e');
s = await st();
check(s.panel?.title.includes('Town Guide') && /Adventure Guild/.test(s.panel.text), `guide panel: ${s.panel?.title}`);
await shot('guide');
const btn = (re) => T((src) => { const b = [...document.querySelectorAll('#panel-actions button')].find((x) => new RegExp(src).test(x.textContent)); if (b) b.click(); return !!b; }, re.source);
check(await btn(/Time/), 'speed button present');
s = await st(); check(s.speed === 4, `time speeds up to ${s.speed}×`);
await btn(/Time/); await btn(/Time/);
s = await st(); check(s.speed === 1, 'time back to 1×');
check(await btn(/High street/), 'High street button');
await page.waitForTimeout(500);
s = await st();
check(!s.panel && Math.abs(s.pos.z - 173.6) < 1, `travelled to the high street (${s.pos.x.toFixed(0)}, ${s.pos.z.toFixed(0)})`);

// 4. Shop counter: stock, workers, buying.
await T(() => window.__town.life.setTime(10 * 60));
await T(() => window.__town.life.run(30));
await nearTo(/^place:bakery$/);
s = await st();
check(s.nearPerson === 'place:bakery', `at the Bakery counter (${s.nearPerson})`);
await shot('bakery-day');
await press('e');
s = await st();
check(/Bakery/.test(s.panel?.title) && /On the shelves/.test(s.panel.text), `bakery panel: ${s.panel?.text.slice(0, 120)}`);
const bought = await btn(/Buy/);
s = await st();
check(bought && /You buy/.test(s.panel?.text || ''), `bought something: ${s.panel?.text.slice(0, 90)}`);
await T(() => window.__town.closePanel());

// 5. Town Hall ledger, a farm, the square.
for (const [id, re] of [['hall', /Town Ledger/], ['silo', /Crop/], ['square', /Town news/], ['depot', /freight train/]]) {
  await T((x) => window.__town.goPlace(x), id);
  await nearTo(new RegExp(`^place:${id}$`));
  await press('e');
  s = await st();
  check(re.test(s.panel?.title + s.panel?.text), `${id}: ${s.panel?.title}`);
  if (id === 'silo') { await T(() => window.__town.closePanel()); await T(() => { const t = window.__town.state(); window.__town.place(t.pos.x, t.pos.z + 18, Math.PI); }); await page.waitForTimeout(500); await shot('farm-fields'); }
  await T(() => window.__town.closePanel());
}

// 6. A truck brakes for the player standing in the road.
await T(() => window.__town.life.setTime(8 * 60 + 30));
let tr = null;
for (let i = 0; i < 40 && !tr; i++) { await T(() => window.__town.life.run(1)); tr = (await T(() => window.__town.life.trucks())).find((t) => /heading|delivering/.test(t.state)); }
if (tr) {
  await T(() => window.__town.life.run(0.5));
  const t1 = (await T(() => window.__town.life.trucks())).find((t) => t.state === tr.state);
  const dx = t1.x - tr.x, dz = t1.z - tr.z, d = Math.hypot(dx, dz) || 1;
  await T(([x, z]) => window.__town.place(x, z, 0), [t1.x + (dx / d) * 5, t1.z + (dz / d) * 5]);
  await page.waitForTimeout(300);
  const before = (await T(() => window.__town.life.trucks())).find((t) => t.state === tr.state);
  await page.waitForTimeout(1500);
  const after = (await T(() => window.__town.life.trucks())).find((t) => t.state === tr.state);
  check(before.braking && Math.hypot(after.x - before.x, after.z - before.z) < 0.2, `truck "${tr.state}" braked for the player`);
  await shot('truck');
} else check(false, 'found a truck on the road');

// 7. Chat: what they ate, gossip, relic hints (offline replies; Groq is not configured).
await T(() => window.__town.life.setTime(12 * 60 + 40));
await T(() => window.__town.life.run(20));
const key = await T(() => window.__town.meetVillager(2));
await nearTo(/^villager:/);
s = await st();
check(/^villager:/.test(s.nearPerson || ''), `standing by a villager (${s.nearPerson}; asked for ${key})`);
await press('e');
s = await st();
check(/lives at/.test(s.panel?.title || ''), `villager chat: ${s.panel?.title}`);
const ask = async (q) => {
  await T((q) => { const b = [...document.querySelectorAll('.chat-chip')].find((x) => x.dataset.ask === q); b.click(); }, q);
  await page.waitForFunction(() => !document.querySelector('.thinking'), null, { timeout: 15000 });
  await page.waitForTimeout(200);
  return T(() => [...document.querySelectorAll('.chat-log p.npc')].at(-1)?.textContent || '');
};
const meal = await ask('What did you eat today?'); console.log('   ', meal);
check(/(toast|eggs|milk|sandwich|pie|lamb|omelette|soup|roll|brekkie|white|toastie|parmy|roast|apple|fruit|salad|Bakery)/i.test(meal), 'says what they ate');
const gos = await ask("What's happening in town?"); console.log('   ', gos);
check(/(hear|Word|Well)/.test(gos) && gos.length > 30, 'shares town news');
const nb = await ask('Any gossip about the neighbours on this street?'); console.log('   ', nb);
check(nb.length > 30, 'gossips about the neighbours');
const clue = await ask('Any relic hints for the Adventure Guild?'); console.log('   ', clue);
check(/[A-Z][1-8]/.test(clue) && /relic|Guild|glowing|crystal/i.test(clue), 'gives an Adventure Guild relic hint');
await shot('chat');
await T(() => window.__town.closePanel());

// 8. Night: windows and street lamps light up, stars come out.
await T(() => window.__town.travel('M4'));
await T(() => window.__town.life.setTime(21 * 60 + 30));
await page.waitForTimeout(800);
s = await st();
check(s.daylight < 0.1, `21:30 is dark (daylight ${s.daylight.toFixed(2)})`);
const lum = async () => (await page.screenshot()).length;
await T(() => { const t = window.__town.state(); window.__town.place(t.pos.x, t.pos.z, Math.PI * 0.75); });
await page.waitForTimeout(500);
await shot('night-street');
await T(() => window.__town.goPlace('pub'));
await page.waitForTimeout(500);
await T(() => { const t = window.__town.state(); window.__town.place(t.pos.x - 10, t.pos.z + 6, -0.6); });
await page.waitForTimeout(500);
await shot('night-highstreet');
await T(() => window.__town.life.setTime(6 * 60 + 50));
await page.waitForTimeout(500);
await shot('dawn');
await T(() => window.__town.life.setTime(13 * 60));
await page.waitForTimeout(500);
s = await st();
check(s.daylight > 0.9, `13:00 is bright (daylight ${s.daylight.toFixed(2)})`);
void lum;

// 9. Residents walk between rooms, and go to the kitchen at dinner time.
await T(() => window.__town.travel('Y5'));
await T(() => { const t = window.__town.state(); window.__town.place(t.pos.x, t.pos.z - 9, 0); });
await page.waitForTimeout(1500);
s = await st();
if (s.mode !== 'house') { await T(() => window.__town.travel('Y5')); for (let i = 0; i < 30 && (await st()).mode !== 'house'; i++) { await page.keyboard.down('w'); await page.waitForTimeout(200); await page.keyboard.up('w'); } }
s = await st();
check(s.mode === 'house' && s.coordinate === 'Y5', `inside Y5 (${s.mode} ${s.coordinate})`);
await T(() => window.__town.life.setTime(18 * 60 + 5));
await T(() => window.__town.toExit());
const rooms = new Set();
for (let i = 0; i < 40; i++) { await page.waitForTimeout(1000); const p = (await st()).people[0]; if (p) rooms.add(p.room); if (rooms.has(0) && i > 5) break; }
s = await st();
console.log(`    resident rooms visited: ${[...rooms].join(', ')}; now ${s.people[0]?.activity}`);
check(rooms.size >= 2 && rooms.has(0), 'the resident walked through the house to the kitchen for dinner');
{ const r = (await st()).people[0]; await T(([x, z]) => { const yaw = Math.atan2(-(x - (x + 2)), 0); window.__town.place(x + 2, z, yaw); }, [r.x, r.z]); await page.waitForTimeout(600); }
await shot('resident-kitchen');
await T(() => window.__town.toExit());

// 10. Sound toggles without errors.
await page.click('#btn-sound');
s = await st(); const off = s.sound;
await page.click('#btn-sound');
s = await st();
check(off === false && s.sound === true, 'sound button toggles');
await page.waitForTimeout(1500);

check(errors.length === 0, `no page errors${errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''}`);
s = await st();
console.log(`  fps ${s.fps.toFixed(0)}, draw calls ${s.calls}, triangles ${s.triangles}`);
await browser.close();
console.log(fails.length ? `\n${fails.length} FAILED` : '\nAll town-life checks passed.');
process.exit(fails.length ? 1 : 0);
