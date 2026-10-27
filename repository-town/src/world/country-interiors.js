// One compact, physically connected ground-floor interior for every country home.
// This is a playable floor plan, NOT an NCC construction certificate or architectural survey.
// Upper levels drawn in the exterior remain inaccessible pending stairs/egress design.
import * as THREE from 'three';
import {Builder} from './builder.js';
import {PROPS} from './props.js';

const WALL=0.18, OPEN=1.12;
export function countryInteriorPlan(home){
 const {w,d}=home.design;
 const splitZ=-0.45, splitX=-w/2+2.55, bathDoor=-w/2+1.32, bedDoor=splitX+1.40;
 const rooms=[
  {name:'Living and kitchen',x0:-w/2+.14,x1:w/2-.14,z0:splitZ+.14,z1:d/2-.14},
  {name:'Bathroom and laundry',x0:-w/2+.14,x1:splitX-.10,z0:-d/2+.14,z1:splitZ-.10},
  {name:'Bedroom',x0:splitX+.10,x1:w/2-.14,z0:-d/2+.14,z1:splitZ-.10},
 ];
 // Every slab and fixture is contained in the exterior house footprint. We
 // deliberately omit internal stairs when they have not been designed.
 const fixtures=[
  {type:'kitchenSink',x:-w/2+1.19,z:1.38,room:0},
  {type:'stove',x:-w/2+.66,z:2.73,room:0},
  {type:'fridge',x:-w/2+.51,z:.19,room:0},
  {type:'sofa',x:w/2-1.27,z:1.98,room:0},
  {type:'table',x:w/2-1.17,z:.41,room:0},
  {type:'shower',x:-w/2+1.86,z:-d/2+.71,room:1},
  {type:'toilet',x:-w/2+.58,z:-d/2+.65,room:1},
  {type:'basin',x:-w/2+.60,z:splitZ-1.05,room:1},
  {type:'bed',x:w/2-1.24,z:-d/2+1.31,room:2},
  {type:'wardrobe',x:splitX+.88,z:-d/2+.45,room:2},
 ];
 return Object.freeze({w,d,splitZ,splitX,bathDoor,bedDoor,rooms,fixtures,
   front:d/2,doorWidth:1.75,
   floorsShown:home.design.floors,
   floorsPlayable:1,certified:false});
}
export function countryEntrance(home,at,radius=.7){
 const dz=at.z-home.frontZ;
 return Math.abs(at.x-home.x)<radius && (home.facesNorth ? dz > -.65 && dz < .38 : dz < .65 && dz > -.38);
}
export function countryExitPose(home){
 return {x:home.x,z:home.frontZ+(home.facesNorth?-2.45:2.45),yaw:home.facesNorth?Math.PI:0};
}

export function buildCountryInterior(home,makeLabel=()=>new THREE.Group()){
 const plan=countryInteriorPlan(home), {w,d,splitZ,splitX,bathDoor,bedDoor}=plan;
 const b=new Builder(),group=new THREE.Group(),colliders=[],sight=[];
 const floor=home.design.region==='Africa'?0xbca47f:home.design.region==='Europe'?0xccb9a4:0xc9baaa;
 const walls=home.design.wall,trim=home.design.trim;
 const solid=(x0,x1,z0,z1)=>colliders.push({x0,x1,z0,z1});
 const wall=(x0,x1,z0,z1,colour=walls)=>{
  if(x1<=x0||z1<=z0) return;
  b.box(colour,x1-x0,2.85,z1-z0,(x0+x1)/2,1.425,(z0+z1)/2);
  solid(x0,x1,z0,z1);
  sight.push({x0,x1,y0:0,y1:2.85,z0,z1});
 };
 const width=WALL,half=w/2,depth=d/2;
 // Slab/roof only. No solid roof collider; indoor movement uses 2D footprints.
 b.box(floor,w,.12,d,0,-.07,0);b.box(0xf3eee4,w,.12,d,0,3.15,0);
 wall(-half,half,-depth,-depth+width);
 wall(-half,-half+width,-depth,depth);
 wall(half-width,half,-depth,depth);
 // Front entrance genuinely open, in the same centre as the exterior door.
 wall(-half,-.875,depth-width,depth);
 wall(.875,half,depth-width,depth);
 b.box(trim,1.9,.20,width,0,2.65,depth-width/2);
 // Two separated bedrooms/bath entrances; neither is blocked by a fixture.
 for(const [a,c] of [[-half,bathDoor],[splitX,bedDoor]]){
  const right=a===-half?splitX:half;
  wall(a,c-OPEN/2,splitZ-WALL/2,splitZ+WALL/2);
  wall(c+OPEN/2,right,splitZ-WALL/2,splitZ+WALL/2);
  b.box(trim,OPEN+.12,.18,.26,c,2.52,splitZ);
 }
 wall(splitX-WALL/2,splitX+WALL/2,-depth,splitZ-WALL/2);
 // A clear 1.75m street-facing entry landing and indoor passage.
 b.box(trim,1.84,.035,1.0,0,.005,depth-.65);
 const interactables=[],placedProps=[],sceneObjects=[];
 const labels=[];
 for(let i=0;i<plan.rooms.length;i++){
  const r=plan.rooms[i];
  const light=new THREE.PointLight(0xffe7cb,10,Math.max(w,d)*1.75,1.8);
  light.position.set((r.x0+r.x1)/2,2.67,(r.z0+r.z1)/2);group.add(light);
  const label=makeLabel(r.name,'room');
  if(label){label.position.set((r.x0+r.x1)/2,2.35,(r.z0+r.z1)/2);group.add(label);}
 }
 for(let i=0;i<plan.fixtures.length;i++){
  const item=plan.fixtures[i],prop=PROPS[item.type];
  if(!prop)throw new Error('Missing fixture '+item.type);
  b.at(item.x,0,item.z,0,()=>prop.build(b,{c:item.type==='sofa'?home.design.trim:undefined,key:'country:'+home.parcelId+':'+i}));
  if(prop.solid)solid(item.x-prop.w/2,item.x+prop.w/2,item.z-prop.d/2,item.z+prop.d/2);
  const label=prop.label||item.type,key='country:'+home.parcelId+':'+i;
  const pos=new THREE.Vector3(item.x,0,item.z);
  const act={do:'furniture',title:label};
  // Bedroom is deliberately an inspectable furnishing until an owned-property
  // sleep integration is tested. It must not silently grant free accommodation.
  interactables.push({key,type:item.type,label,act,room:item.room,pos,roomName:plan.rooms[item.room].name});
  placedProps.push({type:item.type,room:item.room});
  sceneObjects.push({type:item.type,label,room:item.room,pos:{x:item.x,z:item.z},interactive:true});
 }
 group.add(b.build(),new THREE.HemisphereLight(0xffffff,0x77705a,1.15));
 const doors=[];
 const ex={x0:-.875,x1:.875,z0:depth-.3,z1:depth+.75};
 const opening=[{axis:'z',at:splitZ,c:bathDoor,rooms:[0,1]},{axis:'z',at:splitZ,c:bedDoor,rooms:[0,2]}];
 return {
   group,colliders,sight,doors,interactables,seats:[],furniture:[],dynamics:b.dynamics,
   rooms:plan.rooms,placedProps,sceneObjects,walkers:[],windows:[],openings:opening,
   spawn:new THREE.Vector3(0,0,depth-1.98),exitZone:ex,
   bounds:{x0:-half,x1:half,z0:-depth,z1:depth},countryPlan:plan,people:[],
 };
}
