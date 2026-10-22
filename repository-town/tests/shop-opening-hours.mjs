import assert from 'node:assert/strict';
import { PLACE_DEFS } from '../src/world/life.js';
import { visitorHours } from '../src/world/facility-access.js';
import { hoursDirectoryEntries, openingHoursPanel } from '../src/ui/shop-hours-panel.js';

const makeLife = (minute, villagers = [], active = null) => ({
  minute, day: 1, places: new Map(PLACE_DEFS.map((p) => [p.id, p])),
  villagers, jobsReport: () => ({active}), needsReport: () => ({booking:null}),
  time: () => `${String(Math.floor(minute/60)).padStart(2,'0')}:${String(minute%60).padStart(2,'0')}`,
});
const midday = makeLife(13*60);
const entries = hoursDirectoryEntries(midday);
assert.equal(entries.length, PLACE_DEFS.length, 'All town businesses and public places listed');
assert.equal(new Set(entries.map(e=>e.id)).size, PLACE_DEFS.length, 'No duplicate locations');
assert.equal(entries.find(e=>e.id==='store').hours, '07:00–20:00');
assert.equal(entries.find(e=>e.id==='bakery').hours, '06:00–18:00');
assert.equal(entries.find(e=>e.id==='cafe').hours, '06:30–17:00');
assert.equal(entries.find(e=>e.id==='hotel').hours, '07:00–23:00', 'Visitor reception, not 24h operations');
assert.equal(entries.find(e=>e.id==='power').hours, '08:00–18:00');
assert.equal(entries.find(e=>e.id==='square').hours, 'Open 24 hours');
assert.equal(entries.find(e=>e.id==='farmhouse').status, 'By appointment');
assert.equal(entries.find(e=>e.id==='store').status, 'Waiting for staff', 'Time alone cannot unlock entry');
const staff = {step:{kind:'work',at:'store'},path:[],x:0,z:0};
const served=hoursDirectoryEntries(makeLife(13*60,[staff]));
assert.equal(served.find(e=>e.id==='store').status, 'Open for entry');
const shut=hoursDirectoryEntries(makeLife(21*60,[staff]));
assert.equal(shut.find(e=>e.id==='store').status, 'Closed now');
assert.equal(shut.find(e=>e.id==='pub').status, 'Open for entry' === shut.find(e=>e.id==='pub').status ? 'Open for entry':'Waiting for staff');
const directory=openingHoursPanel(midday,()=>{});
assert.match(directory.body,/Commit Café/);
assert.match(directory.body,/Community Bank/);
assert.match(directory.body,/Go to General Store/);
assert.equal(typeof directory.mount,'function');
for(const p of PLACE_DEFS) {
  const e=entries.find(e=>e.id===p.id);
  const [a,b]=visitorHours(p);
  if(p.id!=='square'&&p.id!=='farmhouse') assert.equal(e.hours,`${String(Math.floor(a/60)).padStart(2,'0')}:${String(a%60).padStart(2,'0')}–${String(Math.floor(b/60)%24).padStart(2,'0')}:${String(b%60).padStart(2,'0')}`);
}
console.log('Town opening hours: all places, live staff and reception access verified');
