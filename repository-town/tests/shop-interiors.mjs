import assert from 'node:assert/strict';
import * as THREE from 'three';
import { buildCivicInterior,CIVIC_INTERIOR_IDS } from '../src/world/shop-interior.js';
const label=()=>new THREE.Sprite(new THREE.SpriteMaterial());
assert(CIVIC_INTERIOR_IDS.length>=20,'at least 20 facility styles');
for(const id of CIVIC_INTERIOR_IDS){
  const site={id,name:id.replace(/-/g,' ')};
  const room=buildCivicInterior(site,label);
  assert.equal(room.rooms.length,1,id+' walk-in room');
  assert.equal(room.interactables.length,3,id+' three interactive features');
  assert.equal(room.sceneObjects.length,3,id+' scene-aware objects');
  assert(room.colliders.length>=7,id+' walls and counters');
  assert.equal(room.spawn.z,3.75);
  assert(room.exitZone.z1>room.spawn.z);
  for(const p of [{x:0,z:3.75},{x:0,z:5.2},{x:0,z:-3.5},{x:0,z:-4.5}]) {
    const hit=room.colliders.some(c=>p.x>c.x0&&p.x<c.x1&&p.z>c.z0&&p.z<c.z1);
    assert.equal(hit,false,id+' aisle is traversable at '+JSON.stringify(p));
  }
  assert(room.interactables.some(x=>x.act.do==='civic-ledger'),id+' ledger counter');
  assert(room.group.children.length>20,id+' has furnished meshes');
  room.group.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material?.dispose)o.material.dispose();});
}
console.log('PASS: '+CIVIC_INTERIOR_IDS.length+' walk-in civic/farm/shop layouts, doors, counters, furnished rooms and safe aisles');
