// Saving and loading never duplicates or loses work: every occupation can be saved and resumed at
// any step with the same goods and pay as playing straight through; finished work cannot be finished
// again after a reload; loading an older save drops anything begun after it; and ten days of daily
// shifts with a save/reload every six town hours end exactly where an uninterrupted town does.
//   node tests/work-save.mjs [--days 10]
import assert from 'node:assert/strict';
import {TownLife} from '../src/world/life.js';
import {useOccupation,occupationState} from '../src/world/occupation-work.js';
import {deliveryAction,deliveryState} from '../src/world/delivery-work.js';
import {queueCafeCustomer,useCafe,workState} from '../src/world/workplay.js';
import {orderRecipe} from '../src/world/work-recipes.js';
import {startJob,finishJob,jobsReport,JOB_BOARD} from '../src/world/jobs.js';

const DAYS=Number(process.argv[process.argv.indexOf('--days')+1])||10;
const homes=[];for(let r=0;r<7;r++)for(let c=0;c<26;c+=2)homes.push({coordinate:String.fromCharCode(65+c)+(r+1),name:'House',door:{x:(c-12.5)*26,z:r*46-157}});
const make=(minute=600)=>new TownLife({homes,minute,seed:5});
const save=t=>JSON.stringify(t.snapshot());
// A fresh page load: a new town restored from the saved JSON (the visitor's position is not saved).
const reload=(t)=>{const u=make(),at=t.playerAt;assert(u.restore(JSON.parse(save(t))));u.playerAt=at;return u;};
function staff(t,site){t.playerAt=site;for(const v of t.villagers)if(v.work===site){v.step={kind:'work'};v.path=[];}}
function shift(site,id){const t=make();t.place(site).till=500;staff(t,site);assert(t.startJob(id).ok);return t;}
const goods=t=>JSON.stringify([...t.places.values()].map(p=>[p.id,p.stock,p.out,Math.round(p.till*100)]));
const purse=t=>Math.round((t.civic.player.wallet+t.civic.player.bank)*100);

// 1. Every occupation, saved and reloaded after every single step, ends with the same goods,
//    work records and pay as playing it straight through; repeating the last step is refused.
const ROUTINES={
 'depot-sorter':[['depot','sort-freight','collect'],['depot','sort-freight','sort:post'],['depot','verify-manifest','weigh:2'],['depot','stack-parcels','heavy-base'],['depot','stack-parcels','dispatch']],
 'post-assistant':[['post','sort-mail','collect'],['post','sort-mail',t=>'address:'+occupationState(t).post.held.to],['post','label-parcels','label:1'],['post','prepare-route','bag'],['post','prepare-route','release']],
 'farm-hand':[['garden','water-plants','fill'],['garden','water-plants','water'],['garden','water-plants','water'],['garden','weed-beds','weed'],['garden','weed-beds','weed'],['garden','weed-beds','weed'],['garden','weed-beds','compost'],['garden','pack-produce','harvest'],['garden','pack-produce','store']],
 'poultry-hand':[['coop','feed-hens','feed'],['coop','collect-eggs','eggs'],['coop','store-eggs','pack-eggs']],
 'civic-cleaner':[['hall','clean-floors','tools'],['hall','clean-floors','rubbish'],['hall','clean-floors','rubbish'],['hall','clean-floors','rubbish'],['hall','clean-floors','mop'],['hall','empty-bins','bin'],[t=>{t.minute+=5;},'hall','inspect-floor','inspect']],
 'maintenance-assistant':[['trades','diagnose-fault','diagnose'],['trades','isolate-equipment','isolate'],['trades','isolate-equipment','parts'],['trades','repair-test','repair'],['trades','repair-test','test']],
};
const play=(t,steps,reloadEach)=>{
 for(let s of steps){if(typeof s[0]==='function'){s[0](t);s=s.slice(1);}const [site,task,id]=s,r=useOccupation(t,site,task,typeof id==='function'?id(t):id);assert(r.ok,task+': '+r.message);if(reloadEach)t=reload(t);}
 t.minute+=60;t.tick(0.5);const site=JOB_BOARD.find(j=>j.id===t.civic.jobs.active.id).site;staff(t,site);for(let i=0;i<120&&t.civic.jobs.active;i++){t.tick(0.5);staff(t,site);if(reloadEach&&i%20===0)t=reload(t);finishJob(t);}
 return t;
};
for(const [job,steps] of Object.entries(ROUTINES)){
 const site=JOB_BOARD.find(j=>j.id===job).site,control=play(shift(site,job),steps,false),resumed=play(shift(site,job),steps,true);
 assert.equal(goods(resumed),goods(control),job+': same goods after reloads');
 assert.equal(JSON.stringify(occupationState(resumed)),JSON.stringify(occupationState(control)),job+': same work record');
 assert.equal(purse(resumed),purse(control),job+': same pay');assert.equal(jobsReport(resumed).payslips.length,1,job+': one payslip');
 const [site2,task,id]=steps.at(-1).filter(x=>typeof x!=='function'),again=reload(resumed),before=goods(again);
 assert(!useOccupation(again,site2,task,typeof id==='function'?'address:x':id).ok,job+': finished work cannot be repeated after a reload');assert.equal(goods(again),before);
 assert(!finishJob(again).ok,job+': a paid shift cannot be paid again after a reload');assert.equal(purse(again),purse(resumed));
}

