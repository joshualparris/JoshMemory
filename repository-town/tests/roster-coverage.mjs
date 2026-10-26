// Every staffed venue must have someone rostered for all of its advertised visitor
// hours; otherwise facilityAccess() locks the door as "unstaffed" while the sign
// says open (the Bakery used to lock from 15:00 to its 18:00 close).
//   node tests/roster-coverage.mjs
import assert from 'node:assert/strict';
import { TownLife, PLACE_DEFS } from '../src/world/life.js';
import { facilityAccess, visitorHours } from '../src/world/facility-access.js';

const homes = [];
for (let r = 0; r < 14; r++) for (let c = 0; c < 26; c++) homes.push({
  coordinate: String.fromCharCode(65 + c) + (r + 1), name: 'Home',
  door: { x: (c - 12.5) * 26, z: r * 46 - 161 + 4 },
});
const life = new TownLife({ homes, minute: 5 * 60, seed: 20261020 });
const fmt = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

const gaps = [];
for (const place of PLACE_DEFS) {
  const [opens, closes] = visitorHours(place);
  if (!(closes > opens)) continue;
  // Places that admit visitors with nobody on duty (public spaces, permanent
  // hosts, expansion preview shells) need no roster.
  const empty = { ...life, minute: opens, day: life.day, villagers: [], jobsReport: () => ({}), needsReport: () => ({}) };
  if (facilityAccess(empty, place).allowed) continue;
  const roster = life.villagers.filter((v) => v.work === place.id);
  for (let m = opens; m < closes; m += 15)
    if (!roster.some((v) => m >= v.start && m < v.end)) { gaps.push(`${place.name} ${fmt(m)}`); break; }
}
assert.deepEqual(gaps, [], 'every staffed venue has a rostered worker for all visitor hours');
console.log('✓ every staffed venue is rostered across its visitor hours');

// The real simulation: late afternoon, the Bakery is still open and admits customers.
const bakery = life.place('bakery');
while (life.minute < 16 * 60 + 30) life.tick(0.5);
assert.equal(facilityAccess(life, bakery).allowed, true, 'Bakery admits customers at 16:30, before its 18:00 close');
console.log('✓ the Bakery is staffed and open at 16:30');
