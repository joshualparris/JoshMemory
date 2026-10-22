import assert from 'node:assert/strict';
import {houseEntranceZone} from '../src/world/house-entrance.js';
import {civicEntranceZone,atCivicEntrance,closedCivicDoorPose} from '../src/world/civic-entrance.js';
import {exteriorColliders,PLAYER_RADIUS} from '../src/world/exterior-collision.js';
import {workingAt} from '../src/world/shop-attendance.js';

const hits=(x,z,boxes,r=PLAYER_RADIUS)=>boxes.some(b=>{
  const nearX=Math.max(b.x0,Math.min(b.x1,x));
  const nearZ=Math.max(b.z0,Math.min(b.z1,z));
  return (nearX-x)**2+(nearZ-z)**2<r*r;
});
const within=(b,x,z)=>x>b.x0&&x<b.x1&&z>=b.z0&&z<=b.z1;
let checked=0;
// Run low-frame-rate discrete footsteps against the same facade geometry the
// player collides with, including narrow doors and off-centre door openings.
for(const w of [1.45,1.6,1.9,2.2]){
  for(const doorX of [0,-1.4,1.3]){
    const fp={w:10,d:8,front:4,door:{x:doorX,w}};
    const door={x:doorX,z:fp.front};
    const trigger=houseEntranceZone(door,fp);
    const solids=exteriorColliders(fp,0,0);
    const sensed=[];
    for(let z=door.z+4.05;z>=door.z-0.5;z-=0.57){
      if(hits(door.x,z,solids)) break;
      if(within(trigger,door.x,z))sensed.push(z);
    }
    assert(sensed.length>=2,'low-FPS steps must detect a physically reachable house door: '+JSON.stringify({w,doorX,sensed,trigger}));
    assert(trigger.z1-door.z>=2,'sensor begins outside solid facade');
    checked++;
  }
}
for(const side of ['north','south']){
  const p={id:'test',side,door:{x:0,z:0}};
  const sensor=civicEntranceZone(p);
  const bounce=closedCivicDoorPose(p,{x:0,z:0});
  assert(!atCivicEntrance(p,bounce),'locked building must reject player outside whole trigger');
  const walls=side==='south'
    ?[{x0:-6,x1:6,z0:0.5,z1:10}]
    :[{x0:-6,x1:6,z0:-10,z1:-0.5}];
  let sensed=0;
  for(let i=0;i<10;i++){
    const z=side==='south'?-3+i*0.53:3-i*0.53;
    if(hits(0,z,walls))break;
    if(within(sensor,0,z))sensed++;
  }
  assert(sensed>=2,'visitor must reach civic '+side+' entrance from footpath');
  checked++;
}
console.log('PASS: '+checked+' collision-clear house/civic approaches and safe locked doors');
