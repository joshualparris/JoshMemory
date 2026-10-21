// General Store batches: dated lots always add up to real stock, FEFO rotation decides what sells
// first, chilled deliveries are probed, and supplier returns move money between tills only.
//   node tests/store-batches.mjs
import assert from 'node:assert/strict';
import {TownLife} from '../src/world/life.js';
import {workState,useStore,storeState,storeDelivery,tickWorkplay} from '../src/world/workplay.js';
import {STORE_GOODS} from '../src/world/work-recipes.js';
import {SHELF_LIFE,SAFE_TEMP,PROBE_WITHIN,shelfLabels} from '../src/world/store-batches.js';

const homes=[];for(let r=0;r<7;r++)for(let c=0;c<26;c+=2)homes.push({coordinate:String.fromCharCode(65+c)+(r+1),name:'House',door:{x:(c-12.5)*26,z:r*46-161+4}});
const lotsTotal=(s,g)=>s.lots[g].reduce((n,l)=>n+l.qty,0);
const balanced=(t,what)=>{const s=storeState(t),shop=t.place('store');for(const g of Object.keys(STORE_GOODS))assert.equal(lotsTotal(s,g),Math.max(0,shop.stock[g]||0),`${what}: ${g} lots match real stock`);};
const tills=t=>[...t.places.values()].reduce((n,p)=>n+p.till,0)+t.civic.treasury;
// Same order as life.js truckArrived: the stock lands, then the lot is recorded.
const deliver=(t,g,n,from,paid)=>{t.place('store').stock[g]=(t.place('store').stock[g]||0)+n;return storeDelivery(t,g,n,from,paid);};
function onShift(seed=5){
 const t=new TownLife({homes,minute:10*60,seed});t.playerAt='store';
 for(const v of t.villagers)if(v.work==='store'){v.step={kind:'work',at:'store'};v.path=[];}
 assert(t.startJob('store-stocker').ok);storeState(t);return t;
}
function emptyStore(t){const s=storeState(t),shop=t.place('store');for(const g of Object.keys(STORE_GOODS)){shop.stock[g]=0;s.shelves[g]=0;}storeState(t);return s;}

// 1. A long simulation: lots always add up to stock, whatever deliveries, sales and waste rules do.
{
 const t=new TownLife({homes,minute:6*60,seed:11});storeState(t);
 for(let h=0;h<24*5;h++){for(let m=0;m<60;m+=0.5)t.tick(0.5);balanced(t,'day '+t.day+' '+t.minute);}
 const s=storeState(t),attributed=Object.values(s.lots).flat().filter(l=>l.from);
 assert(attributed.length>0,'truck deliveries create lots with a known supplier');
 // A store with an empty till pays what it can (life.js), so a lot's recorded cost can be zero.
 assert(attributed.every(l=>l.unitCost>=0&&Number.isInteger(l.useBy)),'delivered lots record what was paid and a use-by day');
 assert(attributed.some(l=>l.unitCost>0),'paid deliveries record their unit cost');
 assert.equal(s.pending.length,0,'with nobody on shift, staff probe every chilled delivery');
}

// 2. Chilled deliveries while the player is on shift: probe, accept or reject, conserved credit.
{
 const t=onShift(),s=emptyStore(t),shop=t.place('store'),depot=t.place('depot');depot.till=500;
 const warm=deliver(t,'milk',6,'depot',9);assert.equal(warm.probe,'pending');balanced(t,'after delivery');
 warm.temp=SAFE_TEMP+2;const before=tills(t);
 const r=useStore(t,'probe',warm.id);assert(r.ok&&/Rejected/.test(r.message),'warm milk is rejected');
 assert.equal(shop.stock.milk,0,'rejected stock is no longer saleable');balanced(t,'after rejection');
 assert(s.returns.some(x=>x.reason==='warm'&&x.from==='depot'));
 const storeTill=shop.till,depotTill=depot.till;assert(useStore(t,'returns').ok);
 assert.equal(Math.round((shop.till-storeTill)*100),900,'store gets back exactly what it paid');
 assert.equal(Math.round((depotTill-depot.till)*100),900,'the supplier pays the credit');
 assert.equal(Math.round(tills(t)*100),Math.round(before*100),'credits move money between tills, never create it');
 assert(!useStore(t,'probe',warm.id).ok,'a lot is probed once');
 const cold=deliver(t,'eggs',4,'depot',12);cold.temp=3;
 assert(/Accepted/.test(useStore(t,'probe',cold.id).message));balanced(t,'after acceptance');
 // An unprobed chilled lot left on the dock past the two-hour window is binned, not sold.
 const late=deliver(t,'milk',3,'depot',4.5);t.minute+=PROBE_WITHIN+1;tickWorkplay(t);
 assert.equal(late.probe,'binned');assert.equal(shop.stock.milk,0);balanced(t,'after dock timeout');
}

