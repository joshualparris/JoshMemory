// NSW cadastral parcel polygons: independent cross-check with the separate 16
// public-venue lots. These lines are NOT evidence of existing boundary fences.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {narromineLots,clipSegmentToRect,NARROMINE_LOTS} from '../src/world/narromine-lots.js';
import {buildNarromineLotLines} from '../src/world/narromine-lot-lines.js';
import {NARROMINE_PUBLIC_LOTS} from '../src/world/narromine-public-lots.js';
import {OSM,REGION,geoToWorld,toWorld} from '../src/world/narromine-layout.js';
const lots=narromineLots();
assert(lots.length>1500&&lots.length<2600,'plausible NSW lot count');
assert(Buffer.byteLength(JSON.stringify(NARROMINE_LOTS))<200*1024,'<=200KB compressed cadastral data');
assert.equal(NARROMINE_LOTS.licence,'CC BY 4.0');
assert(NARROMINE_LOTS.attribution.includes('New South Wales'),'real NSW attribution');
const area=r=>Math.abs(r.reduce((s,p,i)=>{const q=r[(i+1)%r.length];return s+p[0]*q[1]-q[0]*p[1];},0))/2;
let withLabel=0;
const E=OSM.extent,M=40;
for(const l of lots){
 assert(l.pts.length>=3,'three or more real polygon vertices');
 assert(area(l.pts)>=1,`area for ${l.label}`);
 assert(l.pts.every(([x,z])=>Number.isFinite(x)&&Number.isFinite(z)),'finite positions');
 const xs=l.pts.map(p=>p[0]),zs=l.pts.map(p=>p[1]);
 assert(Math.max(...xs)>=E.x0-M&&Math.min(...xs)<=E.x1+M&&
   Math.max(...zs)>=E.z0-M&&Math.min(...zs)<=E.z1+M,'each lot intersects mapped bounds');
 if(l.plan)withLabel++;
}
assert(withLabel/lots.length>.99,'plan labels preserved');
const anchor=geoToWorld(OSM.anchor.lat,OSM.anchor.lon),zero=toWorld([0,0]);
assert(Math.hypot(anchor[0]-zero[0],anchor[1]-zero[1])<1e-6,'identical geographic transform');
const inPoly=(x,z,r)=>{
 let c=false;
 for(let i=0,j=r.length-1;i<r.length;j=i++){
  if((r[i][1]>z)!==(r[j][1]>z)&&x<(r[j][0]-r[i][0])*(z-r[i][1])/(r[j][1]-r[i][1])+r[i][0])c=!c;
 }
 return c;
};
const world=lots.map(l=>({l,pts:l.pts.map(toWorld)}));
let checked=0,hit=0;const misses=[];
for(const v of NARROMINE_PUBLIC_LOTS){
 const g=v.polygon.map(([lon,lat])=>geoToWorld(lat,lon));
 const cx=g.reduce((n,p)=>n+p[0],0)/g.length,cz=g.reduce((n,p)=>n+p[1],0)/g.length;
 checked++;
 if(world.some(w=>inPoly(cx,cz,w.pts)))hit++;else misses.push(v.id);
}
assert(checked>=16,'expected independent public-venue sample');
assert(hit/checked>=.8,`venue centroids inside actual lot polygons: ${hit}/${checked}, misses: ${misses.join(',')}`);
const R={x0:0,x1:10,z0:0,z1:10};
assert.deepEqual(clipSegmentToRect(2,2,8,8,R),[2,2,8,8]);
assert.equal(clipSegmentToRect(-5,-5,-1,-1,R),null);
assert.equal(clipSegmentToRect(-5,12,15,12,R),null);
assert.deepEqual(clipSegmentToRect(-5,5,5,5,R),[0,5,5,5]);
assert.deepEqual(clipSegmentToRect(-10,5,20,5,R),[0,5,10,5]);
let count=0;
for(const w of world)for(let i=0;i<w.pts.length;i++){
 const a=w.pts[i],b=w.pts[(i+1)%w.pts.length];
 const c=clipSegmentToRect(a[0],a[1],b[0],b[1],REGION);
 if(!c)continue;count++;
 for(const [x,z] of [[c[0],c[1]],[c[2],c[3]]])
  assert(x>=REGION.x0-1e-6&&x<=REGION.x1+1e-6&&z>=REGION.z0-1e-6&&z<=REGION.z1+1e-6,'clip stays inside region');
}
assert(count>5000,'real parcel edges within town');
const parent=new THREE.Group();
const off=buildNarromineLotLines(parent,{visible:false});
assert.equal(off.lines,null);assert.equal(parent.children.length,0,'default no geometry allocated');
const on=buildNarromineLotLines(parent,{visible:true});
assert.equal(on.segmentCount,count);assert.equal(on.lotCount,lots.length);
assert.equal(parent.children.length,1,'single draw call when enabled');
assert.equal(on.lines.type,'LineSegments');
assert.equal(on.lines.geometry.attributes.position.count,count*2);
on.lines.geometry.dispose();on.lines.material.dispose();
console.log(`PASS NR-LOTS-001 ${lots.length} cadastral outlines, ${hit}/${checked} independently verified public-venue lot centroids, ${count} clipped edges; 0 ordinary gameplay meshes/colliders`);
