// Parristan Living Nation residents are rendered with EXACTLY the same detailed,
// stable-identity articulated figure system as Repository Town and Narromine.
// Server is read-only; no fictional resident becomes a real citizen/membership.
import * as THREE from 'three';
import {makeDistinctPerson} from './npc-wardrobe.js';
import {poseResident} from './resident-figure.js';

const API='https://parristan-living-nation.parris-neathaustralia.workers.dev/api/world';
const TOWN_ID=11,MAX_VISIBLE=18,MAX_ROSTER=65;
const near=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const point=(x,z)=>({x,z});
const safeText=(s)=>String(s??'').slice(0,240);
const roadZ=(z)=>Math.abs(z-2760)<Math.abs(z-2990)?2760:2990;
const sidewalkZ=(z,streetZ)=>streetZ+(z<streetZ?-9:9);
const walkTarget=(person,home,features)=>{
  const i=person.id;
  // Shops get genuine, deterministic visitor slots rather than everybody
  // standing at exactly the same place or walking through their front doors.
  const selected=features[i%4];
  if(person.activity==='working'||person.activity==='commuting'){
    return point(selected.x-5+(i%5)*2,selected.z-selected.d/2-3.1);
  }
  if(['shopping','socialising','volunteering','at a cafe'].includes(person.activity)){
    const venue=features[person.activity==='at a cafe'?2:1];
    return point(venue.x-7+(i%7)*2.2,venue.z-venue.d/2-3.2);
  }
  if(person.activity==='travelling')return point((i%2?9:-9),2760+((i*23)%50));
  if(person.activity==='exploring')return point(73+(i*17)%40,2860+(i*7)%80);
  return point(home.x,home.z-7);
};
function planFootpath(a,b){
  if(near(a,b)<1)return [];
  const z0=roadZ(a.z),z1=roadZ(b.z);
  // Follow the frontage footpath, then the eastern/western side of the
  // main road; do not simply interpolate straight through people's homes.
  const sidewalkX=a.x<0?-9:9;
  const from=sidewalkZ(a.z,z0),to=sidewalkZ(b.z,z1);
  const pts=[point(a.x,from),point(sidewalkX,from),point(sidewalkX,to),point(b.x,to),b];
  const clean=[];for(const p of pts)if(!clean.length||near(p,clean.at(-1))>.4)clean.push(p);
  return clean;
}
function obstacle(p,colliders,r=.55){
  return colliders.some(b=>p.x>b.x0-r&&p.x<b.x1+r&&p.z>b.z0-r&&p.z<b.z1+r);
}
export function createLanternCitizens({village,homes,features,spots,colliders}){
  const group=new THREE.Group();group.name='Persistent Parristan resident figures';village.add(group);
  const actors=new Map(),baseSpots=spots.length;
  let lastPoll=0,loading=false,lastSync=null,error=null,total=0;
  const anyHouse=homes[0]||point(-100,2720);
  function relocate(a){
    const home=a.home,person=a.person;
    a.target=walkTarget(person,home,features);
    a.waypoints=planFootpath(point(a.mesh.position.x,a.mesh.position.z),a.target);
  }
  function upsert(person){
    if(!Number.isInteger(person.id)||!person.name||!person.occupation)return;
    const current=actors.get(person.id);
    if(current){
      const previous=current.person.activity;
      current.person=person;
      if(previous!==person.activity){
        current.fig.setActivity(person.activity==='at a cafe'?'chatting':person.activity);
        relocate(current);
      }
      current.spot.label=safeText(person.name)+' · '+safeText(person.occupation)+' · '+safeText(person.activity);
      current.spot.text=safeText(person.name)+' is a fictional Lantern Point resident. Work: '+
        safeText(person.occupation)+'. Activity: '+safeText(person.activity)+
        '. Goal: '+safeText(person.goal)+'. Memory: '+safeText(person.memories?.[0]??'None recorded.');
      return;
    }
    const home=homes[person.id%homes.length]||anyHouse;
    const start=point(home.x,home.z-7);
    const fig=makeDistinctPerson('parristan:resident:'+person.id,person,{activity:person.activity});
    fig.setActivity(person.activity==='at a cafe'?'chatting':person.activity);
    fig.group.position.set(start.x,0,start.z);
    const state={
      person,fig,mesh:fig.group,home,target:start,waypoints:[],speed:.9+(person.id%5)*.12,
      spot:{key:'lantern:person:'+person.id,label:'',pos:new THREE.Vector3(start.x,1.2,start.z),lantern:true,text:''},
    };
    actors.set(person.id,state);group.add(fig.group);
    upsert(person);relocate(state);
  }
  function applyWorld(data){
    if(data?.fictional!==true||!Array.isArray(data.citizens)||!Array.isArray(data.settlements))
      throw Error('Incomplete or non-fictional Parristan simulation response');
    const selected=data.citizens.filter(p=>p.homeTown===TOWN_ID||p.visitTown===TOWN_ID).slice(0,MAX_ROSTER);
    const ids=new Set(selected.map(p=>p.id));
    for(const [id,a] of actors)if(!ids.has(id)){group.remove(a.mesh);actors.delete(id);}
    for(const p of selected)upsert(p);
    spots.splice(baseSpots,spots.length-baseSpots,...[...actors.values()].map(a=>a.spot));
    total=selected.length;lastSync=data.updatedAt||Date.now();error=null;
  }
  async function refresh(){
    if(loading)return;
    loading=true;lastPoll=Date.now();
    try{
      const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),9000);
      let response;try{response=await fetch(API,{signal:controller.signal,cache:'no-store'});}
      finally{clearTimeout(timeout);}
      if(!response.ok)throw Error('Parristan API HTTP '+response.status);
      applyWorld(await response.json());
    }catch(e){error=safeText(e?.message||e);}finally{loading=false;}
  }
  function update(position,visible,dt=1/60,t=0){
    if(visible&&Date.now()-lastPoll>90000)void refresh();
    if(!visible){group.visible=false;return;}
    group.visible=true;
    const eye=point(position.x,position.z);
    const selected=[...actors.values()]
      .filter(a=>a.person.activity!=='sleeping'&&a.person.activity!=='at home')
      .sort((a,b)=>near(a.mesh.position,eye)-near(b.mesh.position,eye));
    const visibleIds=new Set(selected.filter(a=>near(a.mesh.position,eye)<100).slice(0,MAX_VISIBLE).map(a=>a.person.id));
    for(const a of actors.values()){
      const dist=near(a.mesh.position,eye);
      a.mesh.visible=visibleIds.has(a.person.id);
      // Simulate movements at real walking pace, even when far from camera.
      let moving=false,remaining=Math.max(0,dt)*a.speed;
      for(let steps=0;steps<3 && remaining>.0001 && a.waypoints.length;steps++){
        const goal=a.waypoints[0],dx=goal.x-a.mesh.position.x,dz=goal.z-a.mesh.position.z;
        const d=Math.hypot(dx,dz);
        if(d<.06){a.waypoints.shift();continue;}
        const step=Math.min(d,remaining),next=point(a.mesh.position.x+dx/d*step,a.mesh.position.z+dz/d*step);
        // No ghosting through homes: re-route around the nearest obstruction.
        if(obstacle(next,colliders)){
          const block=colliders.find(b=>next.x>b.x0-.55&&next.x<b.x1+.55&&next.z>b.z0-.55&&next.z<b.z1+.55);
          if(block){
            const left=point(block.x0-1.3,next.z),right=point(block.x1+1.3,next.z);
            const detour=near(a.mesh.position,left)<near(a.mesh.position,right)?left:right;
            if(!obstacle(detour,colliders)){a.waypoints.unshift(detour);continue;}
          }
          break;
        }
        a.mesh.position.set(next.x,0,next.z);
        a.mesh.rotation.y=Math.atan2(dx,dz);
        remaining-=step;moving=true;
        if(step>=d-.01)a.waypoints.shift();
      }
      a.spot.pos.set(a.mesh.position.x,1.2,a.mesh.position.z);
      if(a.mesh.visible){
        a.fig.setLod(dist>48?3:dist>24?2:dist>12?1:0,{manual:false});
        poseResident(a.fig,dt,t,moving);
      }
    }
  }
  return {update,refresh,applyWorld,status:()=>({citizens:actors.size,nearby:total,lastSync,error,fictional:true,renderSystem:'Repository Town detailed resident figures',visible:[...actors.values()].filter(a=>a.mesh.visible).length})};
}
