// Node-only service-network tests. No Three.js, browser, secrets or paid CI.
import assert from 'node:assert/strict';
import { distributePower, townPowerDemands, POWER_EDGES } from '../src/world/power-grid.js';
import { TownLife } from '../src/world/life.js';

const homes=[];
for (let r=0; r<7; r++) for(let c=0;c<26;c+=2)
  homes.push({coordinate:String.fromCharCode(65+c)+(r+1),
    name:'House '+r+'-'+c,door:{x:(c-12.5)*26,z:r*46-161+4}});
const advance=(t,minutes)=>{for(let i=0;i<minutes;i+=0.5)t.tick(0.5);};
const grid=()=>new TownLife({homes,seed:20261019,minute:420});

assert.equal(POWER_EDGES.length,10);
assert.equal(Object.values(townPowerDemands(7,0)).reduce((n,p)=>n+p.demand,0),0);
assert.equal(Object.values(townPowerDemands(7,7)).reduce((n,p)=>n+p.demand,0),7);
assert.throws(()=>distributePower({generation:-1,demands:townPowerDemands(9,38)}),/generation/);
assert.throws(()=>distributePower({generation:20,demands:{broken:{demand:-1,priority:0}}}),/demand/);
const healthy=distributePower({generation:38,demands:townPowerDemands(9,38)});
assert.equal(healthy.demand,38);
assert.equal(healthy.served,38);
assert.equal(healthy.affected.length,0);
assert.equal(healthy.edges.find(e=>e.id==='main-feed').flow,38);
const faulty=distributePower({generation:38,demands:townPowerDemands(9,38),failedLines:{'west-feeder':true}});
assert.equal(faulty.customers['west-homes'].served,0);
assert.equal(faulty.customers['east-homes'].status,'supplied');
assert.equal(faulty.customers.waterworks.status,'supplied');
assert.equal(faulty.customers.bakery.status,'supplied');
assert.deepEqual(faulty.affected,['west-homes']);
assert.equal(faulty.served+faulty.unserved,faulty.demand);
for (const e of faulty.edges) {
  assert(e.flow>=0 && e.flow<=e.availableCapacity,e.id+' capacity exceeded');
}
const lowGeneration=distributePower({generation:14,demands:townPowerDemands(9,38)});
assert.equal(lowGeneration.served,14);
assert.equal(lowGeneration.customers.clinic.status,'supplied');
assert.equal(lowGeneration.customers.waterworks.status,'supplied');
assert.equal(lowGeneration.customers.sewage.status,'supplied');
assert.equal(lowGeneration.customers.bakery.status,'supplied');
assert(lowGeneration.unserved>0);
const t=grid();
advance(t,120);
assert.equal(t.civic.powerGrid.unserved,0);
assert.match(t.faultPowerLine('west-feeder'),/Fault recorded/);
assert.equal(t.civic.powerGrid.customers['west-homes'].status,'out');
assert.equal(t.gridPowered('bakery'),true);
assert.equal(t.gridPowered('waterworks'),true);
assert.equal(t.civic.powerGrid.customers['east-homes'].status,'supplied');
assert.equal(t.faultPowerLine('west-feeder'),'That feeder is already out of service.');
const before=t.snapshot(), money=t.civic.treasury, parts=t.place('hall').stock.parts;
assert.equal(before.saveVersion,2);
assert.equal(before.powerGridEvents.length,1);
const restored=grid();
restored.restore(JSON.parse(JSON.stringify(before)));
assert.equal(restored.civic.powerGrid.customers['west-homes'].status,'out');
assert.equal(restored.powerGridEvents[0].id,'grid-1');
assert.match(restored.repairPowerLine('west-feeder'),/repair requested/i);
assert.equal(restored.civic.treasury,money,'no cost before inspection/authorisation');
assert.equal(restored.place('hall').stock.parts,parts,'no parts used before inspection');
assert.equal(restored.civic.powerGrid.customers['west-homes'].status,'out','fault remains until worker completes');
advance(restored,210);
assert.equal(restored.place('hall').stock.parts,parts-2);
assert.equal(restored.civic.powerGrid.affected.length,0);
assert.equal(restored.powerGridEvents[1].type,'power-line-repaired');
assert(restored.civic.government.orders.some(o=>o.kind==='feeder'&&o.status==='done'));

assert.equal(restored.repairPowerLine('west-feeder'),'That feeder is already working.');
assert.equal(restored.snapshot().powerGridEvents.length,2);

// The waterworks pump and sewage plant genuinely depend on their own feeders.
const water=grid();
advance(water,120);
water.place('waterworks').stock.water=0;
water.faultPowerLine('waterworks-feed');
water.utilitiesHour(9,()=>[]);
assert.equal(water.civic.supply.waterOk,false,'water pumps cannot refill a tank without their feeder');
assert.equal(water.gridPowered('sewage'),true,'unaffected wastewater station keeps its power');
const waste=grid();
advance(waste,120);
waste.place('sewage').stock.wastewater=74;
waste.faultPowerLine('sewage-feed');
const wasPollution=waste.civic.indicators.pollution;
waste.utilitiesHour(9,()=>[]);
assert(waste.civic.indicators.pollution>wasPollution,'unpowered sewage works causes recorded pollution');

// Run the identical sequence twice: events, feeder flows and balances match.
function scenario() { const p=grid();advance(p,120);p.faultPowerLine('west-feeder');
  advance(p,60);p.repairPowerLine('west-feeder');advance(p,210);return JSON.stringify({
    grid:p.civic.powerGrid,events:p.powerGridEvents,cash:p.civic.treasury,
    parts:p.place('hall').stock.parts,time:p.minute}); }
assert.equal(scenario(),scenario(),'deterministic same seed/actions');
const legacy=grid();
legacy.restore({day:4,minute:0,civic:{player:{wallet:42}},places:[],villagers:[]});
assert.equal(legacy.minute,0,'v1 midnight save must not accidentally reset to 7am');
assert.equal(legacy.civic.player.wallet,42);
assert.deepEqual(legacy.powerGridEvents,[],'v1 save has no event history');
console.log('PASS: 10-edge capacity-limited power grid; feeder fault, dependencies, budgeted repair, event replay and v1/v2 save restoration');
