import assert from 'node:assert/strict';
import * as THREE from 'three';
import {buildCivicInterior} from '../src/world/shop-interior.js';
import {PATHOLOGY_PLAN} from '../src/world/pathology-interior.js';
import {buildExpansionFacade} from '../src/world/town-expansion-facades.js';
const site={id:'pathology',name:'Riverbend Pathology',style:'health'};
const room=buildCivicInterior(site,()=>new THREE.Sprite(new THREE.SpriteMaterial()));
assert.equal(room.pathologyLayout,PATHOLOGY_PLAN);
assert(room.group.children.length>75);
assert(room.interactables.length===5);
const hit=(x,z,r=.23)=>room.colliders.some(c=>x>c.x0-r&&x<c.x1+r&&z>c.z0-r&&z<c.z1+r);
assert(!hit(room.spawn.x,room.spawn.z));
const step=.2,seen=new Set(['0,0']),queue=[[0,0]];
for(let i=0;i<queue.length;i++)for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
 const [gx,gz]=queue[i],nx=gx+dx,nz=gz+dz,x=room.spawn.x+nx*step,z=room.spawn.z+nz*step,key=nx+','+nz;
 if(seen.has(key)||x<-6.6||x>6.6||z<-11.6||z>5.6||hit(x,z))continue;
 seen.add(key);queue.push([nx,nz]);
}
const pts=queue.map(([x,z])=>[room.spawn.x+x*step,room.spawn.z+z*step]);
for(const p of room.interactables){
 assert(!hit(p.pos.x,p.pos.z),p.key+' blocked');
 assert(pts.some(([x,z])=>Math.hypot(x-p.pos.x,z-p.pos.z)<.55),p.key+' unreachable');
}
for(const [name,x,z] of [['left bay',-2.4,-8],['right bay',2.4,-8],['rear corridor',0,-10.4]]){
 assert(!hit(x,z),name+' blocked');
 assert(pts.some(([px,pz])=>Math.hypot(x-px,z-pz)<.55),name+' inaccessible');
}
const blocks=[],b={box:(...a)=>blocks.push(a),cyl:(...a)=>blocks.push(a)};
assert.equal(buildExpansionFacade(b,site).front,7);
assert(blocks.length>14);
console.log('PASS pathology bay access, specimen collection fixtures, exterior');
