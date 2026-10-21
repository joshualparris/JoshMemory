import assert from 'node:assert/strict';
import {TownLife} from '../src/world/life.js';
import {workState,useStore,useCafe,queueCafeCustomer,cafeCounter,tickWorkplay,storeState} from '../src/world/workplay.js';
import {recipeFor,orderRecipe} from '../src/world/work-recipes.js';
import {installWorkplay} from '../src/world/workplay-view.js';
import * as THREE from 'three';
import {musicProfile,createSoundtrack} from '../src/ui/soundtrack.js';
const homes=[];for(let r=0;r<7;r++)for(let c=0;c<26;c+=2)homes.push({coordinate:String.fromCharCode(65+c)+(r+1),name:'House',door:{x:(c-12.5)*26,z:r*46-161+4}});
function setup(site,job){const t=new TownLife({homes,minute:10*60,seed:5});t.place(site).till=100;t.playerAt=site;for(const v of t.villagers)if(v.work===site){v.step={kind:'work',at:site};v.path=[];}assert(t.startJob(job).ok);return t;}
let t=setup('store','store-stocker'),stock=t.place('store').stock;stock.coffee=20;stock.tea=20;
const before=stock.coffee;assert(useStore(t,'pickup','coffee').ok);assert.equal(stock.coffee,before-3);
assert(!useStore(t,'shelve','chilled').ok);assert(workState(t).store.carton);
assert(useStore(t,'shelve','dry').ok);assert.equal(stock.coffee,before,'moving a carton never creates stock');
assert(useStore(t,'pickup','tea').ok);assert(useStore(t,'shelve','dry').ok);assert(t.civic.jobs.active.hands.earned.includes('refill-shelves'));
assert(!useStore(t,'inspect','sell').ok);const total=Object.values(stock).reduce((a,b)=>a+b,0);assert(useStore(t,'inspect','quarantine').ok);assert.equal(Object.values(stock).reduce((a,b)=>a+b,0),total-1);
assert(!useStore(t,'count',999).ok);const count=Object.values(storeState(t).shelves).reduce((a,n)=>a+Math.min(6,n),0);assert(useStore(t,'count',count).ok);
assert(useStore(t,'pickup','coffee').ok);const cargo=workState(t).store.carton.n,heldStock=stock.coffee;t.cancelJob();tickWorkplay(t);assert.equal(stock.coffee,heldStock+cargo,'cancel returns held goods');
// Real villagers are held at the counter; ingredients and payment occur exactly once.
t=setup('cafe','cafe-all-rounder');const cafe=t.place('cafe');for(const g of ['coffee','milk','tea','bread','eggs','veg','pie'])cafe.stock[g]=30;
const v=t.villagers.find(v=>v.work!=='cafe');v.wallet=100;v.path=[];v.inside=true;v.step={kind:'eatout',at:'cafe',dur:25,activity:'having lunch',queue:{joined:1,serving:null}};
assert(cafeCounter(t,v));const o=workState(t).cafe.tickets[0],recipe=orderRecipe(o);assert(useCafe(t,'take').ok);assert(!v.step.queue);
if(recipe.hasMilk)assert(useCafe(t,'milk',o.milk).ok);
const source={...cafe.stock},money=v.wallet,till=cafe.till;const station=['food','oven'].includes(recipe.kind)?'kitchen':'barista';
assert(useCafe(t,'prepare',station).mini);for(const[g,n]of Object.entries(recipe.ingredients))assert.equal(cafe.stock[g],source[g]-n);
assert(useCafe(t,'prepare',station).mini);for(const[g,n]of Object.entries(recipe.ingredients))assert.equal(cafe.stock[g],source[g]-n,'no duplicate ingredient deduction');
for(const step of recipe.steps){assert(useCafe(t,'prepare',step[3]||station).mini);assert(useCafe(t,'finish-step',step[0],.9).ok);}
assert.equal(o.state,'ready');assert(!useCafe(t,'finish-step',recipe.steps.at(-1)[0],.9).ok);assert(useCafe(t,'collect').ok);
assert(!useCafe(t,'deliver',o.table===1?2:1).ok);assert.equal(v.wallet,money,'wrong table cannot charge');
assert(useCafe(t,'deliver',o.table).ok);assert.equal(v.wallet,money-recipe.price);assert.equal(cafe.till,till+recipe.price-Math.round(recipe.price*t.civic.taxRate*100)/100);
assert(!useCafe(t,'deliver',o.table).ok,'cannot double-serve or double-charge');assert(!useCafe(t,'cancel').ok,'served orders cannot be cancelled');
t.minute+=9;tickWorkplay(t);assert(useCafe(t,'clear',o.table).ok);
const s=t.snapshot(),restored=new TownLife({homes,minute:600,seed:5});assert(restored.restore(s));assert.equal(workState(restored).cafe.served,1);
assert.notEqual(musicProfile('cafe').name,musicProfile('pub').name);assert.notEqual(musicProfile('',0,false).name,musicProfile('',1,false).name);
// Mobile regression: inspection decisions must return visible feedback in the
// same panel, not only a fleeting status toast obscured by the open dialogue.
{
 const shop=setup('store','store-stocker');
 shop.place('store').stock.coffee=20;
 let shown, closed=0;
 const built={group:new THREE.Group(),interactables:[]};
 const view=installWorkplay(built,shop.place('store'),()=>new THREE.Group(),shop,{
  openPanel:p=>{shown=p;},closePanel:()=>{closed++;},
  status:()=>{},sound:()=>{},getVisitors:()=>new Map()
 });
 assert(view,'store has live workplay UI');
 const station=built.interactables.find(i=>i.act.action==='inspect');
 assert(station,'inspection has a usable in-world hotspot');
 view.use(station);
 assert.equal(shown.title,'Batch inspection');
 const wrong=shown.actions.find(a=>a.label==='Put it straight on the shelf').run();
 assert.equal(wrong.title,'Batch action not completed');
 assert.match(wrong.body,/Isolate it instead/,'wrong choice explains why');
 assert(wrong.actions.some(a=>a.label==='Try again'),'failure can be retried');
 const ready=wrong.actions.find(a=>a.label==='Try again').run();
 const stock=shop.place('store').stock;
 const before=Object.values(stock).reduce((sum,n)=>sum+n,0);
 const receipt=ready.actions.find(a=>a.label==='Isolate in the returns cage').run();
 assert.equal(receipt.title,'Batch action recorded');
 assert.match(receipt.body,/returns cage/i,'quarantine receipt is visible within the modal');
 assert.match(receipt.body,/Saleable stock reduced by one/,'saleable stock is explicitly reconciled');
 assert.equal(Object.values(stock).reduce((sum,n)=>sum+n,0),before-1);
 assert.equal(shop.civic.storeBatches.quarantine.filter(q=>!q.returned).length,1);
 assert(shop.civic.jobs.active.hands.earned.includes('check-expiry'),'paid shift earns inspection duty');
 const cage=receipt.actions.find(a=>a.label==='Review returns cage').run();
 const sendBack=cage.actions.find(a=>a.label.startsWith('Return quarantined'));
 assert(sendBack,'returns cage offers supplier review for quarantined stock');
 const returned=sendBack.run();
 assert.match(returned.body,/returned to/,'supplier return provides its own visible receipt');
 assert.equal(shop.civic.storeBatches.quarantine.filter(q=>!q.returned).length,0);
 returned.actions.find(a=>a.label==='Close and continue shift').run();
 assert.equal(closed,1,'player can dismiss receipt and resume normal work');
 view.dispose();
}
console.log('PASS: real stock carrying, correct shelves, quarantine and count, cancellation conservation; FIFO cafe tickets, real ingredients, timed steps, correct tables, one payment, save restoration and venue music profiles.');
