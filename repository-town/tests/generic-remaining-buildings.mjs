// Extra protection recorded BEFORE pass two. Never replace pass-one snapshots.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {Builder} from '../src/world/builder.js';
import {EXPANSION_SITES} from '../src/world/town-expansion.js';
import {buildCivicInterior,CIVIC_INTERIOR_IDS} from '../src/world/shop-interior.js';
import {buildExpansionFacade} from '../src/world/town-expansion-facades.js';
import {createNarrominePopulation} from '../src/world/narromine-population.js';
import {createNarromineWorkplaceIndex,buildNarromineWorkplaceInterior} from '../src/world/narromine-workplaces.js';
import {PLAN_HOMES} from '../src/world/masterplan-built.js';
import {buildCountryHome} from '../src/world/country-homes.js';
import {dossierFor} from '../src/world/country-dossiers.js';
import {buildCountryInterior} from '../src/world/country-interiors.js';

const label=()=>new THREE.Object3D();
const targetKinds=new Set(['hvac','camp_site','museum','coworking','courthouse','animal_shelter',
  'alternative','social_facility','tobacco','community_centre','physiotherapist','guest_house',
  'jewelry','photographer','educational_institution','alcohol','car_wash','car','golf_course','caravan','aerodrome']);
const retainedFacadeIds=new Set(['busstop','visitorcentre','cemetery','agedcare','library','pharmacy',
  'repotech','supermarket','pathology','dentist','clothing','stockfeed','farmsupplies','hairdresser',
  'opshop','beauty','laundry','employment','homewares','irrigation']);
const retainedStyles=new Set(['park','nursery','fuel','carwash','sports']);
function signature(built){
  const h=createHash('sha256'),put=x=>h.update(JSON.stringify(x));
  const geometry=g=>{
    for(const key of Object.keys(g.attributes).sort()){
      const a=g.attributes[key];put(key);h.update(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength));
    }
    if(g.index)h.update(Buffer.from(g.index.array.buffer,g.index.array.byteOffset,g.index.array.byteLength));
  };
  built.group?.traverse(o=>{if(!o.isMesh)return;put([o.position.toArray(),o.rotation.toArray(),o.scale.toArray()]);
    geometry(o.geometry);put((Array.isArray(o.material)?o.material:[o.material]).map(m=>[m.type,m.color?.getHex(),m.opacity,m.transparent]));});
  for(const g of built.parts||[])geometry(g);
  put([built.colliders,built.rooms,built.spawn,built.exitZone,built.placedProps]);
  return h.digest('hex');
}
const actual={};
for(const id of new Set([...CIVIC_INTERIOR_IDS,...EXPANSION_SITES.filter(s=>['library','pharmacy','repotech','dentist','supermarket','pathology','artscentre','agedcare','nursery','clothing','cemetery','busstop','visitorcentre'].includes(s.id)).map(s=>s.id)])){
  actual['civic:'+id]=signature(buildCivicInterior(EXPANSION_SITES.find(s=>s.id===id)||{id,name:'Protected '+id},label));
}
for(const s of EXPANSION_SITES)if(retainedFacadeIds.has(s.id)||retainedStyles.has(s.style)){
  const b=new Builder();buildExpansionFacade(b,s);actual['facade:'+s.id]=signature(b);
}
const pop=createNarrominePopulation(),index=createNarromineWorkplaceIndex(pop);
for(const entry of index.list)if(!targetKinds.has(entry.workplace.kind)){
  actual['workplace:'+entry.workplace.id]=signature(buildNarromineWorkplaceInterior(pop,entry,label,2,660));
}
const path=new URL('./fixtures/generic-pass-two-protected.json',import.meta.url);
const country={};
for(const home of PLAN_HOMES){
  const b=new Builder();buildCountryHome(b,home.design);
  country['exterior:'+home.design.country]=signature(b);
  if(dossierFor(home.design.country))country['researched:'+home.design.country]=signature(buildCountryInterior(home,label));
}
const countryPath=new URL('./fixtures/generic-country-protected.json',import.meta.url);
if(process.argv.includes('--record-country'))console.log(JSON.stringify({baseline:'45f2b632 plus business-only working changes; country sources unchanged',geometry:country},null,2));
else if(process.argv.includes('--record'))console.log(JSON.stringify({baseline:'0cfa7911',geometry:actual},null,2));
else{
  const expected=JSON.parse(fs.readFileSync(path,'utf8'));
  assert.deepEqual(actual,expected.geometry,'pass two changed an existing dedicated or previously upgraded component');
  assert.deepEqual(country,JSON.parse(fs.readFileSync(countryPath,'utf8')).geometry,'a country exterior or researched room changed');
  for(const s of EXPANSION_SITES){
    const built=buildCivicInterior(s,label);
    assert(!built.group.getObjectByName('office-shelf-stock'),s.id+' still has placeholder office stock');
  }
  for(const entry of index.list)if(targetKinds.has(entry.workplace.kind)){
    const built=buildNarromineWorkplaceInterior(pop,entry,label,2,660);
    assert(built.genericFitout,entry.workplace.name+' still has an untyped fallback');
  }
  console.log(`PASS remaining-building coverage and ${Object.keys(actual).length} additional business / ${Object.keys(country).length} country frozen component signatures`);
}
