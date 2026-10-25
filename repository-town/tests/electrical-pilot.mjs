import assert from 'node:assert/strict';
import * as THREE from 'three';
import {pilotNetwork,pilotInitialState,initialiseElectricalPilot,pilotReport,
 pilotMains,pilotPowered,pilotSolarKw,pilotAction,tickElectricalPilot,
 validElectricalPilotState,PILOT_FAULTS,pilotPath} from '../src/world/electrical-pilot.js';
import { createElectricalPilotVisuals,attachPilotInteriorLighting } from '../src/world/electrical-pilot-visuals.js';
import { buildCivicInterior } from '../src/world/shop-interior.js';
import { pubStatus,pubKitchenReady } from '../src/world/pub-utilities.js';
import {electricalPilotPanel} from '../src/ui/electrical-pilot-panel.js';
import fs from 'node:fs';
import {shopService} from '../src/world/shop-attendance.js';
import {coldChainHour} from '../src/world/cold-chain.js';
import {householdHour,ensureHousehold} from '../src/world/household.js';

const life=()=>({minute:12*60,day:1,civic:{weather:'sunny',
 supply:{waterOk:true},electricalPilot:null},gridPowered:()=>true});
const town=life();
let s=initialiseElectricalPilot(town);
assert(validElectricalPilotState(s));
assert.equal(pilotNetwork().sites.length,16);
assert.equal(pilotNetwork().transformers.length,4);
assert.equal(new Set(pilotNetwork().sites.map(x=>x.id)).size,16);
const full=JSON.parse(fs.readFileSync('audit/electricity/design-network-v1.json','utf8'));
const fullEdges=new Map(full.edges.map(e=>[e.id,e]));
for(const edge of pilotNetwork().edges){
  const upstream=fullEdges.get(edge.id);
  assert(upstream,'invented edge '+edge.id);
  assert.deepEqual(edge.route,upstream.route,'route drift '+edge.id);
  assert.equal(edge.from,upstream.from);
  assert.equal(edge.to,upstream.to);
}
for(const site of pilotNetwork().sites){
  assert(full.services.some(s=>s.id===site.id&&s.meterId===site.meterId),'invented connection '+site.id);
  assert(pilotPath(site.id).includes('SERVICE:'+site.id),'missing service '+site.id);
}
const report=pilotReport(town);
assert.equal(report.siteCount,16);
assert(report.sites.every(x=>x.mains&&x.unservedKw===0),'all pilot sites initially powered');
assert(report.totalDemandKw>30&&report.totalDemandKw<120,'credible commercial + dwelling kW envelope');
assert(report.siteById['B:pub'].demandKw>report.siteById['H:N7'].demandKw);
assert.equal(pilotSolarKw(0,'sunny',{pvKw:12}),0,'no night solar');
assert(pilotSolarKw(12*60,'sunny',{pvKw:12})>8,'midday PV');
assert.equal(pilotSolarKw(12*60,'rainy',{pvKw:12})<pilotSolarKw(12*60,'sunny',{pvKw:12}),true);
const before=pilotReport(town).siteById['B:pub'];
pilotAction(town,'fault:'+PILOT_FAULTS.pub);
assert.equal(pilotMains(town,'B:pub'),false);
assert.equal(pilotPowered(town,'B:pub'),false);
assert.equal(pilotMains(town,'B:post'),true,'service fault must not affect neighbours');
assert.equal(pilotMains(town,'B:hotel'),true,'Railway Hotel unaffected by the separate Merged Branch pub service fault');
pilotAction(town,'fault:'+PILOT_FAULTS.hotel);
assert.equal(pilotMains(town,'B:hotel'),false,'I9-N hotel loses its own electrical supply');
assert.equal(pilotMains(town,'B:pub'),false,'pub still independently faulted');
pilotAction(town,'fault:'+PILOT_FAULTS.hotel);
assert.equal(pubStatus(town).power,false,'pub kitchen circuit follows physical breaker');
assert.equal(pubKitchenReady(town),false,'no cooking during outage');
assert(!pilotReport(town).siteById['B:post'].unservedKw);
pilotAction(town,'fault:'+PILOT_FAULTS.pub);
assert.equal(pilotMains(town,'B:pub'),true);
pilotAction(town,'fault:'+PILOT_FAULTS.pubDistrict);
for(const id of ['B:pub','B:post','B:school'])assert.equal(pilotMains(town,id),false,id);
for(const id of ['B:bakery','B:cafe','H:N7'])assert.equal(pilotMains(town,id),true,id+' unaffected');
pilotAction(town,'fault:'+PILOT_FAULTS.pubDistrict);
pilotAction(town,'fault:'+PILOT_FAULTS.shops);
for(const id of ['B:bakery','B:butcher','B:cafe','B:greengrocer','B:store','B:hotel'])assert.equal(pilotMains(town,id),false);
assert(pilotMains(town,'B:pub'));
pilotAction(town,'fault:'+PILOT_FAULTS.shops);
pilotAction(town,'fault:'+PILOT_FAULTS.northHouses);
for(const id of ['H:N7','H:O7','H:P7','H:Q7'])assert.equal(pilotMains(town,id),false);
assert(pilotMains(town,'H:K7')&&pilotMains(town,'B:pub'));
pilotAction(town,'fault:'+PILOT_FAULTS.northHouses);
pilotAction(town,'fault:'+PILOT_FAULTS.shared);
assert(pilotReport(town).sites.every(s=>!s.mains),'upstream intake outage drops every pilot mains');
pilotAction(town,'fault:'+PILOT_FAULTS.shared);
pilotAction(town,'equip:solar');
assert(pilotReport(town).solarKw>0);
pilotAction(town,'fault:'+PILOT_FAULTS.pub);
assert.equal(pilotReport(town).solarKw,0,'grid-following PV trips on loss of reference');
assert.equal(pilotPowered(town,'B:pub'),false,'solar without battery cannot island');
pilotAction(town,'equip:solarBattery');
assert.equal(town.civic.electricalPilot.socKwh,8,'explicit precharged commissioning');
assert.equal(pilotReport(town).siteById['B:pub'].backup,true);
assert.equal(pubStatus(town).power,false,'battery cannot power full bistro kitchen');
assert.equal(pubStatus(town).backup,true);
const start=town.civic.electricalPilot.socKwh;
tickElectricalPilot(town,60);
assert(town.civic.electricalPilot.socKwh<start&&town.civic.electricalPilot.socKwh>=0,'energy-conserving battery discharge');
assert(town.civic.electricalPilot.essentialBackupKwh>0);
assert(town.civic.electricalPilot.unservedKwh>0,'kitchen demand genuinely unmet on battery');
tickElectricalPilot(town,420);
assert.equal(town.civic.electricalPilot.socKwh,0,'backup eventually depletes');
assert.equal(pilotReport(town).siteById['B:pub'].powered,false,'no perpetual phantom battery');
pilotAction(town,'equip:grid');
pilotAction(town,'equip:solarBattery');
assert.equal(town.civic.electricalPilot.socKwh,0,'selection does not conjure another charged battery');
pilotAction(town,'fault:'+PILOT_FAULTS.pub);
town.minute=12*60;
tickElectricalPilot(town,60);
assert(town.civic.electricalPilot.energyGridKwh>0,'physical grid meter advances when connected');
assert(town.civic.electricalPilot.meterKwh['B:post']>0);
assert(pilotReport(town).gridImportKw>=0&&pilotReport(town).servedKw>0);
assert(validElectricalPilotState(town.civic.electricalPilot));
const save=JSON.parse(JSON.stringify(town.civic.electricalPilot)),reload=life();
reload.civic.electricalPilot=save;
initialiseElectricalPilot(reload);
assert.deepEqual(reload.civic.electricalPilot,save,'equipment/faults/meters save roundtrip');
const invalid=JSON.parse(JSON.stringify(save));invalid.socKwh=Infinity;
assert(!validElectricalPilotState(invalid));
assert.throws(()=>pilotAction(town,'fault:NOT-A-LINE'),/invalid edge/);
assert.throws(()=>pilotAction(town,'equip:rocket'),/unrecognised equipment/);
const panel=electricalPilotPanel(town);
assert(panel.title.includes('Railway Hotel')&&panel.actions.length>=10);
assert(panel.body.includes('kWh')&&panel.body.includes('N7')&&panel.body.includes('Railway Hotel'));
const base=new THREE.Group(),geometry=createElectricalPilotVisuals(base,town);
assert(base.children.length===2);
geometry.update();
pilotAction(town,'toggleOverlay');
geometry.update();
assert(geometry.overlay.visible);
assert(geometry.permanent.children.length>0);
geometry.dispose();
assert(base.children.length===0);

