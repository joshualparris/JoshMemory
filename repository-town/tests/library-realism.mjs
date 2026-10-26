import assert from 'node:assert/strict';
import * as THREE from 'three';
import {buildCivicInterior} from '../src/world/shop-interior.js';
import {LIBRARY_PLAN} from '../src/world/library-interior.js';
import {buildExpansionFacade} from '../src/world/town-expansion-facades.js';
const site={id:'library',name:'Sir Reginald Repo Public Library',style:'heritage'};
const label=()=>new THREE.Sprite(new THREE.SpriteMaterial());
const room=buildCivicInterior(site,label);
assert.equal(room.libraryLayout,LIBRARY_PLAN);
assert(room.group.children.length>250,'dedicated library has detailed furnishings');
assert(room.windows.length>=4,'natural daylight and street views');
assert(room.interactables.length>=6,'working service and collection zones');
assert(room.interactables.some(x=>x.key==='library:loans'&&x.act.do==='civic-ledger'));
assert.equal(room.rooms[0].name,'Public library');
assert(room.exitZone.z1>room.spawn.z);
const hit=(x,z,r=.35)=>room.colliders.some(c=>x>c.x0-r&&x<c.x1+r&&z>c.z0-r&&z<c.z1+r);
assert(!hit(room.spawn.x,room.spawn.z),'entry unobstructed');
const step=.25,seen=new Set(['0,0']),queue=[[0,0]];
for(let i=0;i<queue.length;i++)for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
 const [gx,gz]=queue[i],nx=gx+dx,nz=gz+dz,x=room.spawn.x+nx*step,z=room.spawn.z+nz*step,key=nx+','+nz;
 if(seen.has(key)||x<-6.6||x>6.6||z<-11.6||z>5.6||hit(x,z))continue;
 seen.add(key);queue.push([nx,nz]);
}
const accessible=queue.map(([x,z])=>[room.spawn.x+x*step,room.spawn.z+z*step]);
for(const point of room.interactables){
 assert(!hit(point.pos.x,point.pos.z,.3),point.key+' is not blocked');
 assert(accessible.some(([x,z])=>Math.hypot(x-point.pos.x,z-point.pos.z)<.65),point.key+' is reachable');
}
assert(accessible.some(([x,z])=>z<-9),'back of library is reachable');
assert(accessible.some(([x,z])=>x<-4&&z>1),'children area is reachable');
const blocks=[];
const b={box:(...a)=>blocks.push(a),cyl:(...a)=>blocks.push(a),ball:(...a)=>blocks.push(a)};
const facade=buildExpansionFacade(b,site);
assert.equal(facade.front,7);assert(blocks.length>15,'dedicated facade with glazing and entrance');
console.log('PASS library interior, egress, circulation, hotspots, daylight and heritage facade');
