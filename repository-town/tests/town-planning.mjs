import assert from 'node:assert/strict';
import * as THREE from 'three';
import {OUTSKIRT_PARCELS,PLANNED_ROADS,buildOutskirts} from '../src/world/town-planning.js';
assert.equal(OUTSKIRT_PARCELS.length,12);
assert.equal(new Set(OUTSKIRT_PARCELS.map(p=>p.id)).size,OUTSKIRT_PARCELS.length,'unique parcel IDs');
const overlap=(a,b)=>Math.abs(a.x-b.x)<(a.w+b.w)/2&&Math.abs(a.z-b.z)<(a.d+b.d)/2;
for(let i=0;i<OUTSKIRT_PARCELS.length;i++){
 const a=OUTSKIRT_PARCELS[i];
 assert(a.w>0&&a.d>0,'positive parcel dimensions');
 for(let j=i+1;j<OUTSKIRT_PARCELS.length;j++)assert(!overlap(a,OUTSKIRT_PARCELS[j]),a.id+' overlaps '+OUTSKIRT_PARCELS[j].id);
 // Existing core ground rectangle spans x ±368, z ±214; edge parcels must be beyond it.
 assert(Math.abs(a.x)-a.w/2>=368||Math.abs(a.z)-a.d/2>=214,a.id+' intrudes into established town core');
}
assert(PLANNED_ROADS.length>=4);
const scene=new THREE.Group(),out=buildOutskirts(scene);
assert.equal(out.parcels.length,12);
assert.equal(out.roads.length,PLANNED_ROADS.length);
assert(scene.children.includes(out.group));
console.log('Town planning parcels, core preservation and scene rendering passed.');
