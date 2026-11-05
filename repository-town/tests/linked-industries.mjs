import assert from 'node:assert/strict';
import fs from 'node:fs';
import {TownLife,PLACE_DEFS} from '../src/world/life.js';
import {INDUSTRY_FARMS,INDUSTRY_STAGES,ensureLinkedIndustries,animalHealthFactor,tickLinkedIndustries} from '../src/world/linked-industries.js';
import {pubVenue} from '../src/world/pub-venue.js';

const raw=JSON.parse(fs.readFileSync(new URL('../../docs/repository-town.json',import.meta.url)));
const homes=raw.projects.map(({coordinate})=>({coordinate,
 door:{x:(coordinate.charCodeAt(0)-65-12.5)*26,z:(Number(coordinate.slice(1))-1-3.5)*46+3}}));
const life=new TownLife({homes,minute:600,seed:20261020});
const s=ensureLinkedIndustries(life);
assert.equal(life.villagers.length,171,'must not replace or duplicate 171 existing salaried actors');
assert.equal(life.marriages.length,55,'must preserve existing spouses');
assert.equal(PLACE_DEFS.filter(x=>x.id==='hardware').length,1,'reuse real hardware');
assert.equal(PLACE_DEFS.filter(x=>x.id==='pub').length,1,'reuse real licensed pub');
assert.equal(PLACE_DEFS.filter(x=>x.id==='vet').length,1,'reuse existing town-expansion vet');
assert.equal(PLACE_DEFS.some(x=>x.id==='brewery'||x.id==='buildsite'),false,'no duplicate brewery or building site');
assert.deepEqual(Object.keys(INDUSTRY_FARMS),['sheep','dairy','coop']);
assert.deepEqual([s.herds.sheep.length,s.herds.dairy.length,s.herds.coop.length],[12,7,16]);
assert(s.herds.sheep.every(a=>a.id&&a.health>60),'animals have persistent IDs/health');
assert(life.populationReport()?.population===470,'population and linked industries coexist');

// Real animal cases lower farm output and cost farm money + clinic kit.
// The vet travels from the existing clinic; case cannot be resolved instantly.
const animal=s.herds.dairy[0],farm=life.place('dairy'),vet=life.place('vet');
assert(animalHealthFactor(life,'dairy')===1);
assert.match(life.reportFarmAnimal('dairy',animal.id),/VET-0001/);
assert.match(life.reportFarmAnimal('dairy',animal.id),/Already/);
assert(animalHealthFactor(life,'dairy')<1,'illness isolates a dairy cow from milk yield');
const prevFarm=farm.till,prevVet=vet.till,prevKit=s.vet.stock;
tickLinkedIndustries(life,1);
assert.equal(s.cases[0].status,'travelling');
assert(s.vet.totalTravel>=5);
tickLinkedIndustries(life,s.vet.totalTravel);
assert.equal(s.cases[0].status,'examining');
assert.equal(s.cases[0].examMinutes,0,'no instant treatment on arrival');
tickLinkedIndustries(life,25);
assert.equal(s.cases[0].status,'treated');
assert.equal(farm.till,prevFarm-34);
assert.equal(vet.till,prevVet+34,'existing vet service receives its visit fee');
assert.equal(s.vet.stock,prevKit-1);
assert(animalHealthFactor(life,'dairy')===1);

// Paid freight transfers from the EXISTING hardware to the EXISTING trades site.
// Goods leave source immediately but cannot appear at destination before travel.
const hardware=life.civic.tradeEducation,site=s.site;
const oldHw=hardware.stock.timber,oldTill=hardware.hardwareCash,oldBudget=site.budget;
assert.match(life.orderIndustryBuilding(),/Paid/);
const run=s.supplyRuns.at(-1);
assert.equal(run.from,'hardware');assert.equal(run.to,'trades');
assert.equal(hardware.stock.timber,oldHw-2);
assert(hardware.hardwareCash>oldTill);
assert(site.budget<oldBudget);
assert.equal(site.stock.timber||0,0);
tickLinkedIndustries(life,Math.max(.1,run.duration-1));
assert.equal(site.stock.timber||0,0,'no teleported materials');
tickLinkedIndustries(life,1);
assert.equal(run.status,'delivered');
assert.equal(site.stock.timber,2);
assert.equal(site.stock.fasteners,2);

