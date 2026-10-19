// Run: node tests/economy.mjs
// Covers finite player purchases, supported bank flows, wages, payroll sources,
// deliveries, work attendance, persistence and monetary conservation.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const src=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const stripped=x=>x.replace(/^import .*?;\s*$/gm,'').replace(/^export /gm,'');
const {TownMoney,JOB_BOARD}=new Function(stripped(src('world/money.js'))+'\nreturn {TownMoney,JOB_BOARD};')();
const {TownFinance}=new Function(stripped(src('world/finance.js'))+'\nreturn {TownFinance};')();
const {TownLife}=new Function('TownMoney','TownFinance',stripped(src('world/life.js'))+'\nreturn {TownLife};')(TownMoney,TownFinance);
const homes=Array.from({length:188},(_,i)=>({coordinate:String.fromCharCode(65+i%26)+(1+Math.floor(i/26)),
 name:'Repo '+i,door:{x:(i%26)*26,z:Math.floor(i/26)*46}}));
const town=new TownLife({homes}),m=town.money;
const sum=()=>town.treasury+town.finance.federalTreasury+town.finance.stateTreasury+m.total+town.villagers.reduce((total,v)=>total+v.wallet,0)+
 [...town.places.values()].reduce((total,p)=>total+(p.operating||0)+(p.till||0),0);
const initial=sum();
assert.deepEqual([m.cash,m.checking,m.savings,m.total,m.bankVault],[60,100,40,200,140]);
const store=town.place('store'),bread=store.stock.bread,operating=store.operating;
const bought=town.payPlayerPurchase('store','bread');assert.equal(bought.ok,true);
assert.equal(store.stock.bread,bread-1);assert.equal(store.operating,operating+5);
assert.equal(m.checking,95);assert.equal(m.playerBag.bread,1);assert.equal(sum(),initial);
assert.equal(town.payPlayerPurchase('store','unknown').ok,false);
assert.equal(town.payPlayerPurchase('cafe','bread').ok,true);
town.minute=11*60;
assert.equal(town.payPlayerPurchase('pub','pie').ok,true);
assert.equal(sum(),initial);
// Missing money and stock never trigger partial transactions.
m.checking=0;m.bankVault=m.savings;const before=store.stock.bread;
assert.equal(town.payPlayerPurchase('store','bread').ok,false);
assert.equal(store.stock.bread,before);
assert.equal(m.bank('withdraw',100000,town.day).ok,false);
assert.equal(m.bank('deposit',-2,town.day).ok,false);
assert.equal(m.bank('deposit',1.5,town.day).ok,false);
// Restore balance through reversible accounting so the total supply stays fixed.
m.checking=83;m.bankVault=123;
assert.equal(sum(),initial); // original balance after a $5 bread, $5 cafe and $7 pie
assert(m.bank('deposit',20,town.day).ok);
assert.equal(m.cash,40);assert.equal(m.checking,103);
assert(m.bank('save',40,town.day).ok);assert.equal(m.savings,80);
assert(m.bank('unsave',10,town.day).ok);assert(m.bank('withdraw',10,town.day).ok);
assert.equal(sum(),initial);assert.equal(m.bankVault,m.checking+m.savings);
// A second payment method uses physical register cash.
assert(m.setPayment('cash'));
const till=store.till;
assert(town.payPlayerPurchase('store','bread').ok);
assert.equal(store.till,till+5);assert.equal(sum(),initial);
// Payroll must take wages from a real employer balance.
const worker=town.villagers.find(v=>v.work==='bakery'),bakery=town.place('bakery');
const workerBefore=worker.wallet,payPool=bakery.till+bakery.operating;
town.pay(worker);
assert.equal(worker.wallet-workerBefore,41); // 10% PAYG floor($4)
assert.equal(payPool-bakery.till-bakery.operating,45);
assert.equal(sum(),initial);
// A paid shift requires supervision, location and actual work duration.
town.minute=510;worker.step={kind:'work',at:'bakery'};worker.path=[];
const entry=m.startJob(town,'bakery-assistant','bakery');assert(entry.ok);
assert.equal(m.startJob(town,'bakery-assistant','bakery').ok,false);
assert.equal(m.tickJob(town,100,'store'),false);
assert.equal(m.finishJob(town,'bakery').ok,false);
assert(m.tickJob(town,35,'bakery'));
assert.equal(m.finishJob(town,'store').ok,false);
assert.equal(m.finishJob(town,'bakery').ok,false,'Shift must require real duties');
assert(m.performTask(town,'bakery','wash-hands').ok);
assert.equal(m.performTask(town,'bakery','wash-hands').ok,false,'Cannot farm the same task');
assert.equal(m.performTask(town,'bakery','prep-bench').ok,false,'Work duties require spacing');
town.minute+=5;assert(m.performTask(town,'bakery','prep-bench').ok);
town.minute+=5;assert(m.performTask(town,'bakery','cooling').ok);
const current=m.checking,shift=m.finishJob(town,'bakery');
assert(shift.ok);assert.equal(m.checking,current+22); // gross $24 less $2 PAYG
assert.equal(m.finishJob(town,'bakery').ok,false);
assert.equal(m.startJob(town,'bakery-assistant','bakery').ok,false);
assert.equal(sum(),initial);
// Freight invoices transfer value from destination to origin; no goods vanish.
const sourceFarm=town.place('silo'),dest=town.place('mill'),originalSrc=sourceFarm.operating,originalDest=dest.operating;
sourceFarm.out.grain=12;
const truck=town.trucks[0];truck.job={from:'silo',to:'mill',good:'grain',n:4};truck.leg='pickup';
town.truckArrived(truck);assert.equal(truck.load.n,4);
town.truckArrived(truck);assert.equal(sourceFarm.operating,originalSrc+4);assert.equal(dest.operating,originalDest-4);
assert.equal(sum(),initial);
// Reload cannot reset wages or completed shift history.
const snap=town.snapshot(),other=new TownLife({homes});other.restore(snap);
assert.equal(other.money.checking,m.checking);assert.equal(other.money.completedJobs['1:bakery-assistant'],24);
assert.equal(other.villagers[worker.id].paidDay,1);
assert.equal(other.treasury,town.treasury);
assert.equal(other.money.bankVault,other.money.checking+other.money.savings);
assert.equal(JOB_BOARD.length,6);
console.log('PASS: finite payments, bank transactions, payroll, job timeclock, wholesale conservation and restore');
