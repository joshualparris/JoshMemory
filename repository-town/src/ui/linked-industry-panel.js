import {esc} from './interactions.js';
import {INDUSTRY_STAGES} from '../world/linked-industries.js';

// One shared cooperative desk, reachable from the EXISTING civic/industry panels.
// Never substitute its actions for the town's pub licensing or hardware counter.
export function linkedIndustryPanel(life,site='overview',message=''){
 const r=life.linkedIndustriesReport(),b=r.brewery,build=r.site;
 const rows=Object.entries(r.farms).map(([id,f])=>{
  const farm=life.place(id);
  return '<tr><td>'+esc(farm.name)+'</td><td>'+f.count+'</td><td>'+f.healthy+
   '</td><td>'+f.fed+'</td><td>'+f.cases.length+'</td></tr>';
 }).join('');
 const goods=o=>Object.entries(o).filter(([,n])=>n>0).map(([g,n])=>esc(g)+': '+n).join(', ')||'none';
 const stage=INDUSTRY_STAGES[build.stage];
 const visits=r.visits.map(v=>esc(v.caseId)+' ($'+v.cost+')').join(', ')||'none';
 const report='<p><b>Farm cooperative:</b> fictional rural supply chain using the existing hardware counter, trades depot, clinic, Foundry, farm paddocks and licensed pub. All invoices are Town Dollars.</p>'+
   (message?'<p role="status"><b>'+esc(message)+'</b></p>':'')+
   '<h3>Individual livestock and veterinary care</h3><table class="ledger"><tr><th>Farm</th><th>Animals</th><th>Healthy</th><th>Feed left</th><th>Open cases</th></tr>'+rows+'</table>'+
   '<p>On-call vet: '+esc(r.vet.name)+' · '+esc(r.vet.status)+' · medical kits '+r.vet.stock+
   ' · treated cases: '+esc(visits)+'</p>'+
   '<h3>Brewhouse (existing Foundry site)</h3><p>Ingredients: '+goods(b.stock)+
   ' · conditioned kegs: '+b.readyKegs+' · delivered to existing pub: '+b.deliveredKegs+
   ' · cooperative cash: $'+b.capital+'.</p>'+
   '<p>Paid regional resupplies: '+(r.regionalOrders?.length?r.regionalOrders.map(o=>esc(o.id)+' '+esc(o.type)+' '+esc(o.status)+' due day '+o.readyDay).join(', '):'none')+'</p>'+
   '<p>Batches: '+(b.batches.length?b.batches.map(x=>esc(x.id)+' ('+esc(x.status)+', ready day '+x.readyDay+')').join(' · '):'none started')+'</p>'+
   '<h3>Cooperative workshop (existing Town Trades site)</h3><p>Stage: '+esc(stage?.name||'commissioned')+
   ' · progress '+Math.floor(build.progress)+'/'+(stage?.minutes||0)+' town minutes · budget $'+build.budget+
   ' · worksite materials: '+goods(build.stock)+'.</p>'+
   '<p>Inspections: '+(build.inspections.length?build.inspections.map(x=>esc(x.stage)).join(', '):'none')+'</p>'+
   '<p>Existing Hardware & Timber stock: '+goods(r.hardwareStock)+'</p>'+
   '<h3>Recorded cooperative deliveries</h3><p>'+(r.runs.length?r.runs.map(x=>esc(x.id)+': '+esc(x.kind)+
   ' '+esc(x.status)+' ('+Math.floor(x.elapsed)+'/'+x.duration+' min)').join(' · '):'No deliveries yet')+'</p>'+
   '<h3>Recent cooperative activity</h3><p>'+(r.log.length?r.log.slice(0,6).map(x=>esc(x.text)).join('<br>'):'None recorded')+'</p>'+
   '<p class="dim">The farm workforce, hardware business and pub licensing remain under their existing independent systems. The on-call vet and courier have separate schedules and physical locations; no extra duplicate shop has been created.</p>';
 const take=(label,fn)=>({label,run:()=>linkedIndustryPanel(life,site,fn())});
 const actions=[
  take('Buy construction materials from existing hardware',()=>life.orderIndustryBuilding()),
  take('Order regional brewery ingredients',()=>life.orderIndustryIngredients()),
  take('Buy paid two-day brewing inputs from regional supplier',()=>life.orderIndustryRegionalIngredients()),
  take('Buy paid next-day veterinary kits',()=>life.orderIndustryMedicalKits()),
  take('Deliver conditioned kegs to existing pub',()=>life.orderIndustryPubKegs())
 ];
 for(const farm of ['sheep','dairy','coop']){
  actions.push(take('Deliver paid feed to '+life.place(farm).name,()=>life.orderIndustryFeed(farm)));
  const animal=life.civic.linkedIndustries.herds[farm].find(a=>a.alive&&!a.caseId);
  if(animal)actions.push(take('Report '+animal.id+' sick to on-call vet',()=>life.reportFarmAnimal(farm,animal.id)));
 }
 return {title:'Cooperative linked industries · '+(life.place(site)?.name||'Town Ledger'),wide:true,body:report,actions};
}
