import {WORK_RECIPES,recipeFor,STORE_GOODS,MILKS,BREADS,PANTRY,SURCHARGE,DIETS} from './work-recipes.js';
import {noteSpend} from './household.js';
const result=(ok,message,extra={})=>({ok,message,...extra});
const now=t=>t.day*1440+t.minute;
export function workState(t){
 const s=t.civic.workplay??={version:1,store:{shelves:{},carton:null,quarantine:0,restocked:0},cafe:{next:1,tickets:[],selected:null,held:null,served:0,cleared:0}};
 return s;
}
export function isWorking(t,site){const a=t.civic.jobs?.active;return !!(a&&a.site===site&&a.day===t.day&&t.playerAt===site);}
function authorised(t,site){return isWorking(t,site)&&t.jobSupervisors(site).length>0&&t.open(t.place(site));}
function mark(t,task){
 const a=t.civic.jobs?.active;if(!a)return;
 a.hands??={earned:[],scores:[]};if(!a.hands.earned.includes(task))a.hands.earned.push(task);
 // The existing five-minute spacing still governs completed shift duties.
 for(const k of a.hands.earned)if(!a.tasks.includes(k))t.doTask(k);
}
export function storeState(t){
 const s=workState(t).store,shop=t.place('store');s.lastStock??={};
 for(const g of Object.keys(STORE_GOODS)){
  if(!Number.isFinite(s.shelves[g]))s.shelves[g]=Math.min(2,shop.stock[g]||0);
  const current=Math.max(0,shop.stock[g]||0);
  if(Number.isFinite(s.lastStock[g])&&current<s.lastStock[g])s.shelves[g]=Math.max(0,s.shelves[g]-(s.lastStock[g]-current));
  s.shelves[g]=Math.max(0,Math.min(s.shelves[g],current));s.lastStock[g]=current;
 }
 return s;
}
export function useStore(t,action,arg){
 if(!authorised(t,'store'))return result(false,'Start a General Store shift and work while a supervisor is on duty.');
 const s=storeState(t),a=t.civic.jobs.active,stock=t.place('store').stock;
 const success=message=>{for(const g of Object.keys(STORE_GOODS))s.lastStock[g]=stock[g]||0;return result(true,message);};
 if(action==='inspect'){
  // A damaged carton is an actual item isolated from sale, not new inventory.
  if(a.hands?.earned?.includes('check-expiry'))return result(false,'Batch inspection already completed for this shift.');
  if(arg!=='quarantine')return result(false,'The carton is marked damaged / do not sell. Isolate it instead of putting it on a shelf.');
  const good=Object.keys(STORE_GOODS).find(g=>(stock[g]||0)>(s.shelves[g]||0));
  if(!good)return result(false,'No backroom carton is available to inspect. Wait for a delivery.');
  stock[good]--;s.quarantine++;s.lastQuarantine=good;
  mark(t,'check-expiry');return success('Damaged '+STORE_GOODS[good].name+' isolated in the returns cage. Saleable stock reduced by one.');
 }
 if(action==='pickup'){
  if(s.carton)return result(false,'Put down or shelve your current carton first.');
  const g=STORE_GOODS[arg];if(!g)return result(false,'Choose a labelled product carton.');
  const n=Math.min(3,Math.max(0,(stock[arg]||0)-(s.shelves[arg]||0)));
  if(!n)return result(false,'No '+g.name+' remains in the backroom. Wait for a delivery or choose another carton.');
  stock[arg]-=n;s.carton={good:arg,n};
  return success('Carrying '+n+' '+g.name+'. Walk to the '+g.zone+' shelf and use it.');
 }
 if(action==='return'){
  if(!s.carton)return result(false,'You are not carrying a carton.');
  stock[s.carton.good]=(stock[s.carton.good]||0)+s.carton.n;s.carton=null;
  return success('Carton returned to the receiving bay.');
 }
 if(action==='shelve'){
  if(!s.carton)return result(false,'Collect a labelled carton from the receiving bay first.');
  const {good,n}=s.carton;if(STORE_GOODS[good].zone!==arg)return result(false,'Wrong shelf: '+STORE_GOODS[good].name+' belongs in '+STORE_GOODS[good].zone+'.');
  stock[good]=(stock[good]||0)+n;s.shelves[good]=(s.shelves[good]||0)+n;s.restocked+=n;s.carton=null;
  a.hands??={earned:[],scores:[]};a.hands.restocked=(a.hands.restocked||0)+n;
  if(a.hands.restocked>=6)mark(t,'refill-shelves');
  return success(n+' '+STORE_GOODS[good].name+' stocked. '+Math.max(0,6-a.hands.restocked)+' more units needed for the refill duty.');
 }
 if(action==='count'){
  const count=Object.values(s.shelves).reduce((sum,n)=>sum+Math.min(6,n),0);
  if(Number(arg)!==count)return result(false,'That count does not match the marked shelf sections. Count the visible products again.');
  if(!(a.hands?.restocked>=6))return result(false,'Finish shelving six units before the final stocktake.');
  mark(t,'count-stock');return success('Stocktake reconciled: '+count+' visible products.');
 }
 return result(false,'Unknown store task.');
}
// ── Café ──
// A ticket holds one to three items. Each item carries the customer's requested milk or bread
// (`want`) and what the barista or cook actually used (`chosen`); a mismatch is refused politely at
// the table and remade, never charged and never deducted from wages.
const LIVE=['queue','accepted','preparing','ready','carrying'];
const itemFor=(r,want)=>({recipe:r.id,want,chosen:null,step:0,quality:[],status:'todo',reserved:false});
const modOptions=r=>r.tags.includes('milk')?MILKS:r.tags.includes('bread')?BREADS:null;
export const itemPrice=it=>{const r=recipeFor(it.recipe);return r.price+(SURCHARGE[it.want]||0);};
export const ticketPrice=o=>o.items.reduce((n,it)=>n+itemPrice(it),0);
export const itemLabel=it=>{const r=recipeFor(it.recipe);return (it.want&&it.want!=='full cream'&&it.want!=='regular'?it.want+' ':'')+r.name;};
export const ticketLabel=o=>o.items.map(itemLabel).join(' + ');
// Older saves had one `item` per ticket.
function normalise(o){if(!o.items&&o.item){o.items=[{...itemFor(recipeFor(o.item),null),step:o.step||0,quality:o.quality||[],status:['ready','carrying','served','dirty','cleared'].includes(o.state)?'ready':o.state==='preparing'?'preparing':'todo',reserved:!!o.reserved}];delete o.item;}o.patience??=45;return o;}
export function cafeState(t){const c=workState(t).cafe;c.pantry??={oat:8,soy:8,gf:6};c.tips??=0;c.refused??=0;for(const o of c.tickets)normalise(o);return c;}
export const dietOf=v=>DIETS[(v.id*7+3)%DIETS.length];
const suits=(r,diet)=>!(diet==='vegetarian'&&r.tags.includes('meat'))&&!(diet==='gluten-free'&&r.tags.includes('no-gf'));
// Ingredients one item needs, after milk/bread substitutions from the pantry.
function needs(r,mod){
 const stock={...r.ingredients},pantry={};
 if(['oat','soy'].includes(mod)&&stock.milk){pantry[mod]=stock.milk;delete stock.milk;}
 if(mod==='gluten-free'&&stock.bread){pantry.gf=stock.bread;delete stock.bread;}
 return {stock,pantry};
}
function canMake(p,c,list){
 const st={},pa={};for(const[r,mod]of list){const n=needs(r,mod);for(const[g,k]of Object.entries(n.stock))st[g]=(st[g]||0)+k;for(const[g,k]of Object.entries(n.pantry))pa[g]=(pa[g]||0)+k;}
 return Object.entries(st).every(([g,k])=>(p.stock[g]||0)>=k)&&Object.entries(pa).every(([g,k])=>(c.pantry[g]||0)>=k);
}
export function queueCafeCustomer(t,v){
 const c=cafeState(t),existing=c.tickets.find(o=>o.customer===v.id&&!['cleared','cancelled'].includes(o.state));
 if(existing)return existing;
 const busy=c.tickets.filter(o=>!['cleared','cancelled'].includes(o.state));if(busy.length>=6)return null;
 const table=[1,2,3,4,5,6].find(n=>!busy.some(o=>o.table===n));
 const p=t.place('cafe'),diet=dietOf(v),k=v.id*13+c.next*7;
 const want=r=>r.tags.includes('milk')?(diet==='dairy-free'?['oat','soy'][k%2]:['full cream','full cream','skim','oat'][k%4]):r.tags.includes('bread')?(diet==='gluten-free'?'gluten-free':'regular'):null;
 const drinks=WORK_RECIPES.filter(r=>['coffee','tea'].includes(r.kind)&&suits(r,diet)),food=WORK_RECIPES.filter(r=>!['coffee','tea'].includes(r.kind)&&suits(r,diet));
 // Most customers have a drink and something to eat; some just a drink; a few just food.
 const shape=k%10<6?['drink','food']:k%10<9?['drink']:['food'];
 for(let attempt=0;attempt<Math.max(drinks.length,food.length);attempt++){
  const pick=shape.map((s,i)=>{const list=s==='drink'?drinks:food;return list[(k+attempt+i*5)%list.length];});
  const items=pick.map(r=>itemFor(r,want(r))),total=items.reduce((n,it)=>n+itemPrice(it),0);
  if(v.wallet<total||!canMake(p,c,pick.map((r,i)=>[r,items[i].want])))continue;
  const o={id:c.next++,customer:v.id,name:v.name,diet,items,table,state:'queue',created:now(t),patience:45+(v.id%4)*10};   // town minutes (3 real seconds each at 1×)
  c.tickets.push(o);v.step.workTicket=o.id;v.activity='Queuing to order at Commit Café';
  c.tickets=c.tickets.filter(x=>!['cleared','cancelled'].includes(x.state)).concat(c.tickets.filter(x=>['cleared','cancelled'].includes(x.state)).slice(-12));
  return o;
 }
 return null;
}
export function cafeCounter(t,v){
 const s=v.step;if(s?.at!=='cafe'||s.kind!=='eatout')return false;
 if(!s.queue&&!s.workTicket)return false; // Let existing automatic meals finish normally.
 const c=cafeState(t);
 if(!authorised(t,'cafe')){
  const old=c.tickets.find(o=>o.id===s.workTicket);
  if(old&&LIVE.includes(old.state))cancelCafe(t,old);
  return false;
 }
 const o=c.tickets.find(x=>x.id===s.workTicket)||queueCafeCustomer(t,v);
 if(!o)return false;
 if(!LIVE.includes(o.state))return false;
 v.activity=o.state==='queue'?'Queuing for café order '+o.id:'Waiting for '+ticketLabel(o)+' at table '+o.table;
 return true;
}
// Returns raw ingredients for items not yet started; anything already worked on is waste.
function releaseItem(t,c,it,{waste=true}={}){
 if(!it.reserved)return;
 const n=needs(recipeFor(it.recipe),it.chosen);
 if(it.step===0){for(const[g,k]of Object.entries(n.stock))t.place('cafe').stock[g]=(t.place('cafe').stock[g]||0)+k;for(const[g,k]of Object.entries(n.pantry))c.pantry[g]=(c.pantry[g]||0)+k;}
 else if(waste)t.rubbish(1);
 it.reserved=false;
}
export function cancelCafe(t,o,why){
 const c=cafeState(t),v=t.villagers.find(v=>v.id===o.customer);
 for(const it of o.items)releaseItem(t,c,it);
 o.state='cancelled';if(c.held===o.id)c.held=null;
 if(why)t.log(o.name+' '+why+' at Commit Café.');
 if(v?.step?.workTicket===o.id){delete v.step.workTicket;delete v.step.food;v.step.queue={joined:now(t),serving:null};}
}
export function useCafe(t,action,arg,score,mod){
 if(!authorised(t,'cafe'))return result(false,'Start the café all-rounder shift while a supervisor is on duty.');
 const c=cafeState(t),p=t.place('cafe'),o=c.tickets.find(x=>x.id===(c.held||c.selected));
 if(action==='select'){const chosen=c.tickets.find(x=>x.id===Number(arg)&&!['cleared','cancelled'].includes(x.state));if(!chosen)return result(false,'That ticket is no longer active.');c.selected=chosen.id;return result(true,'Ticket '+chosen.id+' selected: '+ticketLabel(chosen)+' for '+chosen.name+' at table '+chosen.table+'.');}
 if(action==='take'){
  const front=c.tickets.filter(x=>x.state==='queue').sort((a,b)=>a.created-b.created||a.id-b.id)[0];
  if(!front)return result(false,'No customer is waiting to order. The town’s actual villagers join as they arrive.');
  if(arg!==undefined&&front.customer!==arg)return result(false,'Please take '+front.name+'’s order first; they are at the front of the queue.');
  front.state='accepted';c.selected=front.id;
  const v=t.villagers.find(v=>v.id===front.customer);
  if(!v?.step)return result(false,'The customer has already left.');
  delete v.step.queue;v.step.food={dish:[ticketLabel(front),ticketPrice(front)],ready:now(t)+100000};
  mark(t,'take-orders');
  return result(true,front.name+': “'+front.items.map(it=>{const r=recipeFor(it.recipe);return r.tags.includes('milk')?r.name+' with '+it.want+' milk':it.want==='gluten-free'?'gluten-free '+r.name.toLowerCase():r.name;}).join(' and ')+', please.”'+(front.diet?' ('+front.diet+')':'')+' Ticket '+front.id+', table '+front.table+'.');
 }
 if(!o)return result(false,'Select a ticket on the order rail first.');
 if(action==='prepare'){
  if(!['accepted','preparing'].includes(o.state))return result(false,'This order is not waiting for preparation.');
  const station=r=>r.kind==='food'||r.kind==='oven'?'kitchen':'barista';
  const it=o.items.find(it=>it.status==='preparing'&&station(recipeFor(it.recipe))===arg)||o.items.find(it=>it.status==='todo'&&station(recipeFor(it.recipe))===arg);
  if(!it){const other=o.items.find(it=>it.status!=='ready');return result(false,other?'Prepare '+recipeFor(other.recipe).name+' at the '+station(recipeFor(other.recipe))+' station.':'Every item on this ticket is ready. Collect the tray at the pass.');}
  const r=recipeFor(it.recipe);
  if(!it.reserved){
   const options=modOptions(r);
   if(options&&!mod)return result(false,'Choose the '+(r.tags.includes('milk')?'milk':'bread')+' for '+r.name+'.',{needMod:true,options,item:r.name,request:it.want});
   const chosen=options?mod:null;if(options&&!options.includes(chosen))return result(false,'That is not one of the options here.');
   if(!canMake(p,c,[[r,chosen]]))return result(false,(chosen&&PANTRY[{oat:'oat',soy:'soy','gluten-free':'gf'}[chosen]]?PANTRY[{oat:'oat',soy:'soy','gluten-free':'gf'}[chosen]].name:'Ingredients')+' sold out. Wait for a delivery or the morning pantry restock.');
   const n=needs(r,chosen);for(const[g,k]of Object.entries(n.stock))p.stock[g]-=k;for(const[g,k]of Object.entries(n.pantry))c.pantry[g]-=k;
   it.reserved=true;it.chosen=chosen;
  }
  it.status='preparing';o.state='preparing';o.active=o.items.indexOf(it);
  return result(true,r.steps[it.step][1],{mini:r.steps[it.step],order:o.id,item:o.active});
 }
 if(action==='finish-step'){
  const it=o.items[o.active??-1],r=it&&recipeFor(it.recipe);
  if(!it||it.status!=='preparing'||arg!==r.steps[it.step]?.[0]||!Number.isFinite(score))return result(false,'That preparation step is no longer active.');
  it.quality.push(Math.max(0,Math.min(1,score)));it.step++;
  if(it.step>=r.steps.length){
   it.status='ready';const left=o.items.filter(x=>x.status!=='ready');
   if(!left.length){o.state='ready';mark(t,'prepare-orders');return result(true,ticketLabel(o)+' ready on the pass. Collect the tray for table '+o.table+'.');}
   o.state='accepted';return result(true,r.name+' ready. Still to make: '+left.map(x=>recipeFor(x.recipe).name).join(', ')+'.');
  }
  return result(true,r.steps[it.step-1][1]+' complete. Next: '+r.steps[it.step][1]+'.');
 }
 if(action==='collect'){
  if(c.held)return result(false,'Deliver your current tray first.');
  if(o.state!=='ready')return result(false,'Finish every item on this ticket first.');
  c.held=o.id;o.state='carrying';return result(true,'Carrying '+ticketLabel(o)+' for '+o.name+', table '+o.table+'.');
 }
 if(action==='deliver'){
  if(c.held!==o.id||o.state!=='carrying')return result(false,'Collect the finished tray at the pass first.');
  if(Number(arg)!==o.table)return result(false,'Wrong table. This tray belongs to '+o.name+' at table '+o.table+'.');
  const v=t.villagers.find(v=>v.id===o.customer);
  if(!v?.step||v.step.workTicket!==o.id){cancelCafe(t,o);return result(false,'The customer has left. Return to the counter.');}
  // The customer checks their order: wrong milk or bread is handed back to be remade, free.
  const wrong=o.items.filter(it=>it.want&&it.chosen!==it.want);
  if(wrong.length){
   for(const it of wrong){releaseItem(t,c,it);Object.assign(it,{chosen:null,step:0,quality:[],status:'todo'});}
   o.state='accepted';c.held=null;c.selected=o.id;c.refused++;
   return result(false,o.name+': “Sorry, I asked for '+wrong.map(it=>recipeFor(it.recipe).tags.includes('milk')?it.want+' milk':it.want+' bread').join(' and ')+'.” '+wrong.map(it=>recipeFor(it.recipe).name).join(' and ')+' must be remade. Nobody is charged and your pay is unaffected; check the ticket before you start.');
  }
  const price=ticketPrice(o);
  if(v.wallet<price)return result(false,'The customer cannot afford this order. Ask the counter to cancel it.');
  v.wallet-=price;noteSpend(v,'out',price);t.sale(p,price);t.stats.mealsOut++;
  t.eat(v,ticketLabel(o));v.activity='Enjoying '+ticketLabel(o)+' at table '+o.table;
  // Quick, correct service earns a small tip from the customer's own wallet to yours.
  const waited=now(t)-o.created,tip=waited<=o.patience/2&&v.wallet>=1?1:0;
  if(tip){v.wallet-=tip;t.civic.player.wallet+=tip;c.tips+=tip;}
  delete v.step.queue;delete v.step.food;v.step.dur=12;
  o.state='served';o.servedAt=now(t);c.held=null;c.served++;for(const it of o.items)it.reserved=false;
  t.log('Ticket '+o.id+': '+o.name+' served '+ticketLabel(o)+' at table '+o.table+'.');
  return result(true,'Correct table and order! '+o.name+' paid $'+price+' to the café'+(tip?' and left you a $1 tip.':'.'));
 }
 if(action==='clear'){
  if(Number(arg)!==o.table||!['dirty','served'].includes(o.state))return result(false,'There are no finished dishes from this ticket at that table.');
  if(o.state==='served'&&now(t)-o.servedAt<8)return result(false,o.name+' is still eating. Clear the table afterwards.');
  o.state='cleared';c.cleared++;t.rubbish(1);mark(t,'table-service');return result(true,'Crockery cleared. Table '+o.table+' is ready for the next customer.');
 }
 if(action==='cancel'){if(!LIVE.includes(o.state))return result(false,'Only unserved orders can be cancelled.');cancelCafe(t,o);return result(true,'Order cancelled; no customer was charged.');}
 return result(false,'Unknown café task.');
}
// Each morning the café tops up its plant milks and gluten-free bread, paid to the depot.
function restockPantry(t,c){
 const cafe=t.place('cafe'),depot=t.place('depot'),target={oat:8,soy:8,gf:6};
 for(const[g,want]of Object.entries(target)){
  const n=Math.max(0,want-(c.pantry[g]||0)),afford=Math.min(n,Math.floor(Math.max(0,cafe.till)/PANTRY[g].price));
  if(!afford)continue;cafe.till-=afford*PANTRY[g].price;if(depot)depot.till+=afford*PANTRY[g].price;c.pantry[g]=(c.pantry[g]||0)+afford;
 }
}
export function tickWorkplay(t){
 const state=t.civic.workplay;if(!state)return;
 const a=t.civic.jobs?.active;
 if(state.store.carton&&(!a||a.site!=='store'||a.day!==t.day)){
  const {good,n}=state.store.carton;t.place('store').stock[good]=(t.place('store').stock[good]||0)+n;state.store.carton=null;
 }
 const c=cafeState(t);
 if(t.minute>=6*60&&c.pantryDay!==t.day){c.pantryDay=t.day;restockPantry(t,c);}
 for(const o of c.tickets){
  if(o.state==='served'&&now(t)-o.servedAt>=8)o.state='dirty';
  if(LIVE.includes(o.state)){
   const v=t.villagers.find(v=>v.id===o.customer);
   if(!a||a.site!=='cafe'||a.day!==t.day||t.playerAt!=='cafe'||!v?.step||v.step.workTicket!==o.id)cancelCafe(t,o);
   // Customers only wait so long; then they leave without paying.
   else if(now(t)-o.created>o.patience){cancelCafe(t,o,'gave up waiting and left');if(v)v.activity='Left Commit Café after waiting too long';}
  }
 }
 if(a?.hands?.earned)for(const task of a.hands.earned)if(!a.tasks.includes(task))t.doTask(task);
}
