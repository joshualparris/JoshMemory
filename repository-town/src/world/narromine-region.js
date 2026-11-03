// Lightweight representative regional scenery. This is an explorable fictional
// compression of the real town, not a photogrammetric replica or legal road map.
import * as THREE from 'three';
import {Builder} from './builder.js';
import {NARROMINE_LANDMARKS,NARROMINE_ROADS} from './narromine-location.js';

const rect=(x,z,w,d)=>({x0:x-w/2,x1:x+w/2,z0:z-d/2,z1:z+d/2});
export function buildNarromineRegion(parent,makeLabel){
  const group=new THREE.Group();
  group.name='Narromine — compressed playable regional destination';
  parent.add(group);
  const b=new Builder(),colliders=[];
  // Continuously cover the drive from the western existing estate to Narromine.
  // Terrain is deliberately joined to the established estate; the old fixed
  // collision boundary must be extended in main.js as well.
  b.box(0xa6a475,1750,.06,510,-2125,-.075,300);
  for(let i=0;i<18;i++){
    const x=-1445-i*64;
    b.box(i%3===0?0x9e9759:i%3===1?0xc6ad70:0x8d9b61,51,.045,90,x,-.027,211);
    b.box(i%3===0?0xb4a369:i%3===1?0x879553:0xc0aa70,51,.045,110,x,-.027,356);
    if(i%3===0){
      for(const z of [185,392]){
        b.cyl(0x6b5037,.35,4,x,2,z);
        b.ball(0x587d43,2.6,x,5,z);
      }
    }
  }
  // All asphalt strips use the same rectangles as player-driving. Dashed
  // centrelines remain cosmetic, and oncoming real-world traffic is NOT simulated.
  for(const road of NARROMINE_ROADS){
    const w=road.x1-road.x0,d=road.z1-road.z0,x=(road.x0+road.x1)/2,z=(road.z0+road.z1)/2;
    b.box(0x4e5259,w,.05,d,x,.008,z);
    const alongX=w>d,span=alongX?w:d,begin=alongX?road.x0:road.z0;
    for(let s=7;s<span-4;s+=22){
      const p=begin+s+Math.min(5,span-s-4)/2;
      if(alongX)b.box(0xdcd6ae,Math.min(5,span-s-4),.026,.14,p,.045,z);
      else b.box(0xdcd6ae,.14,.026,Math.min(5,span-s-4),x,.045,p);
    }
  }
  // Rural approach: grain sheds, paddocks and tree-lined verges; avoid the road.
  for(let i=0;i<12;i++){
    const x=-1450-i*83;
    b.cyl(0x74583c,.23,2.4,x,1.2,259);
    b.ball(0x5c8247,1.7,x,3.4,259);
    b.cyl(0x74583c,.23,2.4,x+28,1.2,303);
    b.ball(0x60884b,1.7,x+28,3.4,303);
  }
  for(const x of [-2330,-2319,-2308]){
    b.cyl(0xb6b6ac,4.1,16,x,8,215);
    b.cone(0x888d92,5.2,4.7,x,18.4,215);
  }
  // A town centre: generic brick and painted facades, no copied real shopfronts.
  for(let z=179;z<=365;z+=25){
    for(const side of [-1,1]){
      const x=-2630+side*31;
      if(NARROMINE_LANDMARKS.some(q=>Math.hypot(q.buildingX-x,q.buildingZ-z)<23))continue;
      const col=side===-1?0xc7aa81:0xd2b793;
      b.box(col,20,5.2,17,x,2.6,z);
      b.box(0x775447,21,.7,18,x,5.55,z);
      b.box(0x9dcbd1,.16,2,7,x-side*10.1,2.5,z);
      b.box(0x65503e,.4,2.35,1.7,x-side*10.4,1.18,z-5);
      colliders.push(rect(x,z,20,17));
    }
  }
  const colours=[0xd6c69c,0xc8a17c,0xb2b5ad,0xe4c8a7,0xb5c2b7];
  NARROMINE_LANDMARKS.forEach((site,i)=>{
    if(site.id==='park'){
      b.box(0x6c9956,23,.025,25,site.buildingX,-.017,site.buildingZ);
      for(let j=0;j<3;j++){
        const x=site.buildingX+(j-1)*7;
        b.cyl(0x725636,.43,3.2,x,1.6,site.buildingZ+7);
        b.ball(0x558549,2.7,x,4.4,site.buildingZ+7);
      }
      b.box(0x9f9179,11,.05,1.7,site.buildingX,.035,site.buildingZ-6);
    }else if(site.id==='wetlands'){
      b.box(0x5c875b,66,.04,70,site.buildingX,-.02,site.buildingZ);
      for(let j=0;j<5;j++)b.box(j%2?0x477c91:0x568f9c,13,.028,16,site.buildingX+(j%3-1)*18,-.005,site.buildingZ+(Math.floor(j/3)-.5)*30);
      for(let j=0;j<13;j++)b.cyl(0x607444,.2,2.2,site.buildingX+(j%5-2)*12,1.1,site.buildingZ+(Math.floor(j/5)-1)*22);
    }else if(site.id==='aerodrome'){
      b.box(0xe0ded0,site.w,site.h,site.d,site.buildingX,site.h/2,site.buildingZ);
      b.box(0x8c9193,site.w+3,.6,site.d+3,site.buildingX,site.h+.3,site.buildingZ);
      b.box(0x495d63,site.w*.76,site.h*.72,.2,site.buildingX,site.h*.37,site.buildingZ-site.d/2-.15);
      colliders.push(rect(site.buildingX,site.buildingZ,site.w,site.d));
    }else{
      b.box(colours[i%colours.length],site.w,site.h,site.d,site.buildingX,site.h/2,site.buildingZ);
      b.box(site.id==='museum'?0x506978:0x675f56,site.w+1.6,.65,site.d+1.6,site.buildingX,site.h+.31,site.buildingZ);
      const sx=site.x<site.buildingX?-1:1;
      b.box(0x9dc5ca,.16,1.9,site.d*.43,site.buildingX+sx*(site.w/2+.08),2.5,site.buildingZ+3.4);
      b.box(0x655242,.18,2.35,2,site.buildingX+sx*(site.w/2+.17),1.2,site.buildingZ-4);
      colliders.push(rect(site.buildingX,site.buildingZ,site.w,site.d));
    }
    // Signs indicate optional on-foot information hotspots, separate from doors.
    b.cyl(0x665b50,.11,2.4,site.x,1.2,site.z);
    const label=makeLabel(site.name,'house');
    label.position.set(site.x,3.7,site.z);
    group.add(label);
  });
  // Water feature alongside wetlands: evocative, not an official flood layer.
  b.box(0x47859b,30,.028,155,-2850,-.023,417);
  for(let i=0;i<16;i++){
    const z=346+i*8.4;
    for(const x of [-2869,-2830]){
      b.cyl(0x5b6c39,.16,1.9,x,.95,z);
      b.ball(0x628252,1.3,x,2.4,z);
    }
  }
  // Aviation runway is a view-only landmark; cars are never authorised on it.
  b.box(0x85898b,240,.047,17,-2380,.015,529);
  for(let x=-2480;x<-2290;x+=22)b.box(0xf0e8cf,6,.029,.25,x,.055,529);
  for(let x=-2470;x<-2290;x+=52){
    b.box(0xe7dfc9,9,.025,1.5,x,.048,512);
  }
  // Short heritage siding ends BEFORE Dandaloo Street: no unprotected game crossing.
  for(const z of [118,121]){
    b.box(0x737b80,108,.12,.12,-2720,.035,z);
  }
  for(let x=-2768;x<-2670;x+=4)b.box(0x79634c,2,.11,5,x,.02,119.5);
  const welcome=makeLabel('Narromine NSW 2821 · regional destination','interactive');
  welcome.position.set(-2502,4.9,266);group.add(welcome);
  group.add(b.build());
  return {group,colliders,landmarks:NARROMINE_LANDMARKS};
}
