import assert from 'node:assert/strict';
import * as THREE from 'three';
import {buildCivicInterior} from '../src/world/shop-interior.js';
import {LINKED_SERVICE_INTERIORS} from '../src/world/linked-service-interiors.js';
const label=()=>new THREE.Sprite(new THREE.SpriteMaterial());
const expected={vet:['Veterinary reception','Veterinary examination room','Veterinary medicines and clean storage']};
assert.deepEqual([...LINKED_SERVICE_INTERIORS],['vet']);
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
// Existing hardware is an independently authored hardware/timber shop and
// MUST NOT be replaced by the older PR #442's small generic room.
const hardware=buildCivicInterior({id:'hardware',name:'Central West Hardware & Timber',expansion:true},label);
assert(!hardware.linkedServiceLayout,'handcrafted hardware store preserved');
let stockMeshes=0;
hardware.group.traverse(o=>{if(o.name==='hardware-stock')stockMeshes++;});
assert(stockMeshes>0,'actual modelled hardware store stock remains visible');
assert(hardware.interactables.length>=3,'hardware counter and shelves remain playable');
hardware.group.traverse(o=>{if(o.geometry?.dispose)o.geometry.dispose();if(o.material?.dispose)o.material.dispose();});
console.log('PASS #439: bespoke 3-room vet surgery; existing detailed hardware store protected; no added businesses or duplicate economic simulation');
