import assert from 'node:assert/strict';
import * as THREE from 'three';
import { buildCivicInterior } from '../src/world/shop-interior.js';
import { POST_LAYOUT } from '../src/world/post-interior.js';
import { POST_FRONTAGE, decoratePostFacade } from '../src/world/post-office-facade.js';

const label = () => new THREE.Sprite(new THREE.SpriteMaterial());
const site={id:'post',name:'Repo Town Post Office'};
const room=buildCivicInterior(site,label);
assert(room.postLayout,'Post Office uses the dedicated postal fitout');
assert.deepEqual(room.postLayout,POST_LAYOUT);
assert.equal(room.rooms.length,1);
assert(room.windows.length>=4,'shopfront and side windows remain real openings');
assert.equal(room.exitZone.x0,-1.05,'unchanged front doorway');
assert.equal(room.exitZone.x1,1.05,'unchanged front doorway');
assert(room.group.children.length>350,'mail sorting, PO boxes, equipment, signage and furniture appear physically');
const required=['counter','queue','collection','lower-counter','postage','letterbox','tracking','boxes','parcels','packing'];
for(const key of required)assert(room.interactables.some(x=>x.key==='post:'+key),'missing real postal hotspot '+key);
assert.equal(room.interactables.find(x=>x.key==='post:counter').act.do,'civic-ledger','counter retains functional civic panel');

// A real first-person player is a disk rather than an infinitely thin point.
const radius=0.32,step=0.25;
const hit=(x,z,r=radius)=>room.colliders.some(c=>x>c.x0-r&&x<c.x1+r&&z>c.z0-r&&z<c.z1+r);
const o=room.spawn;assert(!hit(o.x,o.z),'spawn must be clear');
const q=[[0,0]],seen=new Set(['0,0']);
for(let i=0;i<q.length;i++){
  const [a,b]=q[i];
  for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
    const nx=a+dx,nz=b+dz,x=o.x+nx*step,z=o.z+nz*step,k=nx+','+nz;
    if(seen.has(k)||x<-6.99||x>6.99||z<-11.99||z>5.99||hit(x,z))continue;
    seen.add(k);q.push([nx,nz]);
  }
}
const points=q.map(([a,b])=>({x:o.x+a*step,z:o.z+b*step}));
for(const item of room.interactables){
  assert(!hit(item.pos.x,item.pos.z,0.3),'hotspot physically blocked: '+item.key);
  assert(points.some(p=>Math.hypot(item.pos.x-p.x,item.pos.z-p.z)<0.6),'hotspot cannot be walked to: '+item.key);
}
assert(!points.some(p=>Math.hypot(p.x-POST_LAYOUT.staff.x,p.z-POST_LAYOUT.staff.z)<0.75),'staff sorting bay cannot be entered through a wall or counter');
assert(!hit(0,5.0),'front door access remains unobstructed');
assert(!hit(0,-4.0),'public central approach remains walkable');

// Physical street model: decorative geometry only. There must be no new solid
// collider hiding the front door, and separate PO-box doors must be present.
const primitives=[];
decoratePostFacade({box:(...args)=>primitives.push(args),block:()=>{throw Error('new decorative frontage must not add colliders');}});
assert(primitives.length>=52,'post frontage includes soffit, parcel hatch and bank of 20 numbered boxes');
assert.deepEqual(POST_FRONTAGE.entranceGap,{x0:-1.05,x1:1.05});
for(const [colour,w,h,d,x,y,z] of primitives){
  assert(w>0&&h>0&&d>0,'zero-size facade object');
  assert(!(x-w/2<1.05&&x+w/2>-1.05&&y-h/2<2.2),'new frontage blocks the entry clearance');
  assert(z>=8.9,'postal frontage must remain at street facade');
}
room.group.traverse(o=>{o.geometry?.dispose?.();o.material?.dispose?.();});
console.log('PASS: regional postal frontage, secure sort zone, 10 reachable service points and real player-width entrance with no collider clipping');
