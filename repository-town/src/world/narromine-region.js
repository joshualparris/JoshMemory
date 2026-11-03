// Real road alignments and government-geocoded public venues for Narromine.
// The shapes/widths of roads and facades are not a cadastral/building survey.
// Accurate XY centreline positions come from NSW Spatial Services (2026-11-03).
// Deliberately no made-up shops, rivers, railway crossings or private houses.
import * as THREE from 'three';
import {Builder} from './builder.js';
import {NARROMINE_LANDMARKS,NARROMINE_ROADS,NARROMINE_REAL_ROAD_COUNT,
  NARROMINE_ROAD_NAMES,NARROMINE_APPROACH,DANDALOO_MEDIAN_Z,
  narromineRoadAllows,nearestRegionalRoad} from './narromine-location.js';
const nearly=(a,b)=>Math.abs(a-b)<.01;
const rect=(x,z,w,d)=>({x0:x-w/2,x1:x+w/2,z0:z-d/2,z1:z+d/2});
export function buildNarromineRegion(parent,makeLabel){
 const group=new THREE.Group();
 group.name='Narromine NSW — real GIS roads + verified property geocodes (interpretive low-poly)';
 parent.add(group);
 const b=new Builder(),colliders=[];
 // At true metre scale: regional survey area, not the previous invented two-street grid.
 // No hypothetical townwide railway, buildings or watercourse is represented.
 b.box(0xa5a679,5250,.05,4800,-4525,-.085,330);
 // Outside-town arrival approach: fictional scenery/route in the ORIGINAL game universe.
 // Its 1.6km seam does not represent the real 16.5km+ external highway journey.
 b.box(0x988e63,1160,.04,1600,-1780,-.078,640);
 for(const road of NARROMINE_ROADS){
  const dx=road.b.x-road.a.x,dz=road.b.z-road.a.z,length=Math.hypot(dx,dz);
  if(length<.04)continue;
  const x=(road.a.x+road.b.x)/2,z=(road.a.z+road.b.z)/2;
  const angle=Math.atan2(dx,dz),nx=dz/length,nz=-dx/length;
  const median=road.name==='DANDALOO ST'&&z>DANDALOO_MEDIAN_Z[0]&&z<DANDALOO_MEDIAN_Z[1];
  if(median){
    // Dandaloo's genuine planted central strip is a heritage-listed feature.
    // Lanes have real centreline alignment, approximate cross-sectional widths.
    for(const offset of [-6.8,6.8])
      b.box(0x50545b,5.8,.035,length+1,x+nx*offset,.015,z+nz*offset,angle);
    b.box(0x679154,6,.042,length+.45,x,-.008,z,angle);
    // Sampled foliage is representative, not a current council tree inventory.
    if(length>14){
      const n=Math.floor(length/28);
      for(let i=0;i<n;i++){
        const t=(i+.5)/n,px=road.a.x+dx*t,pz=road.a.z+dz*t;
        b.cyl(0x795d3f,.17,2.3,px,1.2,pz);
        b.ball(0x5d8452,2.1,px,3.3,pz);
      }
    }
  } else {
    b.box(road.source==='game-compressed-link'?0x62615c:0x51555d,
      road.width,.038,length+1,x,.018,z,angle);
  }
  // Thin white intermittent centrelines for visual orientation, except garden median.
  if(!median&&road.width>=6.3&&length>17){
    const n=Math.min(9,Math.floor(length/26));
    for(let i=0;i<n;i++){
      const t=(i+.5)/n;
      b.box(0xd9d8cb,.12,.01,Math.min(5,length/n*.2),
        road.a.x+dx*t,.046,road.a.z+dz*t,angle);
    }
  }
 }
 // Representative, explicitly NOT Street View-derived, facades at official
 // property-address points. Never fabricate other shops to fill empty blocks.
 for(const site of NARROMINE_LANDMARKS){
   // True cadastral lot edges. The exact site is real; model dimensions aren't.
   if(site.parcelPolygon?.length>2){
     for(let i=1;i<site.parcelPolygon.length;i++){
       const a=site.parcelPolygon[i-1],end=site.parcelPolygon[i];
       const dx=end[0]-a[0],dz=end[1]-a[1],len=Math.hypot(dx,dz);
       if(len>.15)b.box(0xd5c4a6,.14,.028,len,(a[0]+end[0])/2,.055,(a[1]+end[1])/2,Math.atan2(dx,dz));
     }
   }
   const {buildingX:x,buildingZ:z,w,d,h,colour}=site;
   const brick=['heritage','heritage-hotel','hotel'].includes(site.kind);
   const roof=brick?0x64564e:0x777f77;
   b.box(colour,w,h,d,x,h/2,z,site.buildingFacing);
   b.box(roof,w+.7,.65,d+.7,x,h+.32,z,site.buildingFacing);
   if(site.id==='heritage-bank'){
     // Recognisable two-storey red-brick/white Art Deco corner treatment;
     // proportions not measured from 72 Dandaloo Street's real building.
     for(const y of [1.2,3,5.1])b.box(0xe5dfcc,w+1,.14,d+1,x,y,z,site.buildingFacing);
   }
   if(site.id==='royal'||site.id==='hotel'||site.id==='imperial'){
     // Heritage verandah roof form, rather than a generic glass office block.
     b.box(0x7c756b,w+2,.13,3.3,x,h-1.3,z+d/2+1.3,site.buildingFacing);
     for(let k=-1;k<=1;k++)b.cyl(0x6d6055,.14,h-1.4,x+k*w*.35,(h-1.4)/2,z+d/2+2.5);
   }
   const marker=makeLabel(site.name,'house');
   marker.position.set(site.x,3.3,site.z);group.add(marker);
   // Use source-verified address points for interaction; don't treat a model's
   // estimated walls as authoritative barriers to GIS-accurate road traffic.
   // Building-scale collision is added only after verified footprint import.
 }
 const welcome=makeLabel('NARROMINE · NSW 2821 · mapped roads, real shop addresses','interactive');
 const firstDandaloo=NARROMINE_ROADS.find(r=>r.name==='DANDALOO ST'&&r.a.z>DANDALOO_MEDIAN_Z[0]&&r.a.z<DANDALOO_MEDIAN_Z[1]);
 if(firstDandaloo){welcome.position.set(firstDandaloo.a.x+17,5,firstDandaloo.a.z);group.add(welcome);}
 for(const [i,pt] of NARROMINE_APPROACH.entries()){
   if(i!==1&&i!==3&&i!==NARROMINE_APPROACH.length-2)continue;
   const notice=makeLabel(i===1?'← Narromine via fictional regional connection':'Narromine this way · roadway continues','street');
   notice.position.set(pt.x,4.2,pt.z-9);group.add(notice);
 }
 // Label a sampled subset of real streets at true centreline positions.
 // Skip trivial slices and duplicates to stay responsive on Android.
 const signed=new Set();
 for(const road of NARROMINE_ROADS){
   if(road.source!=='nsw-centreline'||signed.size>=40)break;
   if(!road.name||road.name.startsWith('Unnamed')||signed.has(road.name))continue;
   const length=Math.hypot(road.b.x-road.a.x,road.b.z-road.a.z);
   if(length<55)continue;
   const label=makeLabel(road.name,'street');
   label.position.set((road.a.x+road.b.x)/2,3.1,(road.a.z+road.b.z)/2);
   group.add(label);signed.add(road.name);
 }
 group.add(b.build());
 return {group,colliders,landmarks:NARROMINE_LANDMARKS,
  sourceRoadSegments:NARROMINE_REAL_ROAD_COUNT,realStreetNames:NARROMINE_ROAD_NAMES.length,
  officialParcelOutlines:NARROMINE_LANDMARKS.filter(s=>s.parcelPolygon?.length>2).length,
  accuracy:'1-to-1 road centreline XY; road widths, shop facade size and entrance placement unverified'};
}
