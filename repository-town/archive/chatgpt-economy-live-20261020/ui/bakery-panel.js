import {bakeryInventory,superviseBread} from '../world/bakery-production.js';
import {GOODS} from '../world/life.js';

// Every read is fresh: no duplicate stock cache disconnected from the town.
const fmt=(n)=>Number.isFinite(n)?n.toLocaleString('en-AU'):'0';
const remaining=(b,life)=>!b?.readyAt?0:Math.max(0,Math.ceil(b.readyAt-(life.day*1440+life.minute)));
const esc=s=>String(s??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[x]));
export function bakeryStationPanel(life,station='shelves',note=''){
 const s=bakeryInventory(life),b=s.batch,location={
  checkout:'Fresh bread and pie sales',
  shelves:'Bakery display shelves',
  'opening-hours':'Bakery hours and roster',
  mixer:'Dough mixing & preparation',
  'prep-bench':'Sanitised dough preparation',
  'wash-hands':'Food-safe hand washing',
  oven:'Deck ovens and hot line',
  'oven-safety':'Hot equipment safety',
  proofer:'Controlled dough proofing',
  'food-thermometer':'Proofing temperature checks',
  cooling:'Cooling and packaging racks',
  'delivery-orders':'Delivery and wholesale orders',
  'flour-store':'Flour and dry stores',
  allergens:'Allergen information',
  cleaning:'Wash-up station',
  'staff-room':'Staff lockers and hygiene'
 }[station]||'Inside the bakery';
 const msg={
  'prep-bench':'The benches are for weighing, dividing, shaping and rounding dough. The mixer is separate from the ready-to-eat cooling line.',
  'wash-hands':'Hand-washing facilities are separate from cleaning sinks and food preparation. In a real bakery, food hygiene and cross-contact control matter.',
  'oven-safety':'The deck ovens use guarded doors and designated landing trays. Do not leave hot trays unattended. This is a game, not a live oven controller.',
  'food-thermometer':'The proofer maintains suitable fermentation conditions and the baker inspects dough as it rises. Its timing is simulated.',
  allergens:'Bread contains wheat and gluten. Pies can contain wheat and may include milk or egg. Real-world recipes require ingredient-by-ingredient allergen checks.',
  cleaning:'The wash-up area is separate from dry stores, dough benches and the bread cooling zone. Dirty and clean trays have different workflows.',
  'staff-room':'Clean aprons, hair coverings and footwear are stored away from flour and ready-to-eat foods.',
  cooling:'Bake output moves to open cooling racks before it is bagged and sold. The actual in-game loaves are counted below.',
  'delivery-orders':'Flour arrives from the Mill through town deliveries. Bread and pie purchases remove units from these exact sales inventories.'
 }[station]||'';
 const stage=b?({
  proofing:'Dough is proofing ('+remaining(b,life)+' town minutes remaining).',
  baking:'Loaves are baking ('+remaining(b,life)+' town minutes remaining).',
  finished:'Eight loaves were baked and moved to the sales stock today.'
 }[b.phase]||'Ready'):'No supervised batch has been started.';
 const buttons=[];
 if(station==='mixer' || station==='proofer' || station==='oven' || station==='flour-store'){
  if(station==='mixer')buttons.push({label:'Mix one bread batch (2 flour bags)',run:()=>{
     const z=superviseBread(life,'mix');
     return bakeryStationPanel(life,'mixer',z.message);
  }});
  if(station==='proofer'||station==='oven')buttons.push({label:'Move proofed dough into the oven',run:()=>{
     const z=superviseBread(life,'oven');
     return bakeryStationPanel(life,'oven',z.message);
  }});
  if(station==='oven')buttons.push({label:'Unload eight finished loaves',run:()=>{
     const z=superviseBread(life,'unload');
     return bakeryStationPanel(life,'oven',z.message);
  }});
 }
 // Production and purchase inventory share the existing TownLife store.
 const roster=s.bakers.map(v=>esc(v.name+' ('+v.job+', '+(Math.floor(v.start/60))+':'+String(v.start%60).padStart(2,'0')+'–'+(Math.floor(v.end/60))+':'+String(v.end%60).padStart(2,'0')+')')).join(', ')||'No assigned staff';
 const msgText=note?'<p><strong>'+esc(note)+'</strong></p>':'';
 const body='<p>'+esc(msg)+'</p>'+msgText+
  '<p><strong>Town time:</strong> '+esc(s.time)+', Day '+fmt(s.day)+
  ' · '+(s.bakeryOpen?'Shop open':'Shop closed')+
  ' · '+s.working.length+' baker(s) on shift now</p>'+
  '<h3>Real bakery inventory</h3>'+
  '<p><b>Mill flour:</b> '+fmt(s.flour)+' bags · <b>Eggs:</b> '+fmt(s.eggs)+
  ' · <b>Milk:</b> '+fmt(s.milk)+' · <b>Meat:</b> '+fmt(s.meat)+' · <b>Vegetables:</b> '+fmt(s.vegetables)+'</p>'+
  '<p><b>Bread ready for sale:</b> '+fmt(s.bread)+' loaves · <b>Pies:</b> '+fmt(s.pies)+
  ' · <b>Bread price:</b> $'+GOODS.bread.price+
  ' · <b>Pie price:</b> $'+GOODS.pie.price+'</p>'+
  '<p><b>Production:</b> '+esc(stage)+'</p>'+
  '<p><b>Assigned bakers:</b> '+roster+'</p>'+
  '<p class="dim">The normal town economy also bakes automatically each hour when staff are working. The optional supervised batch takes 40 town minutes of proofing and 25 minutes in the oven, and is limited to one per town day.</p>';
 return {title:location,body,actions:buttons,wide:true};
}
