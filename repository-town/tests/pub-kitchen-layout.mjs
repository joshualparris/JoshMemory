import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {buildPubInterior} from '../src/world/pub-interior.js';
import {PUB_KITCHEN_LAYOUT} from '../src/world/pub-kitchen-layout.js';

// Geometry-based navigation: not just a check that some mesh exists.
// Use player-sized footprints against every collider in the actual ground scene.
const room=buildPubInterior({id:'pub',name:'The Merged Branch'},()=>new THREE.Sprite(new THREE.SpriteMaterial()));
const bounds=PUB_KITCHEN_LAYOUT.bounds;
const radius=.34,step=.16;
const free=({x,z})=>x>=bounds.x0+radius&&x<=bounds.x1-radius&&
 z>=bounds.z0+radius&&z<=bounds.z1-radius&&
 !room.colliders.some(c=>x>c.x0-radius&&x<c.x1+radius&&z>c.z0-radius&&z<c.z1+radius);
const near=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
function route(start,goal){
 if(!free(start)||!free(goal))return false;
 const queue=[start],seen=new Set([Math.round(start.x/step)+':'+Math.round(start.z/step)]);
 for(let at=0;at<queue.length;at++){
  const point=queue[at];if(near(point,goal)<.23)return true;
  for(const [dx,dz] of [[step,0],[-step,0],[0,step],[0,-step]]){
   const next={x:point.x+dx,z:point.z+dz},key=Math.round(next.x/step)+':'+Math.round(next.z/step);
   if(seen.has(key)||!free(next))continue;
   seen.add(key);queue.push(next);
  }
 }
 return false;
}
test('kitchen is a navigable galley with separate equipment and clear door approach',()=>{
 const entry={x:-5.55,z:-7.33};
 for(const [name,target] of Object.entries({
  'entire aisle':{x:-5.5,z:-11.4},
  'dedicated hand basin':{x:-5.51,z:-8.34},
  'preparation fridge':{x:-5.49,z:-8.95},
  'four-burner cooking line':{x:-5.49,z:-10.3},
  'dirty return dishwasher':{x:-5.49,z:-10.95},
  'hot pass':{x:-5.48,z:-7.68},
 }))assert(route(entry,target),'player radius .34 m cannot reach '+name);
 for(const item of PUB_KITCHEN_LAYOUT.fixtures){
  assert(room.group.getObjectByName('pub:kitchen:'+item.id),item.id+' missing');
  assert(item.x-item.w/2>=bounds.x0-.01&&item.x+item.w/2<=bounds.x1+.01);
  assert(item.z-item.d/2>=bounds.z0-.01&&item.z+item.d/2<=bounds.z1+.01);
 }
 assert(free(entry),'player entrance is not obstructed');
 assert(room.doors.some(d=>d.name==='pub:kitchen-door'),'actual hinged kitchen door must remain');
});
test('kitchen cookline, ventilation, food handling and wash are represented',()=>{
 for(const name of ['range-top','extraction','exhaust-duct','prep-surface','colour-coded-board',
  'hand-basin','handwash-sign','wash-bench','clean-rack','hot-pass','dry-shelf'])
  assert(room.group.getObjectByName('pub:kitchen:'+name),name+' missing');
});
test('two bright kitchen fixtures follow switchboard and emergency-only blackout',()=>{
 const lamps=[1,2].map(i=>room.group.getObjectByName('pub:kitchen:task-light:'+i));
 const lenses=[1,2].map(i=>room.group.getObjectByName('pub:kitchen:led-panel:'+i));
 assert(lamps.every(l=>l?.isSpotLight&&l.intensity>=70),'both kitchen task fixtures powered');
 assert(lenses.every(l=>l?.material.emissiveIntensity>.5),'two visible lit panels');
 room.group.userData.updateLighting(false);
 assert(lamps.every(l=>l.intensity===0),'no general light on outage');
 assert(lenses.every(l=>l.material.emissiveIntensity===0),'no visually glowing false-on panels');
 room.group.userData.updateLighting(true);
 assert(lamps.every(l=>l.intensity>=70),'normal power re-energises workstations');
 assert(lenses.every(l=>l.material.emissiveIntensity>.5),'lenses recover after blackout');
});
