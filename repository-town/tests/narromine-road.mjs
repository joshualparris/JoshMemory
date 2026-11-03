import assert from 'node:assert/strict';
import {NARROMINE_REAL,NARROMINE_ROADS,NARROMINE_REAL_ROAD_COUNT,NARROMINE_ROAD_NAMES,
 NARROMINE_APPROACH,NARROMINE_LANDMARKS,NARROMINE_UNLOCATED_SITES,
 DANDALOO_MEDIAN_Z,nearestRegionalRoad,narromineRoadAllows,narromineMedianBlocks,
 geoToNarromine,narromineToGeo,NARROMINE_GEO_BOUNDS,inNarromine,
 NARROMINE_CENTERLINES} from '../src/world/narromine-location.js';
import {onPlannedOrCoreRoad} from '../src/world/masterplan-built.js';

assert.equal(NARROMINE_REAL.name,'Narromine');
assert.equal(NARROMINE_REAL.gameScaleInsideTown,1,'1:1 game mapping in surveyed town');
assert.equal(NARROMINE_REAL.streetViewReviewed,false,'no fabricated Street View research');
assert.equal(NARROMINE_REAL.buildingFootprintsVerified,false,'no invented precise footprints');
assert(NARROMINE_CENTERLINES.length>=400,'authoritative NSW road centreline feature count');
assert(NARROMINE_REAL_ROAD_COUNT>=1000,'faithful segmented real-world curves');
for(const name of ['DANDALOO ST','BURRAWAY ST','NYMAGEE ST','MERINGO ST','TRANGIE RD','MITCHELL HWY'])
 assert(NARROMINE_ROAD_NAMES.includes(name),name);
assert.equal(new Set(NARROMINE_ROADS.map(r=>r.id)).size,NARROMINE_ROADS.length);
assert.equal(onPlannedOrCoreRoad(-1330,277),true,'original estate Wattle Street remains driveable');
assert.deepEqual(NARROMINE_APPROACH[0],{x:-1330,z:277});
for(let i=1;i<NARROMINE_APPROACH.length;i++){
 const a=NARROMINE_APPROACH[i-1],b=NARROMINE_APPROACH[i];
 for(let j=0;j<=40;j++){
  const t=j/40,x=a.x+(b.x-a.x)*t,z=a.z+(b.z-a.z)*t;
  assert(narromineRoadAllows(x,z),`fictional connection discontinuity segment ${i} t ${t}`);
 }
}
const last=NARROMINE_APPROACH.at(-1);
const actual=nearestRegionalRoad(last.x,last.z,'MITCHELL HWY');
assert(actual&&actual.d<.05,'connection must terminate at an actual govt-mapped highway point');
for(const r of NARROMINE_ROADS.filter(r=>r.source==='nsw-centreline'&&r.name!=='DANDALOO ST')){
 const m={x:(r.a.x+r.b.x)/2,z:(r.a.z+r.b.z)/2};
 assert(narromineRoadAllows(m.x,m.z),`mapped street not driveable: ${r.id} ${r.name}`);
}
const sample=NARROMINE_ROADS.filter(r=>r.name==='DANDALOO ST'&&(r.a.z+r.b.z)/2>DANDALOO_MEDIAN_Z[0]+25&&(r.a.z+r.b.z)/2<DANDALOO_MEDIAN_Z[1]-25);
assert(sample.length>=2,'heritage Dandaloo divided median represented');
let lanes=0;
for(const r of sample){
 const x=(r.a.x+r.b.x)/2,z=(r.a.z+r.b.z)/2,len=Math.hypot(r.b.x-r.a.x,r.b.z-r.a.z);
 const nx=(r.b.z-r.a.z)/len,nz=-(r.b.x-r.a.x)/len;
 if(!narromineMedianBlocks(x,z,.25))continue; // mapped cross street legitimately crosses
 assert(!narromineRoadAllows(x,z), 'garden median is not legal driving surface away from intersections');
 assert(narromineRoadAllows(x+nx*6.8,z+nz*6.8),'one mapped Dandaloo carriageway');
 assert(narromineRoadAllows(x-nx*6.8,z-nz*6.8),'opposite mapped Dandaloo carriageway');
 lanes++;
}
assert(lanes>=1,'at least one independently checked median location');

assert(NARROMINE_LANDMARKS.length>=14,'public venue addresses from NSW GURAS');
assert(NARROMINE_LANDMARKS.every(x=>x.parcelPolygon?.length>=4&&x.officialLotId),'every located public site has a real cadastral lot outline');
assert(NARROMINE_UNLOCATED_SITES.length>0,'missing address points are not invented');
assert.equal(new Set(NARROMINE_LANDMARKS.map(s=>s.id)).size,NARROMINE_LANDMARKS.length);
for(const site of NARROMINE_LANDMARKS){
 assert(site.source?.startsWith('https://'),site.id);
 assert(site.address?.endsWith(' NARROMINE'),site.id);
 assert(site.geometryAccuracy.includes('unverified facade'),site.id);
 assert(inNarromine(site.buildingX,site.buildingZ),site.id+' has geocoded position in region');
 const p=narromineToGeo(site.buildingX,site.buildingZ);
 assert(Math.abs(p.lon-site.coordinates[0])<.0000002 && Math.abs(p.lat-site.coordinates[1])<.0000002,site.id+' preserves official property point');
}
assert(!narromineRoadAllows(NaN,277));
assert(!inNarromine(Infinity,0));
assert(!narromineRoadAllows(9000,9000),'no fake driveability off town map');
console.log('PASS Narromine GIS: '+NARROMINE_CENTERLINES.length+' official paths, '+NARROMINE_REAL_ROAD_COUNT+' road segments, '+NARROMINE_ROAD_NAMES.length+' street names, '+NARROMINE_LANDMARKS.length+' NSW geocoded venues, lanes, median, rural link and geographic roundtrip');
