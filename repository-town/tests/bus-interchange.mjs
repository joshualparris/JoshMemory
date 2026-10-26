import assert from 'node:assert/strict';
import * as THREE from 'three';
import { BUS_LAYOUT as L } from '../src/world/bus-interchange-layout.js';
import { buildExpansionFacade,expansionFootprint } from '../src/world/town-expansion-facades.js';
import { buildCivicInterior } from '../src/world/shop-interior.js';
import { EXPANSION_SITES } from '../src/world/town-expansion.js';
import { Builder } from '../src/world/builder.js';
import { civicExitPose } from '../src/world/shop-exit.js';
import { civicEntranceZone,atCivicEntrance } from '../src/world/civic-entrance.js';
import { facilityAccess,openingHoursLabel } from '../src/world/facility-access.js';

const site=EXPANSION_SITES.find(p=>p.id==='busstop');
assert(site && site.col==='N' && site.row===5 && site.side==='north');
assert.deepEqual(expansionFootprint(site.style),{w:10,d:7});
const builder=new Builder();builder.glass=[];
const footprint=buildExpansionFacade(builder,site);
assert.deepEqual(footprint,{w:L.width,d:L.depth,front:L.face});
assert(builder.parts.length>50,'exterior has a roof, side glazing, seating, timetable, boarding paving and lights');
assert(builder.glass.length>=4,'exterior has genuine transparent glazing');
const icon=()=>new THREE.Sprite(new THREE.SpriteMaterial());
const built=buildCivicInterior(site,icon);
assert(built.busInterchangeLayout,'must use dedicated shelter, not generic High Street shop');
assert.deepEqual(built.rooms.map(r=>r.name),['Passenger waiting and information']);
assert.equal(built.bounds.x1-built.bounds.x0,L.width);
assert.equal(built.bounds.z1-built.bounds.z0,L.depth);
assert(built.windows.length>=4 && built.group.children.length>=65,'walkable room should be richly furnished, lit and glazed');
assert(built.seats.length>=2 && built.interactables.length>=5,'priority seating and real passenger information');
for(const key of ['information','timetable','boarding','priority','safety'])
 assert(built.interactables.find(i=>i.key==='busstop:'+key),key+' interaction');
assert(built.interactables.some(i=>i.act.do==='civic-ledger'),'staff enquiries retain town interaction');
assert(built.interactables.every(i=>!/\b\d{1,2}:\d{2}\b/.test(i.act.text) || /08:00/.test(i.act.text)),'no invented live bus departure times');
const radius=.35;
const hits=(x,z)=>built.colliders.some(b=>x>b.x0-radius&&x<b.x1+radius&&z>b.z0-radius&&z<b.z1+radius);
assert(!hits(built.spawn.x,built.spawn.z),'spawning visitor cannot clip furniture');
assert(!hits(0,6.85),'full-width door panels must leave the central 2.5 m opening');
for(let z=built.spawn.z;z<=7.3;z+=.15)assert(!hits(0,z),'straight walk from entry to street must be clear at '+z);
assert(built.exitZone.z0<built.rooms[0].z1 && built.exitZone.z1>built.rooms[0].z1);
for(const i of built.interactables)assert(!hits(i.pos.x,i.pos.z),'hotspot blocked: '+i.key);
// Flood fill by a wheelchair-sized player radius; prove all information points are reachable.
const step=.2,origin=built.spawn,q=[[0,0]],seen=new Set(['0,0']);
for(let j=0;j<q.length;j++){
 const [gx,gz]=q[j];
 for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
  const nx=gx+dx,nz=gz+dz,x=origin.x+nx*step,z=origin.z+nz*step,key=nx+','+nz;
  if(seen.has(key)||x<-4.65||x>4.65||z<.5||z>7.2||hits(x,z))continue;
  seen.add(key);q.push([nx,nz]);
 }
}
for(const i of built.interactables)assert(q.some(([x,z])=>Math.hypot(origin.x+x*step-i.pos.x,origin.z+z*step-i.pos.z)<.5),'not reachable: '+i.key);
const centre=L.centralClear;
assert(centre.x1-centre.x0>=2.4,'central passenger clearway at least 2.4 metres wide');
assert(L.boarding.width>=3.14&&L.boarding.depth>=2.07,'illustrative hardstand includes wheelchair turning envelope');
assert(openingHoursLabel(site).includes('24 HOURS'),'shelter stays public beyond staff reception hours');
assert(facilityAccess({minute:23*60,day:1,villagers:[]},site).allowed,'shelter cannot lock out waiting passengers at night');
const frontSite={...site,door:{x:30,z:25}};
const sensor=civicEntranceZone(frontSite);
assert(sensor.z0<frontSite.door.z,'door trigger is roadside, not rear wall');
assert(atCivicEntrance(frontSite,{x:30,z:24}),'approach from the actual road');
const rearWall={x0:25,x1:35,z0:25.3,z1:32};
const outside=civicExitPose(frontSite,[rearWall]);
assert(outside&&outside.z<frontSite.door.z-3&&outside.yaw===0,'exit faces north-side street, not back wall');
built.group.traverse(o=>{o.geometry?.dispose();o.material?.dispose?.();});
console.log('PASS: N5-N researched bus interchange exterior/interior, accessible circulation, five interactions and physical front-door round trip');
