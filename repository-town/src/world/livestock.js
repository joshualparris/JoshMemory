// Stateful farm animals and realistic small-town on-call veterinary work.
// Renderer reads these animal IDs; farm outputs depend on living eligible animals.
const HERDS={sheep:['sheep',12],dairy:['cow',7],coop:['hen',16]};
const clamp=v=>Math.max(0,Math.min(100,v));
export const FARM_ANIMAL_SITES=Object.keys(HERDS);
export function initialiseLivestock(t){
 if(!t.industries)t.industries={};
 if(!t.industries.herds){
   t.industries.herds=Object.fromEntries(Object.entries(HERDS).map(([farm,[species,count]])=>
     [farm,Array.from({length:count},(_,i)=>({id:farm+'-'+String(i+1).padStart(2,'0'),species,
       health:88+(i%10),fed:true,watered:true,isolated:false,caseId:null,age:2+(i%5),alive:true}))]));
 }
 for(const [farm,animals] of Object.entries(t.industries.herds))t.place(farm).animals=animals;
 t.industries.vetCases ||= [];
 t.industries.vetVisits ||= [];
 t.industries.animalFeedDay ||= 0;
 return t.industries.herds;
}
export function animalCareDay(t){
 initialiseLivestock(t);
 const s=t.industries;
 if(s.animalFeedDay===t.day)return;
 s.animalFeedDay=t.day;
 for(const [farm,animals] of Object.entries(s.herds)){
   const p=t.place(farm),water=!!t.civic.supply.waterOk;
   // One feed pallet per herd per day, in addition to grazing.
   const fed=(p.stock.feed||0)>=1;
   if(fed)p.stock.feed-=1;
   for(const a of animals){
     if(!a.alive)continue;
     a.fed=fed;a.watered=water;
     a.health=clamp(a.health+(fed&&water?1.7:-5));
     // Infrequent mild illness; serious biosecurity remains a separate escalation.
     if(a.health>=70 && t.rand()<0.003)a.health=43;
     if(a.health<60&&!a.caseId)reportSickAnimal(t,farm,a.id);
   }
 }
}
export function reportSickAnimal(t,farm,animalId){
 initialiseLivestock(t);
 const a=t.industries.herds[farm]?.find(x=>x.id===animalId);
 if(!a||!a.alive)return 'Animal not found in the living herd.';
 if(a.caseId)return 'Existing veterinary case '+a.caseId+'.';
 a.health=Math.min(a.health,50);a.isolated=true;
 const id='VET-'+String(t.industries.vetCases.length+1).padStart(4,'0');
 a.caseId=id;
 t.industries.vetCases.push({id,farm,animalId,openedDay:t.day,status:'reported',
   vetId:null,examMinutes:0,cost:34,treatedDay:null});
 t.log('Farm welfare report: '+animalId+' needs a veterinary visit (case '+id+').');
 return 'Veterinary welfare case '+id+' opened; the animal is isolated pending assessment.';
}
export function animalProductionFactor(t,farm){
 const animals=initialiseLivestock(t)[farm];
 if(!animals)return 1;
 return animals.filter(a=>a.alive&&!a.isolated&&a.health>=60&&a.fed&&a.watered).length/animals.length;
}
export function livestockMinute(t,minutes){
 initialiseLivestock(t);
 const vet=t.villagers.find(v=>v.job==='veterinarian'&&v.work==='vet');
 if(!vet)return;
 for(const c of t.industries.vetCases){
   if(['treated','biosecurity-hold'].includes(c.status))continue;
   const animal=t.industries.herds[c.farm]?.find(a=>a.id===c.animalId);
   if(!animal||!animal.alive){c.status='closed';continue;}
   if(t.minute<vet.start||t.minute>=vet.end)continue;
   if(c.status==='reported' || c.status==='waiting-for-vet'){
     if(vet.path.length||vet.step?.kind==='veterinary-visit')continue;
     c.vetId=vet.id;c.status='travelling';
     const farm=t.place(c.farm);
     t.goThen(vet,farm.front,{kind:'veterinary-visit',at:c.farm,
       until:vet.end,activity:'examining '+c.animalId+' at '+farm.name});
     t.log(vet.name+' travelled to '+farm.name+' for case '+c.id+'.');
   }
   if(c.vetId!==vet.id||vet.path.length||vet.step?.kind!=='veterinary-visit')continue;
   c.status='examining';c.examMinutes+=minutes;
   if(c.examMinutes<25)continue;
   const clinic=t.place('vet'),farm=t.place(c.farm);
   if((clinic.stock.medkit||0)<1){c.status='waiting-for-supplies';continue;}
   if(farm.till<c.cost){c.status='waiting-for-payment';continue;}
   clinic.stock.medkit--;farm.till-=c.cost;clinic.till+=c.cost;
   animal.health=Math.max(74,animal.health);animal.isolated=false;animal.caseId=null;
   c.status='treated';c.treatedDay=t.day;
   t.industries.vetVisits.push({caseId:c.id,vet:vet.name,day:t.day,cost:c.cost});
   t.log(vet.name+' treated '+animal.id+' at '+farm.name+' ($'+c.cost+', one veterinary kit).');
   vet.step=null;vet.path=[];
 }
}
export function herdReport(t,farm){
 return (initialiseLivestock(t)[farm]||[]).map(a=>({id:a.id,species:a.species,health:Math.round(a.health),
  isolated:a.isolated,fed:a.fed,watered:a.watered,caseId:a.caseId}));
}
