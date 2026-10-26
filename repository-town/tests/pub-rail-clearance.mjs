import assert from 'node:assert/strict';
import {RAIL_Z,RAIL_STRUCTURE_HALF_WIDTH,RAIL_CROSSINGS,withinLevelCrossing} from '../src/world/rail-corridor.js';
import {PUB_ENVELOPE,buildPubFacade} from '../src/world/pub-envelope.js';
const lot8=7*46-3.5*46, rearBoundary=lot8-23;
assert(RAIL_Z+RAIL_STRUCTURE_HALF_WIDTH<rearBoundary,'rail envelope must be behind row-8 lots');
const shapes=[];
const b={box:(...a)=>shapes.push(a),solid:()=>{},block:()=>{},cyl:()=>{},pyramid:()=>{},add:()=>{}};
const facade=buildPubFacade(b);
const stairs=facade.pieces.filter(p=>p.name.startsWith('escape-stair'));
assert(stairs.length>20,'pub exterior stairs must exist');
for(const p of stairs){
 const rear=lot8+p.z-p.d/2;
 assert(rear>RAIL_Z+RAIL_STRUCTURE_HALF_WIDTH,'pub stair '+p.name+' overlaps rail clearance');
}
assert.equal(RAIL_CROSSINGS.length,6);
assert(withinLevelCrossing(RAIL_CROSSINGS[0].x));
console.log('PASS pub stair/rail clearance, row-8 lot setback and crossing positions');
