import assert from 'node:assert/strict';
import {TownLife,GOODS,PLACE_DEFS} from '../src/world/life.js';
import {FARM_ANIMAL_SITES,herdReport,reportSickAnimal,animalProductionFactor,livestockMinute} from '../src/world/livestock.js';
import {productionHour,industrySummary,BUILD_STAGES} from '../src/world/linked-industries.js';
const homes=[];
for(let r=0;r<8;r++)for(let c=0;c<(r===7?6:26);c++)
  homes.push({coordinate:String.fromCharCode(65+c)+(r+1),name:'Test house',door:{x:(c-12.5)*26,z:r*46-161+4}});
const make=()=>new TownLife({homes,minute:10*60,seed:20261020});
const town=make();
assert.equal(town.villagers.length,38);
for(const id of ['vet','hardware','brewery','buildsite']){
 assert(town.place(id),id+' must be an actual geolocated workplace');
 assert(town.villagers.some(v=>v.work===id&&v.job!=='student'),id+' needs a named employee');
}
for(const good of ['feed','medkit','timber','cement','hardware','metal','malt','hops','yeast','beerKeg','soda'])
 assert(GOODS[good],good+' must be a real tradable inventory good');
assert.equal(PLACE_DEFS.filter(x=>['vet','hardware','brewery','buildsite'].includes(x.id)).length,4);
assert.deepEqual(FARM_ANIMAL_SITES,['sheep','dairy','coop']);
assert.deepEqual([town.farmAnimals('sheep').length,town.farmAnimals('dairy').length,town.farmAnimals('coop').length],[12,7,16]);
const initial=town.farmAnimals('dairy')[0],farm=town.place('dairy'),clinic=town.place('vet');
assert(initial.health>60);
farm.till=90;
let result=town.reportAnimalIllness('dairy',initial.id);
assert.match(result,/case VET-/);
assert.equal(town.industries.vetCases.length,1);
assert(animalProductionFactor(town,'dairy')<1,'sick cow must reduce eligible production');
result=town.reportAnimalIllness('dairy',initial.id);assert.match(result,/Existing veterinary case/);
const vet=town.villagers.find(v=>v.job==='veterinarian');
assert(vet&&vet.work==='vet');
vet.x=farm.front.x;vet.z=farm.front.z;vet.path=[];vet.step=null;
town.minute=vet.start+5;
livestockMinute(town,1);
assert.equal(town.industries.vetCases[0].status,'examining');
const formerTill=farm.till,oldKits=clinic.stock.medkit;
livestockMinute(town,26);
assert.equal(town.industries.vetCases[0].status,'treated');
assert.equal(clinic.stock.medkit,oldKits-1);
assert.equal(farm.till,formerTill-34);
assert.equal(town.farmAnimals('dairy')[0].isolated,false);
assert(animalProductionFactor(town,'dairy')>0.85);

const pub=town.place('pub'),publican=town.villagers.find(v=>v.job==='publican');
publican.step={kind:'work',at:'pub',until:publican.end};publican.path=[];town.minute=13*60;
town.civic.player.wallet=100;
pub.stock.beerKeg=1;pub.stock.soda=1;pub.openKegServes=0;
let spent=town.civic.player.wallet;
assert.match(town.buyPubDrink('beer'),/bought one served beer/);
assert.equal(pub.stock.beerKeg,0,'opening a keg removes one actual keg');
assert.equal(pub.openKegServes,9);
assert.equal(town.civic.player.wallet,spent-8);
for(let i=0;i<9;i++)assert.match(town.buyPubDrink('beer'),/bought/);
assert.equal(pub.openKegServes,0);
assert.match(town.buyPubDrink('beer'),/run out/);
assert.match(town.buyPubDrink('soda'),/bought/);
assert.equal(pub.stock.soda,0);
assert.match(town.buyPubDrink('soda'),/run out/);
pub.stock.beerKeg=1;town.civic.player.age=16;
assert.match(town.buyPubDrink('beer'),/eligible adults/);
town.civic.player.age=25;
pub.licenceActive=false;
assert.match(town.buyPubDrink('beer'),/no valid licence/);
pub.licenceActive=true;

// Production has real recipes, time delays and energy/water requirements.
const brew=town.place('brewery'),s=town.industries;
brew.stock={malt:3,hops:1,yeast:1};brew.out.beerKeg=0;
town.day=1;town.minute=10*60;
const onShift=id=>town.villagers.filter(v=>v.work===id);
productionHour(town,10,onShift);
const batch=s.batches.at(-1);
assert(batch?.status==='fermenting');
assert.equal(batch.readyDay,4);
assert.equal(brew.stock.malt,0);assert.equal(brew.stock.hops,0);assert.equal(brew.stock.yeast,0);
town.day=3;productionHour(town,10,onShift);assert.equal(batch.status,'fermenting');
assert.equal(brew.out.beerKeg,0,'beer must not appear before three days');
town.day=4;productionHour(town,10,onShift);
assert.equal(batch.status,'conditioned');
assert.equal(brew.out.beerKeg,3);

// Distinct stages must require named builder, materials, and paid work.
const site=town.place('buildsite'),builder=town.villagers.find(v=>v.job==='builder');
const project=s.project;
site.stock={cement:0,timber:0,hardware:0,metal:0};
builder.step={kind:'work',at:'buildsite',until:builder.end};builder.path=[];
town.minute=10*60;productionHour(town,10,onShift);
assert.equal(project.stage,0,'cannot begin foundation without cement');
site.stock={cement:3,timber:5,hardware:3,metal:2};
const uses=['cement','timber','hardware','metal'];
for(let stage=0;stage<4;stage++){
 const prev=site.stock[uses[stage]];
 productionHour(town,10,onShift);
 assert.equal(site.stock[uses[stage]],prev-[3,5,3,2][stage],'pay materials upfront');
 assert.equal(project.stage,stage,'60 minutes should not instantly complete a stage');
 productionHour(town,11,onShift);
 assert.equal(project.stage,stage+1,'120 minutes completes inspected stage');
}
assert.equal(project.finishedDay,town.day);
assert.equal(BUILD_STAGES[project.stage],'commissioned');
assert(industrySummary(town).log.some(x=>/commissioned/.test(x.text)));

const snap=JSON.parse(JSON.stringify(town.snapshot()));
const copy=make();copy.restore(snap);
assert.equal(copy.industries.project.stage,4);
assert.equal(copy.industries.batches.at(-1).status,'conditioned');
assert.equal(copy.industries.vetCases[0].status,'treated');
assert.equal(copy.place('pub').stock.beerKeg,1);
assert.equal(copy.industries.drinks.length,s.drinks.length);
assert.equal(copy.industries.herds.dairy.length,7);
console.log('PASS: living livestock and paid vet; stock and age-restricted pub sales; three-day brew batches; staffed 4-stage construction with consumed materials; complete save/restore');
