// Lantern Point: fictional Parristan village, south of Repository Town.
// Shares Repository Town's Three.js scene and the read-only Parristan citizen state.
// Geometry is deliberately simple and the remote village is hidden until nearby.
// No real-world land claims, official government status, or real member data.
import * as THREE from 'three';
import { LANTERN_POINT, LANTERN_ROAD, LANTERN_MAP_DESTINATION } from './lantern-point-layout.js';

const API = 'https://parristan-living-nation.parris-neathaustralia.workers.dev/api/world';
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
}
export function buildLanternPoint(parent) {
  const road = new THREE.Group();road.name='South road to Lantern Point';parent.add(road);
  const village = new THREE.Group();village.name='Parristan: Lantern Point';parent.add(village);
  const spots=[],colliders=[],mapPlaces=[LANTERN_MAP_DESTINATION];
  // The northern leg follows the established eastern north-south road (x=338)
  // so no existing house is cut through. The turn at z=650 joins the
  // straight southbound access to the fictional Lantern Point.
  const {startZ,turnZ,endZ,entranceX}=LANTERN_ROAD;
  const northLength=turnZ-startZ,southLength=endZ-turnZ;
  cube(road,entranceX,-.10,(startZ+turnZ)/2,72,.14,northLength,palette.grass);
  cube(road,entranceX,.015,(startZ+turnZ)/2,10,.035,northLength,palette.road);
  cube(road,entranceX/2,-.10,turnZ,entranceX+72,.14,72,palette.grass);
  cube(road,entranceX/2,.015,turnZ,entranceX+10,.035,10,palette.road);
  cube(road,0,-.10,(turnZ+endZ)/2,72,.14,southLength,palette.grass);
  cube(road,0,.015,(turnZ+endZ)/2,10,.035,southLength,palette.road);
  // Short dashed centre marks, instanced to avoid dozens of draw calls.
  const lineGeom=new THREE.BoxGeometry(.12,.04,3.5);
  const marks=new THREE.InstancedMesh(lineGeom,material(0xf7e8b7),Math.floor(southLength/18));
  const transform=new THREE.Object3D();
  for(let i=0;i<marks.count;i++){transform.position.set(0,.052,turnZ+10+i*18);transform.updateMatrix();marks.setMatrixAt(i,transform.matrix);}
  marks.instanceMatrix.needsUpdate=true;road.add(marks);
  // Brown paddock fences and a few roadside trees create visual continuity from Repo Town.
  const trunk=new THREE.InstancedMesh(new THREE.CylinderGeometry(.23,.3,3,5),palette.wood,68);
  const crown=new THREE.InstancedMesh(new THREE.ConeGeometry(2.8,6,5),palette.body[1],68);
  for(let i=0;i<68;i++) {
    const side=i%2?-1:1,z=590+Math.floor(i/2)*63;
    transform.position.set(side*25,1.5,z);transform.updateMatrix();trunk.setMatrixAt(i,transform.matrix);
    transform.position.set(side*25,5.6,z);transform.updateMatrix();crown.setMatrixAt(i,transform.matrix);
  }
  trunk.instanceMatrix.needsUpdate=true;crown.instanceMatrix.needsUpdate=true;
  road.add(trunk,crown);
  // Southern green, two real vehicle-access streets, market square and usable plaza.
  cube(village,0,-.035,2870,360,.12,420,palette.grass);
  for(const z of LANTERN_ROAD.crossStreets)cube(village,0,.04,z,360,.08,10,palette.road);
  cube(village,0,.07,2868,54,.07,65,palette.track);
  cube(village,-20,.12,2874,12,.08,12,material(0xa5b598));
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
    cube(village,b.x,b.h/2,b.z,b.w,b.h,b.d,palette.wall[i%4]);
    const roof=cube(village,b.x,b.h+.8,b.z,b.w+1.6,1.6,b.d+1.6,palette.roof[i%4]);
    roof.rotation.z=i%2?.04:-.04;
    cube(village,b.x,b.h*.55,b.z-b.d/2-.055,3.2,2.2,.18,palette.glass);
    colliders.push({x0:b.x-b.w/2,x1:b.x+b.w/2,z0:b.z-b.d/2,z1:b.z+b.d/2});
    spots.push({key:'lantern:site:'+i,label:b.name,
      pos:pos(b.x,b.z-b.d/2-2),text:b.name+' is part of the fictional Lantern Point settlement.',
      lantern:true});
    mapPlaces.push({id:'lantern:'+i,name:b.name,kind:'building',x:b.x,z:b.z,w:b.w,d:b.d,
      civic:true,address:'Lantern Point · fictional Parristan settlement',detail:'Explore in 3D'});
  });
  // Small dwellings around the junction: distinct roof colours and front doors.
  const homes=[];
  for(let i=0;i<28;i++){
    const row=Math.floor(i/7),col=i%7,x=-153+col*49,z=[2718,2798,2960,3050][row];
    if(Math.abs(x)<15)continue;
    const w=11+(i%3)*2,d=10+(i%2)*3,h=3.9+(i%4)*.35;
    const home=cube(village,x,h/2,z,w,h,d,palette.wall[i%4]);
    cube(village,x,h+.45,z,w+1.1,.9,d+1.1,palette.roof[(i+1)%4]);
    cube(village,x-2.5,2.1,z-d/2-.06,2.3,1.7,.18,palette.glass);
    homes.push({x,z});
    colliders.push({x0:x-w/2,x1:x+w/2,z0:z-d/2,z1:z+d/2});
  }
  // Read-only agents: no invented biographies. Each visible person is mapped to
  // the same persistent ID, job and daily activity reported by Parristan's D1 world.
  const residents=new THREE.Group();village.add(residents);
  const actors=new Map();let lastPoll=0,loading=false,lastSync=null,error=null;
  function clearActors(){
    for(const obj of actors.values()){residents.remove(obj.mesh);}
    actors.clear();
    spots.splice(features.length);
  }
  function applyWorld(data){
    if(data?.fictional!==true||!Array.isArray(data.citizens)||!Array.isArray(data.settlements))throw Error('Untrusted or incomplete simulation data');
    clearActors();
    for(const person of data.citizens.filter(p=>p.homeTown===11||p.visitTown===11).slice(0,60)){
      if(!Number.isInteger(person.id)||!person.name||!person.occupation)continue;
      const actor=new THREE.Group();
      cylinder(actor,0,.9,0,.35,1.2,palette.body[person.id%palette.body.length]);
      const head=new THREE.Mesh(new THREE.SphereGeometry(.32,8,6),palette.skin);head.position.y=1.83;actor.add(head);
      const home=homes[person.id%homes.length]||{x:0,z:2868};
      const job=features[person.id%4];
      const state={person,mesh:actor,home,job,target:new THREE.Vector3()};
      const label=person.name+' · '+person.occupation+' · '+person.activity;
      const spot={key:'lantern:person:'+person.id,label, pos:pos(home.x,home.z),lantern:true,
        text:person.name+' is a fictional resident. Work: '+person.occupation+
          '. Current activity: '+person.activity+'. Goal: '+person.goal+
          '. Latest recorded memory: '+(person.memories?.[0]||'None yet.')};
      state.spot=spot;actors.set(person.id,state);spots.push(spot);residents.add(actor);
    }
    lastSync=data.updatedAt||Date.now();error=null;
    for(const a of actors.values()){setTarget(a);a.mesh.position.copy(a.target);a.spot.pos.set(a.target.x,1.25,a.target.z);}
  }
  function setTarget(a) {
    const p=a.person,seed=p.id;
    let x=a.home.x,z=a.home.z-7;
    if(p.activity==='working'||p.activity==='commuting'){x=a.job.x+((seed%5)-2)*1.6;z=a.job.z-a.job.d/2-4;}
    else if(p.activity==='shopping'||p.activity==='socialising'||p.activity==='at a cafe'){x=-20+seed%9*3;z=2865+(seed%7)*2;}
    else if(p.activity==='travelling'){x=seed%2?2:-2;z=2740+(seed*23)%190;}
    else if(p.activity==='exploring'){x=45+(seed*17)%65;z=2810+(seed*7)%110;}
    a.target.set(x,0,z);
  }
  async function refresh() {
    if(loading)return;
    loading=true;lastPoll=Date.now();
    try {
      const controller=new AbortController();
      const timeout=setTimeout(()=>controller.abort(),9000);
      let response;try{response=await fetch(API,{signal:controller.signal,cache:'no-store'});}finally{clearTimeout(timeout);}
      if(!response.ok)throw Error('HTTP '+response.status);
      applyWorld(await response.json());
    }catch(e){error=String(e?.message||e);}finally{loading=false;}
  }
  function update(position,airborne=false,dt=1/60) {
    const distance=Math.hypot(position.x-LANTERN_POINT.x,position.z-LANTERN_POINT.z);
    village.visible=airborne||distance<650;
    residents.visible=village.visible;
    if(village.visible&&Date.now()-lastPoll>90000)void refresh();
    if(!village.visible)return;
    for(const a of actors.values()){
      setTarget(a);
      a.mesh.visible=a.person.activity!=='sleeping'&&Math.hypot(a.mesh.position.x-position.x,a.mesh.position.z-position.z)<160;
      a.mesh.position.lerp(a.target,Math.min(1,dt*.8));
      a.spot.pos.set(a.mesh.position.x,1.25,a.mesh.position.z);
    }
  }
  return {road,village,spots,colliders,mapPlaces,update,refresh,applyWorld,
    status:()=>({citizens:actors.size,lastSync,error,fictional:true,position:{...LANTERN_POINT}})};
}
