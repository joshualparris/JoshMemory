// General Store batches: every unit of store stock belongs to a dated lot from a known supplier.
// Lots are kept in sale order (front of shelf first), so customers buy whatever is at the front;
// careful rotation (FEFO) keeps the earliest use-by at the front. The lots always add up to the
// store's real stock: shop.stock stays the single source of truth for the town economy.
// Chilled deliveries are probed on arrival; damaged or warm stock goes back to its supplier for a
// credit note, expired stock is the store's own loss. Fictional Town Dollars; not food-safety training.
import {STORE_GOODS} from './work-recipes.js';

export const SHELF_LIFE={coffee:120,tea:180,bread:3,milk:7,eggs:21};   // days from delivery
export const CHILLED=Object.keys(STORE_GOODS).filter(g=>STORE_GOODS[g].zone==='chilled');
export const SAFE_TEMP=5;                                              // °C, chilled receiving limit
export const PROBE_WITHIN=120;                                         // town minutes on the dock
const now=t=>t.day*1440+t.minute;
const total=lots=>lots.reduce((n,l)=>n+l.qty,0);

export function batchState(store){
 store.lots??={};store.returns??=[];store.credits??=[];store.pending??=[];store.fefo??={right:0,wrong:0};store.lotSeq??=1;
 for(const g of Object.keys(STORE_GOODS))store.lots[g]??=[];
 return store;
}
// unitCost is what the store actually paid the supplier per unit; stock with no delivery record
// (opening stock, test fixtures) has no supplier to claim a credit from.
const newLot=(t,s,g,qty,from,unitCost=0,extra={})=>({id:s.lotSeq++,good:g,qty,useBy:t.day+SHELF_LIFE[g],from:from||null,unitCost,received:now(t),...extra});

// Deterministic delivery temperature: most chilled loads arrive at 2–4 °C, roughly one in six warm.
export function deliveryTemp(t,g,n){
 const h=((t.day*1440+t.minute)*31+g.length*17+n*7)%97;
 return h<16?6+(h%4):2+(h%3);
}

// Bring the lots into line with the store's actual stock: new stock becomes an unattributed lot at
// the back, stock that left (sales, waste rules) leaves from the front of the shelf.
export function syncLots(t,s,shop,shelf){
 batchState(s);
 for(const g of Object.keys(STORE_GOODS)){
  const lots=s.lots[g],have=Math.max(0,shop.stock[g]||0);let diff=have-total(lots);
  if(diff>0)lots.push(newLot(t,s,g,diff,null));
  while(diff<0&&lots.length){const take=Math.min(lots[0].qty,-diff);lots[0].qty-=take;diff+=take;if(!lots[0].qty)lots.shift();}
 }
 return s;
}

// life.js calls this right after a truck unloads at the General Store.
export function noteStoreDelivery(t,s,shop,g,n,from,paid){
 if(!STORE_GOODS[g]||!n)return null;
 shop.stock[g]-=n;syncLots(t,s,shop);shop.stock[g]+=n;
 const chilled=CHILLED.includes(g);
 const lot=newLot(t,s,g,n,from,Math.round(paid/n*100)/100,chilled?{temp:deliveryTemp(t,g,n),probe:'pending'}:{});
 s.lots[g].push(lot);if(chilled)s.pending.push(lot.id);
 return lot;
}

// The shelf is the first `shelved` units in sale order; the rest waits in the backroom.
export function takeFromBackroom(s,g,shelved,n){
 const lots=s.lots[g],out=[];let skip=shelved,want=n;
 for(let i=0;i<lots.length&&want>0;){
  const l=lots[i];if(skip>=l.qty){skip-=l.qty;i++;continue;}
  const avail=l.qty-skip,take=Math.min(avail,want);
  if(skip>0){lots.splice(i+1,0,{...l,qty:l.qty-skip});l.qty=skip;skip=0;i++;continue;}
  out.push({...l,qty:take});l.qty-=take;want-=take;if(!l.qty)lots.splice(i,1);else i++;
 }
 return out;
}

// Puts carried lots back on the shelf. Front of the list is sold first.
export function placeOnShelf(s,g,shelved,carried,where){
 const lots=s.lots[g];
 if(where==='front'){lots.unshift(...carried);return;}
 let idx=0,count=0;while(idx<lots.length&&count+lots[idx].qty<=shelved){count+=lots[idx].qty;idx++;}
 if(count<shelved&&idx<lots.length){const l=lots[idx],keep=shelved-count;lots.splice(idx+1,0,{...l,qty:l.qty-keep});l.qty=keep;idx++;}
 lots.splice(idx,0,...carried);
}
// FEFO: new stock goes behind older stock, unless the carton is itself the earliest date.
export function fefoPlacement(s,g,shelved,carried){
 const shelfDates=[];let left=shelved;for(const l of s.lots[g]){if(left<=0)break;shelfDates.push(l.useBy);left-=l.qty;}
 const carton=Math.min(...carried.map(l=>l.useBy));
 return !shelfDates.length||carton>=Math.min(...shelfDates)?'behind':'front';
}

