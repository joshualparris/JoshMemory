// Morning opening guarantee: real staffed entrances, not merely printed hours.
import assert from 'node:assert/strict';
import {TownLife} from '../src/world/life.js';
import {facilityAccess,openingHoursLabel} from '../src/world/facility-access.js';
import {shopService} from '../src/world/shop-attendance.js';

const homes=Array.from({length:188},(_,i)=>({
  coordinate:String.fromCharCode(65+i%26)+(1+Math.floor(i/26)),
  name:'Home '+i,
  door:{x:(i%26-12.5)*26,z:(Math.floor(i/26)-3.5)*46+4}
}));
const cases=[
  ['greengrocer',8*60+18],['securityoffice',8*60+47],['locksmith',8*60+55],
  ['store',7*60+25],['hardware',7*60+40],['tafe',8*60+45],['dealership',8*60+45]
];
for(const seed of [42,20261022]){
  const life=new TownLife({homes,minute:4*60,seed});
  const checkpoints=[...new Set(cases.map(x=>x[1]))].sort((a,b)=>a-b);
  for(const minute of checkpoints){
    while(life.minute+0.001<minute)life.tick(Math.min(0.5,minute-life.minute));
    for(const [id,at] of cases.filter(c=>c[1]===minute)){
      const site=life.place(id),access=facilityAccess(life,site);
      const roster=life.villagers.filter(v=>v.work===id).map(v=>({
        who:v.name,role:v.job,step:v.step?.kind,at:v.step?.at,
        dist:Math.round(Math.hypot(v.x-site.front.x,v.z-site.front.z)),
        legs:v.path.length,activity:v.activity
      }));
      assert(access.allowed,seed+' · '+life.time()+' · '+id+' advertised opening without staff: '+JSON.stringify({access,roster}));
      assert(!openingHoursLabel(site).startsWith('OPEN'),id+' printed hours must not assert current live opening');
      if(['store','greengrocer'].includes(id))assert(shopService(life,site).available,id+' must actually serve customers');
    }
  }
  // The screenshots are Day 4, not just first-day fresh-game conditions.
  // Include accumulated fatigue, shopping, deliveries and saved work schedules.
  while(life.day<4)life.tick(.5);
  for(const minute of [8*60+18,8*60+47,8*60+55]){
    while(life.minute+0.001<minute)life.tick(Math.min(.5,minute-life.minute));
    for(const id of ['greengrocer','securityoffice','locksmith']){
      const site=life.place(id),access=facilityAccess(life,site);
      assert(access.allowed,'Day 4 seed '+seed+' at '+life.time()+' · '+id+' should have physically present staff: '+JSON.stringify({
        access,staff:life.villagers.filter(v=>v.work===id).map(v=>({name:v.name,step:v.step?.kind,at:v.step?.at,legs:v.path.length,activity:v.activity}))
      }));
    }
  }
  console.log('PASS Day 1 and Day 4 morning coverage seed '+seed+': '+cases.map(c=>c[0]).join(', '));
}
// Security must not be bypassed by a rostered employee who has not arrived.
const test=new TownLife({homes,minute:8*60+18,seed:42});
const site=test.place('greengrocer');
assert.equal(facilityAccess(test,site).reason,'unstaffed','no phantom opening merely because it is 08:18');
// Poverty is not an inventory shortage. A stocked retailer must retain its
// goods and count only actual missing goods in the town stockout metric.
const budgetTown=new TownLife({homes,minute:10*60,seed:42});
const grocer=budgetTown.place('greengrocer');
const seller=budgetTown.villagers.find(v=>v.work==='greengrocer');
Object.assign(seller,{x:grocer.front.x,z:grocer.front.z,step:{kind:'work',at:'greengrocer',until:17*60},path:[],inside:true});
const buyer=budgetTown.villagers.find(v=>v!==seller);
buyer.wallet=0;grocer.stock.veg=8;
const stockBefore=grocer.stock.veg,missedBefore=budgetTown.stats.stockouts;
budgetTown.buy(buyer,'greengrocer',['veg']);
assert.equal(budgetTown.stats.stockouts,missedBefore,'unaffordable goods are not empty shelves');
assert.equal(grocer.stock.veg,stockBefore,'unsold inventory remains physical');
assert.match(buyer.memory,/could not afford/);
buyer.wallet=100;grocer.stock.veg=0;
budgetTown.buy(buyer,'greengrocer',['veg']);
assert.equal(budgetTown.stats.stockouts,missedBefore+1,'actual missing goods are recorded');
assert.match(buyer.memory,/out of/);
console.log('PASS: cannot afford vs genuinely out of stock are distinct');
console.log('PASS: staffed service, physical commutes, honest hours and no phantom attendance');