// 3. FEFO: customers take from the front; new stock belongs behind older dates.
{
 const t=onShift(),s=emptyStore(t),shop=t.place('store');
 deliver(t,'coffee',2,'depot',9);s.shelves.coffee=2;s.lots.coffee[0].useBy=t.day+1;   // two older units on the shelf
 deliver(t,'coffee',3,'depot',13.5);
 assert(useStore(t,'pickup','coffee').ok);
 let r=useStore(t,'shelve','dry','behind');assert(/behind the older dates/.test(r.message),'FEFO placement is confirmed');
 assert.equal(s.fefo.right,1);assert.equal(shelfLabels(s,'coffee',5)[0].useBy,t.day+1,'the oldest date stays at the front');
 deliver(t,'tea',2,'depot',6);s.shelves.tea=2;s.lots.tea[0].useBy=t.day+2;
 deliver(t,'tea',3,'depot',9);
 assert(useStore(t,'pickup','tea').ok);r=useStore(t,'shelve','dry','front');
 assert(/Rotation check/.test(r.message)&&!/deduct|docked|fine/i.test(r.message),'wrong rotation is explained, never deducted');
 assert.equal(s.fefo.wrong,1);assert.notEqual(shelfLabels(s,'tea',5)[0].useBy,t.day+2,'newer tea now sits in front of the older tins');
 balanced(t,'after shelving');
 // A sale leaves from the front of the shelf.
 const front=s.lots.coffee[0],qty=front.qty;shop.stock.coffee--;storeState(t);
 assert(front.qty===qty-1||!s.lots.coffee.includes(front),'a sale takes the front lot');balanced(t,'after a sale');
}

// 4. Date check: expired stock is pulled and is the store's own loss (no supplier credit).
{
 const t=onShift(),s=emptyStore(t),shop=t.place('store');
 deliver(t,'bread',4,'bakery',10);s.lots.bread.at(-1).useBy=t.day-1;
 const till=shop.till,before=tills(t);
 assert(/4 out-of-date units pulled/.test(useStore(t,'datecheck').message));
 assert.equal(shop.stock.bread,0);assert(s.returns.some(r=>r.reason==='expired'&&r.qty===4));balanced(t,'after date check');
 assert(/own loss/.test(useStore(t,'returns').message));
 assert.equal(shop.till,till,'expired stock earns no supplier credit');assert.equal(Math.round(tills(t)*100),Math.round(before*100));
 assert(/still in date/.test(useStore(t,'datecheck').message));
 assert(SHELF_LIFE.bread<SHELF_LIFE.tea,'bread keeps for days, tea for months');
}

// 5. Staff run the routines themselves when the player is not on a store shift.
{
 const t=new TownLife({homes,minute:8*60,seed:7}),s=emptyStore(t);
 const warm=deliver(t,'milk',5,'depot',7.5);warm.temp=8;s.lots.milk[0].useBy=t.day;
 deliver(t,'bread',2,'bakery',5);s.lots.bread.at(-1).useBy=t.day-1;
 tickWorkplay(t);assert.equal(warm.probe,'rejected','staff probe and reject warm deliveries');
 t.minute=9*60;tickWorkplay(t);assert.equal(t.place('store').stock.bread,0,'morning date check pulls expired stock');
 t.minute=16*60;tickWorkplay(t);assert.equal(s.returns.length,0,'afternoon returns run clears the cage');balanced(t,'after staff routines');
}

// 6. Save and restore keeps every lot, the cage and the FEFO record.
{
 const t=onShift(),s=storeState(t);deliver(t,'coffee',5,'depot',22.5);s.fefo.right=3;
 const snap=JSON.parse(JSON.stringify(t.snapshot())),back=new TownLife({homes,minute:600,seed:5});assert(back.restore(snap));
 const r=workState(back).store;assert.deepEqual(r.lots,s.lots);assert.equal(r.fefo.right,3);
}
console.log('PASS: dated lots match stock over 5 days, chilled probe/reject/dock timeout, FEFO feedback without deductions, expired pulls, conserved supplier credits, staff routines, save/restore');
