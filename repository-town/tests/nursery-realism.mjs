import assert from 'node:assert/strict';
import * as THREE from 'three';
import {buildNurseryInterior,NURSERY_ZONES} from '../src/world/nursery-interior.js';
import {buildCivicInterior} from '../src/world/shop-interior.js';
const label=()=>{const o=new THREE.Object3D();o.scale.set(1,1,1);return o;};
const site={id:'nursery',name:'Wambuul Nursery & Garden Centre',style:'nursery'};
const built=buildNurseryInterior(site,label);
const dispatched=buildCivicInterior(site,label);
for(const [name,b] of [['direct',built],['dispatch',dispatched]]){
 assert.equal(b.rooms.length,1,name+' room');
 assert.equal(b.interactables.length,6,name+' six hotspots');
 assert.equal(b.nurseryZones.length,NURSERY_ZONES.length,name+' nursery metadata');
 assert.equal(b.exitZone.x0,-1.05,name+' front exit');
 assert.equal(b.spawn.z,3.75,name+' entry spawn');
 for(const p of b.interactables){
  assert(p.pos.x>-7&&p.pos.x<7&&p.pos.z>-12&&p.pos.z<6,p.key+' within shell');
  assert(!b.colliders.some(c=>p.pos.x>c.x0&&p.pos.x<c.x1&&p.pos.z>c.z0&&p.pos.z<c.z1),p.key+' is not inside fixture');
 }
 assert(!b.colliders.some(c=>0>c.x0&&0<c.x1&&3.75>c.z0&&3.75<c.z1),name+' entry clear');
}
console.log('Nursery geometry and dispatch checks passed.');
