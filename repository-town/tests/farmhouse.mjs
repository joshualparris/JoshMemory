// node tests/farmhouse.mjs
// Independent geometry/contents acceptance without a browser or paid API.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import { CollisionWorld } from '../src/engine/collision.js';
import { coplanarFloorSurfaces } from '../src/world/floor-surfaces.js';
const source=readFileSync(new URL('../src/world/farmhouse-interior.js',import.meta.url),'utf8');
const shop=readFileSync(new URL('../src/world/shop-interior.js',import.meta.url),'utf8');
const V=class {constructor(x=0,y=0,z=0){Object.assign(this,{x,y,z})}set(x,y,z){Object.assign(this,{x,y,z});return this}};
const Group=class {constructor(){this.children=[];this.position=new V();this.rotation={x:0,y:0,z:0};this.userData={}}add(...x){this.children.push(...x)}};
const Mesh=class extends Group{constructor(geo,mat){super();this.geometry=geo;this.material=mat}};
const InstancedMesh=class extends Mesh{constructor(geo,mat,n){super(geo,mat);this.n=n;this.instanceMatrix={};this.items=[]}setMatrixAt(i,m){this.items[i]={...m}}};
const Matrix4=class{makeScale(x,y,z){this.scale=[x,y,z];return this}setPosition(x,y,z){this.position=[x,y,z];return this}};
const Three={Group,Mesh,InstancedMesh,Matrix4,Vector3:V,BoxGeometry:class {},CylinderGeometry:class {},SphereGeometry:class {},MeshLambertMaterial:class{constructor(x){this.data=x}},HemisphereLight:class{}};
const runnable=source.replace(/^import .*?;\s*$/gm,'').replace(/^export\s+/gm,'');
const { FLOOR_SURFACE_Y } = await import('../src/world/floor-surfaces.js');
const make=new Function('THREE','FLOOR_SURFACE_Y',runnable+'\nreturn buildFarmhouseInterior;')(Three,FLOOR_SURFACE_Y);
assert(shop.includes("if(site.id==='farmhouse')return buildFarmhouseInterior(site,makeLabel)"),'farmhouse must use its own layout');
const x=make({id:'farmhouse',name:'Farmhouse'},()=>({position:new V(),userData:{}}));
assert.equal(x.rooms.length,10,'should have 10 distinct areas, not a shop counter');
assert(x.interactables.length>=20,'too few household interactions');
assert(x.interactables.some(i=>i.key==='farmhouse:pantry'));
assert(x.interactables.some(i=>i.key==='farmhouse:farm-diary'));
assert(x.interactables.some(i=>i.key==='farmhouse:washer'));
assert(x.interactables.some(i=>i.key==='farmhouse:fireplace'));
assert(x.interactables.some(i=>i.key==='farmhouse:kettle'));
assert(x.dynamics.length>=3,'need animated fire, kettle or lights');
// Colours are preserved for visual realism: roughly 100 distinct furniture tones.
// Each tone is instanced rather than building hundreds of individual meshes.
assert(x.group.userData.staticBatches>0&&x.group.userData.staticBatches<130,'batch furniture by material without collapsing the room palette');
assert.equal(x.rooms[0].z1,6,'exit zone must match the real front door');
const hit=(px,pz,r=.35)=>x.colliders.some(b=>{
 const cx=Math.max(b.x0,Math.min(b.x1,px)),cz=Math.max(b.z0,Math.min(b.z1,pz));
 return (px-cx)**2+(pz-cz)**2 <r*r;
});
assert(!hit(x.spawn.x,x.spawn.z),'player spawns inside furniture or a wall');
// Grid-based flood-fill tests actual walking between door openings, not
// teleporting over walls. Interactables must be reachable within 2.2m.
const step=.35, xmin=-8.4,zmin=-16.1,nx=48,nz=63;
const id=(i,j)=>i+','+j;
const seen=new Set(),q=[];
const i0=Math.round((x.spawn.x-xmin)/step),j0=Math.round((x.spawn.z-zmin)/step);
q.push([i0,j0]);seen.add(id(i0,j0));
for(let n=0;n<q.length;n++){
 const [i,j]=q[n];
 for(const [di,dj] of [[0,1],[0,-1],[1,0],[-1,0]]){
  const a=i+di,b=j+dj,k=id(a,b);
  if(a<0||a>=nx||b<0||b>=nz||seen.has(k))continue;
  if(hit(xmin+a*step,zmin+b*step))continue;
  seen.add(k);q.push([a,b]);
 }
}
for(const e of x.interactables){
 const points=q.filter(([i,j])=>{
 const px=xmin+i*step,pz=zmin+j*step,dist=Math.hypot(px-e.pos.x,pz-e.pos.z);
 return dist<=2.3;
 });
 assert(points.length>0,e.key+' is not reachable from the entry');
}
assert(seen.size>1200,'interior is blocked into inaccessible cells');
console.log('PASS: 10 farmhouse spaces, '+x.interactables.length+' objects, '+seen.size+' reachable floor cells, no inaccessible exhibits');


