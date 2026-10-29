// Playtests the town's people: villagers (run by src/world/life.js) walk and cycle to
// work without clipping into buildings, stop and face you when you come up to them, and
// chat; residents move about their house indoors and stop for you.
//   node tests/people.mjs [--url u] [--shots dir]
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const URL = opt('--url', 'http://localhost:8091/');
const SHOTS = opt('--shots', null);
const fails = [];
const check = (ok, what) => { console.log(`${ok ? '✓' : '✗'} ${what}`); if (!ok) fails.push(what); };

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1100, height: 700 }, locale: 'en-US' });
const errors = []; page.on('pageerror', (e) => errors.push(e.message));
await page.route('**/api/npc-chat', (route) => route.abort('connectionrefused'));
await page.goto(URL);
await page.waitForFunction(() => window.__town && document.getElementById('loading').hidden, null, { timeout: 60000 });
await page.evaluate(() => { localStorage.removeItem('repository-town.groq-keys'); localStorage.removeItem('repository-town.npc-chats'); });
const st = () => page.evaluate(() => window.__town.state());
const shot = async (n) => SHOTS && page.screenshot({ path: `${SHOTS}/people-${n}.png` });

// 1. At 7:50 the town is commuting: villagers walk or cycle, never inside a building.
await page.evaluate(() => { window.__town.life.setTime(7 * 60 + 50); window.__town.life.run(20); });
await page.waitForTimeout(2000);
let s = await st();
const before = s.people;
check(before.length >= 20, `${before.length} villagers in town`);
let inside = 0, looks = 0;
const samples = [];
for (let i = 0; i < 12; i++) {
  await page.waitForTimeout(1000);
  const p = (await st()).people;
  for (const v of p) if (!v.inside) { looks++; if (await page.evaluate(([x, z]) => window.__town.probe(x, z), [v.x, v.z])) inside++; }
  samples.push(p);
}
const after = samples.at(-1);
const moved = after.filter((v, i) => Math.hypot(v.x - before[i].x, v.z - before[i].z) > 2).length;
check(moved >= 5, `${moved}/${before.length} villagers moved more than 2 m in 12 s (the rest are at home or at work)`);
check(inside === 0, `no villager stood inside a wall or house (${inside} overlaps in ${looks} samples)`);

