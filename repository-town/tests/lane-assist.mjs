// Lane assist keeps a hands-off car in the LEFT lane (Australia), recovers from
// either side, follows a curve, and does nothing off-road or below walking pace.
//   node tests/lane-assist.mjs
import assert from 'node:assert/strict';
import {laneAssistSteer} from '../src/world/player-driving.js';
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
// Same integration as player-driving update(): yaw += clamp(err*1.6, ±0.5)*dt, then move forward.
function drive(allows,x,z,yaw,speed,seconds){
  const dt=1/30;
  for(let t=0;t<seconds;t+=dt){
    yaw+=clamp(laneAssistSteer(x,z,yaw,speed,allows)*1.6,-.5,.5)*dt;
    x+=-Math.sin(yaw)*speed*dt;z+=-Math.cos(yaw)*speed*dt;
  }
  return {x,z,yaw};
}
// An 8 m two-lane road running east-west. Heading west (yaw +π/2), the left side is south (+z),
// so the left-lane centre is z = +2.
const road=(x,z)=>Math.abs(z)<=4;
for(const z0 of [0,-3,3.6]){
  const r=drive(road,0,z0,Math.PI/2,16,12);
  assert.ok(Math.abs(r.z-2)<.35,'settles in the left lane from z='+z0+': z='+r.z.toFixed(2));
  assert.ok(Math.abs(r.yaw-Math.PI/2)<.05,'heading straight along the road: '+r.yaw.toFixed(3));
}
// Heading east the left lane is the north side (z = -2).
assert.ok(Math.abs(drive(road,0,0,-Math.PI/2,16,12).z+2)<.35,'left lane when heading east');
// A sweeping curve (radius 200 m) is followed; a 90-degree junction is not, just like a
// real car: the driver turns at intersections.
const ring=(x,z)=>Math.abs(Math.hypot(x,z)-200)<=4;
{ // start on the ring at (200,0) heading north (yaw 0), i.e. anticlockwise round the centre
  let x=200,z=0,yaw=0,s=12,dt=1/30,minR=1e9,maxR=0;
  for(let t=0;t<60;t+=dt){yaw+=clamp(laneAssistSteer(x,z,yaw,s,ring)*1.6,-.5,.5)*dt;x+=-Math.sin(yaw)*s*dt;z+=-Math.cos(yaw)*s*dt;
    const r=Math.hypot(x,z);minR=Math.min(minR,r);maxR=Math.max(maxR,r);}
  assert.ok(minR>196&&maxR<204,'stayed on the curved road for 720 m: r '+minR.toFixed(1)+'..'+maxR.toFixed(1));
}
// Nothing off-road, when slow, or on a huge open surface.
assert.equal(laneAssistSteer(0,10,Math.PI/2,16,road),0);
assert.equal(laneAssistSteer(0,1,Math.PI/2,2,road),0);
assert.equal(laneAssistSteer(0,1,Math.PI/2,16,()=>true),0);
console.log('PASS lane assist: left lane from both sides, both directions, follows a curve, inactive off-road/slow/open ground');
