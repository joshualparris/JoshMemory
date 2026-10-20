import assert from 'node:assert/strict';
import { TownLife } from '../src/world/life.js';
const homes=[];
for(let r=0;r<7;r++)for(let c=0;c<26;c+=2)homes.push({coordinate:String.fromCharCode(65+c)+(r+1),name:'Home',door:{x:(c-12.5)*26,z:r*46-157}});
const t=new TownLife({homes,minute:12*60,seed:20261020});
for(const v of t.villagers){v.step={kind:'idle',at:'home'};v.path=[];}
const player=t.civic.player; player.wallet=200;player.bag.bread=2;
const store=t.place('store'),cafe=t.place('cafe'),pub=t.place('pub');
store.stock.bread=10;Object.assign(cafe.stock,{coffee:5,milk:5});pub.stock.pub_roast=2;
const before=()=>JSON.stringify({player,stock:[store.stock,cafe.stock,pub.stock],tills:[store.till,cafe.till,pub.till],stats:t.stats,treasury:t.civic.treasury});
for(const action of [()=>t.buyItem('store','bread'),()=>t.sellItem('store','bread'),()=>t.orderCafe('flat-white'),()=>t.buyMenuItem('pub','pub_roast')]){
 const snapshot=before();assert.match(action(),/waiting for staff/);assert.equal(before(),snapshot,'refused service must not change food, money, receipts or statistics');
}
const worker=t.villagers.find(v=>v.work==='store');
worker.step={kind:'work',at:'store'};worker.path=[{x:0,z:0}];assert.match(t.buyItem('store','bread'),/waiting for staff/);
worker.path=[];assert.match(t.buyItem('store','bread'),/You buy/);
worker.step={kind:'work',at:'hall'};assert.match(t.sellItem('store','bread'),/waiting for staff/,'stale counter action rechecks attendance');
const relief=t.villagers.find(v=>v!==worker);relief.step={kind:'work',at:'store'};relief.path=[];
assert.match(t.sellItem('store','bread'),/buys it back/,'actual relief can serve even if their normal job is elsewhere');
t.minute=23*60;const snapshot=before();assert.match(t.sellItem('store','bread'),/closed/);assert.equal(before(),snapshot,'closed buybacks cannot bypass shop hours');
t.minute=12*60;relief.step={kind:'idle',at:'home'};
const customer=t.villagers.find(v=>v!==worker&&v!==relief);customer.wallet=100;
const money=customer.wallet,stock=store.stock.bread;
t.buy(customer,'store',['bread']);assert.equal(customer.wallet,money);assert.equal(store.stock.bread,stock);assert.match(customer.memory,/waiting for staff/);
t.snack(customer,'store','bread');assert.equal(customer.wallet,money);assert.equal(store.stock.bread,stock);
t.eatOut(customer,'cafe');assert.equal(customer.wallet,money);assert.match(customer.memory,/waiting for staff/);
console.log('PASS: staff arrival, dispatch, relief, stale actions, closed buybacks and autonomous customers share atomic service rules');
// A missed visit must use a real home meal, not free food at an empty shop.
customer.pantry={bread:4,eggs:2,veg:2,lamb:2,milk:2};customer.step={kind:'eatout',at:'cafe',dur:30};
t.eatOut(customer,'cafe');assert.equal(customer.step.dur,1);assert.equal(customer.queue[0].kind,'cook');assert.equal(customer.queue[0].at,'home');assert.equal(customer.wallet,money);
// Noon food-service coverage: staff do not all join customers' lunch rush.
for(const site of ['cafe','bakery'])for(const v of t.villagers.filter(v=>v.work===site)){
 v.doneToday.breakfast=true;v.doneToday.lunch=false;v.fatigue=0;v.queue=[];v.path=[];t.plan(v);
 assert.equal(v.step.kind,'work');assert(v.step.until>=13*60);
}
console.log('PASS: pantry-backed meal fallback and food-counter noon coverage');