// 2. Walk up to a villager: you're prompted to talk. Being nearby doesn't hold anyone up (they go
// on with their day, src/world/townlife.js); opening a chat does, and they stop while you talk.
// A genuinely commuting villager can walk away between our teleport and the
// next software-rendered frame. Follow another passer-by as a player would,
// but still require a real nearby talk prompt before interacting.
let key=null;
for(let attempt=0;attempt<5;attempt++){
  key=await page.evaluate((i) => window.__town.meetVillager(i),attempt);
  const found=await page.waitForFunction(() => /^villager:/.test(window.__town.state().nearPerson || ''), null, {timeout:1600,polling:50}).then(()=>true).catch(()=>false);
  if(found)break;
}
console.log(`  meeting ${key}`);
s = await st();
check(/^villager:/.test(s.nearPerson || ''), `prompted to talk (${s.nearPerson})`);
await shot('1-meet-villager');
let chatOpened = false;
for (let attempt = 0; attempt < 5 && !chatOpened; attempt++) {
  // A real commuter can leave the prompt between rendered frames. Re-approach
  // a passer-by rather than treating an expired interaction as a game failure.
  if (attempt) await page.evaluate((i) => window.__town.meetVillager(i), attempt);
  await page.waitForFunction(() => /^villager:/.test(window.__town.state().nearPerson || ''), null, { timeout: 3000 }).catch(() => {});
  await page.keyboard.down('e'); await page.waitForTimeout(120); await page.keyboard.up('e');
  chatOpened = await page.waitForSelector('#panel .chat-input', { timeout: 3000 }).then(() => true).catch(() => false);
}
if (!chatOpened) throw new Error('Could not open a real nearby villager conversation after five approaches');
s = await st();
const title = await page.innerText('#panel-title');
check(/lives at [A-Z]\d/.test(title), `chat opens: "${title}"`);
const chatting = s.nearPerson;
const v0 = (await st()).people.find((v) => v.key === chatting);
await page.waitForTimeout(1500);
const v1 = (await st()).people.find((v) => v.key === chatting);
check(Math.hypot(v1.x - v0.x, v1.z - v0.z) < 0.3, 'villager stops walking while you chat');
const talking = (await st()).nearPerson;
const replies = [];
for (const msg of ['hello', 'how are you?', 'what are you up to?', 'any games around here?', 'thanks, bye']) {
  const n = await page.locator('#panel .chat-log .npc:not(.thinking)').count();
  await page.fill('#panel .chat-input', msg); await page.press('#panel .chat-input', 'Enter');
  await page.waitForFunction((n) => document.querySelectorAll('#panel .chat-log .npc:not(.thinking)').length > n, n, { timeout: 15000 });
  replies.push(`${msg} → ${(await page.locator('#panel .chat-log .npc:not(.thinking)').last().innerText()).replace(/^\w+: /, '')}`);
}
console.log('  ' + replies.join('\n  '));
check(new Set(replies.map((r) => r.split(' → ')[1])).size === replies.length, 'every reply is different');
await shot('2-villager-chat');
await page.click('#panel-close');
await page.evaluate(() => window.__town.place(0, -300, 0));
await page.waitForTimeout(3000);
const v2 = (await st()).people.find((v) => v.key === talking);
const vt = v1.key === talking ? v1 : before.find((v) => v.key === talking);
check(Math.hypot(v2.x - vt.x, v2.z - vt.z) > 0.5 || v2.inside, 'villager carries on after the chat');

// 3. Indoors (mid-morning, between meals): the resident wanders, then stops for you.
await page.evaluate(() => window.__town.life.setTime(10 * 60));
await page.evaluate(() => window.__town.travel('M5'));
await page.waitForTimeout(600);
await page.keyboard.down('w');
await page.waitForFunction(() => window.__town.state().mode === 'house', null, { timeout: 20000 });
await page.keyboard.up('w');
const r0 = (await st()).people[0];
let r1 = r0, far = 0;
for (let i = 0; i < 20 && far < 0.8; i++) { await page.waitForTimeout(1000); r1 = (await st()).people[0]; far = Math.max(far, Math.hypot(r1.x - r0.x, r1.z - r0.z)); }
check(far > 0.8, `resident ${r0.name} moves about the house (${far.toFixed(1)} m; rooms ${r0.room} → ${r1.room})`);
check(!(await page.evaluate(([x, z]) => window.__town.probe(x, z), [r1.x, r1.z])), 'resident never stands inside furniture');
const npc = (await st()).interactables.find((x) => x.do === 'npc');
await page.evaluate((k) => window.__town.approach(k), npc.key);
await page.waitForTimeout(1200);
const r2 = (await st()).people[0];
await page.waitForTimeout(1500);
const r3 = (await st()).people[0];
check(Math.hypot(r3.x - r2.x, r3.z - r2.z) < 0.3, 'resident stops when you walk up');
await shot('3-resident');
await page.keyboard.press('e');
await page.waitForSelector('#panel .chat-input', { timeout: 8000 });
await page.fill('#panel .chat-input', 'hi there'); await page.press('#panel .chat-input', 'Enter');
await page.waitForFunction(() => document.querySelectorAll('#panel .chat-log .npc:not(.thinking)').length > 0, null, { timeout: 15000 });
console.log('  resident: hi there → ' + (await page.locator('#panel .chat-log .npc').last().innerText()));
await shot('4-resident-chat');
check(!errors.length, `no page errors ${errors.join(' | ')}`);
await browser.close();
console.log(fails.length ? `\n${fails.length} FAILED` : '\nAll people checks passed.');
process.exit(fails.length ? 1 : 0);
