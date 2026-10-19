import assert from 'node:assert/strict';
import * as THREE from 'three';
import { buildCivicDistrict } from '../src/simulation/civic-world.js';
import { buildCivicInterior, CIVIC_INTERIOR_IDS } from '../src/simulation/civic-interior.js';
import { SITES } from '../src/simulation/town-system.js';
import { CollisionWorld } from '../src/engine/collision.js';

// Every service has an outdoor doorway and a real, navigable 3D indoor
// floor. The original 188 house lots are deliberately not overwritten.
const town={lots:new Map(),colliders:[],group:new THREE.Group()};
const district=buildCivicDistrict(town,()=>new THREE.Group());
assert.equal(SITES.length,20,'Town site count changed; update walk-in inventory');
assert.equal(district.buildings.length,20);
assert.equal(district.doors.length,20);
assert.equal(district.doorZones.length,20);
assert.deepEqual(CIVIC_INTERIOR_IDS.slice().sort(),SITES.map(x=>x[0]).sort());
const outdoor=new CollisionWorld(town.colliders);
const radius=.35;
for(const site of district.buildings){
  assert(site.doorPos,'Missing entrance for '+site.name);
  const portal=district.doorZones.find(z=>z.id===site.id);
  assert(portal,'Missing doorway trigger for '+site.name);
  assert(site.doorPos.x>portal.x0 && site.doorPos.x<portal.x1);
  for(const offset of [.3,.8]) assert.equal(outdoor.hits(site.doorPos.x,site.doorPos.z+offset,radius),null,
    site.name+' exterior doorway has a blocking collider');
  const room=buildCivicInterior(site,()=>new THREE.Group());
  assert.equal(room.rooms.length,1,site.name+' should have a full-sized walkable room');
  assert.equal(room.interactables.length,3,site.name+' should have counter and displays');
  assert(room.interactables.some(x=>x.act.do==='civic-ledger'&&x.act.civicId===site.id));
  const inside=new CollisionWorld(room.colliders);
  for(const z of [room.spawn.z,4.8,5.5,2,0,-2,-4,-4.9]){
    assert.equal(inside.hits(0,z,radius),null,site.name+' aisle blocked at z='+z);
  }
  assert(room.spawn.z<room.rooms[0].z1-1.3,'Spawn inside exit trigger: '+site.name);
  assert(room.exitZone.x0<0&&room.exitZone.x1>0,site.name+' cannot reach the exit');
  assert(room.group.children.length>10,site.name+' interior has no furnishings');
}
console.log('PASS: all 20 civic sites have usable shopfronts, collision-free aisles, furnished interiors, ledgers and exits');
