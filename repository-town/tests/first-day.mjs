// "First day in town" (src/world/first-day.js): each step ticks off only from the town's real state
// (a hotel booking, a hatchet, logs cut and sold, money spent, wages earned, a night slept), steps
// already met are skipped, and progress and the hidden choice survive a save.
//   node tests/first-day.mjs
import assert from 'node:assert/strict';
import { TownLife } from '../src/world/life.js';
import { FIRST_DAY_STEPS, updateFirstDay, firstDayView, setFirstDayHidden } from '../src/world/first-day.js';
import { hotelCheckIn } from '../src/world/needs.js';
import { swing, sellLogs, takeRackTools } from '../src/world/skills.js';

const homes = Array.from({ length: 188 }, (_, i) => ({ coordinate: String.fromCharCode(65 + i % 26) + (1 + Math.floor(i / 26)), name: 'Home ' + i, door: { x: (i % 26 - 12.5) * 26, z: Math.floor(i / 26) * 46 - 157 } }));
const t = new TownLife({ homes, minute: 10 * 60, seed: 5 }), me = t.civic.player;
const step = () => firstDayView(t).id;
me.wallet = 200;

assert.equal(FIRST_DAY_STEPS.length, 7);
assert.deepEqual(updateFirstDay(t), []); assert.equal(step(), 'hotel', 'a new visitor starts at the hotel');
assert.equal(firstDayView(t).steps.length, 7);
assert.match(hotelCheckIn(t), /booked/);
assert.deepEqual(updateFirstDay(t), ['Book a room at the Railway Hotel']); assert.equal(step(), 'hatchet');

takeRackTools(me);
updateFirstDay(t); assert.equal(step(), 'chop');
const tree = (n) => ({ id: 'woodlot:tree-' + n, type: 'tree' });
swing(t, me, tree(1), () => 0); swing(t, me, tree(2), () => 0);
updateFirstDay(t); assert.equal(step(), 'chop', 'two logs are not three');
swing(t, me, tree(3), () => 0);
updateFirstDay(t); assert.equal(step(), 'sell');
assert(sellLogs(me, 'logs', { cash: 100 }).ok);
updateFirstDay(t); assert.equal(step(), 'food');

// Food: only money actually spent counts, from the moment this step began.
updateFirstDay(t); assert.equal(step(), 'food');
for (let i = 0; i < 180; i++) t.tick(0.5); updateFirstDay(t); assert.equal(step(), 'food', 'time passing buys nothing');
const msg = t.buyItem('store', Object.keys(t.place('store').stock).find((g) => t.place('store').stock[g] > 0));
assert.match(msg, /You buy/, msg);
updateFirstDay(t); assert.equal(step(), 'work');

// Work: wages actually paid.
updateFirstDay(t); assert.equal(step(), 'work');
t.jobsReport(); t.civic.jobs.earned += 18;
updateFirstDay(t); assert.equal(step(), 'sleep');

// Save and restore keeps progress and the hidden choice.
setFirstDayHidden(t, true);
const back = new TownLife({ homes, minute: 10 * 60, seed: 5 }); back.restore(JSON.parse(JSON.stringify(t.snapshot())));
assert.equal(firstDayView(back).id, 'sleep'); assert.equal(firstDayView(back).hidden, true);

me.lastSleptDay = t.day + 1;
assert.deepEqual(updateFirstDay(t), ['Sleep the night']);
assert(firstDayView(t).complete); assert.equal(me.firstDay.completedDay, t.day);

// A returning player who already has a hatchet skips that step straight after booking.
const r = new TownLife({ homes, minute: 10 * 60, seed: 6 }); r.civic.player.wallet = 200; takeRackTools(r.civic.player); hotelCheckIn(r);
assert.deepEqual(updateFirstDay(r), ['Book a room at the Railway Hotel', 'Get a hatchet']); assert.equal(firstDayView(r).id, 'chop');
// Corrupt saved progress is repaired, not trusted.
r.civic.player.firstDay = { step: 99, base: 'x' }; assert(firstDayView(r).complete);
r.civic.player.firstDay = { step: -3 }; assert.equal(firstDayView(r).index, 0);
console.log('PASS: first day in town: seven steps from real state (booking, hatchet, 3 logs cut, logs sold, money spent, wages, sleep), skips met steps, survives save/restore');
