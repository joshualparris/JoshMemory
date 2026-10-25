// RTU-001: read-only source/runtime audit. Never exports repository names or briefs.
// Run from any cwd: node tools/audit-electricity.mjs [--check]
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { TownLife, PLACE_DEFS } from '../src/world/life.js';
import { POWER_EDGES, townPowerDemands, distributePower } from '../src/world/power-grid.js';
import { householdHour, feederFor } from '../src/world/household.js';
import { COUNTERS } from '../src/world/counter-queue.js';
import { houseAddress, placeAddress, auditTownSlots } from '../src/world/addresses.js';
import { loadInventory, loadBriefs, toHouse } from './lib.mjs';
import { buildExterior } from '../src/world/exterior.js';
import { Builder } from '../src/world/builder.js';
import { lotPosition, yardLimitsFor } from '../src/world/town.js';
import * as THREE from 'three';
import { buildCivicInterior } from '../src/world/shop-interior.js';
import { coldChainHour } from '../src/world/cold-chain.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const inventory=loadInventory(),briefs=loadBriefs();
const homes=inventory.projects.map(p=>{
  const h=toHouse(briefs.get(p.repo),p,inventory.grid.streetNames,{},new Map());
  const lot=lotPosition(p.coordinate), b=new Builder();
  const fp=buildExterior(b,h.ext,h.ext,yardLimitsFor(p.coordinate));
  return {coordinate:p.coordinate,name:'House '+p.coordinate,
    door:{x:lot.x+fp.door.x,z:lot.z+fp.front},lot:{x:lot.x,z:lot.z}};
});
const make=()=>new TownLife({homes,seed:20261019,minute:540});
const life=make();
const slots=auditTownSlots(homes,PLACE_DEFS);
assert.equal(slots.counts.houses,inventory.projects.length);
assert.equal(slots.counts.sites,PLACE_DEFS.length);
const customers=Object.keys(townPowerDemands(9,50));
const rendererCustomer=id=>['clinic','waterworks','sewage','bakery'].includes(id)?id:
  ['mill','foundry','soyplant'].includes(id)?'industry':null;
const productionCustomer=id=>({waterworks:'waterworks',sewage:'sewage',mill:'bakery',
  bakery:'bakery',foundry:'industry',soyplant:'industry'})[id]||null;
const equipment=['fridge','freezer','lights','oven','climate','tv','computer','washer','hotwater'];
const records=homes.map(h=>{
  const occupants=life.villagers.filter(v=>v.home.coordinate===h.coordinate);
  const home=occupants[0];
  return {id:'H:'+h.coordinate,address:houseAddress(h.coordinate),kind:'repository-house',
    position:h.lot,door:h.door,positionBasis:'lot and exterior doorway geometry',
    householdModels:occupants.length,physicalServiceId:null,meterId:null,
    demandModel:home?'per-villager household; not property-level':'none',
    behaviourCustomer:home?feederFor(home):null,loadEquipment:home?equipment:[],
    renderingCustomer:null,renderingRule:'town-wide positive delivery for exterior; indoor house lights ungated',
    outageEffect:home?'household appliances/food/billing follow neighbourhood; indoor rendering does not':'no household appliance model',
    gap:'No physical service/meter node, phase, conductor, transformer or calibrated demand.'};
});
for(const p of life.places.values())records.push({id:'B:'+p.id,address:placeAddress(p),kind:p.kind,
  position:{x:p.x,z:p.side==='south'?null:161},door:p.door,
  positionBasis:'runtime doorway; south site centre not asserted',householdModels:0,
  physicalServiceId:null,meterId:null,demandModel:customers.includes(p.id)?'aggregate customer allocation':'no distinct customer demand',
  behaviourCustomer:productionCustomer(p.id),coldChainCustomer:COUNTERS.has(p.id)?'bakery':p.id==='soyplant'?'industry':null,
  loadEquipment:[...({waterworks:['water refill pump abstraction'],sewage:['wastewater treatment abstraction'],
    mill:['flour milling','oat drink production'],bakery:['baking'],foundry:['ore and scrap processing'],
    soyplant:['grinding','heat process','packaging','finished-goods cooler']})[p.id]||[],
    ...(COUNTERS.has(p.id)?['retail cold room']:[])],
  renderingCustomer:rendererCustomer(p.id),renderingRule:rendererCustomer(p.id)?'mapped shared-shell interior circuit; verify custom renderer separately':'town-wide positive delivery for registered interior circuit',
  outageEffect:productionCustomer(p.id)?'production/pumping gated by aggregate customer':'no site-specific production gate identified',
  gap:p.id==='mill'?'Production uses bakery but mapped interior lights use industry.':'No physical service/meter node, phase, conductor, transformer or calibrated demand.'});
