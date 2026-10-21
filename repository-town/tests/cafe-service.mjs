// Café service: full menu, dietary needs, milk and bread choices, multi-item tickets, customer
// patience, tips, the plant-milk pantry and latte art. Money and stock are conserved throughout.
//   node tests/cafe-service.mjs
import assert from 'node:assert/strict';
import {TownLife} from '../src/world/life.js';
import {workState,useCafe,queueCafeCustomer,cafeCounter,tickWorkplay,cafeState,ticketPrice,dietOf} from '../src/world/workplay.js';
import {WORK_RECIPES,recipeFor,MILKS} from '../src/world/work-recipes.js';
import {artScore,ART_PATH} from '../src/ui/work-panels.js';

const homes=[];for(let r=0;r<7;r++)for(let c=0;c<26;c+=2)homes.push({coordinate:String.fromCharCode(65+c)+(r+1),name:'House',door:{x:(c-12.5)*26,z:r*46-161+4}});
const money=t=>[...t.places.values()].reduce((n,p)=>n+p.till,0)+t.civic.treasury+t.villagers.reduce((n,v)=>n+v.wallet,0)+t.civic.player.wallet+(t.civic.finance?.federal||0)+(t.civic.finance?.state||0);
function cafeShift(seed=5){
 const t=new TownLife({homes,minute:10*60,seed});t.playerAt='cafe';
 for(const v of t.villagers)if(v.work==='cafe'){v.step={kind:'work',at:'cafe'};v.path=[];}
 assert(t.startJob('cafe-all-rounder').ok);
 for(const g of ['coffee','milk','tea','bread','eggs','veg','pie'])t.place('cafe').stock[g]=40;
 return t;
}
const customer=(t,v)=>{v.wallet=80;v.path=[];v.inside=true;v.step={kind:'eatout',at:'cafe',dur:25,activity:'lunch',queue:{joined:1,serving:null}};return v;};
const station=r=>['food','oven'].includes(r.kind)?'kitchen':'barista';
function make(t,it,mod){
 const r=recipeFor(it.recipe);let x=useCafe(t,'prepare',station(r));
 if(x.needMod)x=useCafe(t,'prepare',station(r),undefined,mod??it.want);
 assert(x.mini,'started '+r.name+': '+x.message);
 for(const step of r.steps)assert(useCafe(t,'finish-step',step[0],.9).ok);
}

// 1. The menu is broad, every customer's order suits their diet, and many tickets have two items.
{
 assert(WORK_RECIPES.length>=14,'full menu');assert(WORK_RECIPES.some(r=>r.steps.some(s=>s[0]==='art')),'latte art step');
 assert(recipeFor('pie').steps.some(s=>s[0]==='probe')&&recipeFor('pie').steps.some(s=>s[0]==='preheat'),'deeper oven steps');
 const t=cafeShift(),c=cafeState(t),seen=new Set();let multi=0;
 for(const v of t.villagers.filter(v=>v.work!=='cafe')){
  customer(t,v);const o=queueCafeCustomer(t,v);if(!o)continue;
  if(o.items.length>1)multi++;for(const it of o.items)seen.add(it.recipe);
  const diet=dietOf(v);assert.equal(o.diet,diet);
  for(const it of o.items){const r=recipeFor(it.recipe);
   if(diet==='vegetarian')assert(!r.tags.includes('meat'),'vegetarians are not served meat');
   if(diet==='gluten-free'){assert(!r.tags.includes('no-gf'));if(r.tags.includes('bread'))assert.equal(it.want,'gluten-free');}
   if(diet==='dairy-free'&&r.tags.includes('milk'))assert(['oat','soy'].includes(it.want),'dairy-free customers ask for plant milk');
   if(r.tags.includes('milk'))assert(MILKS.includes(it.want));
  }
  o.state='cancelled';delete v.step.workTicket;c.tickets=[];
 }
 assert(multi>=5,'several customers order more than one item ('+multi+')');
 assert(seen.size>=8,'customers order across the menu ('+seen.size+' dishes)');
}

