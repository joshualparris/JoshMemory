import assert from 'node:assert/strict';
import {EXPANSION_SITES,EXPANSION_FIRST_WAVE} from '../src/world/town-expansion.js';
import {expansionFootprint} from '../src/world/town-expansion-facades.js';
import {PLACE_DEFS,ROSTER_SIZE,TownLife,EXPANSION_LOCAL_STAFFED} from '../src/world/life.js';
import {auditTownSlots,placeAddress} from '../src/world/addresses.js';
import fs from 'node:fs';
const file=JSON.parse(fs.readFileSync(new URL('../../docs/repository-town.json',import.meta.url),'utf8'));
const homes=file.projects.map(({coordinate,repo})=>({coordinate,name:repo,door:{x:0,z:0}}));
assert.equal(EXPANSION_SITES.length,72);
assert.equal(EXPANSION_SITES.filter(x=>x.priority==='P1').length,22);
assert.equal(EXPANSION_SITES.filter(x=>x.priority==='P2').length,50);
assert.equal(PLACE_DEFS.length,118);
assert.equal(EXPANSION_LOCAL_STAFFED.length,17);
assert.equal(ROSTER_SIZE,188); // exactly the existing home count; never invent housing
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
assert.equal(town.villagers.length,188);
for(const s of EXPANSION_SITES){
 const p=town.place(s.id);
 assert.equal(p.address,placeAddress(s));
 const road=(s.row-2)*46-3.5*46+16;
 assert.ok(Math.abs(p.front.z-(road+5.4))<.0001);
 assert.ok(p.door.z>p.front.z);
 assert.ok(p.originZ-7>road+6.5); // frontage wall behind kerb and traffic
 assert.ok(p.originZ-7+expansionFootprint(s.style).d<((s.row-1)*46-3.5*46)-4);
}
assert.deepEqual(new Set(EXPANSION_LOCAL_STAFFED).size,17);
console.log('PASS 72 new northern-frontage 2026 business/service sites: 22 P1, 50 P2; all unique, existing rows/addresses conserved.');
