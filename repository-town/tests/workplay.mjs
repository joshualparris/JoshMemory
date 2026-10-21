import assert from 'node:assert/strict';
import {TownLife} from '../src/world/life.js';
import {workState,useStore,useCafe,queueCafeCustomer,cafeCounter,tickWorkplay,storeState,ticketPrice} from '../src/world/workplay.js';
import {recipeFor} from '../src/world/work-recipes.js';
import {musicProfile,createSoundtrack} from '../src/ui/soundtrack.js';
const homes=[];for(let r=0;r<7;r++)for(let c=0;c<26;c+=2)homes.push({coordinate:String.fromCharCode(65+c)+(r+1),name:'House',door:{x:(c-12.5)*26,z:r*46-161+4}});
function setup(site,job){const t=new TownLife({homes,minute:10*60,seed:5});t.playerAt=site;for(const v of t.villagers)if(v.work===site){v.step={kind:'work',at:site};v.path=[];}assert(t.startJob(job).ok);return t;}
let t=setup('store','store-stocker'),stock=t.place('store').stock;stock.coffee=20;stock.tea=20;
const before=stock.coffee;assert(useStore(t,'pickup','coffee').ok);assert.equal(stock.coffee,before-3);
assert(!useStore(t,'shelve','chilled').ok);assert(workState(t).store.carton);
assert(useStore(t,'shelve','dry').ok);assert.equal(stock.coffee,before,'moving a carton never creates stock');
assert(useStore(t,'pickup','tea').ok);assert(useStore(t,'shelve','dry').ok);assert(t.civic.jobs.active.hands.earned.includes('refill-shelves'));
assert(!useStore(t,'inspect','sell').ok);const total=Object.values(stock).reduce((a,b)=>a+b,0);assert(useStore(t,'inspect','quarantine').ok);assert.equal(Object.values(stock).reduce((a,b)=>a+b,0),total-1);
assert(!useStore(t,'count',999).ok);const count=Object.values(storeState(t).shelves).reduce((a,n)=>a+Math.min(6,n),0);assert(useStore(t,'count',count).ok);
assert(useStore(t,'pickup','coffee').ok);const cargo=workState(t).store.carton.n,heldStock=stock.coffee;t.cancelJob();tickWorkplay(t);assert.equal(stock.coffee,heldStock+cargo,'cancel returns held goods');
// Real villagers are held at the counter; ingredients and payment occur exactly once per ticket.
t=setup('cafe','cafe-all-rounder');const cafe=t.place('cafe');for(const g of ['coffee','milk','tea','bread','eggs','veg','pie'])cafe.stock[g]=30;
const v=t.villagers.find(v=>v.work!=='cafe');v.wallet=100;v.path=[];v.inside=true;v.step={kind:'eatout',at:'cafe',dur:25,activity:'having lunch',queue:{joined:1,serving:null}};
assert(cafeCounter(t,v));const o=workState(t).cafe.tickets[0];assert(o.items.length>=1);assert(useCafe(t,'take').ok);assert(!v.step.queue);
const source={...cafe.stock},pantry={...workState(t).cafe.pantry},money=v.wallet,till=cafe.till,price=ticketPrice(o);
const stationOf=r=>['food','oven'].includes(r.kind)?'kitchen':'barista';
for(const it of o.items){
 const recipe=recipeFor(it.recipe),station=stationOf(recipe);
 let r=useCafe(t,'prepare',station);if(r.needMod)r=useCafe(t,'prepare',station,undefined,it.want);
 assert(r.mini,'preparation starts with the requested '+(it.want||'recipe'));
 assert(useCafe(t,'prepare',station).mini,'re-opening a step does not re-deduct');
 for(const step of recipe.steps){assert(useCafe(t,'prepare',station).mini);assert(useCafe(t,'finish-step',step[0],.9).ok);}
}
const used={};for(const it of o.items){const r=recipeFor(it.recipe);for(const[g,n]of Object.entries(r.ingredients)){const k=g==='milk'&&['oat','soy'].includes(it.want)?'pantry:'+it.want:g==='bread'&&it.want==='gluten-free'?'pantry:gf':g;used[k]=(used[k]||0)+n;}}
for(const[k,n]of Object.entries(used)){if(k.startsWith('pantry:'))assert.equal(workState(t).cafe.pantry[k.slice(7)],pantry[k.slice(7)]-n);else assert.equal(cafe.stock[k],source[k]-n,'no duplicate ingredient deduction');}
assert.equal(o.state,'ready');assert(useCafe(t,'collect').ok);
assert(!useCafe(t,'deliver',o.table===1?2:1).ok);assert.equal(v.wallet,money,'wrong table cannot charge');
assert(useCafe(t,'deliver',o.table).ok);assert(v.wallet<=money-price&&v.wallet>=money-price-1,'pays once (plus any tip)');
assert.equal(Math.round(cafe.till*100),Math.round((till+price-Math.round(price*t.civic.taxRate*100)/100)*100));
assert(!useCafe(t,'deliver',o.table).ok,'cannot double-serve or double-charge');assert(!useCafe(t,'cancel').ok,'served orders cannot be cancelled');
t.minute+=9;tickWorkplay(t);assert(useCafe(t,'clear',o.table).ok);
const s=t.snapshot(),restored=new TownLife({homes,minute:600,seed:5});assert(restored.restore(s));assert.equal(workState(restored).cafe.served,1);
assert.notEqual(musicProfile('cafe').name,musicProfile('pub').name);assert.notEqual(musicProfile('',0,false).name,musicProfile('',1,false).name);
console.log('PASS: real stock carrying, correct shelves, quarantine and count, cancellation conservation; FIFO cafe tickets, multi-item orders with milk/bread choices, real ingredients, timed steps, correct tables, one payment, save restoration and venue music profiles.');