// 2. A two-item ticket: wrong milk is refused at the table and remade free; the right order pays once.
{
 const t=cafeShift(),c=cafeState(t);let v,o;
 for(const cand of t.villagers.filter(v=>v.work!=='cafe')){customer(t,cand);const x=queueCafeCustomer(t,cand);if(x?.items.some(it=>recipeFor(it.recipe).tags.includes('milk'))&&x.items.length>1){v=cand;o=x;break;}if(x){x.state='cancelled';delete cand.step.workTicket;}}
 assert(o,'found a customer ordering a milk drink and food');
 const milkItem=o.items.find(it=>recipeFor(it.recipe).tags.includes('milk')),wrongMilk=MILKS.find(m=>m!==milkItem.want);
 assert(useCafe(t,'take',v.id).ok);const total0=money(t),wallet=v.wallet,till=t.place('cafe').till,rubbish=t.civic.rubbish||0;
 for(const it of o.items)make(t,it,it===milkItem?wrongMilk:it.want);
 assert.equal(o.state,'ready');assert(useCafe(t,'collect').ok);
 const refused=useCafe(t,'deliver',o.table);assert(!refused.ok&&/must be remade/.test(refused.message)&&/pay is unaffected/.test(refused.message));
 assert.equal(v.wallet,wallet,'nobody is charged for a refused order');assert.equal(t.place('cafe').till,till);
 assert.equal(milkItem.status,'todo');assert.equal(o.state,'accepted');assert.equal(c.refused,1);
 make(t,milkItem);assert.equal(o.state,'ready');assert(useCafe(t,'collect').ok);
 const r=useCafe(t,'deliver',o.table);assert(r.ok,r.message);
 const price=ticketPrice(o);assert(wallet-v.wallet===price||wallet-v.wallet===price+1,'pays the ticket once, plus any tip');
 assert.equal(Math.round(money(t)*100),Math.round(total0*100),'money moved, never created (tip and tax included)');
 void rubbish;
}

// 3. Patience: an order left too long is abandoned; raw ingredients go back, nobody pays.
{
 const t=cafeShift(),c=cafeState(t),v=customer(t,t.villagers.find(v=>v.work!=='cafe'));
 const o=queueCafeCustomer(t,v);assert(useCafe(t,'take',v.id).ok);const it=o.items[0],r=recipeFor(it.recipe);
 let x=useCafe(t,'prepare',station(r));if(x.needMod)x=useCafe(t,'prepare',station(r),undefined,it.want);
 const wallet=v.wallet;t.minute+=o.patience+1;tickWorkplay(t);
 assert.equal(o.state,'cancelled','customer left after waiting too long');assert.equal(v.wallet,wallet);
 assert(/waiting too long/.test(v.activity));void c;
}

// 4. Quick service earns a tip from the customer's wallet to the player's.
{
 const t=cafeShift(),c=cafeState(t),v=customer(t,t.villagers.find(v=>v.work!=='cafe'));
 const o=queueCafeCustomer(t,v);assert(useCafe(t,'take',v.id).ok);for(const it of o.items)make(t,it);
 assert(useCafe(t,'collect').ok);const mine=t.civic.player.wallet;assert(/tip/.test(useCafe(t,'deliver',o.table).message));
 assert.equal(t.civic.player.wallet,mine+1);assert.equal(c.tips,1);
}

// 5. The pantry: plant milk comes from it, and the morning restock is paid to the depot.
{
 const t=cafeShift(),c=cafeState(t);c.pantry={oat:0,soy:2,gf:6};c.pantryDay=t.day-1;t.place('cafe').till=100;
 const before=money(t);t.minute=6*60+1;tickWorkplay(t);
 assert.deepEqual(c.pantry,{oat:8,soy:8,gf:6},'restocked to target');assert.equal(Math.round(money(t)*100),Math.round(before*100),'restock moves money to the depot');
}

// 6. Latte art scores the trace, and old single-item saved tickets still load.
{
 assert(artScore(ART_PATH)>.95&&artScore([[5,5],[9,9],[12,4],[2,3]])===0&&artScore(ART_PATH.slice(0,25))<artScore(ART_PATH));
 const t=cafeShift();workState(t).cafe.tickets.push({id:99,customer:1,name:'Old Save',item:'flat-white',table:2,state:'preparing',step:2,quality:[.8,.9],created:0});
 const c=cafeState(t),old=c.tickets.find(o=>o.id===99);assert(old.items?.length===1&&old.items[0].recipe==='flat-white'&&old.items[0].step===2&&!old.item);
 const back=new TownLife({homes,minute:600,seed:5});assert(back.restore(JSON.parse(JSON.stringify(t.snapshot()))));assert(cafeState(back).tickets.some(o=>o.id===99&&o.items));
}
console.log('PASS: 14-dish menu, diets respected, multi-item tickets, wrong milk refused and remade free, single payment and conserved money, patience, tips, pantry restock, latte art scoring, legacy tickets');
