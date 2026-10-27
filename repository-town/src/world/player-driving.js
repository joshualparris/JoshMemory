// Third-person, physically blocked vehicles. Uses the same Input joystick/keys
// and CollisionWorld as the pedestrian. Only owned, registered vehicles work.
import * as THREE from 'three';
import { VEHICLE_MODELS } from './vehicles.js';
import {updateCoolantTemperature} from './driving-instruments.js';
import { onPlannedOrCoreRoad } from './masterplan-built.js';
import { lightingLevel } from './lighting.js';
import { nightLightLevel } from './estate-lighting.js';
const MODEL={hatch:[1.65,3.4,0x397fbc,11],sedan:[1.84,4.4,0xb1b9c4,12],
 ute:[1.9,4.7,0xb78648,11],van:[2.05,5.4,0xe8e3d8,9],truck:[2.25,6.6,0x9a4d40,8]};
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const r2=n=>Math.round(n*100)/100;
export function modelMesh(model){
 const [w,d,colour]=MODEL[model]||MODEL.hatch;
 const g=new THREE.Group(),bodyMat=new THREE.MeshLambertMaterial({color:colour}),windowMat=new THREE.MeshLambertMaterial({color:0x9dc3d4}),
  wheelMat=new THREE.MeshLambertMaterial({color:0x28282b}),
  lightMat=new THREE.MeshLambertMaterial({color:0xfff6d9,emissive:0xfff0c0,emissiveIntensity:0});
 const cube=(mat,x,y,z,ww,hh,dd)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(ww,hh,dd),mat);m.position.set(x,y,z);g.add(m);};
 cube(bodyMat,0,.65,0,w,.68,d);
 cube(windowMat,0,1.19,.04,w*.85,.55,d*.47);
 for(const x of [-w*.49,w*.49])for(const z of [-d*.34,d*.34]){
   const wh=new THREE.Mesh(new THREE.CylinderGeometry(.36,.36,.19,10),wheelMat);
   wh.rotation.z=Math.PI/2;wh.position.set(x,.38,z);g.add(wh);
 }
 for(const x of [-w*.3,w*.3])cube(lightMat,x,.76,-d*.5-.045,.31,.19,.12);
 // Forward is local -Z in this car model. Both lamps and their targets share
 // the car's transform, so steering rotates the illuminated road area.
 const headlights=[];
 for(const x of [-w*.29,w*.29]){
   const lamp=new THREE.SpotLight(0xfff1da,0,62,.31,.58,1.4);
   lamp.name='Active vehicle low-beam headlight';
   lamp.position.set(x,.77,-d*.5-.12);
   lamp.target.position.set(x*.65,.06,-d*.5-32);
   lamp.castShadow=false;g.add(lamp,lamp.target);headlights.push(lamp);
 }
 g.userData.headlights={beams:headlights,lenses:lightMat,level:0};
 return g;
}
export function headlightLevel(daylight){return lightingLevel(nightLightLevel(daylight));}
export function setVehicleHeadlights(mesh,daylight,engineOn){
  const rig=mesh?.userData?.headlights;
  if(!rig)return 0;
  const level=engineOn?headlightLevel(daylight):0;
  rig.level=level;
  rig.lenses.emissiveIntensity=2.4*level;
  for(const beam of rig.beams){beam.intensity=1600*level;beam.visible=level>0.001;}
  return level;
}
export function roadAllows(x,z){
 // Streets, avenues and the master-plan roads, each bounded to its drawn extent: the old check
 // treated every street and avenue as infinitely long, so cars could leave the map along them.
 return onPlannedOrCoreRoad(x,z);
}
export function createPlayerDriving(life,scene,collision,player,camera,input){
 const meshes=new Map();let active=null,speed=0,message='';
 function siteSpawn(i,self){
   const site=life.place('dealership');
   if(!site)return null;
   // Use the marked roadside parking bays, not the busy doorway or a back
   // paddock with no road access. Only choose a currently clear space.
   const spots=[[9,1.0],[11,1.0],[-9,1.0],[-11,1.0],[9,-.6],[-9,-.6],[13,-.6],[-13,-.6]];
   for(let attempt=0;attempt<spots.length;attempt++){
     const [ox,oz]=spots[(attempt+i)%spots.length];
     const x=site.x+ox,z=site.curb.z+oz;
     if(!roadAllows(x,z)||collision.hits(x,z,1.25))continue;
     if(life.trucks.some(tr=>Math.hypot(tr.x-x,tr.z-z)<5))continue;
     if(life.villagers.some(person=>!person.inside&&Math.hypot(person.x-x,person.z-z)<3.5))continue;
     if((life.civic.motor?.owned||[]).some(v=>v!==self&&Number.isFinite(v.x)&&
       Math.hypot(v.x-x,v.z-z)<3.5))continue;
     return {x,z};
   }
   return null; // Never hide an unavailable parking spot by teleporting through traffic.
 }
 function sync(){
   const owned=life.civic.motor?.owned||[],ids=new Set(owned.map(v=>v.registration));
   for(const [reg,g] of meshes)if(!ids.has(reg)){scene.remove(g);meshes.delete(reg);if(active===reg){active=null;speed=0;}}
   owned.forEach((v,i)=>{
     if(!Number.isFinite(v.x)||!Number.isFinite(v.z)||v.parkingPending){
       const p=siteSpawn(i,v);
       if(p){v.x=p.x;v.z=p.z;v.yaw=0;v.speed=0;v.parkingPending=false;}
       else if(!Number.isFinite(v.x)||!Number.isFinite(v.z))return;
       // When every roadside bay is temporarily occupied, keep the vehicle
       // parked as titled until a clear bay exists; never spawn inside a wall.
     }
     if(!meshes.has(v.registration)){const g=modelMesh(v.model);scene.add(g);meshes.set(v.registration,g);}
     const g=meshes.get(v.registration);g.position.set(v.x,0,v.z);g.rotation.y=v.yaw||0;
     setVehicleHeadlights(g,life.daylight(),active===v.registration);
   });
 }
 function nearest(x=player.pos.x,z=player.pos.z,range=3.1){
   sync();let best=null,dist=range;
   for(const v of life.civic.motor?.owned||[]){
     const d=Math.hypot(v.x-x,v.z-z);
     if(d<dist){dist=d;best=v;}
   }
   return best;
 }
 function enter(v){
   if(v?.workVehicle==='depot'&&life.civic.jobs?.active?.id!=='delivery-driver'&&!(life.civic.deliveryWork?.route?.registration===v.registration&&!life.civic.deliveryWork.route.returnedAt&&['loaded','completed'].includes(life.civic.deliveryWork.route.status)))return 'Start a depot delivery shift to use the employer van.';
   if(!v||active)return 'Get out before entering another vehicle.';
   if(life.day>v.regoUntil||!v.roadworthy||v.condition<60)return 'Registration or roadworthy expired; see Town Motor Workshop.';
   if((v.fuel||0)<=0)return 'Fuel tank empty. Buy fuel at High Street Motors.';
   if(Math.hypot(player.pos.x-v.x,player.pos.z-v.z)>3.1)return 'Walk to the driver door to enter.';
   if(collision.hits(v.x,v.z,1.05))return 'The vehicle is blocked. Move it to a clear parking space before driving.';
   v.parkingPending=false;active=v.registration;speed=0;player.seated=null;input.reset();
   setVehicleHeadlights(meshes.get(active),life.daylight(),true);
   if(!Number.isFinite(v.coolantTemp))v.coolantTemp=22;
   return 'Engine started. W/S or joystick forwards/back; A/D or joystick steer; E or ✋ to get out when stopped.';
 }
 function exit(){
   if(!active)return 'Not driving.';
   if(Math.abs(speed)>.35)return 'Brake to a complete stop before exiting.';
   const v=life.civic.motor.owned.find(x=>x.registration===active);
   if(!v){active=null;return 'Vehicle unavailable.';}
   for(const radius of [2.1,2.7,3.4]){
     for(let i=0;i<16;i++){
       const angle=(v.yaw||0)+Math.PI/2+i*Math.PI/8,x=v.x+Math.cos(angle)*radius,z=v.z+Math.sin(angle)*radius;
       if(!collision.hits(x,z,player.radius+.1)){
         player.place(x,z,v.yaw);setVehicleHeadlights(meshes.get(active),life.daylight(),false);
         active=null;speed=0;return 'Parked, handbrake on. You got out safely.';
       }
     }
   }
   return 'No clear place to exit; move to a parking bay.';
 }
 function update(dt){
   sync();if(!active)return false;
   const v=life.civic.motor.owned.find(x=>x.registration===active);
   if(!v){active=null;return false;}
   const m=input.movement();input.takeLook();
   if(input.consume('use')){message=exit();if(!active)return false;}
   const spec=MODEL[v.model]||MODEL.hatch,top=spec[3];
   // Gradual throttle, service wear, reversing; no instant 180-degree pivots.
   const throttle=-m.z,reverse=throttle<0;
   const desired=clamp(throttle*top, -top*.37,top);
   const accel=reverse?2.5:3.4;
   speed+=clamp(desired-speed,-(throttle===0?7:accel)*dt,(throttle===0?7:accel)*dt);
   if(life.day>v.regoUntil||!v.roadworthy||v.condition<60||(v.fuel||0)<=0)speed=0;
   let yaw=v.yaw||0;
   if(Math.abs(speed)>.2)yaw-=m.x*(speed<0?-1:1)*clamp(Math.abs(speed)/top,0,.9)*1.25*dt;
   const dx=-Math.sin(yaw)*speed*dt,dz=-Math.cos(yaw)*speed*dt;
   const nx=v.x+dx,nz=v.z+dz;
   const pedestrian=life.villagers.some(p=>!p.inside&&Math.hypot(nx-p.x,nz-p.z)<2.2);
   const parked=(life.civic.motor.owned||[]).some(o=>o!==v&&Number.isFinite(o.x)&&Math.hypot(nx-o.x,nz-o.z)<3.1);
   // Road driving only, no tunnelling through buildings/trucks/NPCs.
   if(roadAllows(nx,nz)&&!pedestrian&&!parked&&!collision.hits(nx,nz,Math.min(1.15,spec[0]/2+.1))){
     const distance=Math.hypot(dx,dz);
     v.x=nx;v.z=nz;v.yaw=yaw;v.odometer=(v.odometer||0)+distance/1000;
     v.fuel=Math.max(0,(v.fuel||0)-distance*.003);
     v.condition=r2(Math.max(0,(v.condition||100)-distance*.00008));
     if(v.condition<60)v.roadworthy=false;
   }else{speed=0;message='Brake! Road edge, pedestrian or obstruction.';}
   v.speed=r2(speed);
   v.coolantTemp=updateCoolantTemperature(v.coolantTemp,dt,speed,v.condition);
   player.pos.set(v.x,0,v.z);player.yaw=v.yaw||0;player.pitch=0;
   // Third-person trailing camera, no disembodied eye inside a dashboard.
   const follow=9+(v.model==='truck'?4:0),px=v.x+Math.sin(v.yaw||0)*follow,
     pz=v.z+Math.cos(v.yaw||0)*follow;
   camera.position.set(px,5.6,pz);
   camera.lookAt(v.x,1.1,v.z);
   return true;
 }
 function activeVehicle(){return active?life.civic.motor.owned.find(v=>v.registration===active)||null:null;}
 function headlightStatus(){const rig=meshes.get(active)?.userData?.headlights;
   return {active:!!active,on:!!rig&&rig.level>0.01,level:rig?.level||0,beamCount:rig?.beams.length||0,
     beamsLit:rig?.beams.filter(b=>b.intensity>0).length||0};}
 return {sync,nearest,enter,exit,update,activeVehicle,headlightStatus,get driving(){return !!active;},get message(){return message;},clearMessage(){message='';}};
}
