import assert from 'node:assert/strict';
import fs from 'node:fs';
import {TownLife,ROSTER_SIZE,PLACE_DEFS} from '../src/world/life.js';
import {industryHour,industryMinute,industryDay,industryState,validIndustryState,
  herdYield,INDUSTRY_STAGES} from '../src/world/town-linked-industries-2026.js';
import {facilityAccess} from '../src/world/facility-access.js';
import {HARDWARE} from '../src/world/trade-education.js';
import {pubVenue} from '../src/world/pub-venue.js';
const inventory=JSON.parse(fs.readFileSync(new URL('../../docs/repository-town.json',import.meta.url),'utf8'));
const homes=inventory.projects.map(({coordinate})=>({coordinate,name:'Project '+coordinate,
 door:{x:(coordinate.charCodeAt(0)-65-12.5)*26,z:(Number(coordinate.slice(1))-1-3.5)*46}}));
const t=new TownLife({homes});
assert.equal(ROSTER_SIZE,171,'never change previous NPC and marriage/save identities');
assert.equal(t.villagers.length,171);
assert.equal(new Set(t.villagers.map(v=>v.home.coordinate)).size,116);
const brew=t.place('brewery'),build=t.place('buildsite'),vet=t.place('vet');
assert(brew&&build&&vet,'real town sites, not invisible abstract businesses');
assert.deepEqual([brew.row,brew.col,brew.side],[5,'R','north']);
assert.deepEqual([build.row,build.col,build.side],[5,'S','north']);
assert(PLACE_DEFS.filter(p=>p.row===5&&p.side==='north'&&['R','S'].includes(p.col)).length===2);
assert.equal(t.civic.linkedIndustries.version,1);
assert.equal(validIndustryState(t.civic.linkedIndustries),true);
assert.equal(t.farmAnimals('sheep').length,12);
assert.equal(t.farmAnimals('dairy').length,7);
assert.equal(t.farmAnimals('coop').length,16);
assert.equal(HARDWARE.cement.initial,24,'foundation cement is finite, paid hardware stock');
assert.equal(facilityAccess(t,brew).allowed,false,'brewer not present before 8am');
t.minute=10*60;t.civic.supply.waterOk=true;t.civic.supply.ok=true;
assert.equal(facilityAccess(t,brew).allowed,true,'funded regional contractor allows visitor entry');
assert.equal(facilityAccess(t,build).allowed,true);
const stockBefore={...t.civic.tradeEducation.stock};
industryHour(t,10);
const s=industryState(t);
assert.equal(s.batches.length,1,'first 3-day brew is started with actual ingredients');
assert.equal(s.batches[0].readyDay,t.day+3);
assert.deepEqual([brew.stock.malt,brew.stock.hops,brew.stock.yeast],[0,0,0]);
assert(s.shipments.some(x=>x.from==='hardware'&&x.to==='buildsite'&&x.contents?.cement===3),
  'real paid hardware shipment with cement is in transit');
assert.equal(t.civic.tradeEducation.stock.cement,stockBefore.cement-3);
assert.equal(build.stock.cement,0,'materials cannot be consumed before arriving');
industryMinute(t,45);
assert.equal(build.stock.cement,3);
assert(s.shipments.find(x=>x.to==='buildsite').status==='delivered');
industryHour(t,11);assert.equal(s.project.stage,0);
industryHour(t,12);assert.equal(s.project.stage,1);
assert.equal(s.project.inspections.length,1);
assert.equal(build.stock.cement,0,'stage material actually consumed');
for(let stage=1;stage<4;stage++){
 t.minute=10*60;t.day+=1;
 industryHour(t,10);
 const shipment=s.shipments.findLast(x=>x.to==='buildsite'&&x.status==='transit');
 assert(shipment,'stage '+stage+' purchase dispatched');
 industryMinute(t,45);
 industryHour(t,11);industryHour(t,12);
 assert.equal(s.project.stage,stage+1,'finished phase '+stage);
}
assert.equal(s.project.stage,4);
assert.equal(s.project.inspections.length,4);
assert(s.project.commissionedDay>0);
assert.equal(s.project.inspections[2].stage,'services');
assert.equal(INDUSTRY_STAGES[4],'commissioned');
// Process the original batch after a minimum of three days.
t.minute=10*60;t.day=s.batches[0].readyDay;
industryHour(t,10);
assert.equal(s.batches[0].status,'conditioned');
assert(brew.out.keg50>=3);
// The existing pub is NOT automatically refilled. It has to pay for and
// physically await the incoming 50L keg, then existing RSA controls apply.
const oldBeer=pubVenue(t).beerDepotL;
t.place('pub').till=110;
industryHour(t,11);
assert(s.shipments.some(x=>x.to==='pub'&&x.status==='transit'));
assert.equal(pubVenue(t).beerDepotL,oldBeer,'no instant teleporting of pub beer');
industryMinute(t,59);
assert.equal(pubVenue(t).beerDepotL,oldBeer);
industryMinute(t,1);
assert.equal(pubVenue(t).beerDepotL,oldBeer+50);
assert.equal(s.shipments.findLast(x=>x.to==='pub').status,'delivered');
// A nurse cannot perform surgery merely because of a job title. A separately
// named regional visiting veterinarian must travel and invoice before cure.
const sheep=t.farmAnimals('sheep')[0],beforeHealth=sheep.health;
assert.match(t.reportAnimalIllness('sheep',sheep.id),/case/);
assert.equal(herdYield(t,'sheep'),11/12);
assert.equal(t.farmAnimals('sheep')[0].isolated,true);
const nurse=t.villagers.find(x=>x.work==='vet');
assert(nurse&&nurse.job.includes('veterinary'),'existing registered surgery nurse is reused');
nurse.step={kind:'work',at:'vet',until:17*60};nurse.path=[];t.minute=10*60;
const vetMedBefore=vet.stock.medkit, farmCash=t.place('sheep').till;
industryMinute(t,1);
assert.equal(s.cases[0].status,'travelling');
industryMinute(t,30);assert.equal(s.cases[0].status,'examining');
industryMinute(t,25);assert.equal(s.cases[0].status,'treated');
assert.equal(t.farmAnimals('sheep')[0].isolated,false);
assert(t.farmAnimals('sheep')[0].health>=75);
assert.equal(vet.stock.medkit,vetMedBefore-1);
assert.equal(t.place('sheep').till,farmCash-34);
// Feed is spent daily; water shortages and shortages reduce physical output,
// rather than magically replenishing animal health.
const olderYield=herdYield(t,'coop');
t.place('coop').stock.feed=0;t.day+=1;
industryDay(t);
assert(herdYield(t,'coop')<olderYield);
// Persistence: new state is saved and restored with current 171 saved workers.
assert.equal(validIndustryState(s),true);
const save=t.snapshot();
const fresh=new TownLife({homes});
assert.equal(fresh.restore(save),true,'current saved-game restore');
assert.equal(fresh.villagers.length,171);
assert.equal(fresh.villagers[0].home.coordinate,t.villagers[0].home.coordinate);
assert.equal(fresh.civic.linkedIndustries.project.stage,4);
assert.equal(pubVenue(fresh).beerDepotL,pubVenue(t).beerDepotL);
const bad=structuredClone(save);bad.civic.linkedIndustries.project.stage=9;
const before=fresh.day;
assert.equal(fresh.restore(bad),false,'malformed linked state refused');
assert.equal(fresh.day,before,'failed restore leaves game untouched');
console.log('PASS linked industries: preserved 171 residents, farm welfare + real nurse/visiting vet, paid materials + four inspected build stages, 3-day brew + delayed keg freight, saved state');
