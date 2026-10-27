import assert from 'node:assert/strict';
import * as THREE from 'three';
import {buildBrackenInterior} from '../src/world/bracken-interior.js';
import {buildYeovalInterior} from '../src/world/yeoval-interior.js';
import {populateCareCampus} from '../src/world/aged-care-population.js';
import {careResidents} from '../src/world/aged-care-operations.js';
const label=()=>new THREE.Object3D();
for(const [id,builder] of [['bracken-house',buildBrackenInterior],['yeoval-aged-care',buildYeovalInterior]]){
 const life={day:1,minute:12*60};
 const indoor=builder(label);
 const people=populateCareCampus(id,indoor,life,label);
 assert(people.length>=8,'representative staff/resident models rendered');
 assert(people.filter(p=>p.group.visible).length>=7,'people visible at lunchtime');
 assert(indoor.interactables.some(p=>p.key==='care:'+id+':noticeboard'),'care noticeboard');
 assert(indoor.interactables.some(p=>p.key.includes(':resident:')),'talkable fictional residents');
 assert(indoor.interactables.some(p=>p.key.includes(':staff:')),'talkable nurses and care staff');
 for(const person of people){
  const {x,z}=person.pos;
  assert(!indoor.colliders.some(c=>{const cx=Math.max(c.x0,Math.min(x,c.x1)),cz=Math.max(c.z0,Math.min(z,c.z1));return Math.hypot(cx-x,cz-z)<.43}),
   id+' care person collides with a wall or furniture: '+person.key);
 }
 life.minute=23*60+30;people[0].update(.016,12,{pos:new THREE.Vector3(-100,0,-100)});
 const nighttime=people.filter(p=>p.group.visible);
 assert(nighttime.length>=3,'overnight on-duty RN/care team and a resident represented');
 assert(nighttime.length<people.length,'less ambient activity overnight');
 assert(careResidents(id).length>=25,'full simulated resident cohort exists beyond drawn subset');
 indoor.group.traverse(o=>{if(o.geometry?.type!=='BoxGeometry')o.geometry?.dispose?.();});
 console.log('PASS '+id+': resident and nurse figures safely inside illustrative interiors, shifts change overnight, care board visible');
}
