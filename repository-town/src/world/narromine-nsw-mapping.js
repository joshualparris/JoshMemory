// Narromine government GIS integration into the existing OSM-authored town.
// Source A: NSW Spatial Services RoadCentreline (GDA2020, 432 polylines, 2026-11-03).
// Source B: NSW Spatial Services Geocoded Addressing Theme + cadastral Lots,
// limited to publicly listed businesses/services, NOT residents or owner records.
// Source C: OpenStreetMap ODbL; preserve attribution as used by the existing game.
// The actual XY location is ~1:1. Road widths, lane markings, building heights,
// shopfronts and current tenancy require separate visual verification.
import {NARROMINE_CENTERLINES,narromineToGeo} from './narromine-geodata.js';
import {NARROMINE_PUBLIC_GEOCODES,NARROMINE_UNLOCATED_SITES} from './narromine-public-geocodes.js';
import {NARROMINE_PUBLIC_LOTS} from './narromine-public-lots.js';
import {NARROMINE_OSM} from './narromine-osm-data.js';
const RAD=Math.PI/180,R=6371008.8,COS=Math.cos(NARROMINE_OSM.anchor.lat*RAD);
const x0=-2870,z0=-7;
export function publicGeoToGame(lat,lon){
 return [x0+(lon-NARROMINE_OSM.anchor.lon)*RAD*R*COS,z0-(lat-NARROMINE_OSM.anchor.lat)*RAD*R];
}
export function gameToPublicGeo(x,z){
 return {lat:NARROMINE_OSM.anchor.lat-(z-z0)/(RAD*R),
  lon:NARROMINE_OSM.anchor.lon+(x-x0)/(RAD*R*COS)};
}
const ROAD_TYPES={ST:'Street',RD:'Road',AVE:'Avenue',DR:'Drive',CR:'Crescent',
 CT:'Court',CL:'Close',PL:'Place',PDE:'Parade',HWY:'Highway',BYPA:'Bypass',
 CCT:'Circuit',LANE:'Lane'};
const TITLE_EXCEPTIONS={DANDALOO:'Dandaloo',BURRAWAY:'Burraway',NYMAGEE:'Nymagee',
 CATHUNDRIL:'Cathundril',MERYULA:'Meryula',DERRIBONG:'Derribong',MERILBA:'Merilba',
 MERINGO:'Meringo',TEMOIN:'Temoin'};
export function expandedRoadName(raw){
 const bits=String(raw||'').trim().split(/\s+/);
 return bits.map((w,i)=>ROAD_TYPES[w]||TITLE_EXCEPTIONS[w]||(w[0]||'')+w.slice(1).toLowerCase()).join(' ');
}
export const DANDALOO_HERITAGE_MEDIAN={
 north:publicGeoToGame(-32.2298569,148.2399766)[1],
 south:publicGeoToGame(-32.2329157,148.2394229)[1],
 source:'https://legislation.nsw.gov.au/view/whole/pdf/inforce/2025-08-14/epi-2011-0648',
 legalReference:'Narromine LEP heritage listing I7 (historical instrument; 2026 status to reconfirm)',
 widthEstimatedMetres:6.0, laneOffsetsEstimatedMetres:6.8
};
export const NSW_GIS_STREETS=Object.freeze(NARROMINE_CENTERLINES.flatMap(([objectId,raw,line])=>{
 const name=expandedRoadName(raw),out=[];
 for(let i=2;i<line.length;i+=2){
  const ga=narromineToGeo(line[i-2],line[i-1]),gb=narromineToGeo(line[i],line[i+1]);
  const a=publicGeoToGame(ga.lat,ga.lon),b=publicGeoToGame(gb.lat,gb.lon),len=Math.hypot(b[0]-a[0],b[1]-a[1]);
  if(len<.06)continue;
  const divided=name==='Dandaloo Street'&&(a[1]+b[1])/2>DANDALOO_HERITAGE_MEDIAN.north &&
     (a[1]+b[1])/2<DANDALOO_HERITAGE_MEDIAN.south;
  const highway=name==='Mitchell Highway';
  out.push(Object.freeze({id:'nsw-'+objectId+'-'+(i/2-1),
    name:raw?name:'Unnamed mapped road',kind:highway?'trunk':/Road$|Drive$|Bypass$/.test(name)?'unclassified':'residential',
    width:highway?10:divided?6.2:/Dandaloo Street|Burraway Street|Trangie Road/.test(name)?9:7,
    pts:Object.freeze([a,b]),source:'NSW Spatial Services RoadCentreline',sourceId:objectId,divided}));
 }
 return out;
}));
const lotById=new Map(NARROMINE_PUBLIC_LOTS.map(s=>[s.id,s]));
const TITLE={ 'coles-square':'Coles',post:'Narromine Post Office',pharmacy:'Narromine Pharmacy',
 zest:'Zest by Modern Foodie',vinnies:'Vinnies',macquarie:'Macquarie Clothing',
 'soul-food':'Soul Food Depot & Gallery',butchery:'Narromine Butchery',
 library:'Narromine Library & Local History Room',
 keeping:'Narromine Aboriginal Keeping Place',
 'heritage-bank':'Former CBC Bank',hotel:'Narromine Hotel',
 royal:'Royal Hotel',abbey:'The Abbey',imperial:'Imperial Hotel',
 hospital:'Narromine Health Service'};
export const NSW_PUBLIC_PLACES=Object.freeze(NARROMINE_PUBLIC_GEOCODES.map(p=>{
 const [x,z]=publicGeoToGame(p.coordinates[1],p.coordinates[0]),lot=lotById.get(p.id);
 return Object.freeze({...p,name:TITLE[p.id]||p.name,x,z,
    kindLabel:String(p.kind).replace(/-/g,' '),fact:'NSW GURAS address-registered public property. The business name is from a dated directory; storefront and current opening status are not independently verified.',
    parcel:lot?.polygon?.map(([lon,lat])=>publicGeoToGame(lat,lon))||null,
    officialLotId:lot?.nswLotId||null,precision:'government address point, not building doorway'});
}));
export const NSW_UNLOCATED_PUBLIC_PLACES=NARROMINE_UNLOCATED_SITES;
export const NSW_GIS_PROVENANCE=Object.freeze({
 roads:'https://beta.portal.spatial.nsw.gov.au/server/rest/services/NSW_Land_Parcel_Property_Theme_A/MapServer/1',
 addresses:'https://portal.spatial.nsw.gov.au/server/rest/services/NSW_Geocoded_Addressing_Theme_multiCRS/FeatureServer/1',
 cadastralLots:'https://portal.spatial.nsw.gov.au/server/rest/services/NSW_Land_Parcel_Property_Theme_multiCRS/FeatureServer/8',
 retrieved:'2026-11-03',sources:'NSW Spatial Services, OpenStreetMap contributors (ODbL)',
 streetViewStatus:'Not inspected: connected interactive Google Maps browser lacked wallet credit'
});
