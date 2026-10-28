// Every estate floor plan, including researched dossiers, must have a connected
// player-sized route from the entrance to every room and fixture approach.
import * as THREE from 'three';
import fs from 'node:fs';
import {PLAN_HOMES} from '../src/world/masterplan-built.js';
import {buildCountryInterior} from '../src/world/country-interiors.js';
import {CollisionWorld} from '../src/engine/collision.js';
const results=[];
for(const home of PLAN_HOMES){
 const built=buildCountryInterior(home,()=>new THREE.Group()),world=new CollisionWorld(built.colliders),issues=[];
 const origin=built.spawn,step=.3,queue=[[0,0]],seen=new Set(['0,0']);
 const inside=(x,z)=>built.rooms.some(r=>x>=r.x0&&x<=r.x1&&z>=r.z0&&z<=r.z1);
 if(world.hits(origin.x,origin.z,.35))issues.push('spawn blocked');
 for(let i=0;i<queue.length;i++){
  const [gx,gz]=queue[i];
  for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
   const nx=gx+dx,nz=gz+dz,key=nx+','+nz,x=origin.x+nx*step,z=origin.z+nz*step;
   if(seen.has(key)||!inside(x,z)||world.hits(x,z,.35))continue;
   // Check the segment too, rather than jumping across thin walls.
   const p={x:origin.x+gx*step,z:origin.z+gz*step};
   world.move(p,dx*step,dz*step,.35);if(Math.hypot(p.x-x,p.z-z)>.001)continue;
   seen.add(key);queue.push([nx,nz]);
  }
 }
 const points=queue.map(([x,z])=>({x:origin.x+x*step,z:origin.z+z*step}));
 built.rooms.forEach((r,i)=>{if(!points.some(p=>p.x>r.x0+.4&&p.x<r.x1-.4&&p.z>r.z0+.4&&p.z<r.z1-.4))issues.push('room '+i+' unreachable');});
 for(const item of built.interactables)if(!points.some(p=>Math.hypot(p.x-item.pos.x,p.z-item.pos.z)<2.5))issues.push(item.key+' unreachable');
 const exit={x:origin.x,z:origin.z};world.move(exit,0,built.exitZone.z1-origin.z,.35);
 if(exit.z<built.exitZone.z0)issues.push('front exit blocked');
 results.push({id:home.parcelId,rooms:built.rooms.length,fixtures:built.interactables.length,reachableCells:points.length,issues});
 built.group.traverse(o=>{o.geometry?.dispose?.();for(const m of Array.isArray(o.material)?o.material:[o.material])m?.dispose?.();});
}
fs.mkdirSync('test-results',{recursive:true});fs.writeFileSync('test-results/estate-walkability.json',JSON.stringify(results,null,2));
const bad=results.filter(x=>x.issues.length);console.log(JSON.stringify({buildings:results.length,bad},null,2));
process.exitCode=bad.length?1:0;
