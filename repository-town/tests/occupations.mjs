import assert from 'node:assert/strict';
import * as THREE from 'three';
import {TownLife} from '../src/world/life.js';
import {useOccupation,occupationState,tickOccupationWork} from '../src/world/occupation-work.js';
import {deliveryAction,deliveryState} from '../src/world/delivery-work.js';
import {superviseBread} from '../src/world/bakery-production.js';
import {storeBatches,reserveBatch,restoreBatch,tickStoreBatches,returnToSupplier} from '../src/world/store-batches.js';
import {queueCafeCustomer,useCafe,workState,tickWorkplay} from '../src/world/workplay.js';
import {FULL_WORK_MENU,orderRecipe} from '../src/world/work-recipes.js';
import {heartPoints,latteScore} from '../src/ui/latte-art.js';
import {buildCivicInterior} from '../src/world/shop-interior.js';
import {installPhysicalJobs,usePhysicalJob} from '../src/world/physical-jobs.js';
import {routeVisitor} from '../src/world/shop-visitors.js';
import {createPlayerDriving,roadAllows} from '../src/world/player-driving.js';
import {Player} from '../src/engine/player.js';
const homes=[];for(let r=0;r<7;r++)for(let c=0;c<26;c+=2)homes.push({coordinate:String.fromCharCode(65+c)+(r+1),name:'House',door:{x:(c-12.5)*26,z:r*46-157}});
const make=()=>new TownLife({homes,minute:600,seed:5});
function staff(t,site){t.playerAt=site;for(const v of t.villagers)if(v.work===site){v.step={kind:'work'};v.path=[];}}
function shift(site,id){const t=make();t.place(site).till=500;staff(t,site);assert(t.startJob(id).ok);return t;}
const action=(t,site,task,id)=>{const r=useOccupation(t,site,task,id);assert(r.ok,r.message);return r;};
let t=shift('depot','depot-sorter'),s=occupationState(t);const stock=t.place('depot').out.parcel;
action(t,'depot','sort-freight','collect');assert.equal(t.place('depot').out.parcel,stock-2);assert(!useOccupation(t,'depot','sort-freight','sort:cafe').ok);
action(t,'depot','sort-freight','sort:post');assert(!useOccupation(t,'depot','verify-manifest','weigh:6').ok);action(t,'depot','verify-manifest','weigh:2');assert(!useOccupation(t,'depot','stack-parcels','top').ok);action(t,'depot','stack-parcels','heavy-base');const post=t.place('post').stock.parcel;action(t,'depot','stack-parcels','dispatch');assert.equal(t.place('post').stock.parcel,post,'dispatch cannot teleport usable goods');const truck=t.trucks.find(v=>v.load?.good==='parcel');assert(truck.path.length);t.truckArrived(truck);assert.equal(t.place('post').stock.parcel,post+2);assert(!useOccupation(t,'depot','stack-parcels','dispatch').ok);
t=shift('post','post-assistant');const n=t.place('post').stock.parcel;action(t,'post','sort-mail','collect');const address=occupationState(t).post.held.to;action(t,'post','sort-mail','address:'+address);action(t,'post','label-parcels','label:1');action(t,'post','prepare-route','bag');action(t,'post','prepare-route','release');assert.equal(t.place('post').stock.parcel,n);const postie=t.villagers.find(v=>v.work==='post');t.postRound(postie);assert.equal(postie.step.home.coordinate,address,'label controls actual resident round');
t=shift('garden','farm-hand');const water=t.place('waterworks').stock.water;action(t,'garden','water-plants','fill');action(t,'garden','water-plants','water');action(t,'garden','water-plants','water');assert.equal(t.place('waterworks').stock.water,water-1);for(let i=0;i<3;i++)action(t,'garden','weed-beds','weed');action(t,'garden','weed-beds','compost');const veg=t.place('garden').out.veg;action(t,'garden','pack-produce','harvest');assert.equal(t.place('garden').out.veg,veg-3);action(t,'garden','pack-produce','store');assert.equal(t.place('garden').out.veg,veg);assert(!useOccupation(t,'garden','pack-produce','harvest').ok);
t=shift('coop','poultry-hand');const eggs=t.place('coop').out.eggs,grain=t.place('coop').stock.grain;action(t,'coop','feed-hens','feed');action(t,'coop','collect-eggs','eggs');action(t,'coop','store-eggs','pack-eggs');assert.equal(t.place('coop').out.eggs,eggs);assert.equal(t.place('coop').stock.grain,grain-1);assert(!useOccupation(t,'coop','collect-eggs','eggs').ok);
t=shift('hall','civic-cleaner');assert(!useOccupation(t,'hall','clean-floors','mop').ok);action(t,'hall','clean-floors','tools');for(let i=0;i<3;i++)action(t,'hall','clean-floors','rubbish');action(t,'hall','clean-floors','mop');action(t,'hall','empty-bins','bin');assert(!useOccupation(t,'hall','inspect-floor','inspect').ok);t.minute+=5;action(t,'hall','inspect-floor','inspect');assert(!occupationState(t).hall.spill);
t=shift('hall','maintenance-assistant');const parts=t.place('hall').stock.parts;assert(!useOccupation(t,'trades','repair-test','repair').ok);action(t,'trades','diagnose-fault','diagnose');action(t,'trades','isolate-equipment','isolate');action(t,'trades','isolate-equipment','parts');action(t,'trades','repair-test','repair');action(t,'trades','repair-test','test');assert.equal(t.place('hall').stock.parts,parts-1);assert(occupationState(t).trades.restored);assert(!useOccupation(t,'trades','repair-test','test').ok);
action(t,'trades','diagnose-fault','diagnose:tap');let reservoir=t.place('waterworks').stock.water;tickOccupationWork(t,60);assert.equal(t.place('waterworks').stock.water,reservoir-1);for(const [task,id]of [['isolate-equipment','isolate'],['isolate-equipment','parts'],['repair-test','repair'],['repair-test','test']])action(t,'trades',task,id);reservoir=t.place('waterworks').stock.water;tickOccupationWork(t,60);assert.equal(t.place('waterworks').stock.water,reservoir);
action(t,'trades','diagnose-fault','diagnose:mixer');staff(t,'bakery');superviseBread(t,'wash');t.place('bakery').out.bread=0;superviseBread(t,'weigh',2000);assert.match(superviseBread(t,'mix').message,/isolated/);const output=t.place('bakery').out.bread;t.everyHour();assert.equal(t.place('bakery').out.bread,output,'isolated mixer also stops automatic bread production');staff(t,'hall');for(const [task,id]of [['isolate-equipment','isolate'],['isolate-equipment','parts'],['repair-test','repair'],['repair-test','test']])action(t,'trades',task,id);staff(t,'bakery');assert(superviseBread(t,'mix').ok,'repaired machine actually works');
// The employer van drives with real physics; receipts require it at destination.
t=shift('depot','delivery-driver');assert(deliveryAction(t,'manifest').ok);const source={...t.place('depot').out};assert(deliveryAction(t,'load').ok);const route=deliveryState(t).route,van=t.civic.motor.owned.find(v=>v.workVehicle);assert(roadAllows(van.x,van.z));assert.match(t.sellVehicle(van.registration),/cannot be sold/);for(const l of route.lines)assert.equal(t.place('depot').out[l.good],source[l.good]-l.n);
let throttle=-1;const camera=new THREE.PerspectiveCamera(),player=new Player(camera),input={movement:()=>({x:0,z:throttle}),takeLook:()=>({}),consume:()=>false,reset:()=>{}};const driving=createPlayerDriving(t,new THREE.Scene(),{hits:()=>false},player,camera,input);player.pos.set(van.x,0,van.z);assert.match(driving.enter(van),/Engine started/);for(let i=0;i<120;i++)driving.update(1/60);assert(van.odometer>0);assert(!deliveryAction(t,'unload',route.lines[0].to).ok,'wrong place cannot receive');
// Drive the complete horizontal delivery route using normal acceleration,
// steering, fuel, braking and safe exit. No van position or odometer edits.
for(const [i,l] of route.lines.entries()){
 const p=t.place(l.to),before=p.stock[l.good]||0;if(i){assert.match(driving.enter(van),/Engine started/);throttle=-1;}
 let frames=0;while(Math.abs(van.x-p.curb.x)>9&&frames++<10000)driving.update(1/60);
 assert(frames<10000,'work van reaches actual destination along road');throttle=0;
 for(let frame=0;frame<180;frame++)driving.update(1/60);
 assert.match(driving.exit(),/got out safely/);t.workVehicleDriving=false;t.playerAt=l.to;
 assert(Math.hypot(van.x-p.curb.x,van.z-p.curb.z)<22);assert(deliveryAction(t,'unload',l.to).ok);assert.equal(p.stock[l.good],before+l.n);assert(!deliveryAction(t,'unload',l.to).ok);
}
assert.equal(route.status,'completed');
assert.match(driving.enter(van),/Engine started/);throttle=1;let backFrames=0;while(Math.abs(van.x-t.place('depot').curb.x)>9&&backFrames++<12000)driving.update(1/60);assert(backFrames<12000);throttle=0;for(let i=0;i<180;i++)driving.update(1/60);assert.match(driving.exit(),/got out safely/);t.playerAt='depot';assert(deliveryAction(t,'return').ok);assert(route.returnedAt);
// An older, worn employer van is funded from employer accounts, never worker cash.
assert(deliveryAction(t,'manifest').ok);van.condition=58;van.roadworthy=false;van.regoUntil=t.day-1;const workerMoney=t.civic.player.wallet+t.civic.player.bank,publicFunds=t.civic.treasury;t.civic.treasury=10;assert(!deliveryAction(t,'load').ok);assert.equal(deliveryState(t).route.status,'accepted');t.civic.treasury=publicFunds;assert(deliveryAction(t,'load').ok);assert.equal(t.civic.player.wallet+t.civic.player.bank,workerMoney);assert.equal(t.civic.treasury,publicFunds-112);assert(van.roadworthy&&van.regoUntil>t.day);

