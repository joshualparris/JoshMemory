import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { routeProgress, clearPedestrianSegment, escapeCrowdWaypoint } from '../src/world/pedestrian-progress.js';
import { TownLife } from '../src/world/life.js';

// One rider bounced back and forth around a busy shopfront for hours.
// A stationary target without NET progress must prompt a new approach.
const actor = { x:0, z:0, path:[{x:12,z:0}] };
assert.equal(routeProgress(actor,.5),false);
for(let i=0;i<6;i++)assert.equal(routeProgress(actor,.5),false);
assert.equal(routeProgress(actor,.5),true,'detect persistent orbit/backtracking');
assert.equal(escapeCrowdWaypoint(actor),true,'recover with a real detour');
assert.equal(actor.path.length,2);
assert.equal(actor.path[0].detour,true);
assert.equal(routeProgress(actor,.5),false,'fresh detour has a fresh progress timer');

// The detour must never clip through a building or park furniture.
const wall={hits:(x,z)=>x>1&&x<3&&z>-.3&&z<.3};
assert.equal(clearPedestrianSegment({x:0,z:0},{x:5,z:0},wall),false);
assert.equal(clearPedestrianSegment({x:0,z:2},{x:5,z:2},wall),true);
const blocked={x:0,z:0,path:[{x:8,z:0}]};
assert.equal(escapeCrowdWaypoint(blocked,{hits:()=>true}),false);
const crossing={x:0,z:0,path:[{x:8,z:0}]};
if(escapeCrowdWaypoint(crossing,wall)){
  assert(clearPedestrianSegment(crossing,crossing.path[0],wall));
  assert(clearPedestrianSegment(crossing.path[0],crossing.path[1],wall));
}

// After hours a publican's patrons belong INSIDE the pub, not in a permanent
// stationary crowd blocking the adjacent General Store's footpath.
const homes=[];
for(let row=1;row<=7;row++)for(let col=0;col<26;col+=2)
  homes.push({coordinate:String.fromCharCode(65+col)+row,name:'House',
    door:{x:(col-12.5)*26,z:(row-1)*46-161+4}});
const town=new TownLife({homes,minute:21*60+34,seed:20261020});
const customer=town.villagers[0];
customer.step={kind:'idle',at:'pub',dur:60,activity:'having a yarn at the pub'};
customer.inside=false;
town.arrive(customer);
assert.equal(customer.inside,true,'pub leisure customers must enter the building');

const named=readFileSync(new URL('../src/world/npcs.js',import.meta.url),'utf8');
assert(named.includes('entry.lastWalkBest'),'independently animated street characters also need a route-progress guard');
console.log('PASS: crowd-orbit watchdog, swept detour, unreachable route, and indoor pub patrons');
