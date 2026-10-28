import assert from 'node:assert/strict';
import * as THREE from 'three';
import {buildCafeInterior} from '../src/world/cafe-interior.js';
import {createShopVisitors,clearWalk} from '../src/world/shop-visitors.js';
const bounds={x0:-5,x1:5,z0:-5,z1:5},actor={x:0,z:0,radius:.5};
assert(clearWalk({x:.61,z:.61},{x:2,z:2},[actor],bounds),'a diagonally clear actor position must remain a valid route start');
assert.equal(clearWalk({x:.6,z:.6},{x:2,z:2},[actor],bounds),false,'actual personal-space overlap remains blocked');
assert.equal(clearWalk({x:-2,z:0},{x:2,z:0},[actor],bounds),false,'continuous route cannot cut through an actor');
const label=()=>new THREE.Sprite(new THREE.SpriteMaterial());
const site={id:'cafe',name:'Cafe'},room=buildCafeInterior(site,label);
const customer={id:1,name:'Customer',job:'shopper',inside:true,path:[],step:{at:'cafe',kind:'eatout',queue:{joined:0},workTicket:1},activity:'queuing'};
const ticket={id:1,customer:1,name:'Customer',table:1,state:'queue',created:0};
const life={villagers:[customer],civic:{workplay:{cafe:{tickets:[ticket]}}}};
const player={pos:new THREE.Vector3(0,0,4),seated:null},people=[];
const visitors=createShopVisitors(site,life,room,label,people);
for(let i=0;i<250;i++)visitors.update(.05,i*.05,player);
ticket.state='accepted';delete customer.step.queue;
let person;
for(let i=250;i<1000;i++){
 visitors.update(.05,i*.05,player);person=visitors.entries.get(1);
 if(person.seat&&person.state==='walking'&&person.next==='seating')break;
}
assert(person?.landing&&person.state==='walking','customer starts a genuine route to their reserved chair');
const blocked={...person.landing};player.pos.set(blocked.x,0,blocked.z);
const before={x:person.pos.x,z:person.pos.z};let maxStep=0,last=before;
for(let i=0;i<1800&&person.state!=='seated';i++){
 visitors.update(.05,60+i*.05,player);
 const delta=Math.hypot(person.pos.x-last.x,person.pos.z-last.z);maxStep=Math.max(maxStep,delta);last={x:person.pos.x,z:person.pos.z};
}
assert.equal(person.state,'seated','customer must find another clear approach when the player occupies the first one');
assert(Math.hypot(person.landing.x-blocked.x,person.landing.z-blocked.z)>.5,'uses a different landing instead of walking through the player');
// The short final sit animation may cover chair-to-landing distance; the route
// itself must not teleport across the room to escape a temporary obstruction.
assert(maxStep<=1.4,'no cross-room teleport to chair');
console.log('PASS: café patron reroutes around a player occupying the original chair approach');
// Taking an order can precede completion of the visual walk to the till.
// Redirect that accepted customer immediately, before the next queued patron
// claims the same front-of-line point.
{
 const room=buildCafeInterior(site,label);
 const patrons=[1,2].map(id=>({id,name:'Customer '+id,job:'shopper',inside:false,path:[],step:{at:'cafe',kind:'eatout',queue:{joined:id},workTicket:id},activity:'queuing'}));
 const tickets=patrons.map(p=>({id:p.id,customer:p.id,name:p.name,table:p.id,state:'queue',created:p.id}));
 const life={villagers:patrons,civic:{workplay:{cafe:{tickets}}}},people=[];
 const player={pos:new THREE.Vector3(0,0,4),seated:null};
 const visitors=createShopVisitors(site,life,room,label,people);
 visitors.update(.05,0,player);patrons.forEach(p=>p.inside=true);
 for(let i=1;i<8;i++)visitors.update(.05,i*.05,player);
 const first=visitors.entries.get(1);assert.equal(first.state,'walking');
 tickets[0].state='accepted';delete patrons[0].step.queue;
 visitors.update(.05,.5,player);
 assert(first.seat&&first.next==='seating','accepted customer must leave the stale queue route immediately');
 for(let i=0;i<1800&&first.state!=='seated';i++)visitors.update(.05,1+i*.05,player);
 assert.equal(first.state,'seated','accepted customer and next queue customer do not deadlock at the counter');
 console.log('PASS: order accepted during queue walk redirects to its table before the next customer claims the till');
}
