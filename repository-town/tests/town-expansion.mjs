import assert from 'node:assert/strict';
import {EXPANSION_SITES,EXPANSION_FIRST_WAVE} from '../src/world/town-expansion.js';
import {expansionFootprint} from '../src/world/town-expansion-facades.js';
import {civicEntranceZone,atCivicEntrance,closedCivicDoorPose} from '../src/world/civic-entrance.js';
import {civicExitPose} from '../src/world/shop-exit.js';
import {PLACE_DEFS,ROSTER_SIZE,TownLife,EXPANSION_LOCAL_STAFFED} from '../src/world/life.js';
import {auditTownSlots,placeAddress} from '../src/world/addresses.js';
import fs from 'node:fs';
const file=JSON.parse(fs.readFileSync(new URL('../../docs/repository-town.json',import.meta.url),'utf8'));
const homes=file.projects.map(({coordinate,repo})=>({coordinate,name:repo,door:{x:0,z:0}}));
assert.equal(EXPANSION_SITES.length,72);
assert.equal(EXPANSION_SITES.filter(x=>x.priority==='P1').length,22);
assert.equal(EXPANSION_SITES.filter(x=>x.priority==='P2').length,50);
assert.equal(PLACE_DEFS.length,118);
assert.equal(EXPANSION_LOCAL_STAFFED.length,72);
assert.equal(ROSTER_SIZE,171); // 99 old + 72 new workers, married couples share properties
assert.equal(new Set(PLACE_DEFS.map(x=>x.id)).size,PLACE_DEFS.length);
const slots=auditTownSlots(homes,PLACE_DEFS);
assert.equal(slots.counts.sites,118);assert.equal(slots.counts.houses,188);
for(const s of EXPANSION_SITES){
 assert.equal(placeAddress(s),s.col+s.row+'-N');
 assert.ok(s.row>=2&&s.row<=7);
 const footprint=expansionFootprint(s.style);
 assert.ok(footprint.d<=11 && footprint.w<=13); // avoid existing houses and avenues
 assert.ok(s.description.length>12);
}
for(const k of ['A7-N','B7-N','C7-N','W7-N','X7-N','Y7-N','Z7-N'])
 assert.equal(slots.slots.find(s=>s.address===k)?.kind,'site');
for(const k of EXPANSION_FIRST_WAVE)assert.ok(EXPANSION_SITES.some(s=>s.id===k),'First wave '+k);
const town=new TownLife({homes});
assert.equal(town.villagers.length,171);
assert.equal(town.marriages.length,55);
assert.equal(new Set(town.villagers.map(v=>v.home.coordinate)).size,116);
for(const s of EXPANSION_SITES){
 const p=town.place(s.id);
 assert.equal(p.address,placeAddress(s));
 const road=(s.row-2)*46-3.5*46+16;
 assert.ok(Math.abs(p.front.z-(road+5.4))<.0001);
 assert.ok(p.door.z>p.front.z);
 assert.ok(p.originZ-7>road+6.5); // frontage wall behind kerb and traffic
 assert.ok(p.originZ-7+expansionFootprint(s.style).d<((s.row-1)*46-3.5*46)-4);
 // All 72 infill premises face the PRECEDING road (-Z), never the solid back wall.
 const zone=civicEntranceZone(p),footprint=expansionFootprint(s.style);
 assert.ok(zone.z0 < p.door.z && zone.z1 < p.door.z+0.5, p.id+' sensor on street side');
 assert.ok(atCivicEntrance(p,{x:p.door.x,z:p.door.z-1.0}),p.id+' front approach enters');
 const rejected=closedCivicDoorPose(p,{x:p.door.x,z:p.door.z-1});
 assert.ok(rejected.z<p.door.z && !atCivicEntrance(p,rejected),p.id+' locked entry rejects onto street');
 const wall={x0:p.x-footprint.w/2,x1:p.x+footprint.w/2,z0:p.originZ-7,z1:p.originZ-7+footprint.d};
 const exit=civicExitPose(p,[wall]);
 assert.ok(exit && exit.z<p.door.z-3 && exit.yaw===0,p.id+' exits through FRONT door facing road');
 assert.ok(!atCivicEntrance(p,exit),p.id+' exit not repeatedly auto-triggered');
}
assert.equal(new Set(EXPANSION_LOCAL_STAFFED).size,72);
await import('./bus-interchange.mjs');
console.log('PASS: all 72 new 2026 north-frontage buildings use street-facing front doors for entry, locked-entry rejection, and collision-safe exit.');
