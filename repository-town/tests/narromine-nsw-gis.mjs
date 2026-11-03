import assert from 'node:assert/strict';
import {NARROMINE_CENTERLINES,NARROMINE_ROAD_SOURCE} from '../src/world/narromine-geodata.js';
import {NARROMINE_PUBLIC_GEOCODES,NARROMINE_UNLOCATED_SITES} from '../src/world/narromine-public-geocodes.js';
import {NARROMINE_PUBLIC_LOTS} from '../src/world/narromine-public-lots.js';
import {NSW_GIS_STREETS,NSW_PUBLIC_PLACES,NSW_GIS_PROVENANCE,
 DANDALOO_HERITAGE_MEDIAN,publicGeoToGame,gameToPublicGeo} from '../src/world/narromine-nsw-mapping.js';
import {STREETS,OSM,BUILDINGS,PLACES,FILL_SHOPS,FILL_HOUSES,
 onNarromineRoad,onDandalooGardenMedian,geoToWorld} from '../src/world/narromine-layout.js';

assert.equal(NARROMINE_CENTERLINES.length,432,'government source road records');
assert(NSW_GIS_STREETS.length>1700,'government source centreline segments retained');
assert.equal(NSW_PUBLIC_PLACES.length,16,'authoritative public business/site address points');
assert.equal(NARROMINE_PUBLIC_LOTS.length,16,'actual cadastral lots for public sites');
assert(NARROMINE_UNLOCATED_SITES.length>0,'unmatched sources kept unknown, never guessed');
assert.equal(OSM.licence,'ODbL 1.0');
assert(BUILDINGS.length>=219,'retain original OSM mapped actual building outlines');
assert.equal(FILL_SHOPS.length,0,'no invented shopfronts for missing mapped buildings');
assert.equal(FILL_HOUSES.length,0,'no random generated homes pretending to be real Narromine');
const names=new Set(STREETS.map(r=>r.name));
for(const n of ['Dandaloo Street','Burraway Street','Nymagee Street','Meringo Street','Mitchell Highway'])
 assert(names.has(n),'real NSW street present: '+n);
for(const poi of NSW_PUBLIC_PLACES){
 assert(poi.parcel?.length>=4,'official public lot attached: '+poi.name);
 assert(poi.officialLotId,'official lot key: '+poi.name);
 assert(poi.precision.includes('not building doorway'),'no fake entrance accuracy');
 const back=gameToPublicGeo(poi.x,poi.z);
 assert(Math.abs(back.lon-poi.coordinates[0])<1e-7&&Math.abs(back.lat-poi.coordinates[1])<1e-7,
   'round trip source coordinate: '+poi.name);
 assert(PLACES.some(p=>p.name===poi.name&&Math.hypot(p.x-poi.x,p.z-poi.z)<.1),
   'shop must appear at official geocode in game: '+poi.name);
}
const royal=PLACES.find(p=>p.name==='Royal Hotel');
assert(royal?.address.includes('Dandaloo'),'Royal real address preserved');
assert.match(royal.fact,/1890/);
const heritage=NSW_GIS_STREETS.filter(r=>r.divided);
assert(heritage.length>=3,'actual garden-median segment alignment exists');
let laneMatches=0;
for(const seg of heritage){
 const a=seg.pts[0],b=seg.pts[1],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);
 if(len<5)continue;
 const x=(a[0]+b[0])/2,z=(a[1]+b[1])/2,nx=dz/len,nz=-dx/len;
 if(!onDandalooGardenMedian(x,z,.3))continue; // legal intersection
 assert(onNarromineRoad(x+nx*6.8,z+nz*6.8),'northbound divided carriageway');
 assert(onNarromineRoad(x-nx*6.8,z-nz*6.8),'southbound divided carriageway');
 laneMatches++;
}
assert(laneMatches>=1,'at least one Dandaloo garden divider can be driven around, not through');
for(const [longitude,latitude] of [[148.2396,-32.232],[148.241,-32.234],[148.238,-32.231]]){
 const a=publicGeoToGame(latitude,longitude),b=geoToWorld(latitude,longitude);
 assert(Math.hypot(a[0]-b[0],a[1]-b[1])<.02,'government streets and OSM buildings share a single geodetic frame');
}
assert(NSW_GIS_PROVENANCE.roads.startsWith('https://'),'traceable NSW government street data');
assert(/Street View/.test('Street View') && NSW_GIS_PROVENANCE.streetViewStatus.startsWith('Not inspected'));
console.log('PASS Narromine government GIS fidelity: '+NSW_GIS_STREETS.length+' road segments, '+names.size+' road names, '+BUILDINGS.length+' OSM buildings, '+NSW_PUBLIC_PLACES.length+' official businesses/lot polygons, Dandaloo divided median, zero fabricated shop/houses');
