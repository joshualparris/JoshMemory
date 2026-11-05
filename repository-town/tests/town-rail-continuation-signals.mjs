import assert from 'node:assert/strict';
import {RAIL_Z,RAIL_CROSSINGS,setConnectingTrainPresence,connectingTrainGate,
  scheduledRailTrainX,railGateState} from '../src/world/rail-corridor.js';

const crossing=RAIL_CROSSINGS[0].x;
const depot=117;
const timed=410;
setConnectingTrainPresence(null);
assert.equal(connectingTrainGate(crossing),null);
assert.notEqual(scheduledRailTrainX(timed,depot),null,'original timetable must survive with no player train');
const present=(x,z,speed=9,heading=0,driving=true,cars=null)=>
  setConnectingTrainPresence({speed,driving,cars:cars||[{x,z,L:22,heading}]});
// At 170m away at 35km/h road traffic must stop with early warning.
present(crossing-170,RAIL_Z);
let g=railGateState(600,depot,crossing);
assert.equal(g.roadStop,true);assert.equal(g.arm,0.5);
assert.equal(g.source,'player-operated-connected-train');
// At less than 120m booms should be completely closed before passage.
present(crossing-110,RAIL_Z);
g=railGateState(600,depot,crossing);
assert.equal(g.arm,0);assert.equal(g.trainProceed,true);
// Trailing wagons must keep a crossing closed AFTER the locomotive passes.
present(crossing+85,RAIL_Z,9,0,true,[
 {x:crossing+85,z:RAIL_Z,L:22,heading:0},
 {x:crossing+62,z:RAIL_Z,L:15.5,heading:0},
 {x:crossing+38,z:RAIL_Z,L:15.5,heading:0},
 {x:crossing+13,z:RAIL_Z,L:15.5,heading:0},
 {x:crossing-5,z:RAIL_Z,L:15.5,heading:0},
]);
assert.equal(railGateState(600,depot,crossing).roadStop,true);
assert.equal(railGateState(600,depot,crossing).arm,0);
// Disabled when there are no trains in the crossing's relevant rail corridor.
present(crossing-80,RAIL_Z-360);
assert.equal(connectingTrainGate(crossing),null,'northern 180m loop return is not a road crossing');
present(crossing-180,RAIL_Z,8,Math.PI);
assert.equal(connectingTrainGate(crossing),null,'train departing west should not lower an approaching signal eastward');
// Reverse running toward a crossing is protected using actual signed speed.
present(crossing+160,RAIL_Z,-7,0);
assert.equal(railGateState(600,depot,crossing).roadStop,true,'reverse sign changes the approach direction');
// Stationary train on the crossing keeps gates down but one parked far away doesn't.
present(crossing,RAIL_Z,0,0,false);
assert.equal(railGateState(600,depot,crossing).roadStop,true);
present(crossing-140,RAIL_Z,0,0,false);
assert.equal(connectingTrainGate(crossing),null);
assert.notEqual(scheduledRailTrainX(timed,depot),null,
  'a stationary train 140m west of first crossing lies outside monitored town main and does not block freight');
present(crossing-90,RAIL_Z,0,0,false);
assert.equal(connectingTrainGate(crossing),null,
  'stationary wagons away from the crossing are not a reason for road closure');
assert.equal(scheduledRailTrainX(timed,depot),null,
  'scripted freight holds when actual player consist is inside the modelled main-line block');
setConnectingTrainPresence(null);
assert.notEqual(scheduledRailTrainX(timed,depot),null);
assert.equal(connectingTrainGate(crossing),null);
console.log('PASS all 6 existing level crossing interlocks: early warning, following hoppers, reverse, static occupancy, distant loop/yard exclusions, scripted train dispatch hold and reset');
