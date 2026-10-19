import assert from 'node:assert/strict';
import * as THREE from 'three';
import { buildCivicInterior,CIVIC_INTERIOR_IDS } from '../src/world/shop-interior.js';
const label=()=>new THREE.Sprite(new THREE.SpriteMaterial());
assert(CIVIC_INTERIOR_IDS.length>=20,'at least 20 facility styles');
for(const id of CIVIC_INTERIOR_IDS){
  const site={id,name:id.replace(/-/g,' ')};
  const room=buildCivicInterior(site,label);
  if(id==='farmhouse') {
    assert.equal(room.rooms.length,10,'farmhouse must have 10 distinct spaces');
    assert(room.interactables.length>=20,'farmhouse must have domestic interactions');
    assert(room.interactables.some(x=>x.key==='farmhouse:pantry'));
    assert(room.exitZone.z1>room.spawn.z,'farmhouse exit must be reachable');
    room.group.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material?.dispose)o.material.dispose();});
    continue;
  }
  if(id==='hotel'){
    assert.equal(room.rooms.length,5,'hotel has reception and four real bedrooms');
    assert.equal(room.interactables.filter(x=>x.type==='bed').length,4);
    assert(room.exitZone.z1>room.spawn.z,'hotel must have walkable exit');
    room.group.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material?.dispose)o.material.dispose();});
    continue;
  }
  assert.equal(room.rooms.length,1,id+' walk-in room');
  if(id==='bakery'){
    // Researched bakery: counter, pastry case, kitchen view, bread wall and café corner.
    for(const k of ['counter','pastries','kitchen','breadwall','cafe'])assert(room.interactables.some(x=>x.key==='bakery:'+k),'bakery '+k);
    assert.equal(room.sceneObjects.length,room.interactables.length,'bakery scene-aware objects');
    assert(room.group.children.length>400,'bakery is richly furnished');
    // Every hotspot must be reachable on foot and clear of furniture.
    for(const x of room.interactables){const hit=room.colliders.some(c=>x.pos.x>c.x0-0.35&&x.pos.x<c.x1+0.35&&x.pos.z>c.z0-0.35&&x.pos.z<c.z1+0.35);assert.equal(hit,false,'bakery hotspot '+x.key+' is clear');}
    assert(room.staff.pos.z<room.staff.use.z,'baker stands behind the counter');
    // Shelves follow the live stock: empty shelves have fewer meshes than full ones.
    const full=buildCivicInterior({id,name:'Bakery',out:{bread:30,pie:12}},label), bare=buildCivicInterior({id,name:'Bakery',out:{bread:0,pie:0}},label);
    assert(bare.group.children.length<full.group.children.length-40,'sold-out shelves look empty');
    assert(bare.interactables.find(x=>x.key==='bakery:breadwall').act.text.includes('0 loaves'),'bread wall reports stock');
  } else {
  assert.equal(room.interactables.length,3,id+' three interactive features');
  assert.equal(room.sceneObjects.length,3,id+' scene-aware objects');
  }
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
console.log('PASS: '+CIVIC_INTERIOR_IDS.length+' civic/farm/shop interiors, including a 10-area farmhouse');
