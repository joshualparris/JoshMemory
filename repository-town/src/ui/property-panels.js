import { registry,propertyReport,depositFor,closingCosts,PROPERTY_RULES,PROPERTY_YEAR } from '../world/property.js';
import { VEHICLE_MODELS } from '../world/vehicles.js';
const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const money=n=>'$'+Math.round(n).toLocaleString('en-AU');
const action=(label,fn,returnTo)=>({label,run:()=>{
  const note=fn(),panel=returnTo();
  return {...panel,body:'<p><b>'+esc(note)+'</b></p>'+panel.body};
}});
function openFor(life,id){return life.open(life.place(id));}
export function deedPanel(life,id) {
  const p=registry(life).parcels[id];
  if(!p)return {title:'No land title',body:'<p>Unknown land record.</p>',actions:[]};
  const owned=p.owner==='visitor',lien=registry(life).liens[id];
  const back=()=>propertyOfficePanel(life);
  const self=()=>deedPanel(life,id);
  const status=p.protected?'Public title — not for sale':p.listed?'For sale':'Off market';
  const body='<p><b>Address:</b> '+esc(p.address)+' · <b>Title holder:</b> '+esc(owned?'You':p.owner)+
    '</p><p><b>Current occupier:</b> '+esc(p.tenant||'Vacant')+
    ' · <b>Status:</b> '+esc(status)+'</p>'+
    '<p><b>Estimated value:</b> '+money(p.value)+' · <b>Rent:</b> '+money(p.rent)+'/town day'+
    ' · <b>Condition:</b> '+Math.round(p.condition)+'%</p>'+
    (lien?'<p><b>Your mortgage:</b> '+money(lien.balance)+' owing'+(lien.arrears?' · overdue '+money(lien.arrears):'')+'</p>':'')+
    (!owned&&p.listed?'<p><b>20% deposit + transfer duty and conveyancing:</b> '+money(depositFor(p))+
    ' due up front. Loan advance '+money(p.value*.8)+' secured against the title.</p>':'')+
    '<p class="dim">The resident or shop operator is separate from the freehold owner. Existing leases survive a sale. These are fictional Town Dollar values; one in-game year is '+PROPERTY_YEAR+' town days, not real NSW house prices or legal fees.</p>';
  const actions=[];
  if(!openFor(life,'realestate'))actions.push({label:'Office closed · return to listings',run:back});
  else if(owned){
    actions.push(action(p.listed?'Withdraw listing':'List property for sale',()=>life.listProperty(id),self));
    if(p.listed)actions.push(action('Accept market offer / sell',()=>life.sellProperty(id),self));
  }else if(p.listed)actions.push(action('Purchase property / finance 80%',()=>life.buyProperty(id),self));
  if(openFor(life,'realestate')&&p.kind==='house'&&!p.tenant&&!owned)
    actions.push(action('Apply to rent this vacant home (bond '+money(p.rent*288)+')',()=>life.leaseProperty(id),self));
  actions.push({label:'Return to property office',run:back});
  return {title:'Land title · '+p.name,body,actions,wide:true};
}
export function propertyOfficePanel(life,page=0,mode='listed') {
  const r=propertyReport(life),all=Object.values(registry(life).parcels);
  const filtered=mode==='listed'?all.filter(p=>p.listed&&!p.protected):
    mode==='mine'?all.filter(p=>p.owner==='visitor'):
    all.sort((a,b)=>a.address.localeCompare(b.address));
  const pages=Math.max(1,Math.ceil(filtered.length/8)),num=Math.max(0,Math.min(page,pages-1));
  const segment=filtered.slice(num*8,num*8+8),me=life.civic.player;
  const table='<table class="ledger"><tr><th>Address</th><th>Type</th><th>Value</th><th>Owner</th><th>Occupier</th></tr>'+
    segment.map(p=>'<tr><td>'+esc(p.address)+'</td><td>'+esc(p.kind)+'</td><td>'+money(p.value)+'</td><td>'+
      esc(p.owner==='visitor'?'You':p.owner)+'</td><td>'+esc(p.tenant||'Vacant')+'</td></tr>').join('')+'</table>';
  const body='<p><b>Property agent:</b> Central West Property & Land (south High Street S8). Records for '+
    r.total+' titles, including '+r.public+' public sites; '+r.forSale.length+' for sale. '+r.owned.length+
    ' in your name. Account balances: wallet '+money(me.wallet)+' + savings '+money(me.bank)+'.</p>'+
    '<p><b>Fees:</b> 20% deposit, 3% model transfer charge, $20 model conveyancing, 2% selling commission. Mortgage rate 0.08% per day over 112 days; existing tenancies remain. All figures are Town Dollars and simplified, not actual NSW fees.</p>'+
    '<p><b>View:</b> '+esc(mode)+' · page '+(num+1)+'/'+pages+'</p>'+table+
    (r.playerLease?'<p>Your lease: '+esc(r.playerLease)+'.</p>':'')+
    '<p class="dim">Vacant listings can be bought; a tenanted or public title is not automatically available for sale.</p>';
  const actions=segment.map(p=>({label:'View '+p.address+' · '+money(p.value),run:()=>deedPanel(life,p.id)}));
  if(num>0)actions.push({label:'Previous page',run:()=>propertyOfficePanel(life,num-1,mode)});
  if(num+1<pages)actions.push({label:'Next page',run:()=>propertyOfficePanel(life,num+1,mode)});
  for(const m of ['listed','mine','all'])if(m!==mode)
    actions.push({label:(m==='listed'?'For sale':m==='mine'?'My properties':'All titles'),run:()=>propertyOfficePanel(life,0,m)});
  if(r.playerLease)actions.push(action('End my lease / refund bond',()=>life.endLease(),()=>propertyOfficePanel(life,0,mode)));
  return {title:'🏠 Property Office · land titles and estate agents',body,actions,wide:true};
}
export function motorMarketPanel(life) {
  const r=life.motorReport(),open=openFor(life,'dealership');
  const inventory=r.stock.map(v=>{
    const model=VEHICLE_MODELS.find(x=>x.id===v.model);
    return '<tr><td>'+esc(model?.name)+'</td><td>'+money(v.price)+'</td><td>'+v.odometer.toLocaleString('en-AU')+
      ' km</td><td>'+v.condition+'%</td></tr>';
  }).join('');
  const own=r.owned.map(v=>{
    const model=VEHICLE_MODELS.find(x=>x.id===v.model);
    return '<li>'+esc(v.registration)+' · '+esc(model?.name)+' · '+v.condition+'% condition · rego until day '+v.regoUntil+'</li>';
  }).join('');
  const actions=open?r.stock.map(v=>action('Buy '+(VEHICLE_MODELS.find(m=>m.id===v.model)?.name)+' · '+money(v.price),()=>life.buyVehicle(v.stockId),()=>motorMarketPanel(life))):[];
  for(const v of r.owned)if(open)actions.push(action('Trade in '+v.registration,()=>life.sellVehicle(v.registration),()=>motorMarketPanel(life)));
  actions.push({label:'Visit the mechanics',run:()=>motorWorkshopPanel(life)});
  return {title:'🚗 High Street Motors · south T8',
    body:'<p><b>Dealer inventory:</b> '+r.stock.length+' cars, utes, vans or trucks. Cash dealer reserves '+money(r.dealerCash)+'. '+(open?'Showroom open':'Showroom closed')+'.</p>'+
      '<table class="ledger"><tr><th>Model</th><th>Price</th><th>Odometer</th><th>Condition</th></tr>'+inventory+'</table>'+
      '<p><b>Your vehicle titles</b></p><ul>'+ (own||'<li>No vehicles yet.</li>')+'</ul>'+
      '<p class="dim">Town Dollar prices. Purchase and ownership are implemented, but player driving controls, fuel consumption and parking of purchased vehicles are not yet implemented.</p>',
    actions,wide:true};
}
export function motorWorkshopPanel(life) {
  const state=life.motorReport(),open=openFor(life,'mechanic');
  const items=state.owned;
  const table='<table class="ledger"><tr><th>Rego</th><th>Condition</th><th>Service due</th><th>Registered until</th></tr>'+
    items.map(v=>'<tr><td>'+esc(v.registration)+'</td><td>'+v.condition+'%</td><td>Day '+v.serviceDue+'</td><td>Day '+v.regoUntil+'</td></tr>').join('')+'</table>';
  const actions=[];
  for(const v of items){
    const cost=VEHICLE_MODELS.find(m=>m.id===v.model)?.service||50;
    if(open)actions.push(action('Service '+v.registration+' · '+money(cost),()=>life.serviceVehicle(v.registration),()=>motorWorkshopPanel(life)));
    if(open)actions.push(action('Renew '+v.registration+' registration',()=>life.renewRegistration(v.registration),()=>motorWorkshopPanel(life)));
  }
  actions.push({label:'Browse the vehicle dealership',run:()=>motorMarketPanel(life)});
  return {title:'🔧 Town Motor Workshop · south U8',
    body:'<p>Parts, labour, roadworthiness and the three depot freight trucks. Workshop '+(open?'open':'closed')+
      '. Rego runs for 28 town days; it requires at least 60% mechanical condition.</p>'+table+
      '<p class="dim">Fleet vehicles belong to the Rail Freight Cooperative, not the town visitor. They are automatically serviced through the real garage ledger when worn.</p>',actions,wide:true};
}
