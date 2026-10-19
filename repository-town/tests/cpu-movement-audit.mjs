// Deterministic CPU movement checks; this does not replace rendered browser/device tests.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {loadInventory,loadBriefs,toHouse,sanitise} from '../tools/lib.mjs';
import {buildTown} from '../src/world/town.js';
import {buildCivicDistrict} from '../src/simulation/civic-world.js';
import {CollisionWorld} from '../src/engine/collision.js';
import {Player} from '../src/engine/player.js';
const inv=loadInventory(),briefs=loadBriefs();
const houses=inv.projects.map(r=>sanitise(toHouse(briefs.get(r.repo),r,inv.grid.streetNames)));
const town=buildTown(new THREE.Scene(),houses,inv.grid.streetNames);
const civic=buildCivicDistrict(town,()=>new THREE.Object3D());
const world=new CollisionWorld(town.colliders);
const failures=[];let doors=0,routes=0,facilities=0;
const input=running=>({takeLook:()=>({dx:0,dy:0}),movement:()=>({x:0,z:-1,running,crouching:false}),consume:()=>false});
for(const fps of [20,60]) for(const running of [false,true]) {
 const dt=1/fps,feed=input(running);
 for(const zone of town.doorZones){
  const lot=town.lots.get(zone.coordinate),p=new Player(new THREE.PerspectiveCamera());p.place(lot.doorPos.x,lot.doorPos.z+9,0);
  let entered=false,open=0;
  for(let frame=0;frame<fps*6;frame++){
   p.update(dt,feed,world);const dist=Math.hypot(p.pos.x-lot.doorPos.x,p.pos.z-lot.doorPos.z);
   open+=((dist<3.2?1:0)-open)*Math.min(1,dt*5);
   if(p.pos.x>zone.x0&&p.pos.x<zone.x1&&p.pos.z>zone.z0&&p.pos.z<zone.z1&&open>.6){entered=true;break;}
  }
  doors++;if(!entered)failures.push({test:'entrance',coordinate:zone.coordinate,fps,running,z:p.pos.z});
 }
 const legs=[];
 for(let row=0;row<8;row++){const z=row*46-3.5*46+16;legs.push([`street ${row+1} north`,-342,z-5.3,-Math.PI/2,'x',342],[`street ${row+1} south`,342,z+5.3,Math.PI/2,'x',-342]);}
 for(let col=0;col<=26;col+=5){const x=(col-13)*26;legs.push([`avenue ${col}`,x,-153,Math.PI,'z',185]);}
 for(const [label,x,z,yaw,axis,target] of legs){
  const p=new Player(new THREE.PerspectiveCamera());p.place(x,z,yaw);let reached=false,stalled=0;
  for(let frame=0;frame<fps*200;frame++){
   const prev=p.pos.clone();p.update(dt,feed,world);
   if(Math.abs(p.pos[axis]-target)<.5){reached=true;break;}
   stalled=prev.distanceTo(p.pos)<.001?stalled+1:0;if(stalled>fps*2)break;
  }
  routes++;if(!reached)failures.push({test:'street',label,fps,running,pos:{x:p.pos.x,z:p.pos.z}});
 }
 for(const b of civic.buildings){
  const p=new Player(new THREE.PerspectiveCamera());p.place(b.position.x,b.position.z+16,0);let reachable=false;
  for(let frame=0;frame<fps*4;frame++){p.update(dt,feed,world);if(Math.hypot(p.pos.x-b.position.x,p.pos.z-b.position.z-7)<6){reachable=true;break;}}
  facilities++;if(!reachable)failures.push({test:'civic approach',id:b.id,fps,running});
 }
}
assert.equal(houses.length,188);
assert.equal(civic.buildings.length,20);
const solidChecks=civic.buildings.filter(b=>!['agriculture','recreation'].includes(b.kind)).map(b=>({id:b.id,blocked:!!world.hits(b.position.x,b.position.z,.35)}));
console.log(JSON.stringify({method:'CPU Player.update and real collision geometry; no rendered browser',doors,routes,facilities,civicCount:civic.buildings.length,solidChecks,failures},null,2));
assert.ok(solidChecks.every(check=>check.blocked),'Civic buildings must block movement');
assert.equal(failures.length,0,'Movement regressions');
