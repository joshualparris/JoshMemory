// Real traffic integration: no oriented body overlap during following, parking,
// opposing-lane passing and multi-road junctions, including intermediate frames.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createNarromineTraffic} from '../src/world/narromine-traffic.js';
import {vehicleFootprintsOverlap} from '../src/world/vehicle-occupancy.js';

const car=(x,z,yaw=0,L=4.4)=>({x,z,yaw,L,widthM:1.9});
assert(vehicleFootprintsOverlap(car(0,0),car(0,4.4)), 'touching bumpers needs safety clearance');
assert(!vehicleFootprintsOverlap(car(0,0),car(0,6.1)));
assert(vehicleFootprintsOverlap(car(0,0),car(2.3,1.5,Math.PI/2)), 'turning corners can clip despite separated centres');
assert(!vehicleFootprintsOverlap(car(0,0),car(3.9,0)), 'opposing offset lanes may pass');

const traffic=createNarromineTraffic(new THREE.Group(),{models:false,residents:false});
const edges=[...traffic.edges].sort((a,b)=>b.len-a.len);
const e=edges[0];assert(e.len>25,'road graph needs a testable segment');
const {nodes,adj}=traffic.graph;
traffic.edges.splice(0); // isolate driving physics; no new random through traffic during the test
let serial=10000;
function make(from,to,s,speed=11){
  const seg=adj.get(from).find(x=>x.to===to);
  assert(seg,'road graph edge must exist');
  const a=nodes[from],b=nodes[to],ux=(b.x-a.x)/seg.len,uz=(b.z-a.z)/seg.len;
  const off=Math.min(seg.width/4,1.9);
  return {id:serial++,from,to,s,len:seg.len,width:seg.width,model:0,L:4.4,
    speed,v:speed,colour:0xffffff,ux,uz,yaw:Math.atan2(-ux,-uz)+Math.PI,
    x:a.x+ux*s+uz*off,z:a.z+uz*s-ux*off};
}
const {cars,parked}=traffic;
const midpoint={x:(nodes[e.from].x+nodes[e.to].x)/2+28,z:(nodes[e.from].z+nodes[e.to].z)/2+28};
const assertClear=(desc)=>{
  for(let i=0;i<cars.length;i++){
    for(let j=i+1;j<cars.length;j++)assert(!vehicleFootprintsOverlap(cars[i],cars[j],0.15),desc+': vehicles '+cars[i].id+'/'+cars[j].id+' overlap');
    for(const p of parked)assert(!vehicleFootprintsOverlap(cars[i],p,0.15),desc+': moving car overlaps parked body');
  }
};
const tick=(n=40)=>{for(let i=0;i<n;i++){traffic.update(0.1,midpoint,570,2);assertClear('step '+i);}};
const frontS=Math.min(e.len-7,Math.max(19,e.len*.45));
const leading=make(e.from,e.to,frontS,0), following=make(e.from,e.to,frontS-8,11);
cars.push(leading,following);
tick(55);
assert(following.braking,'following car eventually brakes instead of passing through stationary leader');
cars.length=0;

const obstacle=make(e.from,e.to,frontS,0);
parked.push({x:obstacle.x,z:obstacle.z,yaw:obstacle.yaw,L:obstacle.L,widthM:1.9});
const approaching=make(e.from,e.to,frontS-8,11);
cars.push(approaching);
tick(55);
assert(approaching.braking,'moving car stops before occupied parking footprint');
cars.length=0;parked.length=0;

// Same road, opposite direction: left-hand lanes have enough lateral space.
const a=make(e.from,e.to,Math.min(13,e.len*.3),11);
const b=make(e.to,e.from,Math.min(13,e.len*.3),11);
const ax=a.x, bx=b.x, az=a.z, bz=b.z;
cars.push(a,b);assertClear('opposing approach');tick(35);
assert(Math.hypot(a.x-ax,a.z-az)>1,'one side of road must progress');
assert(Math.hypot(b.x-bx,b.z-bz)>1,'other side of road must progress');
cars.length=0;

// Crossing intersection: two approach legs use different roads and cross the
// junction in controlled substeps. No full-footprint intersection is allowed.
let intersection=null;
for(const [node,edgesAt] of adj){
  if(edgesAt.length<3)continue;
  const choices=edgesAt.filter(x=>x.len>12);
  if(choices.length<3)continue;
  const vectors=choices.map(q=>{
    const p=nodes[q.to],o=nodes[node],d=Math.hypot(p.x-o.x,p.z-o.z);
    return {to:q.to,len:q.len,ux:(p.x-o.x)/d,uz:(p.z-o.z)/d};
  });
  const choicesPair=vectors.flatMap((u,i)=>vectors.slice(i+1).map(v=>[u,v]));
  const pair=choicesPair.find(([u,v])=>Math.abs(u.ux*v.ux+u.uz*v.uz)<0.75);
  if(pair){intersection={node,pair};break;}
}
assert(intersection,'expected a road junction with two nonparallel approaches');
const [u,v]=intersection.pair, j=intersection.node;
const c1=make(u.to,j,u.len-11,10),c2=make(v.to,j,v.len-11,10);
c1.route=[u.to,j,v.to];c1.ri=0;
c2.route=[v.to,j,u.to];c2.ri=0;
cars.push(c1,c2);assertClear('junction approach');tick(50);
console.log('PASS vehicle occupancy: oriented turns, stationary/parked following, opposing lanes and junction, no body overlap');
