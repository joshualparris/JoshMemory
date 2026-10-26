import assert from 'node:assert/strict';
import * as THREE from 'three';
import {buildCivicInterior} from '../src/world/shop-interior.js';
import {SUPERMARKET_PLAN} from '../src/world/supermarket-interior.js';
const site={id:'supermarket',name:'Repository Fresh Supermarket',style:'retail'};
const room=buildCivicInterior(site,()=>new THREE.Sprite(new THREE.SpriteMaterial()));
assert.equal(room.supermarketLayout,SUPERMARKET_PLAN);
assert(room.group.children.length>200);
assert(room.windows.length>=4);
assert.equal(room.interactables.length,6);
const blocked=(x,z,r=.25)=>room.colliders.some(c=>x>c.x0-r&&x<c.x1+r&&z>c.z0-r&&z<c.z1+r);
assert(!blocked(room.spawn.x,room.spawn.z));
const step=.2,seen=new Set(['0,0']),queue=[[0,0]];
for(let i=0;i<queue.length;i++)for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
 const [gx,gz]=queue[i],nx=gx+dx,nz=gz+dz,x=room.spawn.x+nx*step,z=room.spawn.z+nz*step,key=nx+','+nz;
 if(seen.has(key)||x<-6.6||x>6.6||z<-11.6||z>5.6||blocked(x,z))continue;
 seen.add(key);queue.push([nx,nz]);
}
const pts=queue.map(([x,z])=>[room.spawn.x+x*step,room.spawn.z+z*step]);
for(const p of room.interactables){
 assert(!blocked(p.pos.x,p.pos.z),p.key+' is blocked');
 assert(pts.some(([x,z])=>Math.hypot(x-p.pos.x,z-p.pos.z)<.55),p.key+' unreachable');
}
assert(pts.some(([x,z])=>z<-9));
assert(pts.some(([x,z])=>x<-4&&z>0));
console.log('PASS supermarket walkable zones and interactions');
