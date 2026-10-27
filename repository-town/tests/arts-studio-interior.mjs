// Arts & Makers Studio: the dedicated interior replaces the generic shell; every station is
// reachable on foot from the door, the central aisle stays clear, and the kiln sits in its own
// room that the player can walk into through its doorway.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {buildCivicInterior} from '../src/world/shop-interior.js';
import {ARTS_STUDIO_PLAN} from '../src/world/arts-studio-interior.js';
const site={id:'artscentre',name:'Repository Arts & Makers Studio',style:'heritage',expansion:true,description:'Community art and craft classes'};
const room=buildCivicInterior(site,()=>new THREE.Sprite(new THREE.SpriteMaterial()));
assert.equal(room.artsStudioLayout,ARTS_STUDIO_PLAN,'the studio uses its own interior, not the generic shell');
assert(room.group.children.length>150);
assert(room.windows.length>=4);
assert(room.interactables.length>=9);
assert(room.interactables.some(x=>x.key==='artscentre:reception'&&x.act.do==='civic-ledger'));
assert(!room.interactables.some(x=>/first-stage interior shell/.test(x.act.text)));
const hit=(x,z,r=.35)=>room.colliders.some(c=>x>c.x0-r&&x<c.x1+r&&z>c.z0-r&&z<c.z1+r);
assert(!hit(room.spawn.x,room.spawn.z),'front entry is clear');
for(let z=-7;z<5;z+=.25)assert(!hit(0,z,.3),'central aisle clear at z='+z);
const step=.25,seen=new Set(['0,0']),queue=[[0,0]];
for(let i=0;i<queue.length;i++)for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
 const [gx,gz]=queue[i],nx=gx+dx,nz=gz+dz,x=room.spawn.x+nx*step,z=room.spawn.z+nz*step,key=nx+','+nz;
 if(seen.has(key)||x<-6.6||x>6.6||z<-11.6||z>5.6||hit(x,z))continue;
 seen.add(key);queue.push([nx,nz]);
}
const pts=queue.map(([x,z])=>[room.spawn.x+x*step,room.spawn.z+z*step]);
for(const point of room.interactables){
 assert(!hit(point.pos.x,point.pos.z,.3),point.key+' not inside a fixture');
 assert(pts.some(([x,z])=>Math.hypot(x-point.pos.x,z-point.pos.z)<.65),point.key+' reachable from entrance');
}
const K=ARTS_STUDIO_PLAN.kilnRoom;
assert(pts.some(([x,z])=>x>K.x0+.3&&z<K.z1-.3),'the kiln room can be entered through its doorway');
assert(room.seats.length>=8,'stools, chairs and the gallery bench are seats');
console.log('PASS arts studio: own fit-out, clear aisle, all stations reachable, enclosed kiln room');
