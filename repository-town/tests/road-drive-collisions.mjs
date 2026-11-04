// Regression for the 2026-11-04 user-reported invisible car barrier.
// Exact OSM polygon collision + clear real vehicle carriageways; no collision bypass.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { CollisionWorld, circleHitsPolygon, polygonSignedDistance } from '../src/engine/collision.js';
import { buildNarromine } from '../src/world/narromine.js';
import { BUILDINGS, onNarromineRoad, inPoly } from '../src/world/narromine-layout.js';
import { TownLife, AVENUES } from '../src/world/life.js';

// A concave polygon should only block its actual mass, including edges within a
// car radius; bounding-box empty corners must remain drivable.
const outline=[[0,0],[8,0],[8,2],[2,2],[2,8],[0,8]];
const bounded={x0:0,x1:8,z0:0,z1:8,polygon:outline};
const shape=new CollisionWorld([bounded]);
assert(shape.hits(1,6,1.12),'real concave polygon wing is solid');
assert(shape.hits(7,1,1.12),'other actual wing is solid');
assert(!shape.hits(6,6,1.12),'empty corner of concave footprint not a phantom wall');
assert(circleHitsPolygon(3,3,1.5,outline),'circle touching true wall remains blocked');
assert(!circleHitsPolygon(4.3,4.3,1.12,outline),'free point with vehicle clearance');
assert(polygonSignedDistance(1,1,outline)<0,'signed interior distance');
assert(polygonSignedDistance(6,6,outline)>0,'signed exterior distance');
// Existing ordinary, square building colliders, trucks and rail barriers
// are deliberately unaffected by the optional polygon feature.
const plain=new CollisionWorld([{x0:0,x1:8,z0:0,z1:8}]);
assert(plain.hits(6,6,1.12),'non-polygon walls remain solid');
plain.dynamic=()=>[{x0:10,x1:12,z0:0,z1:2}];
assert(plain.hits(11,1,1.12),'moving vehicle still blocks movement');
plain.dynamic=()=>[];
assert(!plain.hits(11,1,1.12),'moving obstacle cannot leave an invisible ghost');

const town=buildNarromine(new THREE.Group()),world=new CollisionWorld(town.colliders);
const cases=[
  {id:30,p:[-4772.57,209.45],label:'Narromine Hospital side-road'},
  {id:194,p:[-4516.76,-1002.32],label:'SE angled OSM block'},
  {id:171,p:[-4692.79,-855.3],label:'Burraway Street approach'},
  {id:18,p:[-5169.22,-917.22],label:'western neighbourhood road'},
  {id:178,p:[-4829.7,-996.86],label:'south-west side road'},
  {id:166,p:[-4748.55,-898.64],label:'Dandaloo shopping side street'},
];
let verified=0;
for(const {id,p,label} of cases) {
  const building=BUILDINGS.find(b=>b.osmIndex===id);
  assert(building,label+': OSM index exists');
  assert(!inPoly(...p,building.pts),label+': sample is outside actual building polygon');
  assert(onNarromineRoad(...p),label+': sampled road is in mapped drivable pavement');
  const oldAabb=building.pts.reduce((r,[x,z])=>({
    x0:Math.min(r.x0,x),x1:Math.max(r.x1,x),z0:Math.min(r.z0,z),z1:Math.max(r.z1,z)
  }),{x0:Infinity,x1:-Infinity,z0:Infinity,z1:-Infinity});
  assert(new CollisionWorld([oldAabb]).hits(...p,1.12),label+': reproduces old invisible AABB blocking');
  const precise=new CollisionWorld([{...oldAabb,polygon:building.pts}]);
  assert(!precise.hits(...p,1.12),label+': true footprint leaves road clear');
  // Other authored street obstacles may be present. This proves the actual
  // defect no longer comes from the specific OSM building being checked.
  const collider=world.hits(...p,1.12);
  assert(!(collider?.polygon===building.pts),label+': active scene is not blocked by this OSM outline');
  verified++;
}
const hospital=BUILDINGS.find(b=>b.osmIndex===30);
const hospitalBox=hospital.pts.reduce((r,[x,z])=>({
  x0:Math.min(r.x0,x),x1:Math.max(r.x1,x),z0:Math.min(r.z0,z),z1:Math.max(r.z1,z)
}),{x0:Infinity,x1:-Infinity,z0:Infinity,z1:-Infinity});
const hospitalWorld=new CollisionWorld([{...hospitalBox,polygon:hospital.pts}]);
const centre=hospital.pts.reduce(([sx,sz],[x,z])=>[sx+x/hospital.pts.length,sz+z/hospital.pts.length],[0,0]);
if(inPoly(...centre,hospital.pts)) assert(hospitalWorld.hits(...centre,.7),'actual hospital interior stays solid');
else {
  const point=hospital.pts.find(([x,z])=>hospitalWorld.hits(x,z,.7));
  assert(point,'real hospital perimeter must still be solid');
}

// The same 7m core avenue in Josh's screenshot has a farm fence at x184.5,
// only 2.5m from the centre of the x=182 road. A car of radius 1.12m cannot
// pass that wall at the normal 1.6m lane position. Move the planted/fenced
// field boundary into the adjoining lot, not the paved traffic lane.
const homes=[];
for(let r=0;r<7;r++)for(let c=0;c<26;c+=2)
  homes.push({coordinate:String.fromCharCode(65+c)+(r+1),name:'House',door:{x:(c-12.5)*26,z:r*46-161+4}});
const life=new TownLife({homes,minute:420,seed:20261104});
const dairy=life.place('dairy');
assert(dairy?.field,'the original farm field and its fence remain');
assert.equal(AVENUES.includes(182),true,'mapped core avenue-4 centreline unchanged');
assert(dairy.field.x0>=187.5,'farm's western perimeter fence moved outside full car clearance');
assert(dairy.field.x1>dairy.field.x0+10,'productive farm field is not destroyed');
for(const p of life.places.values()) if(p.field) {
  for(const avenue of AVENUES) {
    const left=p.field.x0+.5,right=p.field.x1-.5;
    const reserved=5.5;
    assert(!(left>avenue-reserved&&left<avenue+reserved),
      p.id+': west fence occupies a core avenue right-of-way');
    assert(!(right>avenue-reserved&&right<avenue+reserved),
      p.id+': east fence occupies a core avenue right-of-way');
  }
}
console.log('PASS road vehicle collision: '+verified+' proven phantom building-box blockers eliminated by precise OSM outlines; mapped walls and dynamic traffic preserved, farm fencing clear of avenue-4');
