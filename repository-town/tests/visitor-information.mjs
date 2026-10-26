import assert from 'node:assert/strict';
import * as THREE from 'three';
import { EXPANSION_SITES } from '../src/world/town-expansion.js';
import { buildExpansionFacade,expansionFootprint } from '../src/world/town-expansion-facades.js';
import { buildCivicInterior } from '../src/world/shop-interior.js';
import { VISITOR_LAYOUT as L } from '../src/world/visitor-information-layout.js';
import { Builder } from '../src/world/builder.js';
import { civicEntranceZone,atCivicEntrance } from '../src/world/civic-entrance.js';
import { civicExitPose } from '../src/world/shop-exit.js';
import { visitorHours } from '../src/world/facility-access.js';
const site=EXPANSION_SITES.find(s=>s.id==='visitorcentre');
assert(site&&site.col==='O'&&site.row===5&&site.side==='north'&&site.taskId==='RTBUILD-070');
assert.deepEqual(expansionFootprint(site.style),{w:12,d:9});
const b=new Builder();b.glass=[];const f=buildExpansionFacade(b,site);
assert.deepEqual(f,{w:12,d:9,front:7});
assert(b.parts.length>80,'verandah, pitched green roof, brick path, gardens and traveller seats');
assert(b.glass.length>=3,'glazed front windows and real glass door');
const label=()=>new THREE.Sprite(new THREE.SpriteMaterial());
const room=buildCivicInterior(site,label);
assert(room.visitorInformationLayout,'O5-N uses researched visitor centre, not a generic 14x18 retail interior');
assert.deepEqual(room.rooms.map(r=>r.name),['Travel information and local produce']);
assert.equal(room.bounds.x1-room.bounds.x0,12);assert.equal(room.bounds.z1-room.bounds.z0,9);
assert.equal(room.windows.length,4);
assert(room.group.children.length>100,'richly modelled interior lighting, racks, shelves, local products');
assert(room.seats.length>=1,'actual bench registered for sitting');
const required=['advice','map','brochures','souvenirs','itinerary','amenities','rest'];
for(const key of required)assert(room.interactables.some(i=>i.key==='visitorcentre:'+key),key+' hotspot');
assert(room.interactables.some(i=>i.act.do==='civic-ledger'),'counter remains connected to gameplay');
const hit=(x,z,r=.35)=>room.colliders.some(c=>x>c.x0-r&&x<c.x1+r&&z>c.z0-r&&z<c.z1+r);
assert(!hit(room.spawn.x,room.spawn.z),'spawn clear');
for(let z=room.spawn.z;z<=L.front+.2;z+=.10)assert(!hit(0,z),'front passage blocked at '+z);
assert.equal(L.doorHalfWidth*2,2.6);
const step=.20,seen=new Set(['0,0']),q=[[0,0]],origin=room.spawn;
for(let i=0;i<q.length;i++){
 const [gx,gz]=q[i];
 for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
  const nx=gx+dx,nz=gz+dz,x=origin.x+nx*step,z=origin.z+nz*step,k=nx+','+nz;
  if(seen.has(k)||x<-5.6||x>5.6||z<-1.65||z>7.2||hit(x,z))continue;
  seen.add(k);q.push([nx,nz]);
 }
}
for(const item of room.interactables){
 assert(!hit(item.pos.x,item.pos.z,.3),'hotspot intersects furniture '+item.key);
 assert(q.some(([gx,gz])=>Math.hypot(origin.x+gx*step-item.pos.x,origin.z+gz*step-item.pos.z)<.50),
   'cannot physically walk to '+item.key);
}
assert(q.some(([x,z])=>origin.x+x*step>3.55&&origin.x+x*step<4.85&&origin.z+z*step<.75),
 'illustrative accessible toilet doorway has a traversable opening');
const p={...site,door:{x:14,z:60}};
assert(atCivicEntrance(p,{x:14,z:59}),'front entrance sensor road-facing');
const zone=civicEntranceZone(p);assert(zone.z0<60&&zone.z1<60.5);
const e=civicExitPose(p,[{x0:8,x1:20,z0:60.3,z1:69}]);
assert(e&&e.z<57&&e.yaw===0,'leaving O5-N goes out onto road-facing porch');
assert(!atCivicEntrance(p,e),'exit does not auto-reenter');
assert(visitorHours(site)[0]===480&&visitorHours(site)[1]===1050,'do not fabricate late opening hours');
for(const w of room.windows)assert(w.out!==0,'views face outdoors');
room.group.traverse(x=>{x.geometry?.dispose();x.material?.dispose?.()});
console.log('PASS O5-N: local 12x9 plan, green roof, verandah, 7 hotspots, walkable accessible-toilet doorway and front-road exit');
