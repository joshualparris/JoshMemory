import assert from 'node:assert/strict';
import {TownLife} from '../src/world/life.js';
import {takeBreak,jobOffer,JOB_BOARD} from '../src/world/jobs.js';
import {collectWageDebt,payroll} from '../src/world/visitor-payroll.js';
import {contractAction,contractsReport} from '../src/world/work-contracts.js';
import {workState} from '../src/world/workplay.js';
import {payslipPanel,jobPanel} from '../src/ui/economy-panels.js';
const homes=[];for(let r=0;r<7;r++)for(let c=0;c<26;c+=2)homes.push({coordinate:String.fromCharCode(65+c)+(r+1),name:'House',door:{x:(c-12.5)*26,z:r*46-157}});
const fresh=()=>new TownLife({homes,minute:600,seed:5});
const staff=t=>{t.playerAt='store';for(const v of t.villagers)if(v.work==='store'){v.step={kind:'work'};v.path=[];}};
const advance=(t,n)=>{for(let i=0;i<n;i++){staff(t);t.tick(1);}};
let t=fresh();assert(!t.startJob('store-stocker').ok,'empty employer cannot promise funded work');
t.place('store').till=100;staff(t);assert(t.startJob('store-stocker').ok);
advance(t,15);staff(t);assert(takeBreak(t).ok);assert(!t.doTask('check-expiry').ok,'rest period blocks duties');advance(t,5);
assert.equal(t.jobsReport().active.breakTaken,5);assert.equal(t.jobsReport().active.worked,20);
assert(!takeBreak(t).ok,'one paid break');
const earned=24*20/35;const treasury=t.civic.treasury;t.place('store').till=2;
const wallet=t.civic.player.wallet;assert(t.cancelJob().ok);
let r=t.jobsReport(),s=r.payslips[0];assert.equal(s.gross,Math.round(earned*100)/100);assert.equal(s.paid,2);assert.equal(s.tax,0);assert.equal(t.civic.treasury,treasury,'private shortfall never uses council');
assert.equal(t.civic.player.wallet,wallet+2);assert.equal(r.wageDebt,11.71);
assert(!t.cancelJob().ok);assert(!collectWageDebt(t).ok);assert.equal(t.jobsReport().payslips[0].paid,2);
const snap=JSON.parse(JSON.stringify(t.snapshot()));let u=fresh();assert(u.restore(snap));
u.place('store').till=5;assert(collectWageDebt(u).ok);assert.equal(u.jobsReport().payslips[0].tax,1,'cumulative tax on instalments');
u.place('store').till=100;assert(collectWageDebt(u).ok);assert.equal(u.jobsReport().wageDebt,0);const paid=u.civic.player.wallet;assert(!collectWageDebt(u).ok);assert.equal(u.civic.player.wallet,paid,'repeated collection cannot duplicate payment');
assert.match(payslipPanel(u).body,/11.71|13.71/);assert.match(jobPanel(u,'store').body,/Fixed-scope/);
// Midnight closes a saved active timesheet instead of deleting earned work.
t=fresh();t.place('store').till=100;staff(t);t.startJob('store-stocker');advance(t,10);t.minute=1439;advance(t,2);assert.equal(t.jobsReport().active,null);assert(t.jobsReport().payslips[0].gross>0);
// Full work without every duty still earns full wages; no training credit.
t=fresh();t.place('store').till=100;staff(t);t.startJob('store-stocker');advance(t,35);staff(t);assert(t.finishJob().ok);assert.equal(t.jobsReport().payslips[0].gross,24);assert.equal(t.jobsReport().skills.store,undefined);
// Responsibility unlocks a real stock/service contract, backed by finite escrow.
assert(!contractAction(t,'store','accept').ok);payroll(t).skills.store={shifts:3,duties:9,qualification:'Town workplace certificate'};
assert.equal(jobOffer(t,JOB_BOARD.find(x=>x.id==='store-stocker')).pay,26.4,'certificate unlocks higher quoted wage');
const before=t.place('store').till;assert(contractAction(t,'store','accept').ok);assert.equal(t.place('store').till,before-12);assert(!contractAction(t,'store','submit').ok);
const saved=JSON.parse(JSON.stringify(t.snapshot()));u=fresh();u.restore(saved);staff(u);assert.equal(contractsReport(u).active.escrow,12);
workState(u).store.restocked+=6;const w=u.civic.player.wallet;assert(contractAction(u,'store','submit').ok);assert(u.civic.player.wallet>w);const w1=u.civic.player.wallet;assert(!contractAction(u,'store','submit').ok);assert.equal(u.civic.player.wallet,w1);
assert(contractAction(u,'store','accept').ok);const pot=u.place('store').till;assert(contractAction(u,'store','cancel').ok);assert.equal(u.place('store').till,pot+12);
console.log('PASS: saved partial and midnight wages, finite employer debts, cumulative PAYG, paid breaks, fair rework, training gate, contract escrow/acceptance/cancellation and idempotent payment.');