// Bread never becomes saleable before all stages and cooling complete.
t=make();staff(t,'bakery');const bakery=t.place('bakery');bakery.out.bread=0;bakery.stock.flour=6;assert(superviseBread(t,'wash').ok);assert(!superviseBread(t,'weigh',1000).ok);assert(superviseBread(t,'weigh',2000).ok);assert(!superviseBread(t,'weigh',2000).ok);assert(superviseBread(t,'mix').ok);for(let i=0;i<8;i++)assert(superviseBread(t,'shape').ok);assert(superviseBread(t,'proof').ok);assert(!superviseBread(t,'oven').ok);t.minute+=40;assert(superviseBread(t,'oven').ok);t.minute+=25;assert(superviseBread(t,'unload').ok);assert.equal(bakery.out.bread,0);assert(!superviseBread(t,'pack').ok);t.minute+=6;assert(superviseBread(t,'pack').ok);assert.equal(bakery.out.bread,8);assert(!superviseBread(t,'pack').ok);
// FEFO, exact batch return and cold exposure persist through saves.
t=make();let batches=storeBatches(t);const old=batches.lots.find(b=>b.good==='milk');old.expires=2;t.place('store').stock.milk+=3;batches=storeBatches(t);const newer=batches.lots.filter(b=>b.good==='milk').at(-1);assert(!reserveBatch(t,'milk',newer.id).ok);const carton=reserveBatch(t,'milk',old.id).carton;t.minute+=121;assert.equal(restoreBatch(t,carton,true),false);const q=storeBatches(t).quarantine[0];assert(returnToSupplier(t,q.id).ok);assert(!returnToSupplier(t,q.id).ok);t.day=5;tickStoreBatches(t);assert.equal(t.place('store').stock.milk,0);
const snap=JSON.parse(JSON.stringify(t.snapshot())),u=make();assert(u.restore(snap));assert.equal(u.civic.storeBatches.claims.length,1);
// Every menu recipe can be prepared, with multi-item ingredients and one payment.
assert.equal(FULL_WORK_MENU.length,19);assert(latteScore(heartPoints())>.95);assert(latteScore([{x:0,y:0}])===0);
for(const recipe of FULL_WORK_MENU){t=shift('cafe','cafe-all-rounder');const cafe=t.place('cafe');for(const g of ['coffee','milk','oatmilk','tea','bread','eggs','veg','pie','fruit'])cafe.stock[g]=50;const v=t.villagers.find(v=>v.work!=='cafe');v.wallet=100;v.step={kind:'eatout',at:'cafe',queue:{joined:1}};const o=queueCafeCustomer(t,v);Object.assign(o,{item:recipe.id,items:[recipe.id],diet:'standard',milk:'dairy'});assert(useCafe(t,'take').ok);const r=orderRecipe(o);if(r.hasMilk){assert(!useCafe(t,'milk','oat').ok);assert(useCafe(t,'milk','dairy').ok);}const station=r.kind==='food'||r.kind==='oven'?'kitchen':'barista';for(const step of r.steps){assert(useCafe(t,'prepare',station).mini);assert(!useCafe(t,'finish-step',step[0],.1).ok);assert(useCafe(t,'finish-step',step[0],.9).ok);}assert(useCafe(t,'collect').ok);assert(useCafe(t,'deliver',o.table).ok);assert.equal(v.wallet,100-r.price);assert(!useCafe(t,'deliver',o.table).ok);}
t=shift('cafe','cafe-all-rounder');const patron=t.villagers.find(v=>v.work!=='cafe');patron.wallet=100;patron.step={kind:'eatout',at:'cafe',queue:{joined:1}};queueCafeCustomer(t,patron);t.minute+=91;tickWorkplay(t);assert.equal(workState(t).cafe.tickets[0].state,'cancelled');
// Bundled oat-milk order crosses barista and kitchen stations without double
// reservation or payment; save mid-preparation and resume the same ticket.
t=shift('cafe','cafe-all-rounder');for(const g of ['coffee','milk','oatmilk','tea','fruit','bread','eggs','veg','pie'])t.place('cafe').stock[g]=50;
const customer=t.villagers.find(v=>v.work!=='cafe');customer.wallet=100;customer.step={kind:'eatout',at:'cafe',queue:{joined:1}};
let ticket=queueCafeCustomer(t,customer);Object.assign(ticket,{item:'latte',items:['latte','toast'],milk:'oat',diet:'vegan'});assert(useCafe(t,'take').ok);assert(useCafe(t,'milk','oat').ok);
let bundle=orderRecipe(ticket),steps=bundle.steps,coffee0=t.place('cafe').stock.coffee,oat0=t.place('cafe').stock.oatmilk;
assert(useCafe(t,'prepare','barista').mini);assert.equal(t.place('cafe').stock.oatmilk,oat0-1);assert(useCafe(t,'finish-step',steps[0][0],.9).ok);
let resumed=make();assert(resumed.restore(JSON.parse(JSON.stringify(t.snapshot()))));t=resumed;staff(t,'cafe');ticket=workState(t).cafe.tickets.find(x=>x.id===ticket.id);bundle=orderRecipe(ticket);
for(const step of bundle.steps.slice(1)){assert(useCafe(t,'prepare',step[3]).mini);assert(useCafe(t,'finish-step',step[0],.9).ok);}
assert.equal(t.place('cafe').stock.coffee,coffee0-1);assert(useCafe(t,'collect').ok);assert(useCafe(t,'deliver',ticket.table).ok);assert.equal(t.villagers.find(v=>v.id===customer.id).wallet,100-bundle.price);
// All reserved occupation goods survive crossing midnight and save migration.
t=shift('garden','farm-hand');action(t,'garden','water-plants','fill');action(t,'garden','water-plants','water');action(t,'garden','water-plants','water');for(let i=0;i<3;i++)action(t,'garden','weed-beds','weed');action(t,'garden','weed-beds','compost');action(t,'garden','pack-produce','harvest');
resumed=make();assert(resumed.restore(JSON.parse(JSON.stringify(t.snapshot()))));assert.equal(occupationState(resumed).garden.crate,3);
resumed.day++;staff(resumed,'garden');resumed.place('garden').till=500;assert(resumed.startJob('farm-hand').ok);assert.equal(occupationState(resumed).garden.crate,3,'previous harvest cannot disappear on a date change');const cropBefore=resumed.place('garden').out.veg;action(resumed,'garden','pack-produce','store');assert.equal(resumed.place('garden').out.veg,cropBefore+3);
// Actual furniture geometry: new workstations can be approached from the door.
for(const id of ['post','depot','hall','garden','coop','bakery']){const life=make(),site=life.place(id),built=buildCivicInterior(site,()=>new THREE.Sprite(new THREE.SpriteMaterial()));installPhysicalJobs(built,site,()=>new THREE.Sprite(new THREE.SpriteMaterial()),life);for(const item of built.interactables.filter(i=>i.act.do==='physical-job')){assert(routeVisitor(built.spawn,item.pos,built.colliders,built.bounds,.3),id+' reachable '+item.key);assert(!built.colliders.some(c=>item.pos.x>c.x0-.3&&item.pos.x<c.x1+.3&&item.pos.z>c.z0-.3&&item.pos.z<c.z1+.3),id+' clear '+item.key);}}
// Regression: practice trolley clicks must never waste real flour or fake completed work.
{
 const job=shift('bakery','bakery-assistant'),flour=job.place('bakery').stock.flour;
 assert(!usePhysicalJob(job,'prep-bench').ok,'practice preparation cannot bypass actual production');
 assert(!usePhysicalJob(job,'cooling').ok,'practice cooling cannot bypass real loaves');
 assert.equal(job.place('bakery').stock.flour,flour,'no flour lost to imaginary bread');
 assert(!job.civic.jobs.active.bakeryTrainingBatch,'no synthetic demonstration inventory');
}
// Regression: a saved, unfinished batch is resumable today, but never bakeable tomorrow.
{
 const pending=make();staff(pending,'bakery');pending.place('bakery').out.bread=0;pending.place('bakery').stock.flour=6;
 assert(superviseBread(pending,'wash').ok);
 assert(superviseBread(pending,'weigh',2000).ok);
 assert.equal(pending.place('bakery').stock.flour,4);
 const saved=JSON.parse(JSON.stringify(pending.snapshot()));
 const resumed=make();assert(resumed.restore(saved));staff(resumed,'bakery');
 assert.equal(resumed.civic.bakeryBatch.phase,'weighed','unpacked batches survive a same-day save');
 assert(superviseBread(resumed,'mix').ok,'resume correct same-day stage');
 resumed.day+=1;resumed.minute=600;staff(resumed,'bakery');
 assert(!superviseBread(resumed,'pack').ok,'stale dough never enters saleable stock');
 assert.equal(resumed.place('bakery').out.bread,0);
 assert.equal(resumed.place('bakery').stock.flour,4,'reserved flour not refunded or consumed twice');
 assert.equal(resumed.civic.bakeryBatch,null,'expired state cleared');
 assert(superviseBread(resumed,'wash').ok);
 assert(superviseBread(resumed,'weigh',2000).ok,'new day may start a new finite batch');
 assert.equal(resumed.place('bakery').stock.flour,2,'new batch debited once');
 assert(!superviseBread(resumed,'weigh',2000).ok,'no duplicate weighing');
}
console.log('PASS: real freight/post addresses, farm/feed/egg stock conservation, cleaner, repaired lamp, driven van/receipt guards, full bakery, FEFO/cold returns, 16 cafe recipes, patience, saved state and reachable stations.');
