#!/usr/bin/env node
// Convert NSW Spatial Services CC BY 4.0 Lot layer 9 GeoJSON into compact
// Narromine OSM-anchor local metres. Input may be local GeoJSON as in Claude's
// original tool, or --fetch for reproducible ArcGIS public-service retrieval.
// No owner, title status, assessment, or private attributes are retained.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {NARROMINE_OSM as OSM} from '../src/world/narromine-osm-data.js';
const OUT=path.join(path.dirname(fileURLToPath(import.meta.url)),'../src/world/narromine-lots-data.js');
const URL_BASE='https://maps.six.nsw.gov.au/arcgis/rest/services/public/NSW_Cadastre/MapServer/9/query';
const BBOX='148.215,-32.255,148.265,-32.215';
const RAD=Math.PI/180,EARTH=6371008.8,COS=Math.cos(OSM.anchor.lat*RAD),TOL=.3;
const toLocal=([lon,lat])=>[(lon-OSM.anchor.lon)*RAD*EARTH*COS,-(lat-OSM.anchor.lat)*RAD*EARTH];
const dist=(p,a,b)=>{
 const dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz,t=l2?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/l2)):0;
 return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dz);
};
function dp(points,tol){
 const keep=new Uint8Array(points.length);keep[0]=keep[points.length-1]=1;
 const stack=[[0,points.length-1]];
 while(stack.length){
  const [i,j]=stack.pop();let max=0,at=-1;
  for(let k=i+1;k<j;k++){const d=dist(points[k],points[i],points[j]);if(d>max){max=d;at=k;}}
  if(max>tol){keep[at]=1;stack.push([i,at],[at,j]);}
 }
 return points.filter((_,i)=>keep[i]);
}
function simplifyRing(ring,tol){
 let far=1,best=0;
 for(let k=1;k<ring.length;k++){const d=Math.hypot(ring[k][0]-ring[0][0],ring[k][1]-ring[0][1]);if(d>best){best=d;far=k;}}
 const a=dp(ring.slice(0,far+1),tol),b=dp([...ring.slice(far),ring[0]],tol);
 return [...a.slice(0,-1),...b.slice(0,-1)];
}
const area=r=>Math.abs(r.reduce((s,p,i)=>{const q=r[(i+1)%r.length];return s+p[0]*q[1]-q[0]*p[1];},0))/2;
async function fetchPage(offset){
 const u=new URL(URL_BASE),q=u.searchParams;
 for(const [k,v] of Object.entries({where:'1=1',geometry:BBOX,geometryType:'esriGeometryEnvelope',inSR:'4326',
  outSR:'4326',spatialRel:'esriSpatialRelIntersects',outFields:'objectid,lotnumber,planlabel',
  returnGeometry:'true',resultOffset:String(offset),resultRecordCount:'1000',orderByFields:'objectid ASC',f:'geojson'}))
  q.set(k,v);
 for(let retry=0;retry<3;retry++){
  try{
   const response=await fetch(u,{signal:AbortSignal.timeout(60000)});
   if(!response.ok)throw Error('HTTP '+response.status);
   const data=await response.json();
   if(data.error||!Array.isArray(data.features))throw Error('ArcGIS did not return GeoJSON: '+JSON.stringify(data.error||data).slice(0,250));
   return data.features;
  }catch(e){if(retry===2)throw e;await new Promise(r=>setTimeout(r,500*(retry+1)));}
 }
}
async function readFeatures(){
 const args=process.argv.slice(2);
 if(args.length===1&&args[0]==='--fetch'){
  const pages=[];for(let offset=0;offset<30000;offset+=1000){
   const features=await fetchPage(offset);
   console.log('NSW cadastre page offset '+offset+': '+features.length+' features');
   pages.push(...features);
   if(features.length<1000)return pages;
  }
  throw Error('ArcGIS pagination exceeded 30,000; do not publish partial lot data');
 }
 if(!args.length){console.error('usage: node tools/narromine-lots.mjs --fetch OR lots-1.geojson [lots-2.geojson ...]');process.exit(1);}
 return args.flatMap(p=>JSON.parse(fs.readFileSync(p,'utf8')).features);
}
const features=await readFeatures(),E=OSM.extent,M=40;
const box={x0:E.x0-M,x1:E.x1+M,z0:E.z0-M,z1:E.z1+M};
const seen=new Set(),lots=[];let outside=0,thin=0,dup=0;
for(const ft of features){
 if(!ft?.properties||!ft?.geometry)throw Error('Invalid NSW cadastre feature');
 const id=ft.properties.objectid;
 if(id==null)throw Error('NSW cadastre missing OBJECTID; refusing unverifiable dataset');
 if(seen.has(id)){dup++;continue;}seen.add(id);
 const parts=ft.geometry.type==='Polygon'?[ft.geometry.coordinates]:ft.geometry.type==='MultiPolygon'?ft.geometry.coordinates:null;
 if(!parts)throw Error('Unrecognised NSW cadastre geometry: '+ft.geometry.type);
 const lot=String(ft.properties.lotnumber??''),plan=String(ft.properties.planlabel??'');
 for(const part of parts){
  let ring=part[0].map(toLocal);
  if(ring.length>1&&ring[0][0]===ring.at(-1)[0]&&ring[0][1]===ring.at(-1)[1])ring.pop();
  if(ring.length<3)continue;
  const xs=ring.map(p=>p[0]),zs=ring.map(p=>p[1]);
  if(Math.max(...xs)<box.x0||Math.min(...xs)>box.x1||Math.max(...zs)<box.z0||Math.min(...zs)>box.z1){outside++;continue;}
  ring=simplifyRing(ring,TOL);
  if(ring.length<3||area(ring)<1){thin++;continue;}
  const d=ring.map(([x,z])=>[Math.round(x*10),Math.round(z*10)]);
  const flat=[d[0][0],d[0][1]];
  for(let i=1;i<d.length;i++)flat.push(d[i][0]-d[i-1][0],d[i][1]-d[i-1][1]);
  lots.push([lot,plan,flat]);
 }
}
lots.sort((a,b)=>a[1].localeCompare(b[1])||a[0].localeCompare(b[0],undefined,{numeric:true}));
if(lots.length<1500||lots.length>2600)throw Error('Unexpected public lot coverage '+lots.length+'; do not commit incomplete public source');
const meta={source:'NSW Spatial Services cadastre, Lot layer (NSW_Cadastre MapServer 9)',licence:'CC BY 4.0',
 attribution:'© State of New South Wales (NSW Spatial Services)',exported:new Date().toISOString().slice(0,10),
 units:'rings: [lot, plan, [x0, z0, dx1, dz1, ...]] in decimetres of local map metres (x east, z south), as narromine-osm-data.js'};
fs.writeFileSync(OUT,`// Generated by tools/narromine-lots.mjs from NSW cadastre lots — do not edit by hand.\n// © State of New South Wales (NSW Spatial Services), CC BY 4.0. Lot number and plan label only.\nexport const NARROMINE_LOTS = ${JSON.stringify({...meta,lots})};\n`);
console.log(`lots read ${features.length}, rings kept ${lots.length}, outside ${outside}, thin ${thin}, duplicates ${dup}; wrote ${path.relative(process.cwd(),OUT)} (${Math.round(fs.statSync(OUT).size/1024)} KB)`);
