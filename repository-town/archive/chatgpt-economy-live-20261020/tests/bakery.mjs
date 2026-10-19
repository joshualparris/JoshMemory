// Run: node tests/bakery.mjs
// Real production test: no browser, API key or paid service needed.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=n=>readFileSync(new URL('../'+n,import.meta.url),'utf8');
const s=read('world/bakery-interior.js');
const p=read('world/bakery-production.js');
const m=read('main.js'),shop=read('world/shop-interior.js'),lifeCode=read('world/life.js');
const V=class{constructor(x=0,y=0,z=0){Object.assign(this,{x,y,z})}set(x,y,z){Object.assign(this,{x,y,z});return this}};
const Group=class{constructor(){this.children=[];this.position=new V();this.rotation={y:0};this.userData={}}add(...a){this.children.push(...a)}};
const Mesh=class extends Group{constructor(geo,material){super();this.geometry=geo;this.material=material}};
const Matrix=class{makeScale(x,y,z){this.s=[x,y,z];return this}setPosition(x,y,z){this.p=[x,y,z];return this}};
const Inst=class extends Mesh{constructor(g,m,count){super(g,m);this.count=count;this.instanceMatrix={};}setMatrixAt(){}};
const THREE={Vector3:V,Group,Mesh,Matrix4:Matrix,InstancedMesh:Inst,BoxGeometry:class{},CylinderGeometry:class{},MeshLambertMaterial:class{},HemisphereLight:class{}};
const clean=t=>t.replace(/^import .*?;\s*$/gm,'').replace(/^export /gm,'');
const build=new Function('THREE',clean(s)+'\nreturn buildBakeryInterior;')(THREE);
const room=build({id:'bakery',name:'Bakery'},()=>({position:new V(),userData:{}}));
assert.equal(room.rooms.length,8,'Bakery must have 8 purpose-built areas');
assert.equal(room.interactables.length,16);
assert(room.dynamics.length>0,'Commercial ovens must have usable heat indicators');
assert(room.group.userData.staticBatches>0&&room.group.userData.staticBatches<60,'Use instancing for mobile GPU');
assert.equal(room.rooms[0].z1,6,'Exit logic requires the front room as index 0');
assert(shop.includes("if(site.id==='bakery')return buildBakeryInterior(site,makeLabel)"));
assert(m.includes('bakeryStationPanel(life,thing.act.stage)'),'Equipment must open economy panels');
assert(lifeCode.includes('p.supervisedBatch||null'),'Batch should save with town state');
const hit=(x,z,r=.35)=>room.colliders.some(b=>{
 const cx=Math.max(b.x0,Math.min(b.x1,x)),cz=Math.max(b.z0,Math.min(b.z1,z));
 return(x-cx)**2+(z-cz)**2<r*r;
});
assert(!hit(room.spawn.x,room.spawn.z),'Spawn inside wall or machinery');
// Walkable flood fill from entrance with physical player-radius collisions.
const step=.35,x0=-7.8,z0=-17.1,nx=46,nz=65;
const key=(i,j)=>i+','+j,seen=new Set(),q=[];
let i0=Math.round((room.spawn.x-x0)/step),j0=Math.round((room.spawn.z-z0)/step);
seen.add(key(i0,j0));q.push([i0,j0]);
for(let n=0;n<q.length;n++){
 const [i,j]=q[n];
 for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){
  const a=i+di,b=j+dj,k=key(a,b);
  if(a<0||a>=nx||b<0||b>=nz||seen.has(k)||hit(x0+a*step,z0+b*step))continue;
  seen.add(k);q.push([a,b]);
 }
}
for(const station of room.interactables){
 assert(q.some(([i,j])=>Math.hypot(x0+i*step-station.pos.x,z0+j*step-station.pos.z)<2.2),
   station.key+' cannot be approached from entrance');
}
const {superviseBread,bakeryInventory}=new Function(clean(p)+'\nreturn {superviseBread,bakeryInventory};')();
const bakery={stock:{flour:5},out:{bread:8,pie:3}},events=[];
const workers=[{name:'Gus',work:'bakery',step:{kind:'work',at:'bakery'},path:[]}];
const life={day:1,minute:480,villagers:workers,stats:{baked:0},
 place:()=>bakery,open:()=>true,time:()=>'08:00',log:t=>events.push(t)};
assert.equal(bakeryInventory(life).flour,5);
const start=superviseBread(life,'mix');assert(start.ok);
assert.equal(bakery.stock.flour,3);
assert.equal(superviseBread(life,'oven').ok,false,'Proofing must take town time');
life.minute+=40;
assert(superviseBread(life,'oven').ok);
assert.equal(superviseBread(life,'unload').ok,false,'Oven must cook for 25 town minutes');
life.minute+=25;
assert(superviseBread(life,'unload').ok);
assert.equal(bakery.out.bread,16);
assert.equal(life.stats.baked,8);
assert.equal(superviseBread(life,'unload').ok,false,'Cannot duplicate a finished batch');
assert.equal(superviseBread(life,'mix').ok,false,'One supervised batch per day');
const restore=JSON.parse(JSON.stringify(bakery.supervisedBatch));
assert.equal(restore.phase,'finished');
assert.equal(events.length,3);
const n=life.day*1440+life.minute;
console.log('PASS: 8 bakery rooms, '+room.interactables.length+' reachable stations, '+seen.size+' walkable tiles, timed stock-safe baking and persistence hooks');
