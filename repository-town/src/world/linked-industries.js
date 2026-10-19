// Connected local industries: actual material shipments, timed construction,
// fermentation batches, retail drinks and supplier-funded inventory.
const INGREDIENTS={malt:3,hops:1,yeast:1};
const MATERIALS=[['cement',3],['timber',5],['hardware',3],['metal',2]];
export const BUILD_STAGES=['foundation','framing','services','roof','commissioned'];
const PRODUCTS={feed:2,medkit:15,timber:12,cement:9,hardware:7,metal:12,malt:5,hops:7,yeast:6,beerKeg:72,soda:3};
function entry(t,text){
 t.industries.log.unshift({day:t.day,minute:Math.floor(t.minute),text});
 t.industries.log.length=Math.min(150,t.industries.log.length);
 t.log(text);
}
export function initialiseIndustries(t){
 if(!t.industries)t.industries={};
 const s=t.industries;
 s.log ||= [];s.imports ||= [];s.batches ||= [];s.drinks ||= [];
 s.project ||= {id:'WORKS-01',name:'Farm cooperative workshop extension',stage:0,
  progress:0,materialsPaid:0,startedDay:t.day,finishedDay:null,
  contract:{owner:'Farm cooperative',builder:'Bluey',externalCapital:440}};
 if(s.initialised)return s;
 // Each capital injection is explicitly accounted for as outside investment.
 for(const [id,capital] of [['hardware',420],['brewery',310],['pub',140],['buildsite',440],['vet',180]]){
   t.place(id).till+=capital;
   s.imports.push({day:t.day,business:id,type:'regional-investment',amount:capital});
 }
 Object.assign(t.place('pub').stock,{beerKeg:2,soda:8});
 Object.assign(t.place('depot').out,{beerKeg:4,soda:15,feed:32,medkit:8,
   malt:9,hops:4,yeast:4,timber:10,cement:8,hardware:7,metal:6});
 for(const id of ['sheep','dairy','coop']){
   const p=t.place(id);p.stock.feed=15;p.target={...(p.target||{}),feed:16};
 }
 t.place('vet').stock.medkit=3;
 t.place('brewery').stock={malt:3,hops:1,yeast:1};t.place('brewery').out={beerKeg:0};
 t.place('hardware').stock={timber:3,cement:2,hardware:2,metal:1};
 t.place('hardware').out={};
 t.place('buildsite').stock={timber:0,cement:0,hardware:0,metal:0};
 s.initialised=true;
 entry(t,'Regional investors supplied startup capital and initial commercial inventory.');
 return s;
}
export function regionalImports(t){
 const s=initialiseIndustries(t),depot=t.place('depot');
 const contracts=[
  ['feed','sheep',12,1],['medkit','vet',4,12],
  ['timber','hardware',6,7],['cement','hardware',5,6],['hardware','hardware',5,4],['metal','hardware',4,7],
  ['malt','brewery',7,3],['hops','brewery',4,5],['yeast','brewery',4,3],
  ['beerKeg','pub',3,38],['soda','pub',10,2]
 ];
 for(const [good,business,quantity,unitCost] of contracts){
   const shop=t.place(business);
   if(!shop|| (depot.out[good]||0)>quantity*2 || shop.till<quantity*unitCost)continue;
   // Purchases are not free: each incoming shipment has an invoice.
   shop.till-=quantity*unitCost;depot.out[good]=(depot.out[good]||0)+quantity;
   s.imports.push({day:t.day,business,good,quantity,unitCost,total:quantity*unitCost});
 }
 s.imports=s.imports.slice(-100);
}
export function productionHour(t,h,at){
 const s=initialiseIndustries(t),brew=t.place('brewery'),hw=t.place('hardware'),site=t.place('buildsite');
 if(h===7)regionalImports(t);
 // Stock travels by the town's actual delivery trucks: hardware inventory
 // is made available at wholesale only when a staffed business has stock.
 if(at('hardware').length&&!s.project.finishedDay)
   for(const [good] of MATERIALS){
     const want=Math.max(0,(site.target[good]||0)-(site.stock[good]||0)-(hw.out[good]||0));
     const n=Math.min(want,hw.stock[good]||0);
     if(n>0){hw.stock[good]-=n;hw.out[good]=(hw.out[good]||0)+n;}
   }
 // Brewery consumes real materials, electricity and clean water; batch matures
 // for three in-game days, not a single tick.
 if(at('brewery').length&&t.open(brew)&&t.gridPowered('industry')&&t.civic.supply.waterOk){
   for(const batch of s.batches.filter(x=>x.status==='fermenting'&&x.readyDay<=t.day)){
     batch.status='conditioned';batch.finishedDay=t.day;
     brew.out.beerKeg=(brew.out.beerKeg||0)+3;
     entry(t,'Three conditioned kegs from '+batch.id+' are available to freight.');
   }
   if(h===10&&s.batches.filter(x=>x.status==='fermenting').length<2&&
      Object.entries(INGREDIENTS).every(([g,n])=>(brew.stock[g]||0)>=n)){
     for(const [g,n] of Object.entries(INGREDIENTS))brew.stock[g]-=n;
     const batch={id:'BREW-'+String(s.batches.length+1).padStart(4,'0'),
       createdDay:t.day,readyDay:t.day+3,status:'fermenting',
       recipe:{...INGREDIENTS},kegs:3};
     s.batches.push(batch);entry(t,'Brewer started '+batch.id+' (three-day fermentation).');
   }
 }
 // Named builder must physically reach the safe work site during shift.
 const builder=t.villagers.find(v=>v.job==='builder'&&v.work==='buildsite');
 if(builder?.step?.kind==='work'&&!builder.path.length&&t.open(site)&&t.gridPowered('industry')&&s.project.stage<4){
   const [good,n]=MATERIALS[s.project.stage];
   if((site.stock[good]||0)>=n){
     if(s.project.progress===0){site.stock[good]-=n;entry(t,'Builder started '+BUILD_STAGES[s.project.stage]+' using '+n+' '+good+'.');}
     s.project.progress+=60;
     if(s.project.progress>=120){
       s.project.stage++;s.project.progress=0;
       entry(t,'Worksite passed '+BUILD_STAGES[s.project.stage-1]+' inspection.');
       if(s.project.stage===4){s.project.finishedDay=t.day;entry(t,'Workshop extension was commissioned and is now usable.');}
     }
   }
 }
}
export function serveDrink(t,customer,kind='soda'){
 const pub=t.place('pub'),s=initialiseIndustries(t);
 if(!t.open(pub))return 'The public house is closed.';
 if(!t.villagers.some(v=>v.work==='pub'&&v.step?.kind==='work'&&!v.path.length))return 'No publican is on duty.';
 const alcohol=kind==='beer',good=alcohol?'beerKeg':'soda',price=alcohol?8:4;
 if(!['beer','soda'].includes(kind))return 'Drink unavailable.';
 if(alcohol&&(customer.job==='student'||customer.age<18))return 'Alcohol service is for eligible adults only.';
 if(customer.alcoholPreference==='none'&&alcohol)return 'This resident prefers not to drink alcohol.';
 if(customer.wallet<price)return 'Insufficient wallet balance.';
 if(alcohol){
   if(!pub.openKegServes){
     if(!(pub.stock.beerKeg>0))return 'The public house has run out of beer kegs.';
     pub.stock.beerKeg--;pub.openKegServes=10;
   }
   pub.openKegServes--;
 }else{
   if(!(pub.stock.soda>0))return 'The public house has run out of soft drinks.';
   pub.stock.soda--;
 }
 customer.wallet-=price;t.sale(pub,price);
 s.drinks.push({day:t.day,minute:Math.floor(t.minute),customer:customer.name||'Visitor',
   kind,price,stockKind:good});
 s.drinks=s.drinks.slice(-100);t.rubbish(.25);
 return (customer.name||'Visitor')+' bought '+(alcohol?'one served beer':'a soft drink')+' for $'+price+'.';
}
export function industrySummary(t){
 const s=initialiseIndustries(t);
 return {project:{...s.project},batches:s.batches.slice(-8),drinks:s.drinks.slice(-12),
   imports:s.imports.slice(-12),log:s.log.slice(0,12),
   beerKegs:t.place('pub').stock.beerKeg||0,openKegServes:t.place('pub').openKegServes||0,
   hardwareStock:{...t.place('hardware').stock},buildMaterials:{...t.place('buildsite').stock}};
}
