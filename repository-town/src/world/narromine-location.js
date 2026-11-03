// Actual Narromine NSW: authoritative GDA2020 road centreline geometry and GURAS
// property-based geocodes. Real metric scale INSIDE town; the fictional
// Repository Town connection is explicitly marked as a compressed game route.
// NSW Spatial Services (CC BY) attribution retained in source and visitor panels.
import {NARROMINE_CENTERLINES,NARROMINE_GEO_ORIGIN,NARROMINE_GEO_BOUNDS,
  geoToNarromine,narromineToGeo,NARROMINE_ROAD_SOURCE} from './narromine-geodata.js';
import {NARROMINE_PUBLIC_GEOCODES,NARROMINE_UNLOCATED_SITES,
  NARROMINE_ADDRESS_SOURCE} from './narromine-public-geocodes.js';
export {NARROMINE_CENTERLINES,NARROMINE_GEO_ORIGIN,NARROMINE_GEO_BOUNDS,
  geoToNarromine,narromineToGeo,NARROMINE_ROAD_SOURCE,NARROMINE_ADDRESS_SOURCE,
  NARROMINE_UNLOCATED_SITES};

export const NARROMINE_REAL=Object.freeze({
 name:'Narromine',state:'NSW',postcode:'2821',traditionalCountry:'Wiradjuri Country',
 gameScaleInsideTown:1,realWorldLinkToRepoTown:'compressed and fictional; NOT GIS-authenticated',
 publishedPopulation2021UCL:3507,publishedPopulation2021LGA:6360,
 positionSource:'NSW Spatial Services road centrelines + GURAS address points (not surveyed entrances)',
 streetViewReviewed:false,buildingFootprintsVerified:false,
 source:'https://www.spatial.nsw.gov.au/products_and_services/web_services'
});

const roadWidth=name=>/MITCHELL HWY|DANDALOO ST|BURRAWAY ST|TRANGIE RD/.test(name)?8.5:/RD$/.test(name)?7.8:/LANE|LANEWAY/.test(name)?3.5:6.3;
const realRoads=[];
for(const [sourceId,name,coordinates] of NARROMINE_CENTERLINES){
 for(let i=2;i<coordinates.length;i+=2){
  const a={x:coordinates[i-2],z:coordinates[i-1]},b={x:coordinates[i],z:coordinates[i+1]};
  if(Math.hypot(a.x-b.x,a.z-b.z)<.05)continue;
  realRoads.push({id:'nsw-'+sourceId+'-'+((i/2)-1),name:name||'Unnamed public road (mapping source)',
    source:'nsw-centreline',a,b,width:roadWidth(name),nswId:sourceId});
 }
}
// The fictional Wattle connection follows the rural edge to an ACTUAL mapped
// Mitchell Highway link at the east survey boundary. It is not falsely passed
// off as an NSW gazetted road. Its path is a gameplay-only approximation.
const eastHighway=realRoads.filter(r=>r.name==='MITCHELL HWY')
  .flatMap(r=>[r.a,r.b])
  .sort((a,b)=>b.x-a.x)[0];
if(!eastHighway||eastHighway.x>-1650||eastHighway.x<-3100)
 throw Error('Expected actual Narromine Mitchell Highway eastern boundary not present');
export const NARROMINE_APPROACH=Object.freeze([
 Object.freeze({x:-1330,z:277}),
 Object.freeze({x:-1500,z:277}),
 Object.freeze({x:-1760,z:365}),
 Object.freeze({x:-1940,z:560}),
 Object.freeze({x:-2040,z:770}),
 Object.freeze({x:-2120,z:1010}),
 Object.freeze({...eastHighway})
]);
const approachSegments=NARROMINE_APPROACH.slice(1).map((b,i)=>({
 id:i===0?'western-regional-link':'western-regional-link-'+i,
 name:'Fictional Wattle–Mitchell Highway game connection',
 a:NARROMINE_APPROACH[i],b,width:9.5,source:'game-compressed-link'
}));
export const NARROMINE_ROADS=Object.freeze([...realRoads,...approachSegments]);
export const NARROMINE_REAL_ROAD_COUNT=realRoads.length;
export const NARROMINE_ROAD_NAMES=Object.freeze([...new Set(realRoads.map(r=>r.name).filter(n=>!n.startsWith('Unnamed')))].sort());

function projectToSegment(x,z,r){
 const dx=r.b.x-r.a.x,dz=r.b.z-r.a.z,len2=dx*dx+dz*dz;
 const t=len2?Math.max(0,Math.min(1,((x-r.a.x)*dx+(z-r.a.z)*dz)/len2)):0;
 const px=r.a.x+t*dx,pz=r.a.z+t*dz;
 return {x:px,z:pz,d:Math.hypot(x-px,z-pz),t,dx,dz};
}
export function nearestRegionalRoad(x,z,roadName=''){
 if(!Number.isFinite(x)||!Number.isFinite(z))return null;
 let best=null,d=Infinity;
 for(const r of NARROMINE_ROADS){
   if(roadName&&!r.name.startsWith(roadName))continue;
   const pt=projectToSegment(x,z,r);
   if(pt.d<d){best={road:r,...pt};d=pt.d;}
 }
 return best;
}
const medianNorth=geoToNarromine(148.24,-32.229857).z;
const medianSouth=geoToNarromine(148.2395,-32.232916).z;
export const DANDALOO_MEDIAN_Z=Object.freeze([medianNorth,medianSouth]);
const isMedianRoad=r=>r.name==='DANDALOO ST'
 && (r.a.z+r.b.z)/2>medianNorth&&(r.a.z+r.b.z)/2<medianSouth;

