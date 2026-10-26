import assert from 'node:assert/strict';
import * as THREE from 'three';
import { EXPANSION_SITES } from '../src/world/town-expansion.js';
import { buildExpansionFacade,expansionFootprint } from '../src/world/town-expansion-facades.js';
import { buildCivicInterior } from '../src/world/shop-interior.js';
import { Builder } from '../src/world/builder.js';
import { CEMETERY_LAYOUT as L } from '../src/world/cemetery-office-layout.js';
import { civicEntranceZone,atCivicEntrance,closedCivicDoorPose } from '../src/world/civic-entrance.js';
import { civicExitPose } from '../src/world/shop-exit.js';
import { visitorHours } from '../src/world/facility-access.js';
const place=EXPANSION_SITES.find(s=>s.id==='cemetery');
assert(place&&place.col==='M'&&place.row===5&&place.side==='north'&&place.taskId==='RTBUILD-068');
assert.deepEqual(expansionFootprint(place.style),{w:12,d:9});
const b=new Builder();b.glass=[];
assert.deepEqual(buildExpansionFacade(b,place),{w:12,d:9,front:7});
assert(b.parts.length>80,'solid vernacular shell, rain shelter, flower beds, memorial sample and seating');
assert(b.glass.length>=3,'front daylight windows plus glazed actual door');
const label=()=>new THREE.Sprite(new THREE.SpriteMaterial());
const room=buildCivicInterior(place,label);
assert(room.cemeteryOfficeLayout,'M5-N must not use a generic shop interior');
assert.equal(room.bounds.x1-room.bounds.x0,L.w);
assert.equal(room.bounds.z1-room.bounds.z0,L.d);
assert.deepEqual(room.rooms.map(r=>r.name),[
 'Welcome and records enquiries','Private family consultation','Staff records review']);
assert(room.group.children.length>100,'office richly modelled, glazed and illuminated');
assert(room.seats.length>=4,'real waiting and private consultation seating');
assert(room.windows.length>=4,'four views to the outside');
const actions=['enquiries','map','samples','flowers','consult','records','rights','maintenance'];
for(const key of actions)assert(room.interactables.some(i=>i.key==='cemetery:'+key),'interaction '+key);
assert(room.interactables.some(i=>i.act.do==='civic-ledger'),'real existing town ledger help');
assert(room.interactables.every(i=>!/(?:birthdate|passport|deceased name|real record|customer file)/i.test(i.act.text)),
 'no sensitive resident or deceased data fabricated');
const blocked=(x,z,r=.35)=>room.colliders.some(c=>x>c.x0-r&&x<c.x1+r&&z>c.z0-r&&z<c.z1+r);
assert(!blocked(room.spawn.x,room.spawn.z),'visitor spawn not in walls/furniture');
for(let z=room.spawn.z;z<=7.12;z+=.12)assert(!blocked(0,z),'front door must be open at '+z);
assert(L.doorHalfWidth*2>=2.5,'usable 2.5 metre lobby opening');
const step=.2,queue=[[0,0]],seen=new Set(['0,0']),origin=room.spawn;
for(let i=0;i<queue.length;i++){
 const [gx,gz]=queue[i];
 for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
  const nx=gx+dx,nz=gz+dz,x=origin.x+nx*step,z=origin.z+nz*step,k=nx+','+nz;
  if(seen.has(k)||x<-5.60||x>5.60||z<-1.58||z>7.2||blocked(x,z))continue;
  seen.add(k);queue.push([nx,nz]);
 }
}
const pts=queue.map(([x,z])=>[origin.x+x*step,origin.z+z*step]);
for(const spot of room.interactables){
 assert(!blocked(spot.pos.x,spot.pos.z,.3),'hotspot in furniture: '+spot.key);
 assert(pts.some(([x,z])=>Math.hypot(x-spot.pos.x,z-spot.pos.z)<.5),
   'physically unreachable: '+spot.key);
}
for(const [index,r] of room.rooms.entries()){
 assert(pts.some(([x,z])=>x>r.x0+.35&&x<r.x1-.35&&z>r.z0+.35&&z<r.z1-.35),
  'room '+index+' is walkable from reception');
}
assert(pts.some(([x,z])=>x>-4.18&&x<-3.35&&z<-.45),'consultation entrance really opens');
assert(pts.some(([x,z])=>x>4.49&&x<5.04&&z<-.45),'records entrance really opens');
const north={...place,door:{x:24,z:51}};
assert(atCivicEntrance(north,{x:24,z:50}), 'street-facing entry in the established road');
const zone=civicEntranceZone(north);
assert(zone.z0<51&&zone.z1<51.5,'sensor outside front wall');
const deny=closedCivicDoorPose(north,{x:24,z:50});
assert(deny.z<51&&!atCivicEntrance(north,deny),'denied access bounces onto the street');
const exit=civicExitPose(north,[{x0:18,x1:30,z0:51.2,z1:60}]);
assert(exit&&exit.z<48&&exit.yaw===0,'leaving cemetery office uses front not rear wall');
assert(!atCivicEntrance(north,exit),'exit does not trigger immediate re-entry');
assert.deepEqual(visitorHours(place),[480,1050],'preserve advertised in-game office hours');
room.group.traverse(x=>{x.geometry?.dispose();x.material?.dispose?.()});
console.log('PASS M5-N cemetery: 12x9 site, respectful exterior, three walkable rooms, eight reachable interactions, street-facing entry and exit');
