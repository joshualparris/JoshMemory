import assert from 'node:assert/strict';
import * as THREE from 'three';
import {buildCivicInterior} from '../src/world/shop-interior.js';
import {installWorkplay} from '../src/world/workplay-view.js';
import {routeVisitor} from '../src/world/shop-visitors.js';
const label=()=>new THREE.Sprite(new THREE.SpriteMaterial());
for(const id of ['store','cafe']){
 const site={id,name:id,stock:{coffee:20,tea:20,bread:20,milk:20,eggs:20},target:{coffee:30}};
 const life={civic:{jobs:{active:null}},place:()=>site};
 const built=buildCivicInterior(site,label),work=installWorkplay(built,site,label,life,{});
 const items=built.interactables.filter(i=>i.act.do==='workplay');
 assert(items.length>5);
 for(const item of items){
  assert(!built.colliders.some(c=>item.pos.x>c.x0-.3&&item.pos.x<c.x1+.3&&item.pos.z>c.z0-.3&&item.pos.z<c.z1+.3),id+' clear '+item.key);
  assert(routeVisitor(built.spawn,item.pos,built.colliders,built.bounds,.3),id+' reachable '+item.key);
 }
 const player={pos:new THREE.Vector3(0,0,4),eye:1.65,yaw:0,forward:()=>new THREE.Vector3(0,0,-1)};
 work.update(.016,player);work.dispose();
}
console.log('PASS: store/cafe work hotspots are clear and reachable through actual furniture collision geometry; render update and disposal work.');
// The actual customer renderer must move a queued patron to their ticket's table.
{
 const {createShopVisitors}=await import('../src/world/shop-visitors.js');
 const {queueCafeCustomer,useCafe,workState}=await import('../src/world/workplay.js');
 const {CAFE_TABLES}=await import('../src/world/work-recipes.js');
 const site={id:'cafe',name:'Commit Café',stock:{coffee:20,milk:20,eggs:20,bread:20,veg:20,pie:20,tea:20}};
 const v={id:5,name:'Customer',job:'programmer',work:'home',inside:true,path:[],activity:'queuing',step:{at:'cafe',kind:'eatout',queue:{joined:1,serving:null}},wallet:100};
 const life={day:1,minute:600,playerAt:'cafe',civic:{jobs:{active:{site:'cafe',day:1,tasks:[]}}},villagers:[v],place:()=>site,open:()=>true,jobSupervisors:()=>[{}],doTask:()=>({ok:true})};
 const room=buildCivicInterior(site,label),people=[],visitors=createShopVisitors(site,life,room,label,people);
 queueCafeCustomer(life,v);const player={pos:new THREE.Vector3(0,0,4),seated:null};visitors.update(.1,0,player);
 assert(useCafe(life,'take').ok);for(let i=0;i<500;i++)visitors.update(.05,i*.05,player);
 const p=visitors.entries.get(v.id),o=workState(life).cafe.tickets[0],table=CAFE_TABLES[o.table-1];
 assert(p.seat,'ticket customer has a real reserved chair');assert(Math.hypot(p.seat.pos.x-table[0],p.seat.pos.z-table[1])<.85,'chair belongs to the correct numbered table');assert.equal(p.state,'seated','customer actually walks to and sits at their assigned table');
 console.log('PASS: queued ticket customer walks through café furniture to a chair at the assigned table.');
}
