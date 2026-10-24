// Run from repository-town: node tests/npc-appearance.mjs
// Guard the phone rendering regression where NaN joint rotations hid arms/legs.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { makePerson, makeNPC, pose, Walker, houseWander } from '../src/world/npcs.js';
import { CollisionWorld } from '../src/engine/collision.js';
import { NPCS } from '../src/ui/npc-data.js';

for (const seed of [0, 1, 17, 99, 353, 922]) {
  const p=makePerson(seed,0x557e9f,0x303e4e);
  assert.equal(p.legs.length,2,'both legs must be present');
  assert.equal(p.arms.length,2,'both arms must be present');
  assert.equal(p.knees.length,2,'knees must be jointed');
  assert.equal(p.elbows.length,2,'elbows must be jointed');
  assert(Number.isFinite(p.phase),'walking phase must be initialised');
  const bounds=new THREE.Box3().setFromObject(p.group);
  assert(bounds.max.y>1.95 && bounds.min.y>=-0.05 && bounds.min.y<0.09,
    'human silhouette must have a head and shoes on the ground');
  assert(bounds.max.x-bounds.min.x>.60 && bounds.max.x-bounds.min.x<1.05,
    'shoulders and arms should be distinguishable without oversized barrels');
  const solids=[];
  p.group.traverse(child=>{if(child.isMesh)solids.push(child);});
  assert(solids.length>=17,'faces, clothes, hands, feet and joints must be rendered');
  assert(solids.some(m=>m.geometry.isBufferGeometry && !m.geometry.type?.includes('Cylinder')),
    'torso must not be a simple featureless tube');
  for(let t=0;t<6;t++)pose(p,1/60,t*.17,true);
  for(const limb of [...p.legs,...p.arms,...p.knees,...p.elbows])
    assert(Number.isFinite(limb.rotation.x),'walking must never produce invisible NaN limbs');
  delete p.phase; // Old callers were allowed to omit phase.
  pose(p,1/60,1.7,true);
  assert(p.legs.every(l=>Number.isFinite(l.rotation.x)),
    'legacy figure without phase must keep legs visible');
}
const human=NPCS.find(n=>!n.shape);
assert(human,'at least one named human available');
const named=makeNPC(human,null);
assert(named.userData.person?.legs?.length===2,'named humans share articulated model');
assert(named.userData.body?.isGroup,'bob animation still targets a group');
const fantasy=NPCS.find(n=>n.shape);
assert(fantasy && makeNPC(fantasy,null).userData.npc===fantasy,
  'fantasy quest characters keep distinctive non-human silhouettes');

// Regression: an indoor resident's whole articulated body must never walk
// through an interior wall, even if the planner supplied an impossible target.
// This also exercises collision-aware path movement without a real WebGL context.
const noDoor = new CollisionWorld([{x0:1,x1:1.2,z0:-4,z1:4}]);
const walker = new Walker(makePerson(17,0x557e9f,0x303e4e),new THREE.Vector3(0,0,0),{speed:1.3,name:'Wall test'});
walker.wait=0;
walker.path=[{x:3,z:0}];
const blockedPlan=()=>[];
blockedPlan.collisionWorld=noDoor;
const distantPlayer={pos:new THREE.Vector3(20,0,20)};
for (let i=0;i<200;i++) {
  walker.update(.05,i*.05,distantPlayer,blockedPlan);
  assert(!noDoor.hits(walker.pos.x,walker.pos.z,.52),'indoor resident avatar entered a solid wall');
  assert(walker.pos.x <= .481,'hands or shoulders could protrude through wall');
}
assert.equal(walker.path.length,0,'stale blocked waypoint must be discarded');

// Doors must remain walkable and no existing room transition can be disabled
// by using the figure's real collision clearance.
const doorway=new CollisionWorld([
  {x0:1,x1:1.2,z0:-4,z1:-.9},{x0:1,x1:1.2,z0:.9,z1:4}
]);
const visitor=new Walker(makePerson(25,0x557e9f,0x303e4e),new THREE.Vector3(0,0,0),{speed:1.3,name:'Door test'});
visitor.wait=0;
visitor.path=[{x:2,z:0}];
const openPlan=()=>[];
openPlan.collisionWorld=doorway;
for(let i=0;i<80;i++) {
  visitor.update(.05,i*.05,distantPlayer,openPlan);
  assert(!doorway.hits(visitor.pos.x,visitor.pos.z,.52),'resident collided while passing a door');
}
assert(visitor.pos.x>1.7,'a 1.8m door must remain passable');
const planner=houseWander([{x0:-2,x1:3,z0:-2,z1:2}],[],doorway,()=>480);
assert.equal(planner.collisionWorld,doorway,'indoor route planner must share its wall collision world with Walker');

console.log('PASS: articulated human silhouettes, shoes, faces, finite movement and named-character compatibility.');