export function shelfLabels(s,g,shelved){
 const out=[];let left=shelved;
 for(const l of s.lots[g]){if(left<=0)break;const n=Math.min(left,l.qty);out.push({useBy:l.useBy,qty:n});left-=n;}
 return out;
}

// Pull every expired unit off sale into the returns cage (the store's loss: no supplier credit).
export function pullExpired(t,s,shop){
 let pulled=0;
 for(const g of Object.keys(STORE_GOODS)){
  const lots=s.lots[g];
  for(let i=lots.length-1;i>=0;i--){const l=lots[i];if(l.useBy<t.day){shop.stock[g]-=l.qty;pulled+=l.qty;s.returns.push({good:g,qty:l.qty,reason:'expired',from:l.from,unitCost:l.unitCost,lot:l.id});lots.splice(i,1);}}
 }
 return pulled;
}

// Probe a chilled lot on the receiving dock: over 5 °C it goes straight back to the supplier.
export function probeLot(t,s,shop,id){
 const lot=Object.values(s.lots).flat().find(l=>l.id===id&&l.probe==='pending');
 s.pending=s.pending.filter(x=>x!==id);
 if(!lot)return null;
 if(lot.temp>SAFE_TEMP){
  const lots=s.lots[lot.good];lots.splice(lots.indexOf(lot),1);shop.stock[lot.good]-=lot.qty;
  s.returns.push({good:lot.good,qty:lot.qty,reason:'warm',temp:lot.temp,from:lot.from,unitCost:lot.unitCost,lot:lot.id});lot.probe='rejected';
 }else lot.probe='accepted';
 return lot;
}

// Process the returns cage: damaged and warm-on-arrival stock is credited by the supplier who was
// paid for it (money moves between tills, never created); expired stock is disposed of as waste.
export function processReturns(t,s){
 const store=t.place('store');let credit=0,disposed=0;const notes=[];
 for(const r of s.returns){
  if(r.reason==='expired'){disposed+=r.qty;continue;}
  const supplier=r.from&&t.place(r.from),value=Math.round(r.qty*(r.unitCost||0)*100)/100;
  const paid=supplier?Math.min(value,Math.max(0,supplier.till)):0;
  if(supplier)supplier.till-=paid;store.till+=paid;credit+=paid;
  notes.push({good:r.good,qty:r.qty,reason:r.reason,from:r.from,credit:paid,day:t.day});
  disposed+=r.qty;
 }
 if(disposed){t.rubbish(disposed);t.stats.wasted=(t.stats.wasted||0)+disposed;}
 s.credits.push(...notes);s.credits=s.credits.slice(-20);s.returns=[];
 return {credit:Math.round(credit*100)/100,disposed,notes};
}

// Staff handle everything themselves when the player is not on a store shift: probe arrivals,
// a morning date check, and the afternoon returns run. The economy never stalls on the player.
export function staffRoutines(t,s,shop,playerWorking){
 if(playerWorking)return;
 for(const id of [...s.pending])probeLot(t,s,shop,id);
 if(t.minute>=9*60&&s.datedDay!==t.day){s.datedDay=t.day;pullExpired(t,s,shop);}
 if(t.minute>=16*60&&s.returnsDay!==t.day&&s.returns.length){s.returnsDay=t.day;processReturns(t,s);}
}

// Chilled lots left unprobed on the dock past the two-hour window are unsafe and are binned.
export function dockTimeouts(t,s,shop){
 for(const id of [...s.pending]){
  const lot=Object.values(s.lots).flat().find(l=>l.id===id);
  if(!lot){s.pending=s.pending.filter(x=>x!==id);continue;}
  if(now(t)-lot.received<=PROBE_WITHIN)continue;
  const lots=s.lots[lot.good];lots.splice(lots.indexOf(lot),1);shop.stock[lot.good]-=lot.qty;lot.probe='binned';
  s.pending=s.pending.filter(x=>x!==id);t.rubbish(lot.qty);t.stats.wasted=(t.stats.wasted||0)+lot.qty;
  t.log(lot.qty+' '+STORE_GOODS[lot.good].name+' sat on the General Store dock unchecked for over two hours and was thrown out.');
 }
}
