// Real crossing behaviour, failure injection and safety-envelope acceptance.
import assert from 'node:assert/strict';
import {TownLife,trainX} from '../src/world/life.js';
import {RAIL_Z,RAIL_GAUGE,RAIL_CROSSINGS,RAIL_STRUCTURE_HALF_WIDTH,
 RAIL_DEPOT_PLATFORM_SETBACK,RAIL_DEPOT_PLATFORM_DEPTH,RAIL_APPROACH_WARNING_MINUTES,
 railGateState,railUserBlocked,railGateBoxes,railClearanceAudit,scheduledRailTrainX}
 from '../src/world/rail-corridor.js';

assert.equal(RAIL_GAUGE,1.435);
assert(RAIL_DEPOT_PLATFORM_SETBACK-RAIL_DEPOT_PLATFORM_DEPTH/2>=RAIL_STRUCTURE_HALF_WIDTH,
 'freight apron must clear the track structure envelope');
assert(RAIL_APPROACH_WARNING_MINUTES>=1/3,'20 seconds minimum simulated warning');
assert.equal(RAIL_CROSSINGS.length,6);
assert.deepEqual(RAIL_CROSSINGS.map(c=>c.x),[-338,-208,-78,52,182,312]);
const depotX=117;
for(const minute of [399,400,407,415,420,440,441,460]){
 assert.equal(scheduledRailTrainX(minute,depotX),trainX(minute,depotX));
}
const phases={warning:railGateState(404,depotX,312),
 lowering:railGateState(405,depotX,312),
 closed:railGateState(406,depotX,312),
 clear:railGateState(413,depotX,312),
 fault:railGateState(10,depotX,312,{fault:true})};
for(const [key,g] of Object.entries(phases))assert.equal(g.phase,key,key);
assert.equal(phases.warning.roadStop,true);
assert.equal(phases.warning.arm,1);
assert.equal(phases.lowering.arm,0.5);
assert.equal(phases.closed.arm,0);
assert.equal(phases.closed.trainProceed,true);
assert.equal(phases.fault.roadStop,true);
assert.equal(phases.fault.trainProceed,false);
assert.equal(phases.clear.roadStop,false);
assert.equal(railGateState(440,depotX,52).phase,'warning',
 'departure warning must begin before engine leaves depot');
assert.equal(railGateState(441,depotX,52).phase,'lowering');
assert.equal(railGateState(442,depotX,52).phase,'closed');
assert.equal(railGateState(425,depotX,182).phase,'clear',
 'stopped depot train must not keep an already-clear crossing closed');
assert.equal(railGateState(470,depotX,52,{heldFront:52}).phase,'occupied',
 'train held over crossing cannot give false open aspect');

const blocking=railGateState(406,depotX,312);
assert(railUserBlocked({x:315.6,z:134},{x:315.6,z:137},blocking,{radius:0.59}));
assert(railUserBlocked({x:313.7,z:131},{x:313.7,z:136},blocking,{halfLength:3.5,radius:0.6}),
 'truck must stop its front bumper before the boom');
assert(!railUserBlocked({x:315.6,z:142},{x:315.6,z:150},blocking,{radius:0.59}),
 'walker already over track must be allowed to clear');
assert(!railUserBlocked({x:315.6,z:133},{x:315.6,z:136},phases.clear,{radius:0.59}));
assert(!railUserBlocked({x:120,z:133},{x:120,z:137},blocking,{radius:0.59}),
 'not at a crossing');
assert.equal(railGateBoxes(312).length,2);
assert.deepEqual(railClearanceAudit([{x0:3,x1:5,z0:RAIL_Z-0.5,z1:RAIL_Z+0.5},
 {x0:30,x1:34,z0:RAIL_Z+9,z1:RAIL_Z+11}]).map(c=>c.index),[0]);

const homes=[];
for(let r=0;r<8;r++)for(let c=0;c<26;c++){
 if(r===7&&c>=6)continue;
 homes.push({coordinate:String.fromCharCode(65+c)+(r+1),name:'Test home',
 door:{x:(c-12.5)*26,z:r*46-161+4}});
}
const sim=new TownLife({homes,minute:406,seed:17});
assert.equal(sim.railGate(312).phase,'closed');
const truck=sim.trucks[0]; // Use actual driving gate enforcement, without invented visuals.
assert(sim.railRoadBlocked({x:313.7,z:131},{x:313.7,z:136},3.5,0.6));
assert(sim.railRoadBlocked({x:315.6,z:134},{x:315.6,z:137},0,0.59));
sim.setRailFault(true);
const held=sim.railTrainFront();
assert.equal(held,trainX(406,depotX));
sim.tick(0.5);
assert.equal(sim.railTrainFront(),held,'failed interlocking freezes the simulated consist');
for(const crossing of RAIL_CROSSINGS){
 assert.equal(sim.railGate(crossing.x).phase,'fault');
 assert.equal(sim.railGate(crossing.x).trainProceed,false);
}
sim.setRailFault(false);
assert.equal(sim.railTrainFront(),held,'train does not jump after fault recovery');
assert.equal(sim.railGate(312).phase,'occupied','held train retains protection if on crossing');
assert.equal(truck!=null,true);
console.log('PASS: six crossing approaches, phased early warnings, full truck/pedestrian stops, fault holds, no stale reopening, measured depot setback.');
