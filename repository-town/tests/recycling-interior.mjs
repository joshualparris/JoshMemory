import assert from 'node:assert/strict';
import * as THREE from 'three';
import {buildRecyclingInterior,RECYCLING_LAYOUT} from '../src/world/recycling-interior.js';
import {buildCivicInterior} from '../src/world/shop-interior.js';

const label=()=>new THREE.Sprite(new THREE.SpriteMaterial());
const site=(n,s,out)=>({id:'recycling',name:'Recycling Centre',
  stock:{recyclables:n,scrap:s},out:{scrap:out}});
const populated=buildRecyclingInterior(site(36,8,5),label,
  {civic:{homes:{recyclables:6}}});
const emptied=buildRecyclingInterior(site(0,0,0),label);
const dispatched=buildCivicInterior(site(12,4,2),label);
const missing=buildCivicInterior({id:'recycling',name:'Recycling Centre'},label);
const all=[populated,emptied,dispatched,missing];
const names=RECYCLING_LAYOUT.zones;
const hotspotIds=['weighin','scales','safety','repair','ewaste','tools',
 'presort','rejects','magnet','optical','baler','bales','dispatch',
 'glass','forklift','town-ledger'];

assert.equal(RECYCLING_LAYOUT.site,'P8');
assert.equal(new Set(hotspotIds).size,16);
assert.equal(populated.recyclingSnapshot.recyclables,36);
assert.equal(populated.recyclingSnapshot.scrap,8);
assert.equal(populated.recyclingSnapshot.outbound,5);
assert.equal(populated.recyclingSnapshot.bales,12);
assert.equal(populated.recyclingSnapshot.homeKerbside,6);
assert.equal(emptied.recyclingSnapshot.bales,0);
assert.equal(emptied.recyclingSnapshot.recyclables,0);
assert(populated.group.children.length>emptied.group.children.length+30,
  'stock-backed bales visually disappear when inventory is empty');

for(const room of all){
  assert(room.recyclingLayout,'P8 must use a unique recycling interior, never the generic counter');
  assert.deepEqual(room.rooms.map(r=>r.name),names,'five realistic treatment and use zones');
  assert.equal(room.windows.length,4,'front and side windows match town shell');
  assert.equal(room.interactables.length,hotspotIds.length);
  assert.equal(room.sceneObjects.length,room.interactables.length);
  assert.equal(new Set(room.interactables.map(i=>i.key)).size,hotspotIds.length);
  for(const key of hotspotIds)assert(room.interactables.some(i=>i.key==='recycling:'+key),key);
  assert.equal(room.interactables.filter(i=>i.act.do==='civic-ledger').length,3);
  for(const prop of ['weigh-in','reuse-bench','e-waste-quarantine','presort-conveyor',
    'magnet-separator','optical-demo','baling','outbound-pallets','material-bays',
    'vehicle-safety-barriers','visitor-route'])
    assert(room.placedProps.some(i=>i.type===prop),'missing distinct feature '+prop);
  assert(room.group.children.length>220,'P8 has substantial facility equipment');
  assert(room.staff.pos.z<room.staff.use.z,'staff behind receival counter');
  assert.equal(room.spawn.z,3.75);
  assert(room.exitZone.z1>room.spawn.z,'return exit aligned with street');
  const hit=(x,z,rad=.35)=>room.colliders.some(c=>
    x>c.x0-rad&&x<c.x1+rad&&z>c.z0-rad&&z<c.z1+rad);
  assert(!hit(room.spawn.x,room.spawn.z),'spawn outside furniture');
  const step=.2,queue=[[0,0]],seen=new Set(['0,0']),o=room.spawn;
  for(let i=0;i<queue.length;i++){
    const [a,b]=queue[i];
    for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const x=a+dx,z=b+dz,px=o.x+x*step,pz=o.z+z*step,k=x+','+z;
      if(seen.has(k)||px<-7||px>7||pz<-12||pz>6.45||hit(px,pz))continue;
      seen.add(k);queue.push([x,z]);
    }
  }
  const reachable=p=>queue.some(([a,b])=>
    Math.hypot(o.x+a*step-p.x,o.z+b*step-p.z)<.31);
  for(const i of room.interactables){
    assert(!hit(i.pos.x,i.pos.z),i.key+' has room for a player');
    assert(reachable(i.pos),i.key+' reachable by walking from the front door');
    const zone=room.rooms[i.room];
    assert(zone&&zone.name===i.roomName,i.key+' identifies correct area');
    assert(i.pos.x>=zone.x0&&i.pos.x<=zone.x1&&i.pos.z>=zone.z0&&i.pos.z<=zone.z1,
      i.key+' hotspot lies in assigned zone');
  }
  for(const p of [room.staff.pos,room.staff.use,{x:0,z:6.15}]){
    assert(!hit(p.x,p.z),'staff or street exit is unblocked');
    assert(reachable(p),'connected walking path to staff or exit');
  }
  for(const z of [5.25,3.75,2.25,.25,-2,-4.4,-6.5,-8.5,-10.5])
    assert(!hit(0,z),'continuous public aisle clear at z='+z);
  for(const zone of room.rooms)assert(queue.some(([a,b])=>{
    const x=o.x+a*step,z=o.z+b*step;
    return x>zone.x0+.45&&x<zone.x1-.45&&z>zone.z0+.45&&z<zone.z1-.45;
  }),'each exhibition zone reachable: '+zone.name);
  room.group.updateMatrixWorld(true);
  room.group.traverse(obj=>{
    if(!obj.isMesh)return;
    const box=new THREE.Box3().setFromObject(obj);
    assert([box.min.x,box.min.y,box.min.z,box.max.x,box.max.y,box.max.z]
      .every(Number.isFinite),'finite mesh geometry');
    assert(box.min.x>=-7.36&&box.max.x<=7.36&&box.min.z>=-12.35&&box.max.z<=6.4,
      'no machine parts outside town room shell');
  });
}
const info=(r,k)=>r.interactables.find(i=>i.key==='recycling:'+k).act.text;
assert.match(info(populated,'dispatch'),/36 recyclable units/);
assert.match(info(populated,'dispatch'),/8 scrap units/);
assert.match(info(populated,'bales'),/12 small stock-based bales/);
assert.match(info(emptied,'dispatch'),/0 recyclable units/);
assert.match(info(missing,'dispatch'),/0 recyclable units/);
assert.match(info(populated,'forklift'),/separate routes/);
for(const room of all)room.group.traverse(o=>{o.geometry?.dispose();o.material?.dispose?.()});
console.log('PASS: P8 realistic sorting and reuse depot; 5 zones; 16 hotspots; clear visitor routes and exit; stock-backed bales.');
