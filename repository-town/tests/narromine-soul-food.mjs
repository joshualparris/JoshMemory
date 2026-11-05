// Narromine named-venue contract: no generic cafe clone, no invented blueprint or roster.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { NARROMINE_OSM } from '../src/world/narromine-osm-data.js';
import { PLACES,STREETS } from '../src/world/narromine-layout.js';
import { createNarrominePopulation } from '../src/world/narromine-population.js';
import { createNarromineWorkplaceIndex,buildNarromineWorkplaceInterior } from '../src/world/narromine-workplaces.js';
import { SOUL_FOOD_EVIDENCE,soulFoodOpen,soulFoodInteriorSpec } from '../src/world/narromine-soul-food-interior.js';

const n=SOUL_FOOD_EVIDENCE.name;
assert.equal(NARROMINE_OSM.places.some(p=>p.name===n),false,'venue is genuinely missing from OSM named POIs');
const site=PLACES.filter(p=>p.name===n);
assert.equal(site.length,1,'one named location, not duplicate models on top of other shops');
assert.match(site[0].address,/1.7 Dandaloo/);
assert.match(site[0].fact,/UNVERIFIED/,'visible georeferencing uncertainty');
const culling=STREETS.find(s=>s.name==='Culling Street');
assert(culling,'OSM street near the venue is available');
assert(culling.pts.some(([x,z])=>Math.hypot(site[0].x-x,site[0].z-z)<110),
  'provisional shed is near the independently documented Dandaloo/Culling junction');
assert(SOUL_FOOD_EVIDENCE.verifiedFloorplan===false && SOUL_FOOD_EVIDENCE.verifiedEntrance===false);
assert.equal(SOUL_FOOD_EVIDENCE.verifiedHeadcount,false);
for(const [weekday,minute,expected] of [[1,449,false],[1,450,true],[5,899,true],[6,900,false],
  [0,479,false],[0,480,true],[0,899,true],[0,900,false],[7,600,false],[-1,600,false]])
  assert.equal(soulFoodOpen(weekday,minute),expected,`real restaurant published schedule ${weekday} @ ${minute}`);
const authored=soulFoodInteriorSpec();
assert.equal(authored.layout,'grid','a converted factory with distinct large function areas');
assert.equal(authored.rooms.length,6,'gallery, retail/bar/takeaway, kitchen, events and two meeting rooms');
assert(authored.rooms.every(r=>/interpretive|unverified|reconstruction|inferred|no measured/i.test(r.name)),
  'every room is visibly labelled as interpretive, not a claimed blueprint');
const pop=createNarrominePopulation(),ix=createNarromineWorkplaceIndex(pop);
const entry=ix.list.find(e=>e.workplace.name===n);
assert(entry,'the new place has an actual mapped physical workplace entrance');
assert(entry.building.w>10 && entry.building.d>10,'mapped building footprint');
assert.match(entry.workplace.staffBasis,/NOT an actual/,'never claim nominal density headcount is real');
assert.equal(entry.workplace.opens,450,'regular cafe opening is not a generic 6:30am cafe time');
const label=()=>new THREE.Object3D();
const b=buildNarromineWorkplaceInterior(pop,entry,label,2,600);
assert.equal(b.rooms.length,6,'builder does not automatically add a bedroom');
assert.equal(b.soulFoodLayoutVerified,false);
assert.equal(b.soulFoodEvidence,SOUL_FOOD_EVIDENCE);
assert(b.group.children.some(x=>x.name==='Reused zinc corrugations · original procedural geometry'));
assert(b.group.children.some(x=>x.name==='Gallery artwork frame · original abstract'));
assert(b.group.children.some(x=>x.name==='Wire pendant-style event light · interpretation'));
const names=b.interactables.map(p=>p.label);
for(const name of ['Cafe and Allpress coffee counter','Loading Dock takeaway collection','Licensed bar and drinks enquiries',
  'Catering preparation','Function hosting and presentations','Meeting and training enquiry',
  'Boardroom booking','From citrus packing shed to gallery','Soul Food cafe opening times',
  'Event room and courtyard booking','Meeting and boardroom capacities'])assert(names.includes(name),`missing real service category: ${name}`);
const stations=b.interactables.filter(p=>p.act?.station);
assert(stations.length>=7,'separate workstations for real departments');
assert(stations.every(p=>p.key?.startsWith('NARROMINE-WORK:'+entry.workplace.id+':')),
  'staff workstations have stable unique business identifiers, not shared cafe keys');
assert(b.openings.length===5,'six connected rooms have 5 real doorways');
assert(b.spawn && b.exitZone && b.bounds && b.colliders.length,'actual walk-in gameplay shell exists');
assert.equal(b.rooms.some(r=>/bedroom|sleep/i.test(r.name)),false,'no invented commercial bedroom');
for(const [wd,m,yes] of [[2,600,true],[2,920,false],[0,475,false],[0,520,true]]){
  const o=buildNarromineWorkplaceInterior(pop,entry,label,wd,m);
  assert.equal(o.open,yes,`actual venue hour ${wd} ${m}`);
  if(!yes)assert.equal(o.staff.length,0,'no simulated customer-facing staff during closures');
}
const baseline=buildNarromineWorkplaceInterior(pop,
  {...entry,workplace:{...entry.workplace,name:'Unnamed sample cafe'}},label,2,600);
assert(!baseline.soulFoodEvidence,'bespoke site does not overwrite other cafe kind');
assert.notEqual(baseline.rooms.length,b.rooms.length,'does not reuse the same floor plan');
console.log('PASS Soul Food: named candidate site, 6 labelled reconstructed zones, connected doors, factory gallery fixtures, services, opening hours and fictional-only rosters');
