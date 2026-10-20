// Vehicle register shared by a real forecourt and repair workshop.
// Prices are Town Dollars; vehicles are titled assets, not inventory goods.
export const VEHICLE_MODELS=Object.freeze([
  {id:'hatch',name:'Used hatchback',price:740,type:'car',service:35},
  {id:'sedan',name:'Family sedan',price:1160,type:'car',service:48},
  {id:'ute',name:'Work ute',price:1850,type:'ute',service:65},
  {id:'van',name:'Delivery van',price:2300,type:'van',service:82},
  {id:'truck',name:'Used rigid truck',price:4600,type:'truck',service:150},
]);
const r2=n=>Math.round(n*100)/100;
const funds=me=>(me.wallet||0)+(me.bank||0);
function take(me,n){if(n>funds(me))return false;const a=Math.min(me.wallet||0,n);me.wallet=r2(me.wallet-a);me.bank=r2(me.bank-(n-a));return true;}
export function initialiseVehicles(life){
  life.civic.motor={version:1,parts:20,staffWages:0,stock:VEHICLE_MODELS.map((model,i)=>({stockId:'used-'+i,model:model.id,condition:60+i*7,odometer:(i+2)*32000,price:model.price})),
    owned:[],dealerCash:12500,garageCash:800,journal:[],next:100,day:life.day};
  // These are the existing delivery trucks, titled to the Rail Freight Cooperative,
  // not available for the player to sell or service without a contract.
  for(const truck of life.trucks){truck.owner='Rail Freight Cooperative';truck.condition=85;truck.regoUntil=life.day+28;}
}
export const motorReport=life=>life.civic.motor;
export function buyVehicle(life,stockId){
  const s=motorReport(life),me=life.civic.player,index=s.stock.findIndex(x=>x.stockId===stockId);
  const item=s.stock[index];if(!item)return 'That vehicle has already sold.';
  const duty=Math.round(item.price*.03),transfer=10,total=item.price+duty+transfer;
  if(!take(me,total))return 'You need 
  const vehicle={...item,registration:'RT-'+String(s.next++).padStart(3,'0'),owner:'visitor',regoUntil:life.day+28,lastService:life.day,serviceDue:life.day+14,roadworthy:item.condition>=60};
  s.owned.push(vehicle);s.journal.unshift('Day '+life.day+': bought '+vehicle.registration+' for $'+item.price+'.');
  return vehicle.registration+' is registered in your name. Transfer costs 
}
export function serviceVehicle(life,registration){
  const s=motorReport(life),vehicle=s.owned.find(v=>v.registration===registration);
  if(!vehicle)return 'This registration is not in your name.';
  const model=VEHICLE_MODELS.find(m=>m.id===vehicle.model),cost=model?.service||50;
  if(s.parts<1)return 'The mechanic is waiting for spare parts from the Foundry.';
  if(!take(life.civic.player,cost))return 'You need vehicle.condition=Math.min(100,vehicle.condition+28);
  vehicle.lastService=life.day;vehicle.serviceDue=life.day+14;
  vehicle.roadworthy=vehicle.condition>=60;
  s.journal.unshift('Day '+life.day+': '+registration+' serviced for $'+cost+'.');
  return registration+' serviced ($'+cost+'). Condition '+vehicle.condition+'%, next due day '+vehicle.serviceDue+'.';
}
export function renewRegistration(life,registration){
  const s=motorReport(life),v=s.owned.find(v=>v.registration===registration);
  if(!v)return 'Vehicle not found in your register.';
  if(!v.roadworthy||v.condition<60)return 'Roadworthy inspection or repairs required first.';
  const amount=v.model==='truck'?90:30;if(!take(life.civic.player,amount))return 'Registration costs $'+amount+'.';
  life.civic.treasury+=amount;v.regoUntil=Math.max(life.day,v.regoUntil)+28;
  return registration+' registration renewed to day '+v.regoUntil+'.';
}
export function sellVehicle(life,registration){
  const s=motorReport(life),v=s.owned.find(v=>v.registration===registration);
  if(!v)return 'No matching registered vehicle.';
  const price=Math.round(v.price*(0.6+v.condition/250));
  if(s.dealerCash<price)return 'Dealer has insufficient capital to make an offer.';
  s.dealerCash-=price;life.civic.player.bank=r2(life.civic.player.bank+price);
  s.owned=s.owned.filter(x=>x!==v);
  s.stock.push({...v,stockId:'trade-'+s.next++,price:Math.round(price*1.18)});
  s.journal.unshift('Day '+life.day+': sold '+registration+' for $'+price+'.');
  return 'Dealer settled $'+price+' for '+registration+'; ownership transferred.';
}
export function motorDay(life){
  const s=motorReport(life);if(s.day===life.day)return;
  s.day=life.day;
  // Local foundry manufactures the spare parts. The workshop buys those
  // finite parts, transferring money back to the industry till.
  const foundry=life.place('foundry');
  const restock=Math.min(Math.max(0,10-s.parts),foundry?.out?.parts||0,Math.floor(s.garageCash/12));
  if(restock>0){foundry.out.parts-=restock;foundry.till+=restock*12;s.garageCash-=restock*12;s.parts+=restock;}
  const dealerWage=Math.min(26,s.dealerCash),mechanicWage=Math.min(28,s.garageCash);
  s.dealerCash-=dealerWage;s.garageCash-=mechanicWage;s.staffWages+=dealerWage+mechanicWage;
  for(const v of s.owned){
    v.condition=Math.max(10,r2(v.condition-0.15));
    v.roadworthy=v.condition>=60;
  }
  for(const t of life.trucks) {
    t.condition=Math.max(25,r2((t.condition??85)-0.2));
    if(t.condition<45&&life.civic.treasury>=35&&s.parts>0) {
      life.civic.treasury-=35;s.garageCash+=35;s.parts--;t.condition=Math.min(100,t.condition+30);
      life.stats.repairs=(life.stats.repairs||0)+1;
      life.log('Motor Workshop serviced depot truck '+t.id+' for $35.');
    }
  }
}
+total+' including transfer duty and title fee.';
  life.civic.treasury+=duty+transfer;
  s.stock.splice(index,1);s.dealerCash+=item.price;
  const vehicle={...item,registration:'RT-'+String(s.next++).padStart(3,'0'),owner:'visitor',regoUntil:life.day+28,lastService:life.day,serviceDue:life.day+14,roadworthy:item.condition>=60};
  s.owned.push(vehicle);s.journal.unshift('Day '+life.day+': bought '+vehicle.registration+' for $'+item.price+'.');
  return vehicle.registration+' is registered in your name. Rego expires day '+vehicle.regoUntil+'. Driving controls are not yet supported.';
}
export function serviceVehicle(life,registration){
  const s=motorReport(life),vehicle=s.owned.find(v=>v.registration===registration);
  if(!vehicle)return 'This registration is not in your name.';
  const model=VEHICLE_MODELS.find(m=>m.id===vehicle.model),cost=model?.service||50;
  if(!take(life.civic.player,cost))return 'You need $'+cost+' for parts and labour.';
  s.garageCash+=cost;vehicle.condition=Math.min(100,vehicle.condition+28);
  vehicle.lastService=life.day;vehicle.serviceDue=life.day+14;
  vehicle.roadworthy=vehicle.condition>=60;
  s.journal.unshift('Day '+life.day+': '+registration+' serviced for $'+cost+'.');
  return registration+' serviced ($'+cost+'). Condition '+vehicle.condition+'%, next due day '+vehicle.serviceDue+'.';
}
export function renewRegistration(life,registration){
  const s=motorReport(life),v=s.owned.find(v=>v.registration===registration);
  if(!v)return 'Vehicle not found in your register.';
  if(!v.roadworthy||v.condition<60)return 'Roadworthy inspection or repairs required first.';
  const amount=v.model==='truck'?90:30;if(!take(life.civic.player,amount))return 'Registration costs $'+amount+'.';
  life.civic.treasury+=amount;v.regoUntil=Math.max(life.day,v.regoUntil)+28;
  return registration+' registration renewed to day '+v.regoUntil+'.';
}
export function sellVehicle(life,registration){
  const s=motorReport(life),v=s.owned.find(v=>v.registration===registration);
  if(!v)return 'No matching registered vehicle.';
  const price=Math.round(v.price*(0.6+v.condition/250));
  if(s.dealerCash<price)return 'Dealer has insufficient capital to make an offer.';
  s.dealerCash-=price;life.civic.player.bank=r2(life.civic.player.bank+price);
  s.owned=s.owned.filter(x=>x!==v);
  s.stock.push({...v,stockId:'trade-'+s.next++,price:Math.round(price*1.18)});
  s.journal.unshift('Day '+life.day+': sold '+registration+' for $'+price+'.');
  return 'Dealer settled $'+price+' for '+registration+'; ownership transferred.';
}
export function motorDay(life){
  const s=motorReport(life);if(s.day===life.day)return;
  s.day=life.day;
  for(const v of s.owned){
    v.condition=Math.max(10,r2(v.condition-0.15));
    v.roadworthy=v.condition>=60;
  }
  for(const t of life.trucks) {
    t.condition=Math.max(25,r2((t.condition??85)-0.2));
    if(t.condition<45&&life.civic.treasury>=35) {
      life.civic.treasury-=35;s.garageCash+=35;t.condition=Math.min(100,t.condition+30);
      life.stats.repairs=(life.stats.repairs||0)+1;
      life.log('Motor Workshop serviced depot truck '+t.id+' for $35.');
    }
  }
}
+(duty+transfer)+'. Rego expires day '+vehicle.regoUntil+'. Driving controls are not yet supported.';
}
export function serviceVehicle(life,registration){
  const s=motorReport(life),vehicle=s.owned.find(v=>v.registration===registration);
  if(!vehicle)return 'This registration is not in your name.';
  const model=VEHICLE_MODELS.find(m=>m.id===vehicle.model),cost=model?.service||50;
  if(!take(life.civic.player,cost))return 'You need $'+cost+' for parts and labour.';
  s.garageCash+=cost;vehicle.condition=Math.min(100,vehicle.condition+28);
  vehicle.lastService=life.day;vehicle.serviceDue=life.day+14;
  vehicle.roadworthy=vehicle.condition>=60;
  s.journal.unshift('Day '+life.day+': '+registration+' serviced for $'+cost+'.');
  return registration+' serviced ($'+cost+'). Condition '+vehicle.condition+'%, next due day '+vehicle.serviceDue+'.';
}
export function renewRegistration(life,registration){
  const s=motorReport(life),v=s.owned.find(v=>v.registration===registration);
  if(!v)return 'Vehicle not found in your register.';
  if(!v.roadworthy||v.condition<60)return 'Roadworthy inspection or repairs required first.';
  const amount=v.model==='truck'?90:30;if(!take(life.civic.player,amount))return 'Registration costs $'+amount+'.';
  life.civic.treasury+=amount;v.regoUntil=Math.max(life.day,v.regoUntil)+28;
  return registration+' registration renewed to day '+v.regoUntil+'.';
}
export function sellVehicle(life,registration){
  const s=motorReport(life),v=s.owned.find(v=>v.registration===registration);
  if(!v)return 'No matching registered vehicle.';
  const price=Math.round(v.price*(0.6+v.condition/250));
  if(s.dealerCash<price)return 'Dealer has insufficient capital to make an offer.';
  s.dealerCash-=price;life.civic.player.bank=r2(life.civic.player.bank+price);
  s.owned=s.owned.filter(x=>x!==v);
  s.stock.push({...v,stockId:'trade-'+s.next++,price:Math.round(price*1.18)});
  s.journal.unshift('Day '+life.day+': sold '+registration+' for $'+price+'.');
  return 'Dealer settled $'+price+' for '+registration+'; ownership transferred.';
}
export function motorDay(life){
  const s=motorReport(life);if(s.day===life.day)return;
  s.day=life.day;
  for(const v of s.owned){
    v.condition=Math.max(10,r2(v.condition-0.15));
    v.roadworthy=v.condition>=60;
  }
  for(const t of life.trucks) {
    t.condition=Math.max(25,r2((t.condition??85)-0.2));
    if(t.condition<45&&life.civic.treasury>=35) {
      life.civic.treasury-=35;s.garageCash+=35;t.condition=Math.min(100,t.condition+30);
      life.stats.repairs=(life.stats.repairs||0)+1;
      life.log('Motor Workshop serviced depot truck '+t.id+' for $35.');
    }
  }
}
+total+' including transfer duty and title fee.';
  life.civic.treasury+=duty+transfer;
  s.stock.splice(index,1);s.dealerCash+=item.price;
  const vehicle={...item,registration:'RT-'+String(s.next++).padStart(3,'0'),owner:'visitor',regoUntil:life.day+28,lastService:life.day,serviceDue:life.day+14,roadworthy:item.condition>=60};
  s.owned.push(vehicle);s.journal.unshift('Day '+life.day+': bought '+vehicle.registration+' for $'+item.price+'.');
  return vehicle.registration+' is registered in your name. Rego expires day '+vehicle.regoUntil+'. Driving controls are not yet supported.';
}
export function serviceVehicle(life,registration){
  const s=motorReport(life),vehicle=s.owned.find(v=>v.registration===registration);
  if(!vehicle)return 'This registration is not in your name.';
  const model=VEHICLE_MODELS.find(m=>m.id===vehicle.model),cost=model?.service||50;
  if(!take(life.civic.player,cost))return 'You need $'+cost+' for parts and labour.';
  s.garageCash+=cost;vehicle.condition=Math.min(100,vehicle.condition+28);
  vehicle.lastService=life.day;vehicle.serviceDue=life.day+14;
  vehicle.roadworthy=vehicle.condition>=60;
  s.journal.unshift('Day '+life.day+': '+registration+' serviced for $'+cost+'.');
  return registration+' serviced ($'+cost+'). Condition '+vehicle.condition+'%, next due day '+vehicle.serviceDue+'.';
}
export function renewRegistration(life,registration){
  const s=motorReport(life),v=s.owned.find(v=>v.registration===registration);
  if(!v)return 'Vehicle not found in your register.';
  if(!v.roadworthy||v.condition<60)return 'Roadworthy inspection or repairs required first.';
  const amount=v.model==='truck'?90:30;if(!take(life.civic.player,amount))return 'Registration costs $'+amount+'.';
  life.civic.treasury+=amount;v.regoUntil=Math.max(life.day,v.regoUntil)+28;
  return registration+' registration renewed to day '+v.regoUntil+'.';
}
export function sellVehicle(life,registration){
  const s=motorReport(life),v=s.owned.find(v=>v.registration===registration);
  if(!v)return 'No matching registered vehicle.';
  const price=Math.round(v.price*(0.6+v.condition/250));
  if(s.dealerCash<price)return 'Dealer has insufficient capital to make an offer.';
  s.dealerCash-=price;life.civic.player.bank=r2(life.civic.player.bank+price);
  s.owned=s.owned.filter(x=>x!==v);
  s.stock.push({...v,stockId:'trade-'+s.next++,price:Math.round(price*1.18)});
  s.journal.unshift('Day '+life.day+': sold '+registration+' for $'+price+'.');
  return 'Dealer settled $'+price+' for '+registration+'; ownership transferred.';
}
export function motorDay(life){
  const s=motorReport(life);if(s.day===life.day)return;
  s.day=life.day;
  for(const v of s.owned){
    v.condition=Math.max(10,r2(v.condition-0.15));
    v.roadworthy=v.condition>=60;
  }
  for(const t of life.trucks) {
    t.condition=Math.max(25,r2((t.condition??85)-0.2));
    if(t.condition<45&&life.civic.treasury>=35) {
      life.civic.treasury-=35;s.garageCash+=35;t.condition=Math.min(100,t.condition+30);
      life.stats.repairs=(life.stats.repairs||0)+1;
      life.log('Motor Workshop serviced depot truck '+t.id+' for $35.');
    }
  }
}
+cost+' for parts and labour.';
  s.parts-=1;s.garageCash+=cost;vehicle.condition=Math.min(100,vehicle.condition+28);
  vehicle.lastService=life.day;vehicle.serviceDue=life.day+14;
  vehicle.roadworthy=vehicle.condition>=60;
  s.journal.unshift('Day '+life.day+': '+registration+' serviced for $'+cost+'.');
  return registration+' serviced ($'+cost+'). Condition '+vehicle.condition+'%, next due day '+vehicle.serviceDue+'.';
}
export function renewRegistration(life,registration){
  const s=motorReport(life),v=s.owned.find(v=>v.registration===registration);
  if(!v)return 'Vehicle not found in your register.';
  if(!v.roadworthy||v.condition<60)return 'Roadworthy inspection or repairs required first.';
  const amount=v.model==='truck'?90:30;if(!take(life.civic.player,amount))return 'Registration costs $'+amount+'.';
  life.civic.treasury+=amount;v.regoUntil=Math.max(life.day,v.regoUntil)+28;
  return registration+' registration renewed to day '+v.regoUntil+'.';
}
export function sellVehicle(life,registration){
  const s=motorReport(life),v=s.owned.find(v=>v.registration===registration);
  if(!v)return 'No matching registered vehicle.';
  const price=Math.round(v.price*(0.6+v.condition/250));
  if(s.dealerCash<price)return 'Dealer has insufficient capital to make an offer.';
  s.dealerCash-=price;life.civic.player.bank=r2(life.civic.player.bank+price);
  s.owned=s.owned.filter(x=>x!==v);
  s.stock.push({...v,stockId:'trade-'+s.next++,price:Math.round(price*1.18)});
  s.journal.unshift('Day '+life.day+': sold '+registration+' for $'+price+'.');
  return 'Dealer settled $'+price+' for '+registration+'; ownership transferred.';
}
export function motorDay(life){
  const s=motorReport(life);if(s.day===life.day)return;
  s.day=life.day;
  for(const v of s.owned){
    v.condition=Math.max(10,r2(v.condition-0.15));
    v.roadworthy=v.condition>=60;
  }
  for(const t of life.trucks) {
    t.condition=Math.max(25,r2((t.condition??85)-0.2));
    if(t.condition<45&&life.civic.treasury>=35) {
      life.civic.treasury-=35;s.garageCash+=35;t.condition=Math.min(100,t.condition+30);
      life.stats.repairs=(life.stats.repairs||0)+1;
      life.log('Motor Workshop serviced depot truck '+t.id+' for $35.');
    }
  }
}
+total+' including transfer duty and title fee.';
  life.civic.treasury+=duty+transfer;
  s.stock.splice(index,1);s.dealerCash+=item.price;
  const vehicle={...item,registration:'RT-'+String(s.next++).padStart(3,'0'),owner:'visitor',regoUntil:life.day+28,lastService:life.day,serviceDue:life.day+14,roadworthy:item.condition>=60};
  s.owned.push(vehicle);s.journal.unshift('Day '+life.day+': bought '+vehicle.registration+' for $'+item.price+'.');
  return vehicle.registration+' is registered in your name. Rego expires day '+vehicle.regoUntil+'. Driving controls are not yet supported.';
}
export function serviceVehicle(life,registration){
  const s=motorReport(life),vehicle=s.owned.find(v=>v.registration===registration);
  if(!vehicle)return 'This registration is not in your name.';
  const model=VEHICLE_MODELS.find(m=>m.id===vehicle.model),cost=model?.service||50;
  if(!take(life.civic.player,cost))return 'You need $'+cost+' for parts and labour.';
  s.garageCash+=cost;vehicle.condition=Math.min(100,vehicle.condition+28);
  vehicle.lastService=life.day;vehicle.serviceDue=life.day+14;
  vehicle.roadworthy=vehicle.condition>=60;
  s.journal.unshift('Day '+life.day+': '+registration+' serviced for $'+cost+'.');
  return registration+' serviced ($'+cost+'). Condition '+vehicle.condition+'%, next due day '+vehicle.serviceDue+'.';
}
export function renewRegistration(life,registration){
  const s=motorReport(life),v=s.owned.find(v=>v.registration===registration);
  if(!v)return 'Vehicle not found in your register.';
  if(!v.roadworthy||v.condition<60)return 'Roadworthy inspection or repairs required first.';
  const amount=v.model==='truck'?90:30;if(!take(life.civic.player,amount))return 'Registration costs $'+amount+'.';
  life.civic.treasury+=amount;v.regoUntil=Math.max(life.day,v.regoUntil)+28;
  return registration+' registration renewed to day '+v.regoUntil+'.';
}
export function sellVehicle(life,registration){
  const s=motorReport(life),v=s.owned.find(v=>v.registration===registration);
  if(!v)return 'No matching registered vehicle.';
  const price=Math.round(v.price*(0.6+v.condition/250));
  if(s.dealerCash<price)return 'Dealer has insufficient capital to make an offer.';
  s.dealerCash-=price;life.civic.player.bank=r2(life.civic.player.bank+price);
  s.owned=s.owned.filter(x=>x!==v);
  s.stock.push({...v,stockId:'trade-'+s.next++,price:Math.round(price*1.18)});
  s.journal.unshift('Day '+life.day+': sold '+registration+' for $'+price+'.');
  return 'Dealer settled $'+price+' for '+registration+'; ownership transferred.';
}
export function motorDay(life){
  const s=motorReport(life);if(s.day===life.day)return;
  s.day=life.day;
  for(const v of s.owned){
    v.condition=Math.max(10,r2(v.condition-0.15));
    v.roadworthy=v.condition>=60;
  }
  for(const t of life.trucks) {
    t.condition=Math.max(25,r2((t.condition??85)-0.2));
    if(t.condition<45&&life.civic.treasury>=35) {
      life.civic.treasury-=35;s.garageCash+=35;t.condition=Math.min(100,t.condition+30);
      life.stats.repairs=(life.stats.repairs||0)+1;
      life.log('Motor Workshop serviced depot truck '+t.id+' for $35.');
    }
  }
}
+(duty+transfer)+'. Rego expires day '+vehicle.regoUntil+'. Driving controls are not yet supported.';
}
export function serviceVehicle(life,registration){
  const s=motorReport(life),vehicle=s.owned.find(v=>v.registration===registration);
  if(!vehicle)return 'This registration is not in your name.';
  const model=VEHICLE_MODELS.find(m=>m.id===vehicle.model),cost=model?.service||50;
  if(!take(life.civic.player,cost))return 'You need $'+cost+' for parts and labour.';
  s.garageCash+=cost;vehicle.condition=Math.min(100,vehicle.condition+28);
  vehicle.lastService=life.day;vehicle.serviceDue=life.day+14;
  vehicle.roadworthy=vehicle.condition>=60;
  s.journal.unshift('Day '+life.day+': '+registration+' serviced for $'+cost+'.');
  return registration+' serviced ($'+cost+'). Condition '+vehicle.condition+'%, next due day '+vehicle.serviceDue+'.';
}
export function renewRegistration(life,registration){
  const s=motorReport(life),v=s.owned.find(v=>v.registration===registration);
  if(!v)return 'Vehicle not found in your register.';
  if(!v.roadworthy||v.condition<60)return 'Roadworthy inspection or repairs required first.';
  const amount=v.model==='truck'?90:30;if(!take(life.civic.player,amount))return 'Registration costs $'+amount+'.';
  life.civic.treasury+=amount;v.regoUntil=Math.max(life.day,v.regoUntil)+28;
  return registration+' registration renewed to day '+v.regoUntil+'.';
}
export function sellVehicle(life,registration){
  const s=motorReport(life),v=s.owned.find(v=>v.registration===registration);
  if(!v)return 'No matching registered vehicle.';
  const price=Math.round(v.price*(0.6+v.condition/250));
  if(s.dealerCash<price)return 'Dealer has insufficient capital to make an offer.';
  s.dealerCash-=price;life.civic.player.bank=r2(life.civic.player.bank+price);
  s.owned=s.owned.filter(x=>x!==v);
  s.stock.push({...v,stockId:'trade-'+s.next++,price:Math.round(price*1.18)});
  s.journal.unshift('Day '+life.day+': sold '+registration+' for $'+price+'.');
  return 'Dealer settled $'+price+' for '+registration+'; ownership transferred.';
}
export function motorDay(life){
  const s=motorReport(life);if(s.day===life.day)return;
  s.day=life.day;
  for(const v of s.owned){
    v.condition=Math.max(10,r2(v.condition-0.15));
    v.roadworthy=v.condition>=60;
  }
  for(const t of life.trucks) {
    t.condition=Math.max(25,r2((t.condition??85)-0.2));
    if(t.condition<45&&life.civic.treasury>=35) {
      life.civic.treasury-=35;s.garageCash+=35;t.condition=Math.min(100,t.condition+30);
      life.stats.repairs=(life.stats.repairs||0)+1;
      life.log('Motor Workshop serviced depot truck '+t.id+' for $35.');
    }
  }
}
+total+' including transfer duty and title fee.';
  life.civic.treasury+=duty+transfer;
  s.stock.splice(index,1);s.dealerCash+=item.price;
  const vehicle={...item,registration:'RT-'+String(s.next++).padStart(3,'0'),owner:'visitor',regoUntil:life.day+28,lastService:life.day,serviceDue:life.day+14,roadworthy:item.condition>=60};
  s.owned.push(vehicle);s.journal.unshift('Day '+life.day+': bought '+vehicle.registration+' for $'+item.price+'.');
  return vehicle.registration+' is registered in your name. Rego expires day '+vehicle.regoUntil+'. Driving controls are not yet supported.';
}
export function serviceVehicle(life,registration){
  const s=motorReport(life),vehicle=s.owned.find(v=>v.registration===registration);
  if(!vehicle)return 'This registration is not in your name.';
  const model=VEHICLE_MODELS.find(m=>m.id===vehicle.model),cost=model?.service||50;
  if(!take(life.civic.player,cost))return 'You need $'+cost+' for parts and labour.';
  s.garageCash+=cost;vehicle.condition=Math.min(100,vehicle.condition+28);
  vehicle.lastService=life.day;vehicle.serviceDue=life.day+14;
  vehicle.roadworthy=vehicle.condition>=60;
  s.journal.unshift('Day '+life.day+': '+registration+' serviced for $'+cost+'.');
  return registration+' serviced ($'+cost+'). Condition '+vehicle.condition+'%, next due day '+vehicle.serviceDue+'.';
}
export function renewRegistration(life,registration){
  const s=motorReport(life),v=s.owned.find(v=>v.registration===registration);
  if(!v)return 'Vehicle not found in your register.';
  if(!v.roadworthy||v.condition<60)return 'Roadworthy inspection or repairs required first.';
  const amount=v.model==='truck'?90:30;if(!take(life.civic.player,amount))return 'Registration costs $'+amount+'.';
  life.civic.treasury+=amount;v.regoUntil=Math.max(life.day,v.regoUntil)+28;
  return registration+' registration renewed to day '+v.regoUntil+'.';
}
export function sellVehicle(life,registration){
  const s=motorReport(life),v=s.owned.find(v=>v.registration===registration);
  if(!v)return 'No matching registered vehicle.';
  const price=Math.round(v.price*(0.6+v.condition/250));
  if(s.dealerCash<price)return 'Dealer has insufficient capital to make an offer.';
  s.dealerCash-=price;life.civic.player.bank=r2(life.civic.player.bank+price);
  s.owned=s.owned.filter(x=>x!==v);
  s.stock.push({...v,stockId:'trade-'+s.next++,price:Math.round(price*1.18)});
  s.journal.unshift('Day '+life.day+': sold '+registration+' for $'+price+'.');
  return 'Dealer settled $'+price+' for '+registration+'; ownership transferred.';
}
export function motorDay(life){
  const s=motorReport(life);if(s.day===life.day)return;
  s.day=life.day;
  for(const v of s.owned){
    v.condition=Math.max(10,r2(v.condition-0.15));
    v.roadworthy=v.condition>=60;
  }
  for(const t of life.trucks) {
    t.condition=Math.max(25,r2((t.condition??85)-0.2));
    if(t.condition<45&&life.civic.treasury>=35) {
      life.civic.treasury-=35;s.garageCash+=35;t.condition=Math.min(100,t.condition+30);
      life.stats.repairs=(life.stats.repairs||0)+1;
      life.log('Motor Workshop serviced depot truck '+t.id+' for $35.');
    }
  }
}
