// Every staffed venue must have someone rostered for all of its advertised visitor
// hours; otherwise facilityAccess() locks the door as "unstaffed" while the sign
// says open (the Bakery used to lock from 15:00 to its 18:00 close).
//   node tests/roster-coverage.mjs
import assert from 'node:assert/strict';
import { TownLife, PLACE_DEFS } from '../src/world/life.js';
import { facilityAccess, visitorHours } from '../src/world/facility-access.js';
import { tradeEducationPanel } from '../src/ui/trade-education-panels.js';
import { hasItem } from '../src/world/inventory.js';

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

// A Monday customer must be able to buy a hatchet at 10:00, not merely read
// a roster. Actual workers must have reached the hardware counter.
while(life.minute < 10 * 60) life.tick(0.5);
const hardware=life.place('hardware');
const morning=facilityAccess(life,hardware);
const hardwareWorkers=life.villagers.filter(v=>v.work==='hardware').map(v=>({name:v.name,x:v.x,z:v.z,kind:v.step?.kind,at:v.step?.at,remaining:v.path?.length,inside:v.inside}));
console.log('Monday hardware 10:00:',JSON.stringify({front:hardware.front,morning,hardwareWorkers}));
assert.equal(morning.allowed,true,'Hardware must be actually staffed at 10am Monday');
console.log('✓ Hardware has a real on-site worker at 10am Monday');

// An established player's save may contain only the original 38 NPCs.
// Appended, genuinely rostered shop attendants must catch up when that save
// is restored at 10am, without moving anybody the user previously saved.
const oldSave = life.snapshot();
const oldPositions = new Map(oldSave.sim.villagers.slice(0, 38).map(v => [v.id,{x:v.x,z:v.z,step:v.step}]));
oldSave.sim.villagers = oldSave.sim.villagers.slice(0, 38);
const migrated = new TownLife({ homes, minute: 5 * 60, seed: 20261020 });
assert.equal(migrated.restore(oldSave), true, 'accept a valid older 38-person save');
assert.equal(migrated.time(),'10:00');
const restoredHardware = facilityAccess(migrated,migrated.place('hardware'));
console.log('Migrated hardware 10:00:',JSON.stringify({access:restoredHardware,workers:migrated.villagers.filter(v=>v.work==='hardware').map(v=>({id:v.id,kind:v.step?.kind,at:v.step?.at,x:v.x,z:v.z,remaining:v.path?.length}))}));
assert.equal(restoredHardware.allowed,true,'real newly added hardware staff attend on restoration of an old save');
for (const [id, before] of oldPositions) {
  const after=migrated.villagers[id];
  assert.equal(after.x,before.x,'previously saved resident '+id+' x must remain unchanged');
  assert.equal(after.z,before.z,'previously saved resident '+id+' z must remain unchanged');
}
console.log('✓ Restoring an older save catches up appended hardware staff and preserves existing villagers');
const sale=tradeEducationPanel(migrated,'hardware').actions.find(a=>a.label.startsWith('Buy a hatchet'));
assert(sale,'hatchet should be advertised while hardware is physically open');
const walletBefore=migrated.civic.player.wallet;
sale.run();
assert.equal(hasItem(migrated.civic.player,'hatchet'),true,'hatchet is received from staffed hardware');
assert.equal(walletBefore-migrated.civic.player.wallet,25,'hatchet purchase debits exactly $25');
const soldSave=migrated.snapshot();
const afterSale=new TownLife({homes,minute:5*60,seed:20261020});
assert.equal(afterSale.restore(soldSave),true);
assert.equal(hasItem(afterSale.civic.player,'hatchet'),true,'hatchet persists after reload');
console.log('✓ Monday 10:00 hardware sale charges $25, delivers hatchet and survives saved-game reload');

// The real simulation: late afternoon, the Bakery is still open and admits customers.
const bakery = life.place('bakery');
while (life.minute < 16 * 60 + 30) life.tick(0.5);
assert.equal(facilityAccess(life, bakery).allowed, true, 'Bakery admits customers at 16:30, before its 18:00 close');
console.log('✓ the Bakery is staffed and open at 16:30');
