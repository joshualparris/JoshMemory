// Salvage the fictional post-office resident data, without asserting that the
// real Australia Post staff member, home occupant, roster or store hours match it.
import assert from 'node:assert/strict';
import { NARROMINE_OSM } from '../src/world/narromine-osm-data.js';
import { townDate } from '../src/world/town-calendar.js';
import { NARROMINE_POSTAL_PERSON as person, POSTAL_HOME_OSM_BUILDING_INDEX as home,
  POSTAL_WALK_ROUTE_LOCAL, NSW_POSTAL_PUBLIC_HOLIDAYS, postalDayPlan, postalState }
  from '../src/world/narromine-postal-character.js';

assert.equal(person.id, 'narromine:post-office:leah-bennett');
assert.match(person.job, /fictional/);
assert.equal(person.home.address, null, 'no private house number or actual occupant assumed');
assert.equal(person.household.relationship, 'single', 'fictional relationship choice');
assert.equal(NARROMINE_OSM.buildings[home]?.kind, 'house', 'fictional home is a mapped footprint');
assert(POSTAL_WALK_ROUTE_LOCAL.length >= 2);
for (const p of POSTAL_WALK_ROUTE_LOCAL) assert(p.length === 2 && p.every(Number.isFinite),
  'path vertices must be real-world scale finite metres');
for (let day = 1; day <= 450; day++) {
  const slots = postalDayPlan(day);
  assert(slots.length >= 5, 'substantial 24-hour day');
  assert.equal(slots[0].start, 0, 'starts at midnight');
  assert.equal(slots.at(-1).end, 1440, 'ends at midnight');
  for (let i = 0; i < slots.length; i++) {
    const s = slots[i];
    assert(s.start < s.end && s.start >= 0 && s.end <= 1440, 'valid activity range');
    if(i) assert.equal(s.start, slots[i - 1].end, 'no overlapping or uncovered routine minutes');
    for (const minute of [s.start, Math.floor((s.start + s.end - 1) / 2), s.end - 1]) {
      const state = postalState(day, minute);
      assert.equal(state.place, s.place, 'state corresponds to daily activity');
      assert.equal(state.phase, s.phase);
    }
  }
  const d = townDate(day), isHoliday = NSW_POSTAL_PUBLIC_HOLIDAYS.has(d.iso);
  if (isHoliday) assert(!slots.some(s => s.phase === 'counter'), 'no scheduled fictional counter shift on public holiday');
}
console.log('PASS fictional Narromine postal resident: 450 contiguous plausible days, anonymous mapped home, deterministic activities (not real roster evidence)');
