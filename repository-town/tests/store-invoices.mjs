// General Store receiving: invoiced lots from real truck deliveries, the chilled dock probe, supplier
// credit notes paid from the supplier's own till, and staff routines when nobody is on a store shift.
//   node tests/store-invoices.mjs
import assert from 'node:assert/strict';
import {TownLife} from '../src/world/life.js';
import {useStore,storeState,tickWorkplay} from '../src/world/workplay.js';
import {storeBatches,noteStoreDelivery,returnToSupplier,quarantineBatch,SAFE_TEMP,PROBE_WITHIN} from '../src/world/store-batches.js';

const homes=[];for(let r=0;r<7;r++)for(let c=0;c<26;c+=2)homes.push({coordinate:String.fromCharCode(65+c)+(r+1),name:'House',door:{x:(c-12.5)*26,z:r*46-161+4}});
const tills=t=>[...t.places.values()].reduce((n,p)=>n+p.till,0)+t.civic.treasury;
const cents=n=>Math.round(n*100);
const tracked=(t,g)=>storeBatches(t).lots.filter(b=>b.good===g).reduce((n,b)=>n+b.n,0);
// Same order as life.js truckArrived: the stock lands, then the invoiced lot is recorded.
const deliver=(t,g,n,from,paid)=>{t.place('store').stock[g]=(t.place('store').stock[g]||0)+n;return noteStoreDelivery(t,g,n,from,paid);};
function onShift(){
 const t=new TownLife({homes,minute:10*60,seed:5});t.playerAt='store';
 for(const v of t.villagers)if(v.work==='store'){v.step={kind:'work',at:'store'};v.path=[];}
 t.place('store').till=500;                    // the employer must be able to fund the shift
 const started=t.startJob('store-stocker');assert(started.ok,started.message);storeState(t);return t;
}

// 1. Real deliveries over several days create invoiced lots that always match stock; staff probe them.
{
 const t=new TownLife({homes,minute:6*60,seed:11});storeBatches(t);
 for(let h=0;h<24*4;h++){for(let m=0;m<60;m+=0.5)t.tick(0.5);storeBatches(t);
  for(const g of ['milk','eggs','bread','coffee','tea'])assert.equal(tracked(t,g),Math.max(0,t.place('store').stock[g]||0),'day '+t.day+' '+g+' lots match stock');}
 const lots=storeBatches(t).lots,invoiced=lots.filter(b=>b.unitCost!==undefined);
 assert(invoiced.length>0,'truck deliveries create invoiced lots');
 assert(invoiced.every(b=>t.place(b.supplier)),'each invoiced lot names its real supplier');
 assert(!lots.some(b=>b.probe==='pending'),'with nobody on shift, staff probe every chilled delivery');
}

// 2. On shift: a chilled lot must be probed before pickup; warm is rejected with a conserved credit.
{
 const t=onShift(),dairy=t.place('dairy');dairy.till=200;
 const warm=deliver(t,'milk',6,'dairy',9);warm.temp=SAFE_TEMP+3;
 assert(!useStore(t,'pickup',{good:'milk',batchId:warm.id}).ok||storeBatches(t).lots.find(b=>b.id===warm.id)?.probe==='pending');
 const before=tills(t),stock=t.place('store').stock.milk;
 const r=useStore(t,'probe',warm.id);assert(r.ok&&r.rejected,'warm milk is rejected');
 assert.equal(t.place('store').stock.milk,stock-6,'rejected milk leaves saleable stock');
 const q=storeBatches(t).quarantine.find(q=>q.id===warm.id);assert(/Warm on arrival/.test(q.reason));
 const storeTill=t.place('store').till,credit=returnToSupplier(t,q.id);
 assert.equal(credit.credit,9,'credit equals what the store paid');assert.equal(cents(t.place('store').till-storeTill),900);
 assert.equal(cents(tills(t)),cents(before),'credits move money between tills, never create it');
 assert(!useStore(t,'probe',warm.id).ok,'a delivery is probed once');
 const cold=deliver(t,'eggs',4,'coop',12);cold.temp=3;assert(/accepted/.test(useStore(t,'probe',cold.id).message));
 // Left unprobed on the dock past the two-hour window during the player's shift: binned.
 const late=deliver(t,'milk',3,'dairy',4.5),left=t.place('store').stock.milk;t.minute+=PROBE_WITHIN+1;tickWorkplay(t);
 assert(!storeBatches(t).lots.some(b=>b.id===late.id),'unprobed chilled stock is binned');assert.equal(t.place('store').stock.milk,left-3);
}

// 3. Damaged-on-arrival invoiced stock is credited; stock with no invoice is not.
{
 const t=onShift(),depot=t.place('depot');depot.till=200;
 for(const b of storeBatches(t).lots)b.shelf=b.n;           // everything already shelved
 const lot=deliver(t,'coffee',3,'depot',13.5);
 const q=quarantineBatch(t,'coffee');assert.equal(q.id,lot.id);
 const before=tills(t);assert.equal(returnToSupplier(t,q.id).credit,4.5,'one damaged unit credits its invoiced cost');
 assert.equal(cents(tills(t)),cents(before));
 const opening=storeBatches(t).lots.find(b=>b.unitCost===undefined&&b.n>b.shelf)||null;
 if(opening){const q2=quarantineBatch(t,opening.good);assert.equal(returnToSupplier(t,q2.id).credit,0,'no invoice, no credit');}
}

// 4. Staff routines: off shift, staff probe arrivals and return the cage at 16:00 for credit.
{
 const t=new TownLife({homes,minute:9*60,seed:7});storeBatches(t);t.place('dairy').till=100;
 const warm=deliver(t,'milk',4,'dairy',6);warm.temp=9;tickWorkplay(t);
 assert(storeBatches(t).quarantine.some(q=>q.id===warm.id&&!q.returned),'staff reject a warm delivery');
 const storeTill=t.place('store').till;t.minute=16*60;tickWorkplay(t);
 assert(storeBatches(t).quarantine.every(q=>q.returned),'afternoon returns run');assert.equal(cents(t.place('store').till-storeTill),600);
}

// 5. Invoices, probes and credits survive a save and restore.
{
 const t=onShift(),lot=deliver(t,'milk',5,'dairy',7.5);
 const back=new TownLife({homes,minute:600,seed:5});assert(back.restore(JSON.parse(JSON.stringify(t.snapshot()))));
 const b=storeBatches(back).lots.find(x=>x.id===lot.id);assert(b&&b.unitCost===1.5&&b.probe==='pending'&&b.supplier==='dairy');
}
console.log('PASS: invoiced lots from real deliveries match stock, chilled dock probe and two-hour bin, conserved supplier credits for faulty arrivals only, staff routines off shift, save/restore');
