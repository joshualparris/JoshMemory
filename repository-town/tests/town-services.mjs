// Expansion buildings have real things to do (src/world/town-services.js).
// Regression for the 29 Oct 2026 playtest: 71 of 72 expansion counters offered nothing.
import assert from 'node:assert/strict';
import { TownLife } from '../src/world/life.js';
import { EXPANSION_SITES } from '../src/world/town-expansion.js';
import { TOWN_SERVICES, servicesFor, serviceBlock, useService } from '../src/world/town-services.js';
import { placePanel } from '../src/ui/townpanels.js';
import { shopService } from '../src/world/shop-attendance.js';

const homes = [];
for (let r = 0; r < 8; r++) for (let c = 0; c < 26; c++) if (homes.length < 188) homes.push({ coordinate: String.fromCharCode(65 + c) + (r + 1), name: 'Home', door: { x: (c - 12.5) * 26, z: r * 46 - 157 } });
const t = new TownLife({ homes, minute: 7 * 60, seed: 20261029 });
const me = t.civic.player;

// 1. Coverage: every expansion site except the supermarket (which sells groceries) has services,
// and every service belongs to a real site with sensible data.
const ids = new Set(EXPANSION_SITES.map((x) => x.id));
for (const site of EXPANSION_SITES) if (site.id !== 'supermarket') assert.ok(servicesFor(site.id).length >= 1, site.id + ' has something to do');
for (const [id, list] of Object.entries(TOWN_SERVICES)) {
  assert.ok(ids.has(id), 'service site exists: ' + id);
  assert.equal(new Set(list.map((x) => x.id)).size, list.length, id + ' service ids are unique');
  for (const x of list) {
    assert.ok(x.label && x.text && Number.isFinite(x.price) && x.price >= 0 && x.price <= 75, `${id}:${x.id} is affordable on a new player's $75`);
    assert.ok(Math.abs(x.hunger) <= 70 && Math.abs(x.fatigue) <= 15, `${id}:${x.id} effects are modest`);
    assert.doesNotMatch(x.label + x.text, /scratchie|lotto|pokies|gambl|bet\b/i, 'no gambling');
  }
}

// 2. Run the real clock until the gym instructor is physically at work (no shortcuts).
const gym = t.place('gym');
assert.match(serviceBlock(t, 'gym', servicesFor('gym')[0]) || '', /closed|waiting for staff/i, 'nothing before opening or before staff arrive');
for (let i = 0; i < 6 * 120 && !shopService(t, gym).staff?.length; i++) t.tick(0.5);
assert.ok(shopService(t, gym).staff?.length, 'the fitness instructor reaches the gym');

// 3. A paid service: wallet, till, tax, receipt, effects, daily limit.
me.wallet = 50; me.hunger = 30; me.fatigue = 30;
const till = gym.till, treasury = t.civic.treasury;
const panel = placePanel(t, 'gym');
const workout = panel.actions.find((a) => /^Gym workout \(\$12\)$/.test(a.label));
assert.ok(workout, 'the gym counter offers the workout: ' + JSON.stringify(panel.actions.map((a) => a.label)));
const after = workout.run();
assert.match(after.body, /Weights, rowing machine/);
assert.equal(me.wallet, 38, 'paid $12');
assert.ok(Math.abs(gym.till + (t.civic.treasury - treasury) - till - 12) < 0.01, 'the $12 goes to the till and GST to the treasury');
assert.equal(me.hunger, 40); assert.equal(me.fatigue, 42);
assert.match(useService(t, 'gym', 'workout'), /already done that today/, 'once per town day');
assert.equal(me.wallet, 38, 'a refused service costs nothing');
assert.ok(me.serviceLog[0].label === 'Gym workout' && me.serviceLog[0].place === gym.name, 'logged');

// 4. Food lowers hunger and records the meal; restful services lower fatigue; values clamp.
for (let i = 0; i < 6 * 120 && !shopService(t, t.place('takeaway')).staff?.length; i++) t.tick(0.5);
me.hunger = 50;
assert.match(useService(t, 'takeaway', 'fishchips'), /Wrapped in paper.*paid \$13/);
assert.equal(me.hunger, 0, 'clamped at 0'); assert.match(me.lastAte, /fish and chips/);

// 5. Self-serve places need no staff, but still keep opening hours.
const garden = servicesFor('communitygarden').find((x) => x.id === 'weed');
assert.ok(garden.selfServe);
t.minute = 23 * 60;
assert.equal(serviceBlock(t, 'communitygarden', garden), null, 'the garden is open around the clock, no staff needed');
assert.match(serviceBlock(t, 'church', servicesFor('church')[0]) || '', /closed/, 'the church still closes at 17:30');

// 6. Not enough money: refused with a clear reason, nothing changes.
t.minute = 12 * 60; me.wallet = 3;
for (let i = 0; i < 6 * 120 && !shopService(t, t.place('beauty')).staff?.length; i++) t.tick(0.5);
const block = serviceBlock(t, 'beauty', servicesFor('beauty')[0]);
assert.match(block, /You need \$50 but only have \$3/);
assert.match(placePanel(t, 'beauty').body, /Book a facial · \$50 <span class="dim">— You need \$50/, 'the panel lists it with the reason');

// 7. Save and load keep the daily limits and the log.
const saved = JSON.parse(JSON.stringify(t.snapshot()));
const t2 = new TownLife({ homes, minute: 7 * 60, seed: 1 });
t2.restore(saved);
assert.equal(t2.civic.player.services['gym:workout'], t.day);
assert.equal(t2.civic.player.serviceLog.length, me.serviceLog.length);
console.log(`town-services: ${Object.keys(TOWN_SERVICES).length} expansion buildings, ${Object.values(TOWN_SERVICES).flat().length} services; paid, staffed, daily-limited and saved.`);