// Inspect real Three.js scene objects without a browser, not just the name of a site.
for(const p of life.places.values()){
  const room=buildCivicInterior(p,()=>new THREE.Sprite(new THREE.SpriteMaterial()),life);
  const r=records.find(r=>r.id==='B:'+p.id);
  const lights=[];room.group.traverse(o=>{if(o.isLight)lights.push(o);});
  r.interiorLighting={lights:lights.length,callback:typeof room.group.userData.updateLighting==='function',
    callbackSite:room.group.userData.lightingSite||null};
  room.group.userData.updateLighting?.(false);
  r.interiorLighting.lightsRemainingAfterDirectOff=lights.filter(l=>l.intensity>0).length;
  if(!r.interiorLighting.callback){r.renderingCustomer=null;r.renderingRule='custom interior has no registered power callback; lights stay on during direct outage test';}
  else assert.equal(r.interiorLighting.lightsRemainingAfterDirectOff,0,p.id+' callback must turn off its lights');
  room.group.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of [o.material].flat())m.dispose?.();}});
}
assert.equal(records.length,homes.length+PLACE_DEFS.length);
assert.equal(new Set(records.map(r=>r.id)).size,records.length);
assert.equal(new Set(records.map(r=>r.address)).size,records.length);
for(const r of records){assert(Number.isFinite(r.door.x)&&Number.isFinite(r.door.z));assert(!r.behaviourCustomer||customers.includes(r.behaviourCustomer));}

// Controlled probes deliberately separate demand, node faults and appearance.
const probes=[];
const probe=(id,fn)=>{const result=fn();probes.push({id,...result});};
probe('healthy-capacity',()=>{const g=distributePower({generation:50,demands:townPowerDemands(9,50)});
  assert.equal(g.unserved,0);return {result:'pass',served:g.served,demand:g.demand};});
probe('every-line-fault',()=>{const cases=POWER_EDGES.map(e=>{
  const g=distributePower({generation:50,demands:townPowerDemands(9,50),failedLines:{[e.id]:true}});
  assert.equal(g.served+g.unserved,g.demand);assert.equal(g.edges.find(x=>x.id===e.id).flow,0);
  return {line:e.id,affected:g.affected,served:g.served,unserved:g.unserved};});
  return {result:'pass',cases};});
probe('household-request-suppression',()=>{const a=make(),b=make();
  for(const t of [a,b]){t.civic.supply.power=100;t.civic.supply.powerDemand=50;t.updatePowerGrid();}
  b.faultPowerLine('west-feeder');b.faultPowerLine('east-feeder');
  const normal=householdHour(a,9),out=householdHour(b,9);
  assert(normal.power>0);assert.equal(out.power,0);
  return {result:'confirmed-gap',healthyReportedPower:normal.power,blackoutReportedPower:out.power,
    consequence:'Requested household demand is suppressed while disconnected, then reused to size next supply allocation.'};});
probe('feeder-partition',()=>{const rows=life.villagers.map(v=>({x:v.home.door.x,customer:feederFor(v)}));
  return {result:'confirmed-gap',west:rows.filter(r=>r.customer==='west-homes').length,
    east:rows.filter(r=>r.customer==='east-homes').length,
    consequence:'Assignment uses doorway x<40, but grouped demand always splits remainder 50/50.'};});
probe('water-sewer-dependency',()=>{const t=make();t.civic.supply.power=100;t.civic.supply.powerDemand=50;t.updatePowerGrid();
  t.place('waterworks').stock.water=0;t.faultPowerLine('waterworks-feed');t.utilitiesHour(9,()=>[]);
  assert.equal(t.civic.supply.waterOk,false);assert.equal(t.gridPowered('sewage'),true);
  return {result:'pass',waterRefillBlocked:true,sewerStillPowered:true};});
probe('unknown-customer-fallback',()=>{const t=make();t.civic.supply.ok=true;
  assert.equal(t.gridPowered('not-a-service'),true);
  return {result:'confirmed-gap',unknownIdReturnsPowered:true};});
probe('fault-save-restore',()=>{const t=make();t.civic.supply.power=100;t.civic.supply.powerDemand=50;t.updatePowerGrid();
  t.faultPowerLine('west-feeder');const saved=JSON.parse(JSON.stringify(t.snapshot()));const r=make();r.restore(saved);
  assert.equal(r.gridPowered('west-homes'),false);assert.equal(r.powerGridEvents[0].type,'power-line-failed');
  return {result:'pass',saveVersion:saved.saveVersion,events:r.powerGridEvents.length};});