// RTU-012 production acceptance: physical faults, not the old bakery/west-home
// aggregate feeder, now gate counter trade, individual cold rooms and appliances.
const operations=life();
initialiseElectricalPilot(operations);
operations.gridPowered=()=>true; // legacy grouped grid remains healthy
operations.open=()=>true;
operations.villagers=[];
const shop={id:'butcher',name:'Town Butcher'};
assert.equal(shopService(operations,shop).reason,'unstaffed');
pilotAction(operations,'fault:SERVICE:B:butcher');
assert.equal(shopService(operations,shop).reason,'power-outage','physical breaker disables shop till');
assert.equal(pilotMains(operations,'B:pub'),true,'pub stays powered when butcher loses service');
pilotAction(operations,'fault:SERVICE:B:butcher');
assert.equal(shopService(operations,shop).reason,'unstaffed','repair restores electrical availability');
const shops=Object.fromEntries(['store','bakery','greengrocer','butcher','cafe','pub','soyplant'].map(id=>
 [id,{id,name:id,stock:{milk:5,lamb:3},out:{milk:0,lamb:0,soymilk:0},coldOff:0}]));
operations.place=id=>shops[id]||null;
operations.stats={wasted:0};
operations.rubbish=()=>{};
operations.log=()=>{};
pilotAction(operations,'fault:SERVICE:B:butcher');
coldChainHour(operations);
assert.equal(shops.butcher.coldOff,60,'butcher fridge starts warming on its own isolated circuit');
assert.equal(shops.store.coldOff,0,'neighbouring store fridge remains powered');
assert.equal(shops.pub.coldOff,0,'pub fridge unaffected');
pilotAction(operations,'fault:SERVICE:B:butcher');
coldChainHour(operations);
assert.equal(shops.butcher.coldOff,0,'restoring butcher service resets cooling outage timer');
// The physical N7 service also powers a real household fridge, not only facade glass.
const resident={
 id:0,name:'N7 test resident',job:'retired',
 home:{coordinate:'N7',door:{x:13,z:120}},
 inside:true,step:{kind:'sleep',at:'home'},path:[],
 larder:[],
};
ensureHousehold(resident);
operations.villagers=[resident];
operations.daylight=()=>0;
operations.rubbish=()=>{};
const nowSupply=householdHour(operations,23);
assert(resident.household.meter.power>0&&resident.household.fridgeOff===0);
pilotAction(operations,'fault:SERVICE:H:N7');
const off=householdHour(operations,23);
assert.equal(resident.household.fridgeOff,60,'N7 individual meter cuts household refrigeration');
assert(off.power<nowSupply.power,'outage genuinely reduces served household energy');
assert.equal(pilotMains(operations,'H:K7'),true,'other house remains supplied');
pilotAction(operations,'fault:SERVICE:H:N7');
householdHour(operations,23);
assert.equal(resident.household.fridgeOff,0,'restored supply restarts fridge');


// Regression: the real Railway Hotel I9-N and Bakery previously had no
// dedicated electrical callbacks; their actual Three.js lights must now react.
for(const place of [{id:'hotel',name:'Railway Hotel'}, {id:'bakery',name:'Bakery'}]){
  const built=buildCivicInterior(place,()=>new THREE.Sprite(new THREE.SpriteMaterial()));
  attachPilotInteriorLighting(built.group,'B:'+place.id);
  const lights=[];built.group.traverse(o=>{if(o.isLight)lights.push(o);});
  assert(lights.length>0,place.id+' must contain physical lights');
  assert(typeof built.group.userData.updateLighting==='function');
  built.group.userData.updateLighting(false);
  assert(lights.every(x=>x.intensity===0),place.id+' must black out on physical service fault');
  built.group.userData.updateLighting(true);
  assert(lights.some(x=>x.intensity>0),place.id+' must re-energise on breaker restoration');
}

console.log('PASS: RTU pilot 16 source-derived addresses, 4 transformers, real paths, kW/kWh, PV night/anti-islanding, battery SOC depletion, selective pub/shop/house faults, meter/saves, visual line scene and inspector UI');
