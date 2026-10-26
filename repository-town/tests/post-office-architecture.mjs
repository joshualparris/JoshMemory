import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { Builder } from '../src/world/builder.js';
import { buildPostFacade, POST_FACADE } from '../src/world/post-facade.js';
import { buildPostInterior, POST_LAYOUT } from '../src/world/post-interior.js';
import { POST_OPERATIONS } from '../src/world/post-operational-details.js';

const sprite=()=>new THREE.Sprite(new THREE.SpriteMaterial());
const post=buildPostInterior({id:'post',name:'Town Post Office'},sprite);
const radius=.34,step=.2;
function blocked(x,z){
 return x<=-7+radius||x>=7-radius||z<=-12+radius||z>=6-radius||
 post.colliders.some(c=>x>c.x0-radius&&x<c.x1+radius&&z>c.z0-radius&&z<c.z1+radius);
}
function route(to){
 const from=post.spawn, toCell=p=>Math.round(p/step);
 if(blocked(from.x,from.z)||blocked(to.x,to.z))return false;
 const queue=[{x:from.x,z:from.z}],seen=new Set([toCell(from.x)+':'+toCell(from.z)]);
 for(let i=0;i<queue.length;i++){
   const p=queue[i];if(Math.hypot(p.x-to.x,p.z-to.z)<.26)return true;
   for(const [dx,dz] of [[step,0],[-step,0],[0,step],[0,-step]]){
     const n={x:p.x+dx,z:p.z+dz},key=toCell(n.x)+':'+toCell(n.z);
     if(seen.has(key)||blocked(n.x,n.z))continue;
     seen.add(key);queue.push(n);
   }
 }
 return false;
}
test('front-facing post office facade is distinctly postal and keeps the entry collision free',()=>{
 const b=new Builder();const shell=(builder,w,d,h,wall,trim)=>{
   builder.box(wall,w,h,d,0,h/2,7-d/2);
 };
 const result=buildPostFacade(b,{shopfront:shell});
 assert.deepEqual(result,{w:11,d:9});
 assert.equal(POST_FACADE.entryX,0);
 assert.equal(POST_FACADE.frontZ,7);
 assert.equal(POST_FACADE.postboxX>3.5,true);
 assert.equal(POST_FACADE.boxesX< -3.5,true);
 assert(b.parts.length>110,'painted facade needs real three-dimensional PO doors, awning, parcels and fascia');
 assert.deepEqual(b.solids,[],'architectural trim must not create invisible road or entrance blockers');
 const mesh=b.build();assert(mesh.children.some(x=>x.geometry),'actual facade 3D mesh required');
 mesh.traverse(o=>o.geometry?.dispose?.());
});
test('rural post office has service equipment, four realistic work zones and no fabricated public records',()=>{
 for(const name of ['post:low-counter-shelf','post:signing-pad','post:dispatch-workbench',
  'post:label-printer','post:barcode-scanner','post:parcel-cage-base',
  'post:mail-trolley-bed','post:extinguisher','post:stationery-wall-rack','post:queue-wait-line']){
  assert(post.group.getObjectByName(name),name+' must be physically visible');
 }
 assert(post.group.getObjectByName('post:outgoing-tray:5'));
 assert(post.group.getObjectByName('post:queue-floor-dash:4'));
 for(const key of ['counter','boxes','packing','assisted','collection','dispatch','mail-slot','supplies']){
  const item=post.interactables.find(a=>a.key==='post:'+key);
  assert(item,'missing postal action '+key);
  assert(!blocked(item.pos.x,item.pos.z),'postal action '+key+' clipped into fixture');
  assert(route(item.pos),'postal action '+key+' inaccessible from front door');
  assert(!/completed|paid|identity verified|delivered successfully/i.test(item.act.text),'info action cannot imply actual tracked delivery');
 }
 assert.deepEqual(post.staff.pos,POST_LAYOUT.staff);
 assert.equal(post.interactables.find(a=>a.key==='post:counter').act.do,'civic-ledger');
});
test('a radius-aware player can traverse entrance, retail queue, packing, boxes and staff dispatch',()=>{
 for(const point of [...POST_OPERATIONS.publicRoute,POST_OPERATIONS.accessibleUse,
   POST_OPERATIONS.boxUse,POST_OPERATIONS.packingUse,POST_OPERATIONS.staffUse]){
   assert(route(point),'post office blocked at '+JSON.stringify(point));
 }
 assert(route({x:5.0,z:-6.65}),'counter end access to staff area is obstructed');
 assert(post.windows.length>=4,'front and side glazing preserved');
 assert(post.exitZone.z1>post.spawn.z,'the actual front exit remains functional');
 assert(post.group.children.length>250,'realistic fixtures must be physically modelled');
});