export function narromineRoadAllows(x,z){
 if(!Number.isFinite(x)||!Number.isFinite(z))return false;
 for(const r of NARROMINE_ROADS){
  // Fast axis-bounds rejection with a road-width margin before vector math.
  const margin=isMedianRoad(r)?11:Math.max(3,r.width/2);
  if(x<Math.min(r.a.x,r.b.x)-margin||x>Math.max(r.a.x,r.b.x)+margin||
     z<Math.min(r.a.z,r.b.z)-margin||z>Math.max(r.a.z,r.b.z)+margin)continue;
  const p=projectToSegment(x,z,r);
  if(isMedianRoad(r)){
   // Represent the heritage-listed garden median as non-road, with carriageways
   // on BOTH sides. Lane/median widths are interpretive pending a field survey.
   if(p.d>=3.1&&p.d<=10.8)return true;
  }else if(p.d<=r.width/2)return true;
 }
 return false;
}
export function narromineMedianBlocks(x,z,radius=0){
 if(!Number.isFinite(x)||!Number.isFinite(z))return false;
 // A pedestrian may cross the median; this guard is specifically for cars.
 // Streets crossing Dandaloo at an official GIS junction stay connected.
 const crossStreet=NARROMINE_ROADS.some(s=>s.name!=='DANDALOO ST'&&s.source!=='game-compressed-link'
  &&Math.min(s.a.x,s.b.x)-5<=x&&x<=Math.max(s.a.x,s.b.x)+5
  &&Math.min(s.a.z,s.b.z)-5<=z&&z<=Math.max(s.a.z,s.b.z)+5
  &&projectToSegment(x,z,s).d<Math.max(2.8,s.width/2));
 if(crossStreet)return false;
 return realRoads.some(s=>isMedianRoad(s)&&projectToSegment(x,z,s).d<2.75+radius);
}
const colours={shopping:0xd9c39f,post:0xe5d4bd,pharmacy:0xc8d9c5,
 cafe:0xe1b894,charity:0xa8b2c0,retail:0xdac3a8,butcher:0xc78f78,
 library:0xc5aa88,heritage:0x9a6151,hotel:0xb3a08b,
 'heritage-hotel':0xa99078,health:0xd0d9c6};
const addressStreet=a=>a.includes('DANDALOO STREET')?'DANDALOO ST'
 :a.includes('BURRAWAY STREET')?'BURRAWAY ST'
 :a.includes('NYMAGEE STREET')?'NYMAGEE ST'
 :a.includes('CATHUNDRIL STREET')?'CATHUNDRIL ST':'';
function makeLandmark(item){
 const anchor=geoToNarromine(item.coordinates[0],item.coordinates[1]);
 const road=nearestRegionalRoad(anchor.x,anchor.z,addressStreet(item.address));
 const v=road||nearestRegionalRoad(anchor.x,anchor.z);
 if(!v)return null;
 // The official GURAS point identifies a PROPERTY. Move the interaction
 // just to its nearest road footpath, on the correct side of that road.
 const nx=anchor.x-v.x,nz=anchor.z-v.z;
 const len=Math.hypot(nx,nz);
 const normal=len>.4?{x:nx/len,z:nz/len}:{x:v.dz/Math.hypot(v.dx,v.dz),z:-v.dx/Math.hypot(v.dx,v.dz)};
 const roadSpace=isMedianRoad(v.road)?12:Math.max(4.5,v.road.width/2+2.0);
 const x=v.x+normal.x*roadSpace,z=v.z+normal.z*roadSpace;
 return Object.freeze({...item,
  x:+x.toFixed(2),z:+z.toFixed(2),
  buildingX:+anchor.x.toFixed(2),buildingZ:+anchor.z.toFixed(2),
  addressX:+anchor.x.toFixed(2),addressZ:+anchor.z.toFixed(2),
  buildingFacing:Math.atan2(v.dx,v.dz),colour:colours[item.kind]||0xbca98d,
  w:item.id==='coles-square'?31:14,d:item.id==='coles-square'?21:11,
  h:['hotel','heritage-hotel','heritage'].includes(item.kind)?6.9:5.1,
  summary:item.name+' · '+item.address.replace(' NARROMINE','')+', Narromine NSW 2821. Official NSW property-address position; the low-poly facade, entrance and dimensions are still estimates, not an exact surveyed building. Business listings may change.',
  source:item.source,geometryAccuracy:'geocoded parcel point, unverified facade'
 });
}
export const NARROMINE_LANDMARKS=Object.freeze(NARROMINE_PUBLIC_GEOCODES.map(makeLandmark).filter(Boolean));
export function nearestNarromineLandmark(pos,range=6.5){
 if(!pos||!Number.isFinite(pos.x)||!Number.isFinite(pos.z)||!Number.isFinite(range)||range<0)return null;
 let nearest=null,best=range;
 for(const site of NARROMINE_LANDMARKS){
  const d=Math.hypot(site.x-pos.x,site.z-pos.z);
  if(d<best){nearest=site;best=d;}
 }
 return nearest;
}
export function inNarromine(x,z){
 if(!Number.isFinite(x)||!Number.isFinite(z))return false;
 const p=narromineToGeo(x,z);
 return p.lon>=NARROMINE_GEO_BOUNDS.w&&p.lon<=NARROMINE_GEO_BOUNDS.e
  &&p.lat>=NARROMINE_GEO_BOUNDS.s&&p.lat<=NARROMINE_GEO_BOUNDS.n;
}
