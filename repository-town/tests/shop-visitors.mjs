import assert from 'node:assert/strict';
import * as THREE from 'three';
import {buildCafeInterior} from '../src/world/cafe-interior.js';
import {buildPubInterior} from '../src/world/pub-interior.js';
import {createShopVisitors,routeVisitor,clearWalk,visitorsForSite} from '../src/world/shop-visitors.js';

const label=()=>new THREE.Sprite(new THREE.SpriteMaterial());
const mk=(id,name,kind,inside=true)=>({id,name,job:'shopper',inside,path:[],
  step:{at:'pub',kind,dur:30,activity:'visiting the pub'},activity:'visiting the pub'});
for(const [id,builder] of [['pub',buildPubInterior],['cafe',buildCafeInterior]]){
 const site={id,name:id==='pub'?'The Merged Branch':'Commit Café'};
 const room=builder(site,label);
 const player={pos:new THREE.Vector3(0,0,4),seated:null};
 const visitors=[
  {id:0,name:'Dot',job:'poultry keeper',inside:true,path:[],step:{at:id,kind:'eatout',dur:30,activity:'eating out'},activity:'eating out'},
  {id:1,name:'Arlo',job:'market gardener',inside:true,path:[],step:{at:id,kind:id==='pub'?'idle':'eatout',dur:50,activity:'catching up'},activity:'catching up'},
  {id:2,name:'June',job:'teacher',inside:false,path:[{x:0,z:2}],step:{at:id,kind:'eatout',dur:20,activity:'walking to café'},activity:'walking to café'},
  {id:3,name:'Bea',job:'barista',inside:false,path:[],step:{at:id,kind:'work',until:900,activity:'on shift'},activity:'on shift'},
 ];
 const life={villagers:visitors};
 assert.equal(visitorsForSite(life,id,3).length,2,'real customers, not outside or staff');
 const people=[],system=createShopVisitors(site,life,room,label,people);
 system.update(.05,0,player);
 assert.equal(people.length,2,id+' starts with two actual named customers');
 const seated=people.filter(x=>x.state==='seated');
 assert.equal(seated.length,2,id+' joins an ongoing meal with actual seated people');
 assert.equal(new Set(seated.map(x=>x.seat.key)).size,2,'nobody shares a chair');
 assert(seated.every(p=>p.group.parent===room.group),'visitors belong to the live room');
 assert(seated.every(p=>p.seat.occupiedBy===p.name),'used chairs are marked occupied');
 assert(people.every(p=>room.interactables.some(x=>x.key===p.key)),'patrons can be spoken to');
 visitors[2].inside=true;visitors[2].path=[];
 for(let i=0;i<1200;i++)system.update(.05,i*.05,player);
 assert.equal(people.length,3,'arriving customer appears without re-entering the building');
 assert(people.some(p=>p.name==='June'&&p.state==='seated'), 'new customer walks to a chair');
 const arlo=people.find(p=>p.name==='Arlo');
 visitors[1].inside=false;visitors[1].path=[{x:30,z:30}];
 for(let i=0;i<800;i++)system.update(.05,70+i*.05,player);
 assert(!people.some(x=>x.name==='Arlo'),'departing customer leaves through the entrance and disappears');
 assert(!room.seats.some(s=>s.occupiedBy==='Arlo'),'departed seat becomes free');
 assert(!room.interactables.some(x=>x.key===arlo.key),'no ghost conversation with a departed customer');
 for(const s of room.seats)if(s.occupiedBy)assert(people.some(p=>p.name===s.occupiedBy),'only present people own seats');
 room.group.traverse(o=>{o.geometry?.dispose?.();o.material?.dispose?.();});
}
// The route finder must not go through shop tables or walls.
const bounds={x0:-5,x1:5,z0:-5,z1:5},boxes=[{x0:-1,x1:1,z0:-1,z1:1}];
const from={x:0,z:3},to={x:0,z:-3};
const path=routeVisitor(from,to,boxes,bounds);
assert(path?.length>=2,'a route goes around a large table, not straight through it');
let prev=from;for(const p of path){assert(clearWalk(prev,p,boxes,bounds),'path segment must avoid collisions');prev=p;}
const barrier=[{x0:-6,x1:6,z0:-1,z1:1}];
assert.equal(routeVisitor(from,to,barrier,bounds),null,'walls with no doorway are impassable');
console.log('PASS: real café/pub customers visible, seated, uniquely reserved, entering and leaving with collision-safe paths');