// Four staffed trade stages need actual finite stock, power and inspections.
const tradesworker=life.villagers.find(v=>v.work==='trades');
assert(tradesworker);
tradesworker.step={kind:'work',at:'trades',until:1020};
tradesworker.path=[];
assert.equal(INDUSTRY_STAGES.length,4);
tickLinkedIndustries(life,60);
assert.equal(site.stage,0);
assert.equal(site.stock.timber,0,'start stage by consuming timber');
tickLinkedIndustries(life,60);
assert.equal(site.stage,1);
assert.equal(site.inspections.length,1);
// Stage 2 cannot progress without physically delivered framing materials.
tickLinkedIndustries(life,600);
assert.equal(site.stage,1);
assert.match(life.orderIndustryBuilding(),/Paid/);
const run2=s.supplyRuns.at(-1);
tickLinkedIndustries(life,run2.duration);
tickLinkedIndustries(life,120);
assert.equal(site.stage,2);
assert.equal(site.inspections.length,2);

// The original pub menu/licensing remains untouched; new brewhouse matures
// only after three calendar days and supplies paid 50 L kegs through existing cellar.
const foundryworker=life.villagers.find(v=>v.work==='foundry');
assert(foundryworker);
foundryworker.step={kind:'work',at:'foundry',until:960};
foundryworker.path=[];
s.brewery.stock={malt:3,hops:1,yeast:1};
life.day=1;life.minute=610;
tickLinkedIndustries(life,1);
assert.equal(s.brewery.batches.length,1);
const batch=s.brewery.batches[0];
assert.equal(batch.readyDay,4);
assert.equal(batch.status,'fermenting');
assert.equal(s.brewery.stock.malt,0);
life.day=3;tickLinkedIndustries(life,1);
assert.equal(batch.status,'fermenting');
assert.equal(s.brewery.readyKegs,0);
life.day=4;tickLinkedIndustries(life,1);
assert.equal(batch.status,'conditioned');
assert.equal(s.brewery.readyKegs,3);
const oldBeer=pubVenue(life).beerDepotL;
life.place('pub').till=200;
assert.match(life.orderIndustryPubKegs(),/purchased/);
assert.equal(pubVenue(life).beerDepotL,oldBeer,'pub cannot receive keg early');
const pubRun=s.supplyRuns.at(-1);
tickLinkedIndustries(life,pubRun.duration);
assert.equal(pubVenue(life).beerDepotL,oldBeer+100,'existing licensed pub gets two paid 50 L kegs');
assert.equal(PLACE_DEFS.filter(x=>x.id==='pub').length,1);

// Save/restore round-trip, including progress and vehicle route and ABS register.
const save=life.snapshot();
const copy=new TownLife({homes,minute:600,seed:20261020});
assert.equal(copy.restore(save),true);
assert.deepEqual(copy.civic.linkedIndustries.site,life.civic.linkedIndustries.site);
assert.deepEqual(copy.civic.linkedIndustries.herds,life.civic.linkedIndustries.herds);
assert.equal(copy.civic.linkedIndustries.brewery.deliveredKegs,2);
assert.equal(copy.populationReport().population,470);
assert.equal(copy.villagers.length,171);
const legacy=structuredClone(save);delete legacy.civic.linkedIndustries;delete legacy.population;
assert.equal(copy.restore(legacy),true,'older saves without new industry/population still migrate');
assert.equal(copy.populationReport().population,470);
assert.equal(copy.civic.linkedIndustries.version,1);
console.log('PASS: 171 unchanged workers, 470 residents, 35 animals, paid vet and hardware, time-gated freight, staffed construction, three-day brewing, existing pub keg stock, save migration');