// Inspect every actual instanced farmhouse floor surface, rather than trusting
// hand-picked coordinates. Coplanar overlapping surfaces flicker on mobile GPUs.
const floorBoxes=x.group.children.filter(o=>o instanceof InstancedMesh).flatMap(o=>o.items||[])
  .filter(m=>m&&m.scale[1]<=0.031&&m.scale[0]>.8&&m.scale[2]>.5&&m.position[1]<.15)
  .map(m=>({x:m.position[0],y:m.position[1],z:m.position[2],
    w:m.scale[0],h:m.scale[1],d:m.scale[2]}));
assert(floorBoxes.length>=15,'expected layered floors, rugs and bath tiles');
for(let i=0;i<floorBoxes.length;i++)for(let j=i+1;j<floorBoxes.length;j++)
  assert(!coplanarFloorSurfaces(floorBoxes[i],floorBoxes[j]),
    'coplanar overlapping surfaces '+i+' and '+j+' (z-fighting)');
assert(FLOOR_SURFACE_Y.finish<FLOOR_SURFACE_Y.wetTile);
assert(FLOOR_SURFACE_Y.wetTile<FLOOR_SURFACE_Y.rug);
assert(FLOOR_SURFACE_Y.tilePattern>.021,'bank/bakery floor decals are not coplanar with their slabs');
const world=new CollisionWorld(x.colliders);
const hallway={x:x.spawn.x,z:x.spawn.z};
for(let i=0;i<44;i++){
  world.move(hallway,0,-.18,.35);
  assert(!world.hits(hallway.x,hallway.z,.35),'hallway movement must not intersect a wall');
}
assert(hallway.z<-4,'hallway is still traversable after floor correction');
const living={x:0,z:3.3};
for(let i=0;i<14;i++){
  world.move(living,.18,0,.35);
  assert(!world.hits(living.x,living.z,.35),'living-room doorway remains clear');
}
assert(living.x>2.2,'walk through living-room door, not blocked by a rug');
const wall=new CollisionWorld([{x0:-1,x1:1,z0:-.12,z1:.12}]);
const runner={x:0,z:1.2};wall.move(runner,0,-3,.35);
assert(runner.z>.45,'collision subdivision prevents wall tunnelling at running speed');
for(const [place,filename] of [['bakery','bakery-interior.js'],['bank','bank-interior.js']]){
  const text=readFileSync(new URL('../src/world/'+filename,import.meta.url),'utf8');
  assert(text.includes('new THREE.Vector3(x, FLOOR_SURFACE_Y.tilePattern, z)'),place+' decals must use the shared safe elevation');
}
console.log('PASS: '+floorBoxes.length+' actual floor surfaces without coplanar overlaps, physical farmhouse corridor/door and bank/bakery decal checks');