probe('shop-coldroom-save-restore',()=>{const t=make();t.civic.supply.power=100;t.civic.supply.powerDemand=50;t.updatePowerGrid();
  t.faultPowerLine('bakery-feed');coldChainHour(t);coldChainHour(t);const minutes=t.place('store').coldOff;
  const r=make();r.restore(JSON.parse(JSON.stringify(t.snapshot())));
  assert.equal(minutes,120);assert.equal(r.place('store').coldOff,undefined);
  return {result:'confirmed-gap',beforeReloadMinutes:minutes,afterReloadMinutes:null,
    consequence:'Shop coldOff outage timer is absent from snapshot place tuples; reload resets accumulated warm time.'};});
probe('renderer-gating-source',()=>{const t=read('src/world/townlife.js'),i=read('src/world/interior.js');
  assert(t.includes('life.civic.powerGrid.served > 0'));assert(i.includes('new THREE.HemisphereLight'));
  return {result:'confirmed-gap',evidence:'Town exterior lighting is globally enabled by any served load; repository interior lights have no updateLighting callback.',
    houseInteriorCallbackPresent:i.includes('updateLighting')};});
probe('mill-circuit-mismatch',()=>{assert.equal(productionCustomer('mill'),'bakery');assert.equal(rendererCustomer('mill'),'industry');
  return {result:'confirmed-gap',production:'bakery',mappedInterior:'industry'};});

const files=['src/world/power-grid.js','src/world/life.js','src/world/household.js','src/world/cold-chain.js',
  'src/world/store-batches.js','src/world/soy-chain.js','src/world/government.js','src/world/lighting.js',
  'src/world/townlife.js','src/world/town.js','src/world/interior.js','src/world/power-interior.js',
  'src/ui/townpanels.js','src/main.js','src/world/trade-education.js','src/world/occupation-work.js',
  'src/engine/save.js','tests/power-grid.mjs','tests/household.mjs','tests/lighting.mjs'];
const evidence=files.map(file=>({file,sha256:sha(read(file)),matches:read(file).split('\n')
  .flatMap((line,i)=>/gridPowered|powerGrid|powerLines|utilitiesHour|POWER =|feederFor|householdHour|powerDemand|updateLighting|battery|batteries|solar|solarPanel|powerNetworkHTML/.test(line)
    ?[{line:i+1,text:line.trim().slice(0,420)}]:[])}));
const output={schemaVersion:1,task:'RTU-001',baseline:'19a13fe0b19f9960f8dd87e5dfcefa18670a0c82',
  scope:'Source and controlled Node audit, not hosted gameplay or a new operational service registry',
  privacy:'House coordinates and numeric geometry only; names/URLs/descriptions/brief contents excluded',
  counts:{houses:homes.length,sites:PLACE_DEFS.length,total:records.length,householdModels:life.villagers.length,
    unmodelledHouseLots:records.filter(r=>r.kind==='repository-house'&&!r.householdModels).length,
    graphEdges:POWER_EDGES.length,aggregateCustomers:customers.length,physicalBuildingServices:0,
    civicInteriorsWithPowerCallbacks:records.filter(r=>r.interiorLighting?.callback).length,
    civicInteriorsWithoutPowerCallbacks:records.filter(r=>r.interiorLighting&&!r.interiorLighting.callback).length},
  records,edges:POWER_EDGES,customers,probes,evidence};
const dir=path.join(root,'audit/electricity');
const serial=JSON.stringify(output,null,2)+'\n';
const columns=['id','address','kind','householdModels','demandModel','loadEquipment','behaviourCustomer','coldChainCustomer','renderingCustomer','renderingRule','outageEffect','gap'];
const csv=[columns.join(','),...records.map(r=>columns.map(k=>'"'+String(r[k]??'').replaceAll('"','""')+'"').join(','))].join('\n')+'\n';
if(process.argv.includes('--check')){
  assert.equal(fs.readFileSync(path.join(dir,'coverage.json'),'utf8'),serial,'audit snapshot drift; rerun and review');
  assert.equal(fs.readFileSync(path.join(dir,'buildings.csv'),'utf8'),csv,'CSV drift');
}else{fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'coverage.json'),serial);fs.writeFileSync(path.join(dir,'buildings.csv'),csv);}
console.log(JSON.stringify({task:output.task,...output.counts,probes:probes.map(({id,result})=>({id,result})),check:process.argv.includes('--check')}));
