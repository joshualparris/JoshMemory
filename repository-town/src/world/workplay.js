import {storeBatches,reserveBatch,restoreBatch,quarantineBatch,cartonUnsafe,returnToSupplier,tickStoreBatches} from './store-batches.js';
import {FULL_WORK_MENU,recipeFor,orderRecipe,STORE_GOODS} from './work-recipes.js';
import {noteSpend} from './household.js';
const result=(ok,message,extra={})=>({ok,message,...extra});
const now=t=>t.day*1440+t.minute;
export function workState(t){
 const s=t.civic.workplay??={version:1,store:{shelves:{},carton:null,quarantine:0,restocked:0},cafe:{next:1,tickets:[],selected:null,held:null,served:0,cleared:0}};
 return s;
}
// Finite alternative ingredients are purchased from the Rail Depot, not gifted to
// the café. Supplier and café till balances transfer exactly the same amount.
export function restockCafePantry(t){
 const c=workState(t).cafe,p=t.place('cafe'),depot=t.place('depot');
 if(c.pantryDay===t.day)return 0;
 if(t.minute<360)return 0;
 const targets={oatmilk:8,soymilk:8,gfbread:6},prices={oatmilk:2,soymilk:2,gfbread:3};
 let paid=0;
 for(const [good,target] of Object.entries(targets)){
  const have=Math.max(0,Math.floor(p.stock[good]||0));
  const n=Math.min(Math.max(0,target-have),Math.floor(Math.max(0,p.till||0)/prices[good]));
  if(!n)continue;
  const cost=n*prices[good];p.till-=cost;depot.till+=cost;p.stock[good]=have+n;paid+=cost;
 }
 c.pantryDay=t.day;
 return paid;
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
 const batches=storeBatches(t);
 if(!s.batchShelvesInitialised){for(const good of Object.keys(STORE_GOODS)){let display=Math.min(2,shop.stock[good]||0);for(const b of batches.lots.filter(b=>b.good===good).sort((a,b)=>a.expires-b.expires)){b.shelf=Math.min(display,b.n);display-=b.shelf;}}s.batchShelvesInitialised=true;}
 for(const g of Object.keys(STORE_GOODS)){
  if(!Number.isFinite(s.shelves[g]))s.shelves[g]=Math.min(2,shop.stock[g]||0);
  const current=Math.max(0,shop.stock[g]||0);
  if(Number.isFinite(s.lastStock[g])&&current<s.lastStock[g])s.shelves[g]=Math.max(0,s.shelves[g]-(s.lastStock[g]-current));
  s.shelves[g]=batches.lots.filter(b=>b.good===g).reduce((n,b)=>n+b.shelf,0);s.lastStock[g]=current;
 }
 return s;
}
export function useStore(t,action,arg){
 if(t.civic.jobs?.active?.breakRemaining>0)return result(false,'Enjoy your paid break before continuing work.');
 if(!authorised(t,'store'))return result(false,'Start a General Store shift and work while a supervisor is on duty.');
 const s=storeState(t),a=t.civic.jobs.active,stock=t.place('store').stock;
 const success=message=>{for(const g of Object.keys(STORE_GOODS))s.lastStock[g]=stock[g]||0;return result(true,message);};
 if(action==='inspect'){
  // A damaged carton is an actual item isolated from sale, not new inventory.
  if(a.hands?.earned?.includes('check-expiry'))return result(false,'Batch inspection already completed for this shift.');
  if(arg!=='quarantine')return result(false,'The carton is marked damaged / do not sell. Isolate it instead of putting it on a shelf.');
  const good=Object.keys(STORE_GOODS).find(g=>(stock[g]||0)>(s.shelves[g]||0));
  if(!good)return result(false,'No backroom carton is available to inspect. Wait for a delivery.');
  if(!quarantineBatch(t,good))return result(false,'No backroom batch to quarantine.');s.quarantine++;s.lastQuarantine=good;
  mark(t,'check-expiry');return success('Damaged '+STORE_GOODS[good].name+' isolated in the returns cage. Saleable stock reduced by one.');
 }
 if(action==='pickup'){
  if(s.carton)return result(false,'Put down or shelve your current carton first.');
  const good=typeof arg==='object'?arg.good:arg,g=STORE_GOODS[good];if(!g)return result(false,'Choose a labelled product carton.');
  const reserved=reserveBatch(t,good,typeof arg==='object'?arg.batchId:undefined);
  if(!reserved.ok)return reserved;s.carton=reserved.carton;
  return success(reserved.message+' Walk to the '+g.zone+' shelf.');
 }
 if(action==='supplier-return')return returnToSupplier(t,arg);
 if(action==='return'){
  if(!s.carton)return result(false,'You are not carrying a carton.');
  const safe=restoreBatch(t,s.carton);s.carton=null;
  return success(safe?'Exact batch returned to receiving.':'Unsafe carton quarantined; it cannot re-enter sale stock.');
 }
 if(action==='shelve'){
  if(!s.carton)return result(false,'Collect a labelled carton from the receiving bay first.');
  const {good,n}=s.carton;if(STORE_GOODS[good].zone!==arg)return result(false,'Wrong shelf: '+STORE_GOODS[good].name+' belongs in '+STORE_GOODS[good].zone+'.');
  if(cartonUnsafe(t,s.carton))return result(false,'Date / cold-chain failure: return the carton to quarantine before continuing.');
  restoreBatch(t,s.carton,true);s.shelves[good]=(s.shelves[good]||0)+n;s.restocked+=n;s.carton=null;
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
export function queueCafeCustomer(t,v){
 const c=workState(t).cafe,existing=c.tickets.find(o=>o.customer===v.id&&!['cleared','cancelled'].includes(o.state));
 if(existing)return existing;
 const busy=c.tickets.filter(o=>!['cleared','cancelled'].includes(o.state));if(busy.length>=6)return null;
 const table=[1,2,3,4,5,6].find(n=>!busy.some(o=>o.table===n));
 const p=t.place('cafe');restockCafePantry(t);
 const diet=['vegan','gluten-free','standard','vegetarian','dairy-free','standard','standard'][Math.abs(v.id)%7];
 const milk=['vegan','dairy-free'].includes(diet)?(v.id%2?'soy':'oat'):'dairy',bread=diet==='gluten-free'?'gluten-free':'regular';
 const choices=FULL_WORK_MENU.filter(r=>v.wallet>=r.price);
 if(!choices.length)return null;
 const suitable=choices.filter(r=>!(diet==='vegan'&&(r.ingredients.eggs||r.ingredients.pie||r.ingredients.milk&&!['oat','soy'].includes(milk))))
  .filter(r=>!(diet==='vegetarian'&&r.ingredients.pie))
  .filter(r=>!(diet==='gluten-free'&&r.ingredients.pie))
  .filter(r=>Object.entries(orderRecipe({item:r.id,diet,milk,bread}).ingredients).every(([g,n])=>(p.stock[g]||0)>=n));
 if(!suitable.length)return null;
 const r=suitable[Math.abs(v.id+c.next-1)%suitable.length];
 const o={id:c.next++,customer:v.id,name:v.name,item:r.id,table,state:'queue',step:0,quality:[],created:now(t),diet,milk,bread,items:[r.id],patience:45+(v.id*11%31+31)%31,chosenMilk:null,chosenBread:null};
 const second=suitable.find(x=>x.id!==r.id&&(['food','oven'].includes(x.kind)!==['food','oven'].includes(r.kind)));
 if(c.next%3===0&&second){const pair={...o,items:[r.id,second.id]};const bundle=orderRecipe(pair);if(v.wallet>=bundle.price&&Object.entries(bundle.ingredients).every(([g,n])=>(p.stock[g]||0)>=n))o.items.push(second.id);}
 if(c.next%5===0&&o.items.length<3){
  const third=suitable.find(x=>!o.items.includes(x.id));
  if(third){const candidate={...o,items:[...o.items,third.id]},basket=orderRecipe(candidate);
   if(v.wallet>=basket.price&&Object.entries(basket.ingredients).every(([g,n])=>(p.stock[g]||0)>=n))o.items.push(third.id);
  }
 }
 const final=orderRecipe(o);if(!Object.entries(final.ingredients).every(([g,n])=>(p.stock[g]||0)>=n))return null;
 c.tickets.push(o);v.step.workTicket=o.id;v.activity='Queuing to order at Commit Café';
 c.tickets=c.tickets.filter(x=>!['cleared','cancelled'].includes(x.state)).concat(c.tickets.filter(x=>['cleared','cancelled'].includes(x.state)).slice(-12));
 return o;
}
export function cafeCounter(t,v){
 const s=v.step;if(s?.at!=='cafe'||s.kind!=='eatout')return false;
 if(!s.queue&&!s.workTicket)return false; // Let existing automatic meals finish normally.
 const c=workState(t).cafe;
 if(!authorised(t,'cafe')){
  const old=c.tickets.find(o=>o.id===s.workTicket);
  if(old&&!['served','dirty','cleared','cancelled'].includes(old.state))cancelCafe(t,old);
  return false;
 }
 const o=c.tickets.find(x=>x.id===s.workTicket)||queueCafeCustomer(t,v);
 if(!o)return false;
 if(['served','dirty','cleared','cancelled'].includes(o.state))return false;
 v.activity=o.state==='queue'?'Queuing for café order '+o.id:'Waiting for '+orderRecipe(o).name+' at table '+o.table;
 return true;
}
export function cancelCafe(t,o){
 const c=workState(t).cafe,v=t.villagers.find(v=>v.id===o.customer);
 // Reserved ingredients are returned only while raw. Prepared food becomes waste.
 if(o.reserved&&o.step===0){for(const [g,n]of Object.entries(o.reservedIngredients||orderRecipe(o).ingredients))t.place('cafe').stock[g]=(t.place('cafe').stock[g]||0)+n;}
 if(o.reserved&&o.step>0)t.rubbish(1);
 o.state='cancelled';o.reserved=false;o.reservedIngredients=null;if(c.held===o.id)c.held=null;
 if(v?.step?.workTicket===o.id){delete v.step.workTicket;delete v.step.food;v.step.queue={joined:now(t),serving:null};}
}
export function useCafe(t,action,arg,score){
 if(t.civic.jobs?.active?.breakRemaining>0)return result(false,'Enjoy your paid break before continuing work.');
 if(!authorised(t,'cafe'))return result(false,'Start the café all-rounder shift while a supervisor is on duty.');
 const c=workState(t).cafe,p=t.place('cafe'),o=c.tickets.find(x=>x.id===(c.held||c.selected));
 if(action==='select'){const chosen=c.tickets.find(x=>x.id===Number(arg)&&!['cleared','cancelled'].includes(x.state));if(!chosen)return result(false,'That ticket is no longer active.');c.selected=chosen.id;return result(true,'Ticket '+chosen.id+' selected: '+orderRecipe(chosen).name+', table '+chosen.table+'.');}
 if(action==='take'){
  const front=c.tickets.filter(x=>x.state==='queue').sort((a,b)=>a.created-b.created||a.id-b.id)[0];
  if(!front)return result(false,'No customer is waiting to order. The town’s actual villagers join as they arrive.');
  if(arg!==undefined&&front.customer!==arg)return result(false,'Please take '+front.name+'’s order first; they are at the front of the queue.');
  front.state='accepted';c.selected=front.id;
  const v=t.villagers.find(v=>v.id===front.customer);
  if(!v?.step)return result(false,'The customer has already left.');
  delete v.step.queue;v.step.food={dish:[orderRecipe(front).name,orderRecipe(front).price],ready:now(t)+100000};
  mark(t,'take-orders');return result(true,front.name+': “'+orderRecipe(front).name+', please.” Ticket '+front.id+', table '+front.table+'.');
 }
 if(!o)return result(false,'Select a ticket on the order rail first.');
 const r=orderRecipe(o);
 if(action==='milk'){
  if(!['accepted','preparing'].includes(o.state)||o.reserved)return result(false,'Milk choice is locked once preparation starts.');
  if(!['dairy','skim','oat','soy'].includes(arg))return result(false,'Unknown milk choice.');
  o.chosenMilk=arg;return result(true,arg+' milk selected. Compare with the ticket before delivering.');
 }
 if(action==='bread'){
  if(!['accepted','preparing'].includes(o.state)||o.reserved)return result(false,'Bread choice is locked once preparation starts.');
  if(!['regular','gluten-free'].includes(arg))return result(false,'Unknown bread choice.');
  o.chosenBread=arg;return result(true,arg+' bread selected. Check dietary request before service.');
 }
 if(action==='prepare'){
  if(!['accepted','preparing'].includes(o.state))return result(false,'This order is not waiting for preparation.');
  const station=r.steps[o.step]?.[3]||(['food','oven'].includes(r.kind)?'kitchen':'barista');
  if(arg!==station)return result(false,'Prepare '+r.name+' at the '+station+' station.');
  if(r.hasMilk&&!o.chosenMilk)return result(false,'Choose a milk jug for the ticket before preparation.',{milkChoice:true,request:o.milk});
  if(r.hasBread&&o.bread==='gluten-free'&&!o.chosenBread)return result(false,'Choose the requested bread before preparation.',{breadChoice:true,request:o.bread});
  if(!o.reserved){
   const actual=orderRecipe({...o,milk:o.chosenMilk||o.milk,bread:o.chosenBread||o.bread});
   if(!Object.entries(actual.ingredients).every(([g,n])=>(p.stock[g]||0)>=n))return result(false,'Ingredients are sold out. Wait for a delivery.');
   for(const[g,n]of Object.entries(actual.ingredients))p.stock[g]-=n;
   o.reservedIngredients={...actual.ingredients};o.reserved=true;
  }
  o.state='preparing';return result(true,r.steps[o.step][1],{mini:r.steps[o.step],order:o.id});
 }
 if(action==='finish-step'){
  if(o.state!=='preparing'||arg!==r.steps[o.step]?.[0]||!Number.isFinite(score))return result(false,'That preparation step is no longer active.');
  if(score<.35)return result(false,'Retry this preparation step; no additional ingredients or wages are deducted.');
  o.quality.push(Math.max(0,Math.min(1,score)));o.step++;
  if(o.step>=r.steps.length){o.state='ready';mark(t,'prepare-orders');return result(true,r.name+' ready on the pass. Collect the tray for table '+o.table+'.');}
  return result(true,r.steps[o.step-1][1]+' complete. Next: '+r.steps[o.step][1]+'.');
 }
 if(action==='collect'){
  if(c.held)return result(false,'Deliver your current tray first.');
  if(o.state!=='ready')return result(false,'Finish preparing this ticket first.');
  c.held=o.id;o.state='carrying';return result(true,'Carrying '+r.name+' for '+o.name+', table '+o.table+'.');
 }
 if(action==='deliver'){
  if(c.held!==o.id||o.state!=='carrying')return result(false,'Collect the finished tray at the pass first.');
  if(Number(arg)!==o.table)return result(false,'Wrong table. This tray belongs to '+o.name+' at table '+o.table+'.');
  const v=t.villagers.find(v=>v.id===o.customer);
  if(!v?.step||v.step.workTicket!==o.id){cancelCafe(t,o);return result(false,'The customer has left. Return to the counter.');}
  if((r.hasMilk&&o.chosenMilk!==o.milk)||(r.hasBread&&o.bread==='gluten-free'&&o.chosenBread!==o.bread)){
   const error=r.hasMilk&&o.chosenMilk!==o.milk?'milk':'bread';
   c.refused=(c.refused||0)+1;t.rubbish(1);
   o.step=0;o.quality=[];o.state='accepted';o.reserved=false;o.reservedIngredients=null;
   o.chosenMilk=null;o.chosenBread=null;c.held=null;
   return result(false,'The '+error+' does not match the dietary ticket and must be remade. Customer pays nothing and worker pay is unaffected.');
  }
  if(v.wallet<r.price)return result(false,'The customer cannot afford this order. Ask the counter to cancel it.');
  const tip=now(t)-o.created<=30&&v.wallet>=r.price+1?1:0;
  v.wallet-=r.price+tip;
  if(tip){t.civic.player.wallet+=tip;c.tips=(c.tips||0)+tip;}noteSpend(v,'out',r.price);t.sale(p,r.price);t.stats.mealsOut++;
  t.eat(v,r.name);v.activity='Enjoying '+r.name+' at table '+o.table;
  delete v.step.queue;delete v.step.food;v.step.dur=12;
  o.state='served';o.servedAt=now(t);c.held=null;c.served++;o.reserved=false;
  t.log('Ticket '+o.id+': '+o.name+' served '+r.name+' at table '+o.table+'.');
  return result(true,'Correct table! '+o.name+' received '+r.name+'. $'+r.price+' paid to the café.'+(tip?' $1 tip earned.':''));
 }
 if(action==='clear'){
  if(Number(arg)!==o.table||!['dirty','served'].includes(o.state))return result(false,'There are no finished dishes from this ticket at that table.');
  if(o.state==='served'&&now(t)-o.servedAt<8)return result(false,o.name+' is still eating. Clear the table afterwards.');
  o.state='cleared';c.cleared++;t.rubbish(1);mark(t,'table-service');return result(true,'Crockery cleared. Table '+o.table+' is ready for the next customer.');
 }
 if(action==='cancel'){if(['served','dirty','cleared','cancelled'].includes(o.state))return result(false,'Only unserved orders can be cancelled.');cancelCafe(t,o);return result(true,'Order cancelled; no customer was charged.');}
 return result(false,'Unknown café task.');
}
export function tickWorkplay(t){
 tickStoreBatches(t);restockCafePantry(t);
 const state=t.civic.workplay;if(!state)return;
 const a=t.civic.jobs?.active;
 if(state.store.carton&&(!a||a.site!=='store'||a.day!==t.day)){
  restoreBatch(t,state.store.carton);state.store.carton=null;
 }
 for(const o of state.cafe.tickets){
  if(o.state==='served'&&now(t)-o.servedAt>=8)o.state='dirty';
  if(['queue','accepted','preparing','ready','carrying'].includes(o.state)){
   const v=t.villagers.find(v=>v.id===o.customer);
   if(now(t)-o.created>(o.patience||90)){cancelCafe(t,o);o.reason='Customer patience elapsed';continue;}
   if(!a||a.site!=='cafe'||a.day!==t.day||t.playerAt!=='cafe'||!v?.step||v.step.workTicket!==o.id)cancelCafe(t,o);
  }
 }
 if(a?.hands?.earned)for(const task of a.hands.earned)if(!a.tasks.includes(task))t.doTask(task);
}
+r.price+' paid to the café.'+(tip?' $1 tip earned.':''));
 }
 if(action==='clear'){
  if(Number(arg)!==o.table||!['dirty','served'].includes(o.state))return result(false,'There are no finished dishes from this ticket at that table.');
  if(o.state==='served'&&now(t)-o.servedAt<8)return result(false,o.name+' is still eating. Clear the table afterwards.');
  o.state='cleared';c.cleared++;t.rubbish(1);mark(t,'table-service');return result(true,'Crockery cleared. Table '+o.table+' is ready for the next customer.');
 }
 if(action==='cancel'){if(['served','dirty','cleared','cancelled'].includes(o.state))return result(false,'Only unserved orders can be cancelled.');cancelCafe(t,o);return result(true,'Order cancelled; no customer was charged.');}
 return result(false,'Unknown café task.');
}
export function tickWorkplay(t){
 tickStoreBatches(t);
 const state=t.civic.workplay;if(!state)return;
 const a=t.civic.jobs?.active;
 if(state.store.carton&&(!a||a.site!=='store'||a.day!==t.day)){
  restoreBatch(t,state.store.carton);state.store.carton=null;
 }
 for(const o of state.cafe.tickets){
  if(o.state==='served'&&now(t)-o.servedAt>=8)o.state='dirty';
  if(['queue','accepted','preparing','ready','carrying'].includes(o.state)){
   const v=t.villagers.find(v=>v.id===o.customer);
   if(now(t)-o.created>(o.patience||90)){cancelCafe(t,o);o.reason='Customer patience elapsed';continue;}
   if(!a||a.site!=='cafe'||a.day!==t.day||t.playerAt!=='cafe'||!v?.step||v.step.workTicket!==o.id)cancelCafe(t,o);
  }
 }
 if(a?.hands?.earned)for(const task of a.hands.earned)if(!a.tasks.includes(task))t.doTask(task);
}
