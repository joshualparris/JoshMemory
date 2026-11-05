// Public, read-only visibility of the linked supply chain, with an optional
// real farm-welfare report. The existing pub's age/ID/RSA controls remain the
// sole authority for beer ordering and service.
import {esc} from './interactions.js';
import {INDUSTRY_STAGES} from '../world/town-linked-industries-2026.js';
const table=(pairs)=>'<table class="ledger">'+Object.entries(pairs||{}).map(([k,n])=>
  '<tr><th>'+esc(k)+'</th><td>'+esc(String(n))+'</td></tr>').join('')+'</table>';
export function linkedIndustryPanel(life,id='brewery'){
 const R=life.industryReport(),p=life.place(id);
 if(!p)return {title:'Industry unavailable',body:'<p>That workplace does not exist.</p>',actions:[]};
 const crew=R.visitingCrew.filter(x=>x.at===id||id==='vet'&&x.name.includes('Samira'));
 const recently=R.log.slice(0,8).map(x=>'<li>Day '+esc(String(x.day))+
   ' · '+esc(x.message)+'</li>').join('');
 const transfer='<h3>Physical freight orders (travel time modelled)</h3>'+
   '<table class="ledger"><tr><th>Order</th><th>Goods</th><th>From → To</th><th>Status</th></tr>'+
   R.shipments.map(x=>'<tr><td>'+esc(x.id)+'</td><td>'+esc(x.item)+' × '+x.qty+
    '</td><td>'+esc(x.from)+' → '+esc(x.to)+'</td><td>'+esc(x.status)+
    (x.status==='transit'?' · '+Math.ceil(x.minutes)+' town min':'')+'</td></tr>').join('')+'</table>';
 let body='<p>These are <b>fictional Repository Town businesses</b>, not a claim that these premises exist in real Narromine. All ingredient, hardware and animal supplies are finite. Regional contract labour and journeys are simulated; trucks and worker appearances at these two sites are not yet visually tracked.</p>';
 if(id==='vet'){
  body+='<h3>Live farm-animal welfare</h3>'+table(Object.fromEntries(Object.entries(R.herds).map(([farm,x])=>
    [farm,x.healthy+'/'+x.total+' well · '+x.isolated+' isolated'])));
  body+='<h3>Veterinary appointments and paid care</h3><ul>'+
    R.cases.map(x=>'<li>'+esc(x.id)+' · '+esc(x.animalId)+' · '+esc(x.status)+'</li>').join('')+'</ul>'+
    '<p>Existing rostered surgery worker is a veterinary nurse. Rural treatment is performed only by a separately timed fictional visiting veterinary surgeon with travel, examination, medicines and an invoice.</p>';
 }else if(id==='brewery'){
  body+='<h3>Brewhouse · raw ingredients</h3>'+table(R.breweryStock)+
    '<h3>Fermenting and conditioned batches</h3><ul>'+
    R.batches.map(x=>'<li>'+esc(x.id)+' · '+esc(x.status)+' · ready on town day '+x.readyDay+
      ' · '+x.kegs+' × 50 L</li>').join('')+'</ul>'+
    '<p>On-site finished kegs: '+esc(String(R.breweryOutput.keg50||0))+
    ' · Pub wholesale beer depot: '+esc(String(R.pubBeerDepotL))+' L.</p>'+
    '<p>Three full in-game days are required between brewing and conditioning. All visitor alcohol purchases remain subject to the pub’s existing simulated Australian responsible-service controls.</p>';
 }else if(id==='buildsite'){
  const x=R.project;
  body+='<h3>Construction contract and stage inspections</h3><p>Project '+esc(x.id)+
    ' · '+esc(x.name)+' · stage '+esc(INDUSTRY_STAGES[x.stage])+
    ' · '+x.hours+'/2 paid work hours recorded in current stage</p>'+
    '<h3>Materials physically received</h3>'+table(R.constructionMaterials)+
    '<ul>'+x.inspections.map(i=>'<li>'+esc(i.stage)+' · Day '+i.day+
      ' · '+esc(i.reviewer)+' · '+esc(i.result)+'</li>').join('')+'</ul>'+
    '<p>Only stocked, paid materials and qualified supervision progress the work. These are fictional in-game inspections, not statutory NSW certifications.</p>';
 }
 body+='<h3>On-site visiting or contract crew</h3><ul>'+crew.map(v=>
   '<li>'+esc(v.name)+' · '+(v.onSite?'on site':'off duty / travelling')+'</li>').join('')+
   '</ul>'+transfer+'<h3>Recent supply and welfare records</h3><ul>'+recently+'</ul>';
 const rerender=()=>linkedIndustryPanel(life,id);
 const actions=[
  {label:'Brewery batch register',run:()=>linkedIndustryPanel(life,'brewery')},
  {label:'Farm veterinary ledger',run:()=>linkedIndustryPanel(life,'vet')},
  {label:'Building project and inspections',run:()=>linkedIndustryPanel(life,'buildsite')},
 ];
 if(id==='vet')actions.unshift({label:'Report sheep showing illness (opens a welfare case)',
  run:()=>{
   const herd=life.farmAnimals('sheep'),animal=herd.find(x=>x.alive&&!x.caseId);
   const result=animal?life.reportAnimalIllness('sheep',animal.id):'All sheep are already under care.';
   const p=rerender();p.body='<p><b>'+esc(result)+'</b></p>'+p.body;return p;
  }});
 return {title:p.address+' · '+p.name+' · linked industries',body,actions,wide:true};
}
