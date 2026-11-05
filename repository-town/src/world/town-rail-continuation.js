// Budgeted Three.js railway geometry for the connection & broad 180 m loop.
// The already-rendered Repository Town main road crossings and Narromine OSM
// track are NOT redrawn; this module only fills their missing track between.
import * as THREE from 'three';
import {REPO_RAIL_ADDITIONS,REGIONAL_RAIL_GEOMETRY} from './town-rail-continuation-route.js';

const CHUNK_METRES=168, SLEEPER_SPACING=.75, GAUGE=REGIONAL_RAIL_GEOMETRY.gauge;
const bedMat=new THREE.MeshLambertMaterial({color:0x837b70,side:THREE.DoubleSide});
const baseMat=new THREE.MeshLambertMaterial({color:0x6d6860,side:THREE.DoubleSide});
const railMat=new THREE.MeshLambertMaterial({color:0x92989c,side:THREE.DoubleSide});
const sleeperMat=new THREE.MeshLambertMaterial({color:0x5e4d3e});
const vergeMat=new THREE.MeshLambertMaterial({color:0x79b46f,side:THREE.DoubleSide});
const sleeperBox=new THREE.BoxGeometry(.24,.13,2.6);
const tempMatrix=new THREE.Matrix4(),one=new THREE.Vector3(1,1,1),up=new THREE.Vector3(0,1,0),rot=new THREE.Quaternion();
const interpolate=(a,b,t)=>a+(b-a)*t;
const dist=(a,b)=>Math.hypot(b[0]-a[0],b[1]-a[1]);
// Turn each original route into independent 168m cullable chunks. Long
// straight segments are split, otherwise frustum culling would keep the whole
// 5.5km strip in the GPU on modest phones.
function chunks(section){
 const source=section.pts,subdivided=[{p:source[0],t:0}];
 const lens=source.slice(1).map((p,i)=>dist(source[i],p));
 const total=lens.reduce((a,b)=>a+b,0);
 let travelled=0;
 for(let i=1;i<source.length;i++){
  const a=source[i-1],b=source[i],l=lens[i-1],count=Math.max(1,Math.ceil(l/6));
  for(let k=1;k<=count;k++){
   const t=k/count;subdivided.push({
    p:[interpolate(a[0],b[0],t),interpolate(a[1],b[1],t)],
    t:(travelled+l*t)/total});
  }
  travelled+=l;
 }
 const all=[],chunk=[subdivided[0]];let metre=0;
 for(let i=1;i<subdivided.length;i++){
  const p=subdivided[i],previous=subdivided[i-1],span=dist(previous.p,p.p);
  if(metre+span>CHUNK_METRES&&chunk.length>1){
   all.push([...chunk]);chunk.length=0;chunk.push(previous);metre=0;
  }
  chunk.push(p);metre+=span;
 }
 if(chunk.length>1)all.push(chunk);
 return all;
}
function elevations(section,t){
 if(section.id!=='narromine-link')return {rail:.277,sleeper:.135};
 return {rail:interpolate(.49,.277,t),sleeper:interpolate(.255,.135,t)};
}
// Triangulated rectangular prism between nearby stations, no 1-box/1-draw
// call per rail segment. Four faces are enough (the underside is obscured).
function prism(positions,indices,a,b,offset,width,lowA,highA,lowB,highB){
 const dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);
 if(len<1e-6)return;
 const nx=-dz/len,nz=dx/len,h=width/2,base=positions.length/3;
 for(const [p,bot,top] of [[a,lowA,highA],[b,lowB,highB]]){
  for(const side of [-1,1]){
   const x=p[0]+nx*(offset+side*h),z=p[1]+nz*(offset+side*h);
   positions.push(x,bot,z,x,top,z);
  }
 }
 // Four top/left/right/bottom faces on a 2-station, 2-width rail bar.
 for(const [a,b,c,d] of [[0,4,6,2],[1,3,7,5],[0,1,5,4],[2,6,7,3]]){
  indices.push(base+a,base+b,base+c,base+a,base+c,base+d);
 }
}
function geom(points,section,kind){
 const pos=[],idx=[];
 for(let i=1;i<points.length;i++){
  const a=points[i-1],b=points[i],e0=elevations(section,a.t),e1=elevations(section,b.t);
  if(kind==='rail')for(const side of [-1,1])
   prism(pos,idx,a.p,b.p,side*GAUGE/2,.095,e0.rail-.11,e0.rail,
     e1.rail-.11,e1.rail);
  else if(kind==='bed'){
   prism(pos,idx,a.p,b.p,0,5.6,-.005,.08,-.005,.08);
   prism(pos,idx,a.p,b.p,0,3.6,.075,.145,.075,.145);
  }else if(kind==='verge'){
   // Beyond the existing town ground this natural green strip avoids rails
   // floating on a sky void. It sits below the approved town roads/ground.
   prism(pos,idx,a.p,b.p,0,30,-.125,-.092,-.125,-.092);
  }
 }
 const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);
 g.computeVertexNormals();
 return g;
}
function sleepers(chunk,section){
 const travelled=[],cumulative=[0];
 for(let i=1;i<chunk.length;i++)
  cumulative.push(cumulative.at(-1)+dist(chunk[i-1].p,chunk[i].p));
 const count=Math.max(1,Math.floor(cumulative.at(-1)/SLEEPER_SPACING));
 const mesh=new THREE.InstancedMesh(sleeperBox,sleeperMat,count);
 let i=1;
 for(let n=0;n<count;n++){
  const s=n*SLEEPER_SPACING;
  while(i<cumulative.length-1&&cumulative[i]<s)i++;
  const a=chunk[i-1],b=chunk[i],denom=cumulative[i]-cumulative[i-1]||1;
  const t=Math.max(0,Math.min(1,(s-cumulative[i-1])/denom));
  const x=interpolate(a.p[0],b.p[0],t),z=interpolate(a.p[1],b.p[1],t);
  const y=elevations(section,interpolate(a.t,b.t,t)).sleeper;
  const yaw=-Math.atan2(b.p[1]-a.p[1],b.p[0]-a.p[0]);
  rot.setFromAxisAngle(up,yaw);tempMatrix.compose(new THREE.Vector3(x,y,z),rot,one);
  mesh.setMatrixAt(n,tempMatrix);
 }
 mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();
 mesh.name='Regional rail sleepers '+section.id;return mesh;
}
export function buildTownRailContinuation(parent){
 const group=new THREE.Group();group.name='Repository Town hypothetical regional railway and return oval';
 parent.add(group);
 const stats={sections:[],chunks:0,sleepers:0,totalMetres:0,drawables:0};
 for(const section of REPO_RAIL_ADDITIONS){
  const sectionGroup=new THREE.Group();sectionGroup.name=section.id;group.add(sectionGroup);
  const pieces=chunks(section),length=section.pts.slice(1).reduce((n,p,i)=>n+dist(section.pts[i],p),0);
  stats.sections.push({id:section.id,metres:Math.round(length),chunks:pieces.length});
  stats.totalMetres+=length;
  for(const piece of pieces){
   const rails=new THREE.Mesh(geom(piece,section,'rail'),railMat);
   rails.name='Continuous 1435mm running rails';
   const bed=new THREE.Mesh(geom(piece,section,'bed'),bedMat);
   bed.name='Continuous trackbed and shoulder';
   const wood=sleepers(piece,section);
   const land=new THREE.Mesh(geom(piece,section,'verge'),vergeMat);
   land.name='Open green verge under unmapped connector';
   sectionGroup.add(land,bed,wood,rails);
   stats.sleepers+=wood.count;stats.chunks++;stats.drawables+=4;
  }
 }
 return {group,stats};
}
