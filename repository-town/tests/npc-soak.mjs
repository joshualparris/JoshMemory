// NPC playtest: a whole simulated day in the real browser build, with the town's real collision
// world, checking every villager every 10 town minutes and every named street character.
//   node tests/npc-soak.mjs [--url u] [--hours 24] [--quiet]
import { chromium } from 'playwright';
const args = process.argv.slice(2);
const opt = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
const URL = opt('--url', 'http://localhost:8091/'), HOURS = Number(opt('--hours', 24)), QUIET = args.includes('--quiet');
const fails = [];
const check = (ok, what) => { console.log(`${ok ? '✓' : '✗'} ${what}`); if (!ok) fails.push(what); };
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 800, height: 500 } });
const errors = []; page.on('pageerror', (e) => errors.push(e.message));
await page.goto(URL);
await page.waitForFunction(() => window.__town && document.getElementById('loading').hidden, null, { timeout: 90000 });
const T = (f, a) => page.evaluate(f, a);
// Park the player out of everyone's way so the test sees the town's own behaviour.
await T(() => window.__town.place(0, -400, 0));

// One sample: every villager's state plus whether they stand inside a building or on someone.
const sample = () => T(() => {
  const s = window.__town.state(), L = window.__town.life.ledger();
  const out = s.people.filter((p) => !p.inside);
  // A body's core (0.25 m) inside a solid; brushing past within the player's 0.35 m doesn't count.
  const inWall = out.filter((p) => window.__town.probeStatic(p.x, p.z, 0.25)).map((p) => `${p.name} (${p.activity}) at ${p.x.toFixed(1)},${p.z.toFixed(1)}`);
  const overlaps = [];
  for (let i = 0; i < out.length; i++) for (let j = i + 1; j < out.length; j++) {
    const d = Math.hypot(out[i].x - out[j].x, out[i].z - out[j].z);
    if (d < 0.45) overlaps.push(`${out[i].name}+${out[j].name} ${d.toFixed(2)}m at ${out[i].x.toFixed(0)},${out[i].z.toFixed(0)}`);
  }
  return { time: L.time, people: s.people.map((p) => ({ name: p.name, job: p.job, x: p.x, z: p.z, inside: p.inside, activity: p.activity })), inWall, overlaps };
});

await T(() => window.__town.life.setTime(0));
const track = new Map();   // name → { x, z, since (sample index), activity }
const stuck = new Map(), walls = new Map(), overlaps = [], nan = new Set();
let asleep3 = 0, atWork10 = 0, samples = 0, took3 = false, took10 = false;
for (let i = 0; i < HOURS * 6; i++) {
  await T(() => window.__town.life.run(10));
  const s = await sample(); samples++;
  for (const w of s.inWall) walls.set(w.split(' (')[0], `${s.time} ${w}`);
  if (s.overlaps.length) overlaps.push(`${s.time}: ${s.overlaps.slice(0, 3).join('; ')}`);
  for (const p of s.people) {
    if (!Number.isFinite(p.x) || !Number.isFinite(p.z)) nan.add(p.name);
    const moving = /^(walking|cycling) —/.test(p.activity || '');
    const prev = track.get(p.name);
    if (!prev || Math.hypot(prev.x - p.x, prev.z - p.z) > 0.5 || !moving) track.set(p.name, { x: p.x, z: p.z, since: i, activity: p.activity });
    else if (i - prev.since >= 3 && !stuck.has(p.name)) {
      const r = await T((n) => window.__town.life.route(n), p.name);
      stuck.set(p.name, `${s.time}: ${p.name} the ${p.job} "${p.activity}" has not moved for ${(i - prev.since) * 10} town minutes at ${p.x.toFixed(1)},${p.z.toFixed(1)}; bike ${r.bike}, next ${JSON.stringify(r.path.slice(0, 3).map((q) => [+q.x.toFixed(1), +q.z.toFixed(1), q.detour ? 'detour' : '']))}, step ${JSON.stringify(r.step)}`);
    }
  }
  // The live game loop also moves the clock between samples, so take the first
  // sample in each ten-minute window rather than an exact minute.
  if (/^03:0/.test(s.time) && !took3) { took3 = true; asleep3 = s.people.filter((p) => /asleep/.test(p.activity)).length; }
  if (/^10:0/.test(s.time) && !took10) { took10 = true; atWork10 = s.people.filter((p) => !/asleep|walking —|cycling —/.test(p.activity)).length; }
  if (!QUIET && i % 18 === 0) console.log(`  ${s.time}: ${s.people.filter((p) => !p.inside).length} out, ${s.people.filter((p) => /^(walking|cycling)/.test(p.activity)).length} travelling`);
}
const all = (await T(() => window.__town.state())).people.length;
check(!nan.size, `no villager position becomes NaN (${[...nan].join(', ')})`);
check(!stuck.size, `no villager stays stuck mid-journey for 30+ town minutes${stuck.size ? ':\n    ' + [...stuck.values()].slice(0, 8).join('\n    ') : ''}`);
// A few brief grazes a day remain where yard objects sit on the avenue kerb (see COORDINATION.md);
// main before the routing fixes had about 8 villagers a day walking through buildings and yards.
check(walls.size <= 3, `villagers keep out of buildings and walls (${walls.size} brief contacts a day, at most 3)${walls.size ? ':\n    ' + [...walls.values()].slice(0, 8).join('\n    ') : ''}`);
check(overlaps.length <= samples * 0.05, `villagers rarely overlap one another (${overlaps.length} of ${samples} samples)${overlaps.length ? ':\n    ' + overlaps.slice(0, 5).join('\n    ') : ''}`);
check(asleep3 >= all * 0.8, `most villagers are asleep at 3am (${asleep3} of ${all})`);
check(atWork10 >= all * 0.6, `most villagers are busy (not travelling) at 10am (${atWork10} of ${all})`);

// The named street characters: in the open, not inside buildings, not on top of one another.
const street = await T(() => window.__town.streetPeople().map((n) => ({ ...n, inWall: !!window.__town.probeStatic(n.x, n.z) })));
const streetWalls = street.filter((n) => n.mode === 'town' && n.inWall).map((n) => `${n.name} at ${n.x.toFixed(1)},${n.z.toFixed(1)}`);
const streetPairs = [];
for (let i = 0; i < street.length; i++) for (let j = i + 1; j < street.length; j++) if (Math.hypot(street[i].x - street[j].x, street[i].z - street[j].z) < 0.6) streetPairs.push(`${street[i].name}+${street[j].name}`);
check(street.length >= 30 && !streetWalls.length, `${street.length} street characters, none inside a building${streetWalls.length ? ': ' + streetWalls.join(', ') : ''}`);
check(!streetPairs.length, `street characters don't stand on one another${streetPairs.length ? ': ' + streetPairs.join(', ') : ''}`);
check(!errors.length, `no page errors${errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''}`);
await browser.close();
console.log(fails.length ? `\n${fails.length} FAILED` : '\nAll NPC checks passed.');
process.exit(fails.length ? 1 : 0);
