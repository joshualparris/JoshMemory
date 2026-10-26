import assert from 'node:assert/strict';
import * as THREE from 'three';
import {buildCivicInterior} from '../src/world/shop-interior.js';
import {DENTAL_PLAN} from '../src/world/dental-interior.js';
import {buildExpansionFacade} from '../src/world/town-expansion-facades.js';
const site={id:'dentist',name:'Repository Dental',style:'health'};
const room=buildCivicInterior(site,()=>new THREE.Sprite(new THREE.SpriteMaterial()));
assert.equal(room.dentalLayout,DENTAL_PLAN);
assert(room.group.children.length>55);
assert(room.windows.length>=4);
assert.equal(room.interactables.length,5);
assert.deepEqual(DENTAL_PLAN.reprocessingFlow,['dirty','wash','inspect','package','sterilise','store']);
assert(room.exitZone.z1>room.spawn.z);
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
const blocks=[],b={box:(...a)=>blocks.push(a),cyl:(...a)=>blocks.push(a),ball:(...a)=>blocks.push(a)};
assert.equal(buildExpansionFacade(b,site).front,7);
assert(blocks.length>12);
console.log('PASS dental clinic zones, reception, infection-control flow, reachable interactions and facade');
