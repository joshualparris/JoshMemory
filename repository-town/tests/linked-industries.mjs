// Linked industries: animals need feed and water, the vet treats sick animals from finite kits,
// trades builds a workshop from hardware-store materials, and pub kegs arrive by rail with an invoice.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {TownLife} from '../src/world/life.js';
import {FARM_ANIMAL_SITES,animalProductionFactor,industries,BUILD_STAGES} from '../src/world/linked-industries.js';
import {pubVenue} from '../src/world/pub-venue.js';
const inventory=JSON.parse(fs.readFileSync(new URL('../../docs/repository-town.json',import.meta.url),'utf8'));
const homes=inventory.projects.map(({coordinate})=>({coordinate,name:'Home '+coordinate,
 door:{x:(coordinate.charCodeAt(0)-65-12.5)*26,z:(Number(coordinate.slice(1))-1-3.5)*46+3}}));
const town=new TownLife({homes,minute:6*60,seed:20261105});
for(const id of ['vet','stockfeed','hardware','trades','sheep','dairy','coop','pub'])assert(town.place(id),id+' exists');
assert.deepEqual(FARM_ANIMAL_SITES,['sheep','dairy','coop']);
assert.deepEqual(FARM_ANIMAL_SITES.map(f=>town.farmAnimals(f).length),[12,7,16]);
assert.equal(animalProductionFactor(town,'dairy'),1);
assert.equal(animalProductionFactor(town,'garden'),1,'farms without animals are unaffected');

// A sick cow is isolated and lowers output until treated; a second report reuses the case.
const cow=town.farmAnimals('dairy')[0];
assert.match(town.reportAnimalIllness('dairy',cow.id),/case VET-0001/);
assert.match(town.reportAnimalIllness('dairy',cow.id),/Existing veterinary case/);
assert(animalProductionFactor(town,'dairy')<1);

// Run two working days: the vet must treat the cow (one kit, $34 from the farm), feed must be bought.
const s=industries(town),kits=s.stock.vet.medkit,feed0=s.stock.stockfeed.feed;
for(let i=0;i<2*24*60;i++)town.tick(1);
const c=s.cases[0];
assert.equal(c.status,'treated','the vet treated the cow: '+c.status);
assert.equal(town.farmAnimals('dairy')[0].isolated,false);
assert(s.visits.some(v=>v.caseId===c.id&&v.fee===34));
assert(s.stock.vet.medkit<kits+6,'kits are finite (restocked only by invoice)');
assert(s.invoices.length>0,'restocking is invoiced');
assert(FARM_ANIMAL_SITES.every(f=>town.farmAnimals(f).every(a=>a.fed)),'farms bought feed and fed their animals');

// In a dry spell with no bought feed, grazing animals go hungry and output falls.
s.farmFeed.sheep=0;s.feedDay=0;s.stock.stockfeed.feed=0;town.place('stockfeed').till=0;
const herd=s.herds.sheep;herd.forEach(a=>a.health=65);
town.civic.industries.feedDay=0;town.civic.industries.dryDays=10;town.civic.weather='sunny';   // a dry spell: no pasture left
// careDay runs on the next hour tick
for(let i=0;i<60;i++)town.tick(1);
assert(herd.every(a=>!a.fed),'no feed: sheep went hungry');
assert(animalProductionFactor(town,'sheep')<1);

// The workshop extension progresses from materials bought at the hardware store.
assert(s.project.stage>=1,'trades completed at least the '+BUILD_STAGES[0]+': stage '+s.project.stage);
// Kegs: when the pub's supplier stock runs low, four kegs arrive by rail and are invoiced.
const v=pubVenue(town),pub=town.place('pub');pub.till=1000;v.beerDepotL=100;
for(let i=0;i<60;i++)town.tick(1);
assert.equal(v.beerDepotL,300);assert.equal(pub.till<1000,true);
// State survives save and load.
const saved=JSON.parse(JSON.stringify(town.snapshot()));
const again=new TownLife({homes,minute:6*60,seed:20261105});
assert.notEqual(again.restore(saved),false);
assert.equal(industries(again).cases[0].status,'treated');
assert.equal(industries(again).project.stage,s.project.stage);
console.log(`PASS linked industries: ${s.visits.length} vet visit(s), workshop at stage ${s.project.stage} (${BUILD_STAGES[s.project.stage]}), ${s.kegsDelivered} kegs by rail, ${s.invoices.length} supplier invoices`);
