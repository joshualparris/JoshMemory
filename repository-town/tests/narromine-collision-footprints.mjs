// Narrow, deterministic proof of the actual Narromine footprint collision.
import assert from 'node:assert/strict';
import { CollisionWorld } from '../src/engine/collision.js';
import { rotatedBoxFootprint, rotatedBoxCollider } from '../src/world/narromine-collision-footprints.js';
import { FILL_HOUSES, FILL_SHOPS } from '../src/world/narromine-layout.js';

const approx = (a,b) => assert(Math.abs(a-b)<1e-7, `${a} ~= ${b}`);
const yaw = Math.PI/4, w=12, d=3, x=20, z=30;
const half=(Math.abs(Math.cos(yaw))*w+Math.abs(Math.sin(yaw))*d)/2;
const rect={x0:x-half,x1:x+half,z0:z-half,z1:z+half};
const c=rotatedBoxCollider({x,z,w,d,yaw,rect});
const precise=new CollisionWorld([c]);
const oldAABB=new CollisionWorld([rect]);

// Old rectangular broadphase occupied an empty, diagonal corner; precise wall does not.
const outsideX=x+half-0.25, outsideZ=z+half-0.25;
assert(oldAABB.hits(outsideX,outsideZ,0.3), 'old collider reproduced invisible building wall');
assert.equal(precise.hits(outsideX,outsideZ,0.3),null,'yawed footprint corner remains open');
// But the *visible* rotated building body and its side wall must still block.
assert(precise.hits(x,z,0.3),'middle of real building is solid');
const wallX=x+Math.cos(yaw)*(w/2+0.1), wallZ=z-Math.sin(yaw)*(w/2+0.1);
assert(precise.hits(wallX,wallZ,0.2),'actual building wall blocks');
assert.equal(precise.hits(wallX+Math.cos(yaw)*2,wallZ-Math.sin(yaw)*2,0.2),null,'outside wall is open');

const unrotated=rotatedBoxFootprint(0,0,4,6,0);
assert.deepEqual(unrotated,[[-2,-3],[2,-3],[2,3],[-2,3]],'zero rotation unchanged');
assert.throws(()=>rotatedBoxFootprint(0,0,0,5,0),RangeError);

// Every real rendered footprint/remaining stand-in shop retains its existing AABB,
// with exact yawed polygon inside it, including large and narrow footprints.
assert(FILL_HOUSES.length>2000,'actual Microsoft footprint source is loaded');
assert(FILL_SHOPS.length>0,'remaining mapped POI shop stands are loaded');
for(const building of [...FILL_HOUSES,...FILL_SHOPS]){
 const collider=rotatedBoxCollider(building);
 assert.equal(collider.x0,building.rect.x0);
 assert.equal(collider.x1,building.rect.x1);
 assert.equal(collider.z0,building.rect.z0);
 assert.equal(collider.z1,building.rect.z1);
 assert.equal(collider.poly.length,4);
 for(const [px,pz] of collider.poly){
  assert(px>=collider.x0-1e-6 && px<=collider.x1+1e-6,'polygon x within original broadphase');
  assert(pz>=collider.z0-1e-6 && pz<=collider.z1+1e-6,'polygon z within original broadphase');
 }
 const middle=rotatedBoxFootprint(building.x,building.z,building.w,building.d,building.yaw);
 approx(middle[0][0],collider.poly[0][0]); approx(middle[0][1],collider.poly[0][1]);
}
console.log(`PASS Narromine exact yawed colliders: ${FILL_HOUSES.length} houses, ${FILL_SHOPS.length} shops; phantom corner excluded, actual walls solid`);
