// Lantern Point: fictional Parristan village, south of Repository Town.
// Shares Repository Town's Three.js scene and the read-only Parristan citizen state.
// Geometry is deliberately simple and the remote village is hidden until nearby.
// No real-world land claims, official government status, or real member data.
import * as THREE from 'three';
import { LANTERN_POINT, LANTERN_ROAD, LANTERN_MAP_DESTINATION, LANTERN_CIVIC_GREEN } from './lantern-point-layout.js';
import { buildLanternRoadView } from './lantern-road-view.js';
import { createLanternCitizens } from './lantern-citizens.js';
import {drawLanternCivic,drawLanternHome,drawLanternVillageDetails} from './lantern-architecture.js';

const material = color => new THREE.MeshLambertMaterial({color});
const palette = {
  grass: material(0x789b65), road: material(0x44474d), track: material(0xcbb48b),
  wall: [0xe1c59e,0xc8b49c,0xd9c7b0,0xcbb6a3].map(material),
  roof: [0x894f49,0x545d66,0x68816b,0x7f6659].map(material),
  wood: material(0x75543b), glass: material(0x88aaba),
  lamp: new THREE.MeshLambertMaterial({color:0xffd78e,emissive:0xffad29,emissiveIntensity:.85}),
  body: [0x5a96ab,0x6e985f,0xc57b60,0xa289c1,0xbca45c].map(material),
  skin: material(0xe4bf98),
};
const cube = (group,x,y,z,w,h,d,mat) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
  m.position.set(x,y,z); group.add(m); return m;
};
const cylinder=(group,x,y,z,r,height,mat) => {
  const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,height,10),mat);
  m.position.set(x,y,z);group.add(m);return m;
};
const pos=(x,z)=>new THREE.Vector3(x,1.25,z);
function sign(parent,label,x,z) {
  if (typeof document === 'undefined') return;
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=160;
  const c=canvas.getContext('2d');
  c.fillStyle='#23464a';c.fillRect(0,0,512,160);
  c.lineWidth=9;c.strokeStyle='#e6c889';c.strokeRect(8,8,496,144);
  c.textAlign='center';c.textBaseline='middle';c.fillStyle='#fff4d5';
  c.font='bold 38px system-ui';c.fillText(label,256,80,480);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const board=new THREE.Mesh(new THREE.PlaneGeometry(7,2.2),new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide}));
  board.position.set(x,3.0,z);parent.add(board);
  for(const dx of [-2.65,2.65])cube(parent,x+dx,1.5,z+.13,.14,3,.14,palette.wood);
}
export function buildLanternPoint(parent) {
  const roadView=buildLanternRoadView();
  const road=roadView.group;parent.add(road);
  const village = new THREE.Group();village.name='Parristan: Lantern Point';parent.add(village);
  const spots=[],colliders=[],mapPlaces=[LANTERN_MAP_DESTINATION];
  // Southern green, two real vehicle-access streets, market square and usable plaza.
  cube(village,0,-.035,2870,360,.12,420,palette.grass);
  for(const z of LANTERN_ROAD.crossStreets)cube(village,0,.04,z,360,.08,10,palette.road);
  // The compact public green and planted square belong BESIDE the road.
  // The older wide raised tan slab blocked the sealed through-carriageway.
  cube(village,LANTERN_CIVIC_GREEN.x,.006,LANTERN_CIVIC_GREEN.z,
    LANTERN_CIVIC_GREEN.w,.045,LANTERN_CIVIC_GREEN.d,palette.track);
  cube(village,-41,.085,2874,10,.13,10,material(0xa5b598));
  // Lantern Tower: a locally fictional landmark, not a claim about the real property.
  cylinder(village,115,6,2858,4.8,12,palette.wall[0]);
  cylinder(village,115,13,2858,6,1.2,palette.roof[0]);
  cylinder(village,115,14.4,2858,2.8,1.5,palette.lamp);
  colliders.push({x0:110,x1:120,z0:2853,z1:2863});
  sign(village,'LANTERN POINT',-26,2800);
  sign(village,'Parristan · Fictional',114,2848);
  const features=[
    {name:'The Lantern Library',x:-112,z:2825,w:18,d:13,h:6},
    {name:'South Market',x:-82,z:2915,w:22,d:15,h:5},
    {name:'Lantern Point Café',x:86,z:2912,w:18,d:14,h:5},
    {name:'Community Hall',x:119,z:3025,w:22,d:16,h:7},
    {name:'Bus Stop',x:16,z:2800,w:8,d:6,h:3},
  ];
  features.forEach((b,i)=>{
    drawLanternCivic(village,b,i);
    if(b.name!=='Bus Stop')colliders.push({x0:b.x-b.w/2,x1:b.x+b.w/2,z0:b.z-b.d/2,z1:b.z+b.d/2});
    spots.push({key:'lantern:site:'+i,label:b.name,
      pos:pos(b.x,b.z-b.d/2-2),text:b.name+' is part of the fictional Lantern Point settlement.',
      lantern:true});
    mapPlaces.push({id:'lantern:'+i,name:b.name,kind:'building',x:b.x,z:b.z,w:b.w,d:b.d,
      civic:true,address:'Lantern Point · fictional Parristan settlement',detail:'Exterior landmark · not yet enterable'});
  });
  // Small dwellings around the junction: distinct roof colours and front doors.
  const homes=[];
  for(let i=0;i<28;i++){
    const row=Math.floor(i/7),col=i%7,x=-153+col*49,z=[2718,2798,2960,3050][row];
    if(Math.abs(x)<15)continue;
    const w=11+(i%3)*2,d=10+(i%2)*3,h=3.9+(i%4)*.35;
    const face=row===0||row===2?1:-1;
    drawLanternHome(village,{x,z,w,d,h,index:i,face});
    homes.push({x,z,face});
    colliders.push({x0:x-w/2,x1:x+w/2,z0:z-d/2,z1:z+d/2});
  }
  drawLanternVillageDetails(village);
  // Reuse the exact same human figures / walking system as the main town,
  // with identity permanently keyed by D1 citizen ID (not render order).
  const citizens=createLanternCitizens({village,homes,features,spots,colliders});
  function update(position,airborne=false,dt=1/60,t=0){
    const distance=Math.hypot(position.x-LANTERN_POINT.x,position.z-LANTERN_POINT.z);
    village.visible=airborne||distance<650;
    citizens.update(position,village.visible,dt,t);
  }
  return {road,village,spots,colliders,mapPlaces,update,refresh:citizens.refresh,applyWorld:citizens.applyWorld,
    status:()=>({...citizens.status(),position:{...LANTERN_POINT}})};
}
