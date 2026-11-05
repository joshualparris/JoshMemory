// Fictional linked-industry simulation. Reuses the existing hardware, trades,
// clinic, Foundry and licensed pub systems; never creates duplicate shops or menus.
// All money, travel and durations below are game-scale, not real NSW approvals.
import {HARDWARE,TRADE_STAFF,initialiseTradeEducation} from './trade-education.js';
import {pubVenue} from './pub-venue.js';

export const INDUSTRY_FARMS=Object.freeze({sheep:['sheep',12],dairy:['cow',7],coop:['hen',16]});
export const INDUSTRY_STAGES=Object.freeze([
 {name:'foundation',needs:{timber:2,fasteners:2},minutes:120},
 {name:'framing',needs:{timber:4,fasteners:3},minutes:120},
 {name:'services',needs:{pipe:2,cable:2},minutes:120},
 {name:'roof and safety inspection',needs:{timber:2,fasteners:2,paint:1},minutes:120},
]);
const round=x=>Math.round(x*100)/100;
const clamp=x=>Math.max(0,Math.min(100,x));
const absolute=life=>life.day*1440+life.minute;
const linkedLog=(life,msg)=>{
 const s=ensureLinkedIndustries(life);
 s.log.unshift({day:life.day,minute:Math.floor(life.minute),text:msg});
 s.log.length=Math.min(s.log.length,70);life.log(msg);
};
export function ensureLinkedIndustries(life){
 const c=life.civic;
 if(!c)throw Error('Initialise linked industries after town civic state');
 if(!c.linkedIndustries){
  const herds=Object.fromEntries(Object.entries(INDUSTRY_FARMS).map(([farm,[species,n]])=>
   [farm,Array.from({length:n},(_,i)=>({id:farm+'-'+String(i+1).padStart(2,'0'),species,
    health:88+i%10,fed:true,watered:true,isolated:false,caseId:null,alive:true,age:2+i%5}))]));
  c.linkedIndustries={
   version:1,herds,feed:{sheep:18,dairy:18,coop:18},careDay:0,
   vet:{name:'Dr Ada Wattle',base:'vet',status:'at clinic',activeCase:null,travelMinutes:0,totalTravel:0,
    from:null,to:null,examMinutes:0,stock:5,receipts:0},
   cases:[],visits:[],
   brewery:{name:'Cooperative Brewhouse',base:'foundry',stock:{malt:6,hops:3,yeast:3},
    capital:320,batches:[],readyKegs:0,deliveredKegs:0,lastBrewDay:0},
   site:{name:'Farm cooperative workshop extension',base:'trades',stage:0,progress:0,
    stock:{},budget:620,inspections:[],completedDay:null},
   supplyRuns:[],regionalOrders:[],nextRun:1,log:[],
  };
  // Externally funded, explicitly recorded startup capital; none is taken
  // from existing worker wages, pub till or the hardware shop.
  for(const farm of Object.keys(INDUSTRY_FARMS))life.place(farm).till+=120;
  // Use the pre-existing Regional Stockfeed & Produce premises, not a cloned supplier.
  life.place('stockfeed').stock.grain=12;
  life.place('stockfeed').till+=160;
  const depot=life.place('depot');
  for(const [good,n] of Object.entries({malt:12,hops:5,yeast:5}))
   depot.out[good]=(depot.out[good]||0)+n;
  c.linkedIndustries.log.push({day:life.day,minute:life.minute,text:'Cooperative startup assets supplied by regional investors.'});
 }
 if(c.linkedIndustries.version!==1)throw Error('Unsupported linked-industry save version');
 return c.linkedIndustries;
}
const availableRun=s=>!s.supplyRuns.some(r=>r.status==='in-transit');
function bookRun(life,kind,fromId,toId,goods,cost){
 const s=ensureLinkedIndustries(life);
 if(!availableRun(s))return false; // one shared delivery van: no teleport shipments
 const from=life.place(fromId),to=life.place(toId);
 if(!from||!to)return false;
 const distance=Math.abs(to.curb.x-from.curb.x)+Math.abs(to.curb.z-from.curb.z);
 const r={id:'COOP-'+String(s.nextRun++).padStart(4,'0'),kind,from:fromId,to:toId,
  goods:{...goods},cost,status:'in-transit',elapsed:0,
  duration:Math.max(3,Math.ceil(distance/(7*3))+2),
  x:from.curb.x,z:from.curb.z,startedDay:life.day};
 s.supplyRuns.push(r);s.supplyRuns=s.supplyRuns.slice(-45);
 linkedLog(life,r.id+' departed '+from.name+' for '+to.name+'.');
 return r;
}
export function bookBuildingSupplies(life){
 const s=ensureLinkedIndustries(life),site=s.site,stage=INDUSTRY_STAGES[site.stage];
 if(!stage)return 'Workshop completed and inspected.';
 if(!availableRun(s))return 'The cooperative delivery van is on another run.';
 const missing=Object.fromEntries(Object.entries(stage.needs).map(([g,n])=>[g,Math.max(0,n-(site.stock[g]||0))]).filter(([,n])=>n));
 if(!Object.keys(missing).length)return 'All materials for '+stage.name+' are already at the worksite.';
 const t=initialiseTradeEducation(life);
 for(const [g,n] of Object.entries(missing))if((t.stock[g]||0)<n)return 'Central West Hardware needs '+n+' more '+HARDWARE[g].name+'; use its existing freight ordering.';
 const cost=Object.entries(missing).reduce((n,[g,q])=>n+q*HARDWARE[g].price,0);
 if(site.budget<cost)return 'Cooperative building fund is short by $'+round(cost-site.budget)+'.';
 for(const [g,n] of Object.entries(missing))t.stock[g]-=n;
 t.hardwareCash=round(t.hardwareCash+cost);site.budget=round(site.budget-cost);
 const run=bookRun(life,'building','hardware','trades',missing,cost);
 if(!run){for(const [g,n] of Object.entries(missing))t.stock[g]+=n;t.hardwareCash-=cost;site.budget+=cost;return 'Delivery van unavailable.';}
 return 'Paid $'+cost+' to the existing Hardware & Timber store; '+run.id+' physically bringing '+stage.name+' materials.';
}
export function bookFeedRun(life,farm){
 const s=ensureLinkedIndustries(life);if(!s.herds[farm])return 'Not a livestock farm.';
 if(!availableRun(s))return 'The cooperative van is on another delivery.';
 const source=life.place('stockfeed'),buyer=life.place(farm),n=Math.min(9,source.stock.grain||0),cost=n*2;
 if(n<3)return 'Regional Stockfeed & Produce needs another paid grain delivery.';
 if(buyer.till<cost)return farm+' cannot cover the $'+cost+' feed invoice.';
 source.stock.grain-=n;source.till+=cost;buyer.till-=cost;
 const run=bookRun(life,'feed','stockfeed',farm,{grain:n},cost);
 if(!run){source.stock.grain+=n;source.till-=cost;buyer.till+=cost;return 'Delivery van unavailable.';}
 return 'Farm paid $'+cost+' for '+n+' grain-feed units; '+run.id+' is en route.';
}
export function orderRegionalIngredients(life){
 const s=ensureLinkedIndustries(life),b=s.brewery,cost=90;
 if(s.regionalOrders.some(o=>o.type==='brewery'&&o.status==='ordered'))return 'Regional ingredient order already in transit.';
 if(b.capital<cost)return 'Brewery has insufficient cash for $'+cost+' regional supplier invoice.';
 b.capital-=cost;
 s.regionalOrders.push({id:'REG-'+String(s.regionalOrders.length+1).padStart(3,'0'),
  type:'brewery',day:life.day,readyDay:life.day+2,status:'ordered',goods:{malt:12,hops:4,yeast:4},cost});
 linkedLog(life,'Paid $'+cost+' for regional brewing ingredients; two-day freight arranged.');
 return 'Regional ingredients paid and due on town day '+(life.day+2)+'.';
}
export function orderVetKits(life){
 const s=ensureLinkedIndustries(life),clinic=life.place('clinic'),cost=60;
 if(s.regionalOrders.some(o=>o.type==='vet'&&o.status==='ordered'))return 'Medical supplies already in transit.';
 if(clinic.till<cost)return 'Clinic needs $'+cost+' from veterinary fees to order eight medical kits.';
 clinic.till-=cost;
 s.regionalOrders.push({id:'REG-'+String(s.regionalOrders.length+1).padStart(3,'0'),
  type:'vet',day:life.day,readyDay:life.day+1,status:'ordered',goods:{kits:8},cost});
 linkedLog(life,'Clinic paid $'+cost+' for eight veterinary kits; one-day courier arranged.');
 return 'Vet kits paid and due on town day '+(life.day+1)+'.';
}
function advanceRegionalOrders(life){
 const s=ensureLinkedIndustries(life),depot=life.place('depot');
 for(const order of s.regionalOrders.filter(x=>x.status==='ordered'&&x.readyDay<=life.day)){
  if(order.type==='brewery')for(const [g,n] of Object.entries(order.goods))depot.out[g]=(depot.out[g]||0)+n;
  if(order.type==='vet')s.vet.stock+=order.goods.kits;
  order.status='delivered';order.deliveredDay=life.day;
  linkedLog(life,order.id+' regional freight received after paid transit time.');
 }
 s.regionalOrders=s.regionalOrders.slice(-30);
}
export function bookStockfeedRestock(life){
 const s=ensureLinkedIndustries(life),shop=life.place('stockfeed'),farm=life.place('silo');
 if(!availableRun(s))return 'Cooperative van occupied.';
 const n=Math.min(16,farm.out.grain||0),cost=n;
 if(n<4)return 'Wheat Farm must produce more grain before wholesale feed restocking.';
 if(shop.till<cost)return 'Stockfeed supplier lacks $'+cost+' wholesale funds.';
 farm.out.grain-=n;farm.till+=cost;shop.till-=cost;
 const run=bookRun(life,'stockfeed','silo','stockfeed',{grain:n},cost);
 if(!run){farm.out.grain+=n;farm.till-=cost;shop.till+=cost;return 'Delivery van unavailable.';}
 return shop.name+' paid $'+cost+' for '+n+' grain and booked real transport '+run.id+'.';
}
export function bookBreweryIngredients(life){
 const s=ensureLinkedIndustries(life),brew=s.brewery,depot=life.place('depot');
 if(!availableRun(s))return 'The cooperative van is still in transit.';
 const goods={malt:6,hops:2,yeast:2},cost=42;
 if(brew.capital<cost)return 'Brewery cannot cover the $'+cost+' invoice.';
 if(Object.entries(goods).some(([g,n])=>(depot.out[g]||0)<n))return 'Rail depot awaiting the next paid regional ingredient consignment.';
 for(const [g,n] of Object.entries(goods))depot.out[g]-=n;
 brew.capital-=cost;depot.till+=cost;
 const run=bookRun(life,'brewery','depot','foundry',goods,cost);
 if(!run){for(const [g,n] of Object.entries(goods))depot.out[g]+=n;brew.capital+=cost;depot.till-=cost;return 'Van unavailable.';}
 return 'Paid regional ingredient invoice and dispatched '+run.id+' to the brewhouse.';
}
export function bookBreweryToPub(life){
 const s=ensureLinkedIndustries(life),brew=s.brewery,pub=life.place('pub');
 if(!availableRun(s))return 'Delivery van is carrying another shipment.';
 if(brew.readyKegs<1)return 'No conditioned kegs are ready; fermentation takes three days.';
 const n=Math.min(brew.readyKegs,2),cost=n*28;
 if(pub.till<cost)return 'Pub till is too low to pay its brewery supplier.';
 brew.readyKegs-=n;brew.capital+=cost;pub.till-=cost;
 const run=bookRun(life,'pub','foundry','pub',{kegs:n},cost);
 if(!run){brew.readyKegs+=n;brew.capital-=cost;pub.till+=cost;return 'Van unavailable.';}
 return 'Existing pub purchased '+n+' 50 L kegs for $'+cost+'; '+run.id+' en route to its cellar.';
}
export function reportFarmIllness(life,farm,animalId){
 const s=ensureLinkedIndustries(life),animal=s.herds[farm]?.find(a=>a.id===animalId);
 if(!animal||!animal.alive)return 'Living farm animal not found.';
 if(animal.caseId)return 'Already awaiting veterinary care: '+animal.caseId+'.';
 animal.health=Math.min(animal.health,50);animal.isolated=true;
 const c={id:'VET-'+String(s.cases.length+1).padStart(4,'0'),farm,animalId,
  status:'reported',cost:34,examMinutes:0,openedDay:life.day,finishedDay:null};
 s.cases.push(c);animal.caseId=c.id;
 linkedLog(life,c.id+': '+animalId+' isolated; on-call vet requested at '+life.place(farm).name+'.');
 return 'Isolated '+animalId+' and requested on-farm visit '+c.id+'.';
}
export function animalHealthFactor(life,farm){
 const herd=ensureLinkedIndustries(life).herds[farm];if(!herd)return 1;
 return herd.filter(a=>a.alive&&!a.isolated&&a.fed&&a.watered&&a.health>=60).length/herd.length;
}
function animalCareDay(life){
 const s=ensureLinkedIndustries(life);
 if(s.careDay===life.day)return;
 s.careDay=life.day;
 for(const [farm,herd] of Object.entries(s.herds)){
  const fed=s.feed[farm]>=3,watered=life.civic.supply.waterOk!==false;
  if(fed)s.feed[farm]-=3;
  for(const a of herd){if(!a.alive)continue;a.fed=fed;a.watered=watered;
   a.health=clamp(a.health+(fed&&watered?1.7:-5));
   if(a.health<60&&!a.caseId)reportFarmIllness(life,farm,a.id);}
 }
}
function progressVet(life,minutes){
 const s=ensureLinkedIndustries(life),v=s.vet;
 const shift=life.minute>=480&&life.minute<1020&&!['Saturday','Sunday'].includes(life.weekday())&&life.villagers.some(w=>w.work==='vet'&&w.step?.kind==='work'&&!w.path?.length);
 if(v.status==='at clinic'&&shift){
  const c=s.cases.find(c=>c.status==='reported');
  if(c){const from=life.place('vet').front,to=life.place(c.farm).front;
   v.status='travelling';v.activeCase=c.id;v.from={...from};v.to={...to};
   v.totalTravel=Math.max(5,Math.hypot(to.x-from.x,to.z-from.z)/(1.4*3));
   v.travelMinutes=v.totalTravel;c.status='travelling';linkedLog(life,v.name+' walking to treat '+c.animalId+'.');}
 }
 if(v.status==='travelling'){
  v.travelMinutes=Math.max(0,v.travelMinutes-minutes);
  if(!v.travelMinutes){v.status='examining';const c=s.cases.find(c=>c.id===v.activeCase);if(c)c.status='examining';}
 }else if(v.status==='examining'){
  const c=s.cases.find(c=>c.id===v.activeCase);if(!c){v.status='at clinic';return;}
  c.examMinutes+=minutes;
  if(c.examMinutes<25)return;
  const farm=life.place(c.farm),animal=s.herds[c.farm]?.find(a=>a.id===c.animalId);
  if(v.stock<1){c.status='waiting-for-kit';return;}
  if(farm.till<c.cost){c.status='waiting-for-payment';return;}
  farm.till-=c.cost;life.place('vet').till+=c.cost;v.stock--;v.receipts+=c.cost;
  animal.health=Math.max(74,animal.health);animal.isolated=false;animal.caseId=null;
  c.status='treated';c.finishedDay=life.day;s.visits.push({caseId:c.id,day:life.day,cost:c.cost});
  linkedLog(life,v.name+' treated '+animal.id+'; farm paid the clinic $'+c.cost+'.');
  v.status='returning';v.travelMinutes=v.totalTravel;v.from={...v.to};v.to={...life.place('vet').front};
 }
 if(v.status==='returning'){
  v.travelMinutes=Math.max(0,v.travelMinutes-minutes);
  if(!v.travelMinutes){v.status='at clinic';v.activeCase=null;v.from=null;v.to=null;}
 }
}
function progressRuns(life,minutes){
 const s=ensureLinkedIndustries(life);
 for(const r of s.supplyRuns.filter(x=>x.status==='in-transit')){
  r.elapsed=Math.min(r.duration,r.elapsed+minutes);
  const from=life.place(r.from).curb,to=life.place(r.to).curb,f=r.elapsed/r.duration;
  r.x=from.x+(to.x-from.x)*f;r.z=from.z+(to.z-from.z)*f;
  if(f<1)continue;
  r.status='delivered';r.deliveredDay=life.day;
  if(r.kind==='building')for(const [g,n] of Object.entries(r.goods))s.site.stock[g]=(s.site.stock[g]||0)+n;
  if(r.kind==='feed')s.feed[r.to]+=r.goods.grain;
  if(r.kind==='stockfeed')life.place('stockfeed').stock.grain=(life.place('stockfeed').stock.grain||0)+r.goods.grain;
  if(r.kind==='brewery')for(const [g,n] of Object.entries(r.goods))s.brewery.stock[g]=(s.brewery.stock[g]||0)+n;
  if(r.kind==='pub'){pubVenue(life).beerDepotL+=r.goods.kegs*50;s.brewery.deliveredKegs+=r.goods.kegs;}
  linkedLog(life,r.id+' delivered and recorded '+JSON.stringify(r.goods)+' to '+life.place(r.to).name+'.');
 }
}
function advanceBrewery(life){
 const s=ensureLinkedIndustries(life),b=s.brewery;
 if(!life.gridPowered('industry')||life.civic.supply.waterOk===false)return;
 const staffed=life.villagers.some(v=>v.work==='foundry'&&v.step?.kind==='work'&&!v.path?.length);
 if(!staffed)return;
 for(const batch of b.batches.filter(x=>x.status==='fermenting'&&x.readyDay<=life.day)){
  batch.status='conditioned';b.readyKegs+=3;linkedLog(life,batch.id+' conditioned three 50 L kegs after three days.');}
 if(life.minute<600||life.minute>=660||b.lastBrewDay===life.day||b.batches.filter(x=>x.status==='fermenting').length>=2)return;
 if(!Object.entries({malt:3,hops:1,yeast:1}).every(([g,n])=>b.stock[g]>=n))return;
 for(const [g,n] of Object.entries({malt:3,hops:1,yeast:1}))b.stock[g]-=n;
 b.lastBrewDay=life.day;const batch={id:'BREW-'+String(b.batches.length+1).padStart(4,'0'),day:life.day,readyDay:life.day+3,status:'fermenting'};
 b.batches.push(batch);linkedLog(life,batch.id+' started; ingredients consumed, three-day fermentation.');
}
function advanceSite(life,minutes){
 const s=ensureLinkedIndustries(life),site=s.site,stage=INDUSTRY_STAGES[site.stage];
 if(!stage||!life.open(life.place('trades')))return;
 const builder=TRADE_STAFF.find(x=>x.trade==='building'&&x.qualified);
 const staffed=life.villagers.some(v=>v.work==='trades'&&v.step?.kind==='work'&&!v.path?.length);
 if(!builder||!staffed||!life.gridPowered('industry'))return;
 if(!Object.entries(stage.needs).every(([g,n])=>(site.stock[g]||0)>=n))return;
 if(site.progress===0){for(const [g,n] of Object.entries(stage.needs))site.stock[g]-=n;linkedLog(life,builder.name+' started '+stage.name+' at the cooperative site.');}
 site.progress+=minutes;
 if(site.progress<stage.minutes)return;
 site.inspections.push({stage:stage.name,day:life.day,inspector:builder.name});
 site.stage++;site.progress=0;
 linkedLog(life,stage.name+' inspection completed by '+builder.name+'.');
 if(site.stage===INDUSTRY_STAGES.length){site.completedDay=life.day;linkedLog(life,'Farm cooperative extension commissioned.');}
}
export function tickLinkedIndustries(life,minutes){
 const s=ensureLinkedIndustries(life);
 if(!Number.isFinite(minutes)||minutes<=0)return;
 animalCareDay(life);advanceRegionalOrders(life);progressRuns(life,minutes);progressVet(life,minutes);
 // Farm feed is automatically ordered against finite silo grain and farm cash.
 // The same single delivery van must complete each journey before the next one.
 if(life.minute>=480&&life.minute<1020&&availableRun(s)&&(life.place('stockfeed').stock.grain||0)<9)bookStockfeedRestock(life);
 if(life.minute>=480&&life.minute<1020&&availableRun(s))for(const farm of Object.keys(INDUSTRY_FARMS)){
  if(s.feed[farm]<6 && (life.place(farm).till||0)>=6 && (life.place('stockfeed').stock.grain||0)>=3){
   bookFeedRun(life,farm);break;
  }
 }
 advanceBrewery(life);advanceSite(life,minutes);
}
export function industryReport(life){
 const s=ensureLinkedIndustries(life);
 return {version:s.version,farms:Object.fromEntries(Object.entries(s.herds).map(([id,herd])=>
  [id,{count:herd.length,healthy:herd.filter(a=>a.alive&&a.health>=60&&!a.isolated).length,
   fed:s.feed[id],cases:s.cases.filter(c=>c.farm===id&&c.status!=='treated')} ])),
  cases:s.cases.slice(-12),visits:s.visits.slice(-12),vet:{...s.vet},
  brewery:{...s.brewery,batches:s.brewery.batches.slice(-8)},site:{...s.site},
  runs:s.supplyRuns.slice(-12),regionalOrders:s.regionalOrders.slice(-12),log:s.log.slice(0,14),hardwareStock:{...initialiseTradeEducation(life).stock}};
}
