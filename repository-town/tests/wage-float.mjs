// Wage floats: a small private business with an empty till can still offer a visitor one funded
// shift a day, lent from the council treasury and repaid from the till in the evening.
// Money only moves between the council, the business and the visitor; none is created.
//   node tests/wage-float.mjs
import assert from 'node:assert/strict';
import {TownLife} from '../src/world/life.js';
import {JOB_BOARD} from '../src/world/jobs.js';
import {employerFunds,debtFor,wageFloat,ensureFloat,repayFloats,FLOAT_RESERVE} from '../src/world/visitor-payroll.js';

const homes=[];for(let r=0;r<7;r++)for(let c=0;c<26;c+=2)homes.push({coordinate:String.fromCharCode(65+c)+(r+1),name:'House',door:{x:(c-12.5)*26,z:r*46-161+4}});
const cents=n=>Math.round(n*100);
const money=t=>[...t.places.values()].reduce((n,p)=>n+p.till,0)+t.civic.treasury+t.civic.player.wallet+t.villagers.reduce((n,v)=>n+v.wallet,0)+(t.civic.finance?.federal||0)+(t.civic.finance?.state||0)+Object.values(t.civic.wageFloats||{}).reduce((n,f)=>n+f.balance,0);
const staff=(t,site)=>{t.playerAt=site;for(const v of t.villagers)if(v.work===site){v.step={kind:'work',at:site};v.path=[];}};

// 1. An empty café borrows exactly one shift's pay, once a day; the visitor is paid from the float.
{
 const t=new TownLife({homes,minute:10*60,seed:5}),cafe=t.place('cafe');cafe.till=0;staff(t,'cafe');
 const total=money(t),treasury=t.civic.treasury,r=t.startJob('cafe-all-rounder');assert(r.ok,r.message);
 const f=wageFloat(t,'cafe');assert(f.owed>0&&f.balance===f.owed,'the float holds the loan');
 assert.equal(cents(treasury-t.civic.treasury),cents(f.owed),'lent from the treasury');assert.equal(cents(money(t)),cents(total),'no money created');
 assert.equal(ensureFloat(t,'cafe',100),0,'one loan per business per day');
 const a=t.civic.jobs.active;a.worked=a.required;for(const k of JOB_BOARD.find(j=>j.id==='cafe-all-rounder').tasks)a.tasks.push(k);
 const wallet=t.civic.player.wallet,done=t.finishJob();assert(done.ok,done.message);
 assert(t.civic.player.wallet>wallet,'the visitor is paid');assert.equal(debtFor(t,'cafe'),0,'no wage debt left behind');
 assert.equal(cents(money(t)),cents(total),'wages, PAYG and the loan all balance');
 // Evening: the till repays what it can above its reserve; the rest stays owed for later.
 cafe.till=FLOAT_RESERVE+5;const evening=money(t),owed=f.owed;repayFloats(t);   // a day's takings
 assert.equal(cents(owed-f.owed),Math.min(cents(owed),500),'repaid from the till above the reserve');assert.equal(cents(cafe.till),cents(Math.max(FLOAT_RESERVE,FLOAT_RESERVE+5-owed)));
 assert.equal(cents(money(t)),cents(evening),'repayment moves money back to the council');
}

// 2. Public workplaces still pay from the treasury and never borrow.
{const t=new TownLife({homes,minute:10*60,seed:5});assert.equal(ensureFloat(t,'post',30),0);assert(!t.civic.wageFloats?.post);}

// 3. Across a 3-day game, every private job can be offered in most open hours (it was 2–31 %).
{
 const t=new TownLife({homes,minute:6*60,seed:20261019}),ok={},open={};
 for(let m=0;m<3*1440;m+=0.5){
  t.tick(0.5);if(t.minute%30)continue;
  for(const j of JOB_BOARD){
   if(!t.open(t.place(j.site)))continue;open[j.id]=(open[j.id]||0)+1;
   const f=t.civic.wageFloats?.[j.site],canLend=!f||f.day!==t.day?Math.max(0,t.civic.treasury):0;
   if(employerFunds(t,j.site)+canLend>=j.pay&&debtFor(t,j.site)<=0)ok[j.id]=(ok[j.id]||0)+1;
  }
 }
 for(const j of JOB_BOARD)assert((ok[j.id]||0)/open[j.id]>=0.9,j.id+' can be offered in '+(ok[j.id]||0)+' of '+open[j.id]+' open half-hours');
}
console.log('PASS: empty businesses borrow one shift a day from the council, pay from the float, repay from the till, money conserved; every job offerable in 90%+ of open hours');