// 2. Café: a ticket saved at every preparation step uses the same ingredients and is paid the same
//    as one made straight through; a delivered tray cannot be delivered (or paid) again.
{
 const cafe=(reloads)=>{
  let t=shift('cafe','cafe-all-rounder');for(const g of ['coffee','milk','oatmilk','tea','bread','eggs','veg','pie','fruit'])t.place('cafe').stock[g]=50;
  const v=t.villagers.find(v=>v.work!=='cafe');Object.assign(v,{wallet:60,path:[],inside:true,step:{kind:'eatout',at:'cafe',queue:{joined:1}}});
  const o=queueCafeCustomer(t,v);assert(useCafe(t,'take',v.id).ok);const recipe=orderRecipe(o);if(recipe.hasMilk)assert(useCafe(t,'milk',o.milk).ok);
  const again=()=>{if(reloads){t=reload(t);staff(t,'cafe');}};
  for(const step of recipe.steps){again();const station=step[3]||(['food','oven'].includes(recipe.kind)?'kitchen':'barista');assert(useCafe(t,'prepare',station).mini);assert(useCafe(t,'finish-step',step[0],.9).ok);}
  again();assert(useCafe(t,'collect').ok);again();assert(useCafe(t,'deliver',o.table).ok);
  return {t,o,v};
 };
 const control=cafe(false),{t,o,v}=cafe(true);
 assert.equal(goods(t),goods(control.t),'same ingredients used and same payment with reloads');assert.equal(t.villagers[v.id].wallet,control.t.villagers[v.id].wallet);
 const u=reload(t);staff(u,'cafe');assert(!useCafe(u,'deliver',o.table).ok,'a delivered tray cannot be delivered again');assert.equal(goods(u),goods(t));
}

// 3. Delivery: loaded freight is in the van exactly once across a reload, and each stop receives once.
//    (The van is parked at the stop directly; tests/occupations.mjs drives it there.)
{
 let t=shift('depot','delivery-driver');assert(deliveryAction(t,'manifest').ok);const depot={...t.place('depot').out};assert(deliveryAction(t,'load').ok);
 t=reload(t);const route=deliveryState(t).route;for(const l of route.lines)assert.equal(t.place('depot').out[l.good],depot[l.good]-l.n,'freight left the depot once');
 assert(!deliveryAction(t,'load').ok,'a loaded van cannot be loaded again after a reload');
 const l=route.lines[0],before=t.place(l.to).stock[l.good]||0;const van=t.civic.motor.owned.find(v=>v.workVehicle);Object.assign(van,{x:t.place(l.to).curb.x,z:t.place(l.to).curb.z,speed:0,odometer:(van.odometer||0)+1});t.playerAt=l.to;t=reload(t);t.playerAt=l.to;assert(deliveryAction(t,'unload',l.to).ok);t=reload(t);
 assert(!deliveryAction(t,'unload',l.to).ok,'a receipt cannot be repeated after a reload');assert.equal(t.place(l.to).stock[l.good],before+l.n);
}

// 4. Loading an older save into a running town drops everything begun after it (trays, routes,
//    shifts, pay flags): the town is exactly the saved one.
{
 const t=make(7*60);for(let m=0;m<240;m+=0.5)t.tick(0.5);const older=save(t);
 t.place('depot').till=500;staff(t,'depot');assert(t.startJob('delivery-driver').ok);assert(deliveryAction(t,'manifest').ok);assert(deliveryAction(t,'load').ok);
 for(let m=0;m<600;m+=0.5)t.tick(0.5);assert(t.restore(JSON.parse(older)));
 assert.deepStrictEqual(JSON.parse(save(t)),JSON.parse(older),'restoring an older save leaves nothing from after it');assert(!t.civic.deliveryWork&&!t.civic.jobs?.active);
}

// 5. Ten days: a shift every day, saving and reloading every six town hours, ends identical to the
//    same days played without reloads — no money, goods or payslips duplicated or lost.
{
 const ROTA=['farm-hand','poultry-hand','depot-sorter','post-assistant','civic-cleaner','bakery-assistant','store-stocker'];
 const day=(t,reloads,log)=>{
  const job=JOB_BOARD.find(j=>j.id===ROTA[t.day%ROTA.length]);
  for(let n=0;n<2880;n++){
   if(reloads&&t.minute%360===0&&n)t=reload(t);
   const m=t.minute;t.playerAt=m>=600&&m<900?job.site:null;
   if(m===600||m===720){const r=startJob(t,job.id);if(r.ok)log.started++;}
   if(t.civic.jobs?.active&&finishJob(t).ok)log.paid++;
   t.tick(0.5);
  }
  return t;
 };
 let control=make(7*60),resumed=make(7*60);const a={started:0,paid:0},b={started:0,paid:0};
 for(let d=0;d<DAYS;d++){control=day(control,false,a);resumed=day(resumed,true,b);assert.deepStrictEqual(JSON.parse(save(resumed)),JSON.parse(save(control)),'day '+control.day+': reloaded town matches the uninterrupted one');}
 assert.deepEqual(b,a);assert(a.paid>=DAYS/2,'shifts were worked and paid on at least half the days ('+a.paid+' of '+a.started+')');
 const slips=jobsReport(resumed).payslips;assert.equal(new Set(slips.map(s=>s.id)).size,slips.length,'no payslip saved twice');
 console.log(`  ${DAYS} days: ${a.paid} shifts paid, ${slips.length} payslips, TD ${resumed.civic.jobs.earned} earned — identical with ${DAYS*4} reloads`);
}
console.log('PASS: every occupation resumes after a reload with the same goods and pay; finished work, cafe trays and delivery receipts cannot repeat; older saves replace newer work; long run with reloads matches an uninterrupted town');
