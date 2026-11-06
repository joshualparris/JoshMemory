// Site-specific interior regression: Narromine Pharmacy must not reuse the generic pharmacy.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createNarrominePopulation } from '../src/world/narromine-population.js';
import { createNarromineWorkplaceIndex, buildNarromineWorkplaceInterior } from '../src/world/narromine-workplaces.js';
import { NARROMINE_PHARMACY_EVIDENCE as E, pharmacyOpeningAt, pharmacyInteriorSpec } from '../src/world/narromine-pharmacy-interior.js';

const pop=createNarrominePopulation(), index=createNarromineWorkplaceIndex(pop);
const entry=index.list.find(e=>e.workplace.name===E.business&&e.workplace.kind==='pharmacy');
assert(entry, 'the OSM-named 53 Dandaloo Street pharmacy exists as an enterable workplace');
assert.equal(E.address,'53 Dandaloo Street, Narromine NSW 2821');
assert.equal(E.planIsMeasured,false,'no invented measured floor plan');
assert.equal(E.namedStaffRepresented,false,'named real staff must not be assigned fictional rosters');
assert(E.unknown.includes('room-by-room floor plan'));
const spec=pharmacyInteriorSpec();
assert.equal(spec.layout,'hub','single shop has an open shop floor and adjoining service-zone interpretations');
assert.equal(spec.rooms.length,4);
assert(spec.rooms.every(r=>/interpretive|unverified|interpretation/i.test(r.name)),
  'room position and scale are explicitly marked unverified');
const label=()=>new THREE.Object3D();
const b=buildNarromineWorkplaceInterior(pop,entry,label,2,10*60+30);
assert.equal(b.rooms.length,4,'Narromine pharmacy has a uniquely authored four-zone design');
assert(b.pharmacyEvidence===E && b.pharmacyLayoutVerified===false);
assert(b.group.children.some(child=>child.name.includes('Timber-look retail planks')),'photo-inspired timber floor modelled');
assert.equal(b.group.children.filter(child=>child.name==='Eyewear display spinner · photo-inspired').length,2);
assert(b.group.children.some(child=>child.name.includes('Glazed giftware cabinet')),'photographed glazed giftware cabinet interpreted');
const labels=b.interactables.map(i=>i.label);
for(const name of ['Prescription advice','Giftware and wellness checkout','Vaccination and medicine consultation',
  'Robotic dose-aid packing station','Sleep health and CPAP enquiries','Eyewear and gifts'])
  assert(labels.includes(name),'actual pharmacy service or visible fixture represented: '+name);
const normal=buildNarromineWorkplaceInterior(pop,{...entry,workplace:{...entry.workplace,name:'Other pharmacy (generic test only)'}},label,2,10*60+30);
assert.equal(normal.rooms.length,1,'other pharmacies still receive existing kind-based layout');
assert(!normal.pharmacyEvidence,'only the exact mapped business gets the bespoke evidence');
assert.deepEqual([pharmacyOpeningAt(2,540),pharmacyOpeningAt(2,779),pharmacyOpeningAt(2,780),
  pharmacyOpeningAt(2,840),pharmacyOpeningAt(2,1050),pharmacyOpeningAt(6,660),
  pharmacyOpeningAt(6,720),pharmacyOpeningAt(0,660)],[true,true,false,true,false,true,false,false]);
for(const [wd,min,expected] of [[2,630,true],[2,810,false],[2,865,true],[6,660,true],[6,750,false],[0,630,false]]){
  const v=buildNarromineWorkplaceInterior(pop,entry,label,wd,min);
  assert.equal(v.open,expected,'published opening hours for weekday '+wd+' minute '+min);
  if(!expected)assert.equal(v.staff.length,0,'no customer-facing fictional staff during closure');
}
// Fixtures never close the central front-door aisle. Built walls remain legitimate
// colliders, so verify the in-room route, not the space outside the building.
for(let z=-1.4;z>=b.rooms[0].z0+1.4;z-=0.7){
 const hit=b.colliders.some(c=>c.x0<1.0&&c.x1>-1.0&&c.z0<z+0.35&&c.z1>z-0.35);
 assert(!hit,'2 m central retail path clear at z='+z.toFixed(1));
}
assert(b.spawn && b.exitZone && b.bounds,'reuses actual interior entrance/exit game contract');
assert(b.openings.length===3,'three room entrances; not three disconnected duplicate sheds');
console.log('PASS Narromine Pharmacy: unique 4-zone evidence-gated interpretive fit-out, photo-grounded displays, services, published hours, staff closure and clear customer route');
