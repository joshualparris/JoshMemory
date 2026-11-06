// Narromine residents who work in Repository Town park at their workplace only while on shift, each in their
// own kerbside space, with their own car.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { TownLife } from '../src/world/life.js';
import { createNarrominePopulation } from '../src/world/narromine-population.js';
import { createRepoTownCommuterParking } from '../src/world/narromine-commuters-parked.js';
import { vehicleFootprintsOverlap } from '../src/world/vehicle-occupancy.js';
const inventory = JSON.parse(fs.readFileSync(new URL('../../docs/repository-town.json', import.meta.url), 'utf8'));
const homes = inventory.projects.map(({ coordinate }) => ({ coordinate, name: 'Home ' + coordinate, door: { x: (coordinate.charCodeAt(0) - 65 - 12.5) * 26, z: (Number(coordinate.slice(1)) - 1 - 3.5) * 46 + 3 } }));
const pop = createNarrominePopulation(), life = new TownLife({ homes }), park = createRepoTownCommuterParking(null, pop, life, { models: false });
const day = park.update(2, 11 * 60), night = park.update(2, 2 * 60), sunday = park.update(0, 11 * 60).length;
assert.equal(night.length, 0, 'no Narromine commuters parked at 2 am');
const working = park.update(2, 11 * 60);
assert(working.length >= 20, 'Narromine commuters parked in Repository Town at 11 am Tuesday: ' + working.length);
// Full oriented-body SAT assertions below replace inaccurate centre-distance checks.
for (const c of working) { const p = pop.people.find(q => q.name === c.owner && q.repoTownJob?.name === c.place); assert(p, 'each car belongs to a commuter who works there'); assert(Math.abs(c.x - life.places.get(p.repoTownJob.id).curb.x) < 40, 'parked at their own workplace'); }
assert(sunday < working.length, 'fewer on Sunday');
console.log(`PASS Repository Town parking: ${working.length} Narromine commuters parked at their workplaces at 11 am Tuesday, ${sunday} on Sunday, none at 2 am`);

for(let i=0;i<working.length;i++)for(let j=i+1;j<working.length;j++)
  assert(!vehicleFootprintsOverlap(working[i],working[j],0.6),'full oriented parked body footprints overlap');
for(const c of working){
  const worker=pop.people.find(p=>p.name===c.owner&&p.repoTownJob?.name===c.place);
  const site=life.places.get(worker.repoTownJob.id);
  const side=site.side==='north'||site.side==='south'?1:-1;
  const roadCentre=site.curb.z-side*1.7;
  assert(Math.abs(c.z-roadCentre)-c.L/2>=7.8-0.01,
    'every part of parked body clears carriageway and footpath: '+c.owner);
  for(let i=0;i<6;i++)
    assert(Math.abs(c.x-(i*5-13)*26)>=3.5+0.95+1.5,
      'parked body clears crossing avenue: '+c.owner);
}
const refused=createRepoTownCommuterParking(null,pop,life,{
  models:false,parkingClear:()=>false,
});
assert.equal(refused.update(2,11*60).length,0,
  'no valid physical bay means no car is rendered in the road as a fallback');
