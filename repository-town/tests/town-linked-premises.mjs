import assert from 'node:assert/strict';
import * as THREE from 'three';
import {buildCivicInterior} from '../src/world/shop-interior.js';
import {LINKED_SERVICE_INTERIORS} from '../src/world/linked-service-interiors.js';
const label=()=>new THREE.Sprite(new THREE.SpriteMaterial());
const expected={
 vet:['Veterinary reception','Veterinary examination room','Veterinary medicines and clean storage'],
 hardware:['Trade hardware counter','Timber and building supplies','Warehouse and goods receiving']
};
assert.deepEqual([...LINKED_SERVICE_INTERIORS].sort(),['hardware','vet']);
for(const id of LINKED_SERVICE_INTERIORS){
 const built=buildCivicInterior({id,name:id==='vet'?'Repository Veterinary Surgery':'Central West Hardware & Timber',expansion:true},label);
 assert.equal(built.linkedServiceLayout?.id,id,id+': must use dedicated layout');
 assert.deepEqual(built.rooms.map(x=>x.name),expected[id],id+': three distinct workplace rooms');
 assert.equal(built.openings.length,2,id+': two internal walking doorways');
 assert(!built.rooms.some(x=>/bedroom|sleep/i.test(x.name)),id+': never create home bedroom');
 assert(built.placedProps.length>=9,id+': complete equipment');
 assert(built.interactables.some(x=>x.act?.do==='info'),id+': service information usable');
 assert(built.windows.length>=2,id+': exterior windows');
 assert(built.exitZone?.z1>built.spawn.z,id+': usable street exit');
 const collides=(x,z,rad=.25)=>built.colliders.some(c=>x>c.x0-rad&&x<c.x1+rad&&z>c.z0-rad&&z<c.z1+rad);
 assert(!collides(built.spawn.x,built.spawn.z),id+': reachable initial position');
 for(const room of built.rooms)assert(room.x1>room.x0&&room.z1>room.z0,id+': valid room bounds');
 built.group.traverse(o=>{if(o.geometry?.dispose)o.geometry.dispose();if(o.material?.dispose)o.material.dispose();});
}
console.log('PASS #439: existing veterinary and trade hardware sites have purpose-built three-room walkable, non-residential interiors; no additional fictional businesses or duplicate simulation');
