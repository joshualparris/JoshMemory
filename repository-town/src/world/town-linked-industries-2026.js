// Fictional Repository Town links: finite farm care, real vet assignment,
// regional brewing, hardware-paid construction and the existing licensed pub.
// Regional contractors are NOT new resident IDs; original saves stay intact.
import {initialiseTradeEducation, TRADE_STAFF, HARDWARE} from './trade-education.js';
import {pubVenue} from './pub-venue.js';
export const INDUSTRY_STAGES=Object.freeze(['foundation','framing','services','roof','commissioned']);
export const INDUSTRY_REQUIREMENTS=Object.freeze([
 {cement:3},{timber:5,fasteners:4},{cable:2,pipe:2},{timber:3,paint:2,fasteners:2}
]);
export const HERDS=Object.freeze({sheep:['sheep',12],dairy:['cow',7],coop:['hen',16]});
const RECIPE=Object.freeze({malt:3,hops:1,yeast:1}),COST={feed:2,medkit:12,malt:5,hops:7,yeast:6};
const log=(t,message)=>{const s=industryState(t);s.log.unshift({day:t.day,minute:t.minute,message});s.log.length=Math.min(70,s.log.length);t.log(message);};
export function industryState(t){
 t.civic ||= {};
 return t.civic.linkedIndustries ||= {
   version:1,bootstrapped:false,next:1,feedDay:0,shipments:[],batches:[],cases:[],log:[],
   herds:Object.fromEntries(Object.entries(HERDS).map(([id,[species,n]])=>
     [id,Array.from({length:n},(_,i)=>({id:id+'-'+String(i+1).padStart(2,'0'),
       species,health:90+i%8,alive:true,isolated:false,fed:true,watered:true,caseId:null}))])),
   project:{id:'WORKS-01',name:'Farm cooperative workshop extension',stage:0,hours:0,
     commissionedDay:null,inspections:[],builder:'Noah Reed'},
   vetContract:{name:'Dr Samira Grant',status:'available',farm:null}
 };
}
export function validIndustryState(s){
 if(!s||s.version!==1||typeof s.bootstrapped!=='boolean'||
    !Number.isInteger(s.next)||s.next<1||s.next>100000||
    !Number.isInteger(s.feedDay)||s.feedDay<0||
    !Array.isArray(s.log)||s.log.length>70||
    !Array.isArray(s.shipments)||s.shipments.length>100||
    !Array.isArray(s.batches)||s.batches.length>100||
    !Array.isArray(s.cases)||s.cases.length>100||
    !s.project||!Number.isInteger(s.project.stage)||s.project.stage<0||s.project.stage>4||
    !Number.isInteger(s.project.hours)||s.project.hours<0||s.project.hours>1||
    !s.herds||!s.vetContract||!['available','travelling','examining'].includes(s.vetContract.status))return false;
 for(const [farm,[species,n]] of Object.entries(HERDS)){
  const a=s.herds[farm];
  if(!Array.isArray(a)||a.length!==n||!a.every((x,i)=>x.id===farm+'-'+String(i+1).padStart(2,'0')&&
       x.species===species&&Number.isFinite(x.health)&&x.health>=0&&x.health<=100&&
       typeof x.alive==='boolean'&&typeof x.isolated==='boolean'))return false;
 }
 return s.shipments.every(x=>x&&['transit','delivered'].includes(x.status)&&Number.isFinite(x.minutes)&&x.minutes>=0&&x.minutes<=120&&Number.isInteger(x.qty)&&x.qty>=1&&x.qty<=100)&&
 s.batches.every(x=>x&&['fermenting','conditioned'].includes(x.status)&&Number.isInteger(x.readyDay));
}
export function initIndustries(t){
 const s=industryState(t);if(s.bootstrapped)return s;
 const brew=t.place('brewery'),build=t.place('buildsite'),vet=t.place('vet');
 if(!brew||!build||!vet)throw Error('Industry sites must have real walkable plots');
 for(const [p,capital] of [[brew,500],[build,1050],[vet,100]])p.till+=capital;
 brew.stock={...brew.stock,malt:3,hops:1,yeast:1};brew.out.keg50=0;
 build.stock={...build.stock,cement:0,timber:0,fasteners:0,cable:0,pipe:0,paint:0};
 vet.stock.medkit=3;
 for(const farm of Object.keys(HERDS)){t.place(farm).stock.feed=12;t.place(farm).till+=80;}
 Object.assign(t.place('depot').out,{feed:36,medkit:8,malt:12,hops:6,yeast:6});
 s.bootstrapped=true;
 log(t,'Regional investors supplied finite opening capital and farm/brewery stock.');
 return s;
}
export function herdReport(t,farm){return (industryState(t).herds[farm]||[]).map(x=>({...x}));}
export function herdYield(t,farm){
 const animals=industryState(t).herds[farm];
 return animals?animals.filter(a=>a.alive&&!a.isolated&&a.fed&&a.watered&&a.health>=60).length/animals.length:1;
}
export function requestVet(t,farm,animalId){
 const s=industryState(t),animal=s.herds[farm]?.find(x=>x.id===animalId);
 if(!animal||!animal.alive)return 'Animal not in the living herd.';
 if(animal.caseId)return 'Existing veterinary case '+animal.caseId+'.';
 const id='VET-'+String(s.next++).padStart(5,'0');
 animal.isolated=true;animal.health=Math.min(45,animal.health);animal.caseId=id;
 s.cases.push({id,farm,animalId,openedDay:t.day,status:'reported',travel:0,exam:0,cost:34});
 s.cases=s.cases.slice(-100);log(t,id+' opened: '+animalId+' isolated awaiting veterinary treatment.');
 return 'Veterinary case '+id+' opened; animal isolated.';
}
export function industryDay(t){
 const s=industryState(t);if(s.feedDay===t.day)return;s.feedDay=t.day;
 for(const [farm,animals] of Object.entries(s.herds)){
  const p=t.place(farm),fed=(p.stock.feed||0)>=3,water=!!t.civic.supply.waterOk;
  if(fed)p.stock.feed-=3;
  for(const a of animals){
   if(!a.alive)continue;
   a.fed=fed;a.watered=water;a.health=Math.max(0,Math.min(100,a.health+(fed&&water?1:-4)));
   if(a.health<60&&!a.caseId)requestVet(t,farm,a.id);
  }
 }
}
function shipment(t,from,to,item,qty,minutes,cost=0,contents=null){
 const s=industryState(t),origin=t.place(from),target=t.place(to);
 if(!origin||!target||qty<1||qty>100||target.till<cost)return false;
 if(!contents&&(origin.out[item]||0)<qty)return false;
 // Depot imports are external purchases (cash leaves town); Hardware sales
 // go into the existing tradeEducation.hardwareCash below; only a brewery
 // transfer puts revenue in a local producer's till. Never double-count it.
 target.till-=cost;if(from==='brewery')origin.till+=cost;
 if(!contents)origin.out[item]-=qty;
 s.shipments.push({id:'SHIP-'+String(s.next++).padStart(5,'0'),from,to,item,qty,minutes,cost,contents,
  status:'transit',createdDay:t.day});
 s.shipments=s.shipments.slice(-100);
 log(t,qty+' '+item+' dispatched by scheduled road freight from '+origin.name+' to '+target.name+'.');
 return true;
}
function supply(t,to,item,qty){
 const dest=t.place(to),depot=t.place('depot'),cost=COST[item]*qty,s=industryState(t);
 if(!COST[item]||dest.till<cost||(depot.out[item]||0)<qty||
   s.shipments.some(x=>x.to===to&&x.item===item&&x.status==='transit'))return false;
 return shipment(t,'depot',to,item,qty,45,cost);
}
export function industryMinute(t,minutes){
 const s=industryState(t);if(!(minutes>0))return;
 for(const x of s.shipments){
  if(x.status!=='transit')continue;
  x.minutes=Math.max(0,x.minutes-minutes);
  if(x.minutes>0)continue;
  if(x.to==='pub'&&x.item==='keg50'){
   pubVenue(t).beerDepotL+=x.qty*50;
  }else if(x.contents){
   for(const [g,n] of Object.entries(x.contents))t.place(x.to).stock[g]=(t.place(x.to).stock[g]||0)+n;
  }else t.place(x.to).stock[x.item]=(t.place(x.to).stock[x.item]||0)+x.qty;
  x.status='delivered';x.deliveredDay=t.day;
  log(t,x.id+' delivered '+x.qty+' '+x.item+' to '+t.place(x.to).name+'.');
 }
 // The existing "vet" worker is a nurse, NOT a veterinarian. She coordinates
 // a separately contracted fictional qualified visiting surgeon, travelling
 // 30 game minutes followed by an actual 25-minute farm examination.
 const nurse=t.villagers.find(v=>v.work==='vet'&&v.step?.kind==='work'&&!v.path.length);
 const surgeon=s.vetContract;
 let active=s.cases.find(c=>['travelling','examining'].includes(c.status));
 if(!active&&surgeon.status==='available'&&nurse&&t.minute>=8*60&&t.minute<16*60){
  const pending=s.cases.find(c=>c.status==='reported');
  if(pending&&t.place('vet').stock.medkit>=1&&t.place(pending.farm).till>=pending.cost){
   pending.status='travelling';pending.travel=30;surgeon.status='travelling';surgeon.farm=pending.farm;
   active=pending;log(t,nurse.name+' dispatched '+surgeon.name+' to '+pending.farm+'.');
  }
 }
 if(!active)return;
 if(active.status==='travelling'){
  active.travel=Math.max(0,active.travel-minutes);
  if(active.travel>0)return;
  active.status='examining';surgeon.status='examining';log(t,surgeon.name+' arrived at '+active.farm+'.');return;
 }
 active.exam+=minutes;if(active.exam<25)return;
 const farm=t.place(active.farm),clinic=t.place('vet'),animal=s.herds[active.farm]?.find(x=>x.id===active.animalId);
 if(!animal?.alive){active.status='closed';surgeon.status='available';surgeon.farm=null;return;}
 if(clinic.stock.medkit<1||farm.till<active.cost){
  active.status='reported';surgeon.status='available';surgeon.farm=null;return;
 }
 clinic.stock.medkit--;farm.till-=active.cost;clinic.till+=active.cost;
 animal.health=Math.max(75,animal.health);animal.isolated=false;animal.caseId=null;
 active.status='treated';active.treatedDay=t.day;
 surgeon.status='available';surgeon.farm=null;
 log(t,surgeon.name+' treated '+animal.id+' (paid veterinary kit and farm invoice).');
}
export function crewPresent(t,site){
 const h=Math.floor(t.minute/60);
 return ['brewery','buildsite'].includes(site)&&h>=8&&h<16&&t.open(t.place(site))&&
  t.place(site).till>=12;
}
export function industryHour(t,h){
 const s=industryState(t),brew=t.place('brewery'),build=t.place('buildsite');
 if(h===7){
  for(const farm of Object.keys(HERDS))if((t.place(farm).stock.feed||0)<5)supply(t,farm,'feed',9);
  if((t.place('vet').stock.medkit||0)<2)supply(t,'vet','medkit',3);
  for(const [item,n] of Object.entries(RECIPE))if((brew.stock[item]||0)<n)supply(t,'brewery',item,n*3);
 }
 if(crewPresent(t,'brewery')&&t.gridPowered('industry')&&t.civic.supply.waterOk){
  brew.till-=12; // regional contractor hour, paid from actual business float
  for(const b of s.batches.filter(x=>x.status==='fermenting'&&x.readyDay<=t.day)){
   b.status='conditioned';b.finishedDay=t.day;
   brew.out.keg50=(brew.out.keg50||0)+b.kegs;
   log(t,b.id+' conditioned: '+b.kegs+' genuine-in-game 50 L kegs.');
  }
  if(h===10&&s.batches.filter(x=>x.status==='fermenting').length<2&&
    Object.entries(RECIPE).every(([g,n])=>(brew.stock[g]||0)>=n)){
   for(const [g,n] of Object.entries(RECIPE))brew.stock[g]-=n;
   const b={id:'BREW-'+String(s.next++).padStart(5,'0'),createdDay:t.day,readyDay:t.day+3,
    status:'fermenting',kegs:3,recipe:{...RECIPE}};
   s.batches.push(b);s.batches=s.batches.slice(-100);
   log(t,b.id+' started from paid malt, hops and yeast; condition after three days.');
  }
 }
 // No bypass of the existing adult/RSA/pour safety controls: a local keg
 // only increases the existing pub's finite brewery-depot stock on arrival.
 if(brew.out.keg50>0&&t.place('pub').till>=60&&
   !s.shipments.some(x=>x.to==='pub'&&x.status==='transit'))
  shipment(t,'brewery','pub','keg50',1,60,60);
 if(!crewPresent(t,'buildsite')||!t.gridPowered('industry')||s.project.stage>=4)return;
 build.till-=12; // builder wage
 const req=INDUSTRY_REQUIREMENTS[s.project.stage];
 if(!Object.entries(req).every(([g,n])=>(build.stock[g]||0)>=n)){
  if(s.shipments.some(x=>x.to==='buildsite'&&x.status==='transit'))return;
  const trade=initialiseTradeEducation(t);
  const cost=Object.entries(req).reduce((sum,[g,n])=>sum+(HARDWARE[g]?.price??Infinity)*n,0);
  if(!Number.isFinite(cost)||build.till<cost||
      !Object.entries(req).every(([g,n])=>(trade.stock[g]||0)>=n))return;
  for(const [g,n] of Object.entries(req)){trade.stock[g]-=n;trade.hardwareCash+=HARDWARE[g].price*n;}
  // A recorded 45-minute material trip is deliberately labelled a timed
  // logistics abstraction, NOT an animated vehicle or verified road route.
  shipment(t,'hardware','buildsite','stage-materials',1,45,cost,{...req});return;
 }
 const builder=TRADE_STAFF.find(v=>v.trade==='building'&&v.qualified);
 const busy=t.civic.tradeEducation?.orders?.some(o=>o.worker===builder?.id&&
     ['assigned','in-transit','working','inspecting'].includes(o.status));
 if(!builder||busy)return;
 if(s.project.hours===0){
  for(const [g,n] of Object.entries(req))build.stock[g]-=n;
  log(t,builder.name+' began paid '+INDUSTRY_STAGES[s.project.stage]+' stage.');
 }
 s.project.hours++;
 if(s.project.hours===2){
  s.project.inspections.push({stage:INDUSTRY_STAGES[s.project.stage],day:t.day,
    reviewer:builder.name,result:'passed-fictional-scenario'});
  s.project.stage++;s.project.hours=0;
  log(t,'Stage inspection recorded: '+INDUSTRY_STAGES[s.project.stage-1]+' complete.');
  if(s.project.stage===4)s.project.commissionedDay=t.day;
 }
}
export function industryReport(t){
 const s=industryState(t);
 return {project:{...s.project},herds:Object.fromEntries(Object.keys(HERDS).map(id=>
  [id,{total:s.herds[id].length,healthy:s.herds[id].filter(a=>a.alive&&!a.isolated&&a.health>=60).length,
    isolated:s.herds[id].filter(a=>a.isolated).length}])),
  cases:s.cases.slice(-10),batches:s.batches.slice(-10),shipments:s.shipments.slice(-10),
  breweryStock:{...t.place('brewery').stock},breweryOutput:{...t.place('brewery').out},
  constructionMaterials:{...t.place('buildsite').stock},pubBeerDepotL:pubVenue(t).beerDepotL,
  visitingCrew:[{name:'Maya Ellis',at:'brewery',onSite:crewPresent(t,'brewery')},
    {name:'Noah Reed',at:'buildsite',onSite:crewPresent(t,'buildsite')},
    {name:s.vetContract.name,at:s.vetContract.farm,onSite:s.vetContract.status==='examining'}],
  log:s.log.slice(0,12)};
}
