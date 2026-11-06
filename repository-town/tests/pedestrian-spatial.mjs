import assert from 'node:assert/strict';
import {separatePedestrians,steerPedestrians} from '../src/world/pedestrian-spacing.js';
// Bound position reads rather than wall-clock timing: distant people must not
// produce a quadratic scan on a slower phone or a busy CI runner.
let reads=0;
const people=Array.from({length:1000},(_,id)=>{
  let x=(id%50)*8-200,z=Math.floor(id/50)*8-80;
  return {id,pos:{get x(){reads++;return x},set x(v){x=v},get z(){reads++;return z},set z(v){z=v}},goal:{x:x+30,z},speed:1.5};
});
separatePedestrians(people);steerPedestrians(people);
assert(reads<150000,`nearby scan budget exceeded: ${reads} position reads`);
// Mixed radii and negative coordinates straddling a bucket boundary.
const pair=[{id:'a',pos:{x:-6.01,z:-.01},radius:1.16},{id:'b',pos:{x:-5.99,z:.01},radius:.66}];
separatePedestrians(pair);
assert(Math.hypot(pair[0].pos.x-pair[1].pos.x,pair[0].pos.z-pair[1].pos.z)>1.85);
const crowd=Array.from({length:30},(_,id)=>({id,pos:{x:0,z:0}}));
for(let i=0;i<30;i++)separatePedestrians(crowd,{passes:8});
for(let i=0;i<crowd.length;i++)for(let j=i+1;j<crowd.length;j++)
  assert(Math.hypot(crowd[i].pos.x-crowd[j].pos.x,crowd[i].pos.z-crowd[j].pos.z)>1.24,'dense crowd must separate across cells');
assert.equal(separatePedestrians([]),0);
assert.equal(steerPedestrians([null,{pos:{x:NaN,z:0}}]),0);
console.log(`PASS spatial crowd regression; ${reads} position reads for 1000 pedestrians`);
