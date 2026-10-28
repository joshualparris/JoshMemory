// The production picker must retain a collision-clear approach for every
// original house exhibit, including wall-mounted objects and central props.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {buildInterior} from '../src/world/interior.js';
import {createFloorStack} from '../src/world/multifloor.js';
import {CollisionWorld} from '../src/engine/collision.js';
import {pickInteriorInteraction as pick} from '../src/engine/interaction-picker.js';
const data=JSON.parse(fs.readFileSync('dist/public/houses.json')),failures=[];let count=0;
for(const h of data.houses){
 const stack=createFloorStack(h,()=>new THREE.Group());
 for(const b of stack?.levels||[buildInterior(h,()=>new THREE.Group())]){
 const world=new CollisionWorld(b.colliders);
 for(const item of b.interactables){
  count++;const room=b.rooms[item.room];
  let dx=(room.x0+room.x1)/2-item.pos.x,dz=(room.z0+room.z1)/2-item.pos.z,len=Math.hypot(dx,dz);
  if(len<.01){dx=0;dz=1;len=1;}
  let found=false;
  for(const distance of [1.6,1.9,1.3,2.2])for(const angle of [0,.5,-.5,1,-1]){
   const c=Math.cos(angle),s=Math.sin(angle);
   const position={x:item.pos.x+(dx/len*c+dz/len*s)*distance,z:item.pos.z+(dz/len*c-dx/len*s)*distance};
   if(world.hits(position.x,position.z,.4))continue;
   const vx=item.pos.x-position.x,vz=item.pos.z-position.z,l=Math.hypot(vx,vz)||1;
   if(pick(b,position,{x:vx/l,z:vz/l})===item)found=true;
  }
  if(!found)failures.push({coordinate:h.coordinate,floor:b.floorIndex||0,key:item.key,action:item.act.do});
 }
 b.group.traverse(o=>{o.geometry?.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])m?.dispose?.();});
 }
}
fs.mkdirSync('test-results',{recursive:true});
fs.writeFileSync('test-results/all-home-picking.json',JSON.stringify({houses:data.houses.length,fixtures:count,failures},null,2));
console.log(JSON.stringify({houses:data.houses.length,fixtures:count,failures},null,2));
assert.equal(failures.length,0,'Every house exhibit must remain selectable from clear floor');
