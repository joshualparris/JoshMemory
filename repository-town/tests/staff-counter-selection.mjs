import assert from 'node:assert/strict';
import * as THREE from 'three';
import {populateShopStaff} from '../src/world/shop-staff.js';
import {buildCemeteryOfficeInterior} from '../src/world/cemetery-office-interior.js';
import {buildBusInterchangeInterior} from '../src/world/bus-interchange-interior.js';
import {buildVisitorInformationInterior} from '../src/world/visitor-information-interior.js';
import {pickInteriorInteraction as pick} from '../src/engine/interaction-picker.js';
import {CollisionWorld} from '../src/engine/collision.js';
const label=()=>new THREE.Sprite(new THREE.SpriteMaterial());
for(const [id,builder] of [['cemetery',buildCemeteryOfficeInterior],['busstop',buildBusInterchangeInterior],['visitorcentre',buildVisitorInformationInterior]]){
 const site={id,name:id,kind:'shop'},room=builder(site,label);
 const worker={id:1,name:'Test worker',job:'host',work:id,path:[],step:{kind:'work',at:id}};
 populateShopStaff(site,{villagers:[worker]},room,label);
 const target=room.interactables.find(x=>x.key==='staff:'+id);assert(target,id+' worker present');
 const world=new CollisionWorld(room.colliders);let found=false;
 for(const d of [.7,.9,1.3,1.6,1.9,2.2])for(let n=0;n<32;n++){
  const a=n*Math.PI/16,p={x:target.pos.x+Math.cos(a)*d,z:target.pos.z+Math.sin(a)*d};if(world.hits(p.x,p.z,.4))continue;
  if(pick(room,p,{x:-Math.cos(a),z:-Math.sin(a)})===target)found=true;
 }
 assert(found,id+' staff conversation must be selectable separately from the service counter');
 room.group.traverse(o=>{o.geometry?.dispose?.();for(const m of Array.isArray(o.material)?o.material:[o.material])m?.dispose?.();});
}
console.log('PASS: cemetery, bus interchange and visitor centre staff and counters are independently selectable');
