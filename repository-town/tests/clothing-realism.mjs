import assert from 'node:assert/strict';
import * as THREE from 'three';
import {buildCivicInterior} from '../src/world/shop-interior.js';
import {CLOTHING_PLAN} from '../src/world/clothing-interior.js';
import {buildExpansionFacade} from '../src/world/town-expansion-facades.js';
const site={id:'clothing',name:'Gumleaf Outfitters',style:'retail'};
const room=buildCivicInterior(site,()=>new THREE.Sprite(new THREE.SpriteMaterial()));
assert.equal(room.clothingLayout,CLOTHING_PLAN);
assert(room.group.children.length>120);
assert(room.interactables.length>=5);
assert(room.windows.length>=4);
const hit=(x,z,r=.22)=>room.colliders.some(c=>x>c.x0-r&&x<c.x1+r&&z>c.z0-r&&z<c.z1+r);
assert(!hit(room.spawn.x,room.spawn.z));
const step=.2,seen=new Set(['0,0']),queue=[[0,0]];
for(let i=0;i<queue.length;i++)for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
 const [gx,gz]=queue[i],nx=gx+dx,nz=gz+dz,x=room.spawn.x+nx*step,z=room.spawn.z+nz*step,key=nx+','+nz;
 if(seen.has(key)||x<-6.6||x>6.6||z<-11.6||z>5.6||hit(x,z))continue;
 seen.add(key);queue.push([nx,nz]);
}
const pts=queue.map(([x,z])=>[room.spawn.x+x*step,room.spawn.z+z*step]);
for(const p of room.interactables){
 assert(!hit(p.pos.x,p.pos.z),p.key+' obstructed');
 assert(pts.some(([x,z])=>Math.hypot(x-p.pos.x,z-p.pos.z)<.55),p.key+' inaccessible');
}
for(const [name,x,z] of [['fitting',3.6,-9.9],['footwear',-2.4,-9.4],['central aisle',0,-8.1]]){
 assert(!hit(x,z),name+' obstructed');
 assert(pts.some(([px,pz])=>Math.hypot(x-px,z-pz)<.55),name+' cannot be reached');
}
const blocks=[],b={box:(...a)=>blocks.push(a),cyl:(...a)=>blocks.push(a)};
assert.equal(buildExpansionFacade(b,site).front,7);
assert(blocks.length>15);
console.log('PASS clothing shop displays, accessible circulation, fitting, POS, facade');
