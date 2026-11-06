import assert from 'node:assert/strict';
import * as THREE from 'three';
import { Builder } from '../src/world/builder.js';
import { GENERIC_BUSINESS_PROPS } from '../src/world/generic-business-props.js';
import { GENERIC_CIVIC_SITES, GENERIC_PROFILES, genericProfileForKind, genericProfileForSite } from '../src/world/generic-business-fitouts.js';
import { buildCivicInterior } from '../src/world/shop-interior.js';
import { buildExpansionFacade, expansionFootprint } from '../src/world/town-expansion-facades.js';
import { addGenericFacadeDetails } from '../src/world/generic-facade-details.js';
import { EXPANSION_SITES } from '../src/world/town-expansion.js';
import { createNarrominePopulation } from '../src/world/narromine-population.js';
import { createNarromineWorkplaceIndex, buildNarromineWorkplaceInterior } from '../src/world/narromine-workplaces.js';
const label=()=>new THREE.Object3D();
const clear=(built,x,z,r=.32)=>!built.colliders.some(c=>x+r>c.x0&&x-r<c.x1&&z+r>c.z0&&z-r<c.z1);
const overlap=(a,b)=>a.x-a.w/2<b.x+b.w/2-.01&&a.x+a.w/2>b.x-b.w/2+.01&&a.z-a.d/2<b.z+b.d/2-.01&&a.z+a.d/2>b.z-b.d/2+.01;
for(const [name,p] of Object.entries(GENERIC_BUSINESS_PROPS)){
  const b=new Builder();p.build(b,{});
  for(const g of b.parts){
    g.computeBoundingBox();const q=g.boundingBox;
    assert(q.min.x>=-p.w/2-.001&&q.max.x<=p.w/2+.001,name+' width includes geometry');
    assert(q.min.z>=-p.d/2-.001&&q.max.z<=p.d/2+.001,name+' depth includes geometry');
    assert([...g.attributes.position.array].every(Number.isFinite),name+' finite geometry');
  }
}
assert.equal(genericProfileForKind('hairdresser'),'salon');
assert.equal(genericProfileForKind('estate_agent'),'property');
for(const id of ['hotel','library','pharmacy','clothing','realty','not-a-site'])
  assert.equal(genericProfileForSite({id,expansion:true}),null,id+' excluded');
assert.equal(genericProfileForSite({id:'hairdresser'}),null,'not a fictional expansion');
const rejected=new Builder();
assert.equal(addGenericFacadeDetails(rejected,{id:'hairdresser'},{}),null);
assert.equal(rejected.parts.length,0,'non-expansion facade receives no geometry');
for(const [id,key] of Object.entries(GENERIC_CIVIC_SITES)){
  const site=EXPANSION_SITES.find(s=>s.id===id);assert(site,id);
  const built=buildCivicInterior(site,label),fit=built.genericFitout;
  assert.equal(fit?.key,key,id+' routed through generic fitout');
  assert.deepEqual(built.bounds,{x0:-7,x1:7,z0:-12,z1:6});
  assert.equal(built.spawn.z,3.75);
  for(let z=-11;z<=6.6;z+=.2)assert(clear(built,0,z),id+' central aisle and exit at '+z);
  assert(clear(built,built.staff.pos.x,built.staff.pos.z),id+' staff position');
  assert(clear(built,built.staff.use.x,built.staff.use.z),id+' counter approach');
  assert(built.interactables.some(i=>i.act.do==='civic-ledger'),'preserves service');
  for(const p of fit.placements){
    assert(p.x-p.w/2>=-6.85&&p.x+p.w/2<=6.85,id+' '+p.type+' inside side walls');
    assert(p.z-p.d/2>=-11.85&&p.z+p.d/2<=5.85,id+' '+p.type+' inside end walls');
    for(const q of fit.placements)if(p!==q)assert(!overlap(p,q),id+' fixtures overlap '+p.type+' / '+q.type);
  }
  const b=new Builder(),facade=buildExpansionFacade(b,site);
  assert.equal(facade.genericFacade,key,id+' facade opt-in');
  assert.deepEqual({w:facade.w,d:facade.d},expansionFootprint(site.style),'same footprint');
  assert.equal(facade.front,7,'same entrance alignment');
  assert.equal(b.solids.length,0,'no new sidewalk collision');
}
const pop=createNarrominePopulation(),ix=createNarromineWorkplaceIndex(pop),seen=new Set();
for(const entry of ix.list){
  const built=buildNarromineWorkplaceInterior(pop,entry,label,2,660);
  if(!built.genericFitout)continue;
  seen.add(built.genericFitout.key);
  assert.equal(built.genericFitout.evidenceLevel,'interpretive-not-surveyed');
  assert(!built.rooms.some(r=>/bedroom/i.test(r.name)));
  assert(built.interactables.some(i=>i.act?.station),'retains work stations');
  assert(clear(built,built.spawn.x,built.spawn.z),'clear workplace spawn');
  for(const obj of built.sceneObjects.filter(o=>o.footprint)){
    const r=built.rooms[obj.room],{w,d}=obj.footprint;
    assert(obj.pos.x-w/2>=r.x0+.1&&obj.pos.x+w/2<=r.x1-.1,entry.id+' '+obj.type+' not clipped through side wall');
    assert(obj.pos.z-d/2>=r.z0+.1&&obj.pos.z+d/2<=r.z1-.1,entry.id+' '+obj.type+' not clipped through end wall');
  }
}
assert(seen.size>=5,'generic workplaces actually use varied profiles');
assert.equal(Object.keys(GENERIC_PROFILES).length,9);
console.log(`PASS generic fitouts: ${Object.keys(GENERIC_CIVIC_SITES).length} civic interiors/facades; ${seen.size} mapped workplace profiles; additive fixture bounds, aisle, staff/use, exclusion and collision checks`);
