// Isolated Repository Town yard operation tests (no Three.js or real-world railway claims).
import assert from 'node:assert/strict';
import { TownRailShunting, TOWN_YARD } from '../src/world/town-rail-shunting.js';
import { RAIL_Z, RAIL_CROSSINGS } from '../src/world/rail-corridor.js';

const yard = new TownRailShunting();
assert.equal(yard.status().limitKmh, 8);
assert.equal(yard.coupled, 0);
assert.equal(yard.wagons.length, 2);
assert.equal(yard.load({out:{parcel:50}}).ok, false, 'uncoupled loading prohibited');
assert.equal(yard.stage().ok, false, 'cannot stage empty wagons');
assert.equal(yard.couple().ok, false, 'cannot couple at a distance');
assert.equal(yard.uncouple().ok, false, 'cannot uncouple without wagons');
assert(Math.abs(TOWN_YARD.z-RAIL_Z)>8, 'yard siding is separate from scheduled freight main line');
assert(RAIL_CROSSINGS.every(c=>Math.abs(c.x-TOWN_YARD.west)>10 && Math.abs(c.x-TOWN_YARD.east)>10),
  'yard buffers stay outside all six public road-crossing locations');

function driveUntil(sim, predicate, direction, maxSteps=1000) {
  for(let i=0;i<maxSteps && !predicate(sim);i++) sim.advance(0.25,direction);
  return predicate(sim);
}
assert(driveUntil(yard,s=>s.stopped&&s.x>130,1), 'stop at uncoupled wagon before collision');
assert(yard.x<=132.3,'must not drive through first wagon');
assert(yard.couple().ok,'couple at close gap');
assert.equal(yard.coupled,1);
assert(driveUntil(yard,s=>s.stopped&&s.x>133,1),'stop at second wagon');
assert(yard.couple().ok,'join second wagon at low speed');
assert.equal(yard.coupled,2);
assert.equal(yard.couple().ok,false,'cannot exceed two wagons');

// Drive west to park wagon one at x=117, then brake and load from a finite stock.
assert(driveUntil(yard,s=>s.x<106,-1),'can move coupled wagons towards the depot');
assert(yard.load({out:{parcel:20}}).ok===false,'cannot load while moving');
for(let i=0;i<50&&!yard.stopped;i++)yard.advance(0.25,1); // opposing throttle first brakes
for(let i=0;i<70&&!yard.stopped;i++)yard.advance(0.25,0,true);
assert(yard.stopped,'service brake stops the shunter');
const wagonPosition=yard.carX(0);
assert(Math.abs(wagonPosition-TOWN_YARD.depotX)<7,'wagon should be beside the loading apron');
const depot={out:{parcel:7}};
const loaded=yard.load(depot);
assert(loaded.ok,loaded.message);
assert.equal(depot.out.parcel,3,'real depot stock consumed exactly once');
assert.equal(yard.wagons[0].load,4);
assert.equal(yard.load({out:{parcel:0}}).ok,false,'reject duplicate or unavailable loading');

// Run east with a fully loaded consist. Speed limit and wagon separation persist.
assert(driveUntil(yard,s=>s.carX(0)>=147,1),'can move loading stock to east yard');
for(let i=0;i<50&&!yard.stopped;i++)yard.advance(0.25,0,true);
assert(yard.stopped,'can brake before staging');
assert(yard.stage().ok,'stage a loaded consist at the siding stop');
assert.equal(yard.wagons[0].staged,true);
assert.equal(yard.stage().ok,false,'cannot mark identical load staged twice');
assert(Math.abs(yard.speedKmh)<=TOWN_YARD.limitKmh+0.11,'hard 8 km/h yard restriction');
assert(yard.carPositions().every(w=>w.x<=TOWN_YARD.east-TOWN_YARD.wagonLength/2+0.01));
assert(yard.uncouple().ok,'secure and uncouple last wagon at rest');
assert.equal(yard.coupled,1);

// Round-trip saved independent state, with invalid save safely rejected.
const saved=yard.snapshot();
const restored=new TownRailShunting(saved);
assert.deepEqual(restored.snapshot(),saved,'yard and finite cargo survive reload');
const rejected=new TownRailShunting({...saved,x:Infinity});
assert.equal(rejected.x,103,'invalid saves cannot displace train');
console.log('PASS: fictional siding alignment, two couplings, conservative collision, finite depot loading, staging, braking, 8km/h limit, uncoupling and save restore.');
