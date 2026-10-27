import assert from 'node:assert/strict';
import * as THREE from 'three';
import {PLAN_HOMES} from '../src/world/masterplan-built.js';
import {PROPS} from '../src/world/props.js';
import {countryInteriorPlan,countryEntrance,countryExitPose,buildCountryInterior} from '../src/world/country-interiors.js';
assert.equal(PLAN_HOMES.length,195);
for(const h of PLAN_HOMES){
 const p=countryInteriorPlan(h);
 assert(p.w===h.design.w && p.d===h.design.d);
 assert.equal(p.rooms.length,3);
 assert.equal(p.floorsPlayable,1);
 assert(p.fixtures.some(f=>f.type==='bed')&&p.fixtures.some(f=>f.type==='shower'));
 assert(p.fixtures.some(f=>f.type==='toilet')&&p.fixtures.some(f=>f.type==='kitchenSink'));
 assert(p.fixtures.every(f=>PROPS[f.type] && f.x-PROPS[f.type].w/2>=-p.w/2+.10 && f.x+PROPS[f.type].w/2<=p.w/2-.10
   && f.z-PROPS[f.type].d/2>=-p.d/2+.1 && f.z+PROPS[f.type].d/2<=p.d/2-.10),h.country+' fixtures must fit building envelope');
 assert(countryEntrance(h,{x:h.x,z:h.frontZ},.7),h.country+' door accessible');
 assert(!countryEntrance(h,{x:h.x,z:h.frontZ+(h.facesNorth?-3:3)},.7),h.country+' door not remotely activated');
 const exit=countryExitPose(h);
 assert(Math.sign(exit.z-h.frontZ)===(h.facesNorth?-1:1));
}
for(const h of [PLAN_HOMES[0],PLAN_HOMES[1],PLAN_HOMES[43],PLAN_HOMES[194]]){
 const room=buildCountryInterior(h,()=>new THREE.Group());
 assert.equal(room.rooms.length,3);
 assert(room.colliders.length>7);
 assert(room.interactables.length>=9);
 assert(room.spawn.z < room.rooms[0].z1-1.3,'cannot auto-exit immediately');
 assert(!room.colliders.some(c=>c.x0<room.spawn.x+.46&&c.x1>room.spawn.x-.46
   && c.z0<room.spawn.z+.46&&c.z1>room.spawn.z-.46),'initial player space clear');
 assert.equal(room.countryPlan.certified,false);
 room.group.traverse(o=>{if(o.geometry)o.geometry.dispose?.();});
}
console.log('PASS: 195 building-fitted floor plans, doors, bathrooms, kitchens and beds; four 3D room-and-collider smoke tests');
