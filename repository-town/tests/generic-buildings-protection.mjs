// Geometry snapshots deliberately cover bespoke dispatches, not the generic
// buildings this feature is allowed to improve. Record only on an audited baseline.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import * as THREE from 'three';
import { buildCivicInterior } from '../src/world/shop-interior.js';
import { Builder } from '../src/world/builder.js';
import { buildExpansionFacade } from '../src/world/town-expansion-facades.js';
import { EXPANSION_SITES } from '../src/world/town-expansion.js';
import { createNarrominePopulation } from '../src/world/narromine-population.js';
import { createNarromineWorkplaceIndex, buildNarromineWorkplaceInterior } from '../src/world/narromine-workplaces.js';

const label = () => new THREE.Object3D();
const protectedCivic = ['hotel','library','pharmacy','artscentre','repotech','supermarket','dentist',
  'pathology','clothing','nursery','busstop','visitorcentre','agedcare','cemetery','hardware','trades',
  'tafe','university','bank','store','cafe','pub','post','clinic','hall','greengrocer','butcher','school','fire'];
const protectedFacades = ['library','pharmacy','repotech','supermarket','dentist','pathology','clothing',
  'nursery','busstop','visitorcentre','cemetery','agedcare','fuelstop','carwash','gym','publicamenities'];
function signature(built) {
  const h=createHash('sha256');
  const write=value=>h.update(JSON.stringify(value));
  if(built.group) built.group.traverse(o=>{
    if(!o.isMesh) return;
    write([o.type,o.position.toArray(),o.rotation.toArray(),o.scale.toArray()]);
    for(const key of Object.keys(o.geometry.attributes).sort()){
      const a=o.geometry.attributes[key];write(key);
      h.update(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength));
    }
    if(o.geometry.index) h.update(Buffer.from(o.geometry.index.array.buffer));
    const materials=Array.isArray(o.material)?o.material:[o.material];
    write(materials.map(m=>[m.type,m.color?.getHex(),m.emissive?.getHex(),m.opacity,m.transparent,m.side]));
  });
  if(built.parts) for(const g of built.parts) for(const key of Object.keys(g.attributes).sort()){
    const a=g.attributes[key];h.update(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength));
  }
  write([built.colliders,built.rooms,built.spawn,built.exitZone,built.placedProps]);
  return h.digest('hex');
}
const actual={};
for(const id of protectedCivic){
  const site=EXPANSION_SITES.find(s=>s.id===id)||{id,name:'Protected '+id};
  actual['interior:'+id]=signature(buildCivicInterior(site,label));
}
for(const id of protectedFacades){
  const site=EXPANSION_SITES.find(s=>s.id===id),b=new Builder();
  buildExpansionFacade(b,site);actual['facade:'+id]=signature(b);
}
const pop=createNarrominePopulation(),index=createNarromineWorkplaceIndex(pop);
for(const name of ['Narromine Hotel','Narromine Pharmacy','Soul Food Depot & Gallery']){
  const entry=index.list.find(e=>e.workplace.name===name);
  actual['researched:'+name]=signature(buildNarromineWorkplaceInterior(pop,entry,label,2,660));
}
const path=new URL('./fixtures/generic-protected-buildings.json',import.meta.url);
if(process.argv.includes('--record')) console.log(JSON.stringify({baseline:'66561b06',geometry:actual},null,2));
else {
  const expected=JSON.parse(fs.readFileSync(path,'utf8'));
  assert.deepEqual(actual,expected.geometry,'a handcrafted dispatch changed; generic work must not alter it');
  console.log(`PASS ${Object.keys(actual).length} protected bespoke interior/facade geometry signatures unchanged`);
}
