// Regression for the two Android playtest reports: depot trucks crossing each
// other and Foundry exits spawning inside the south-side exterior collision.
import assert from 'node:assert/strict';
import { TownLife, FIELD_Z0, driveRoute } from '../src/world/life.js';
import { civicExitPose } from '../src/world/shop-exit.js';
import { CollisionWorld } from '../src/engine/collision.js';
const homes=[];
for(let r=0;r<7;r++)for(let c=0;c<26;c+=2)
  homes.push({coordinate:String.fromCharCode(65+c)+(r+1),name:'House',door:{x:(c-12.5)*26,z:r*46-161+4}});
const life=new TownLife({homes,minute:420,seed:20261019});
const tr=life.trucks, dep=life.place('depot');
assert.equal(tr.length,3);
for(let i=0;i<3;i++){
  const b=life.depotBay(i);
  assert.equal(tr[i].x,b.x); assert.equal(tr[i].z,b.z);
  assert.equal(tr[i].state,'parked');
  assert(Math.abs(b.z-dep.curb.z)>2.5,'a parked truck may not occupy a traffic lane');
  for(let j=0;j<i;j++)assert(Math.hypot(tr[i].x-tr[j].x,tr[i].z-tr[j].z)>=8,'bay footprints must not overlap');
}
const lane=dep.curb.z;
const t=tr[0],other=tr[1],third=tr[2];
t.x=0;t.z=lane;t.path=[{x:35,z:lane}];t.state='delivering';t.heading=Math.PI/2;
other.x=9;other.z=lane;other.path=[];other.state='waiting';
third.x=100;third.z=lane;third.path=[];third.state='parked';
life.obstacles=[];life.villagers=[];
life.driveTruck(t,0.5);
assert(t.braking,'truck must brake behind a stopped truck');
assert(t.x>0,'truck should roll up to a safe following distance');
assert(Math.hypot(t.x-other.x,t.z-other.z)>=6.1,'a 6.6m truck must not clip through another truck');
// It must resume when the road ahead clears rather than remain frozen.
other.x=80;life.driveTruck(t,0.5);
assert(!t.braking&&t.x>4,'truck resumes after traffic clears');
const pass=new TownLife({homes,minute:420});
pass.villagers=[];pass.obstacles=[];
pass.trucks[0].x=0;pass.trucks[0].z=lane;pass.trucks[0].path=[{x:20,z:lane}];pass.trucks[0].state='driving';
pass.trucks[1].x=12;pass.trucks[1].z=lane+3.4;pass.trucks[1].path=[{x:-20,z:lane+3.4}];pass.trucks[1].state='driving';pass.trucks[1].heading=-Math.PI/2;
pass.trucks[2].x=100;pass.trucks[2].z=lane+3.4;
pass.driveTruck(pass.trucks[0],0.5);pass.driveTruck(pass.trucks[1],0.5);
assert(!pass.trucks[0].braking&&!pass.trucks[1].braking,'opposing left-hand traffic should pass');
assert(pass.trucks[0].x>0&&pass.trucks[1].x<12,'both opposing vehicles should progress');
// If bodies already touch at a junction, the leading lorry must be able to
// move AWAY from the overlap; blocking that escape causes a permanent deadlock.
const recovery=new TownLife({homes,minute:420});
recovery.villagers=[];recovery.obstacles=[];
const lead=recovery.trucks[0],behind=recovery.trucks[1],away=recovery.trucks[2];
lead.x=0;lead.z=0;lead.heading=0;lead.path=[{x:0,z:12}];lead.state='delivering';
behind.x=0;behind.z=-4.8;behind.heading=0;behind.path=[];behind.state='waiting';
away.x=100;away.z=100;
assert.equal(recovery.blocked(lead,{x:0,z:.9}),false,'already overlapping truck must escape by moving away');
assert.equal(recovery.blocked(behind,{x:0,z:-3.9}),true,'following truck cannot move deeper into overlap');
// Parking geometry is site-relative and delivery trucks finish off the road.
for(const v of tr){const drop=life.stopAt(v,'foundry');assert(Math.abs(Math.abs(drop.z-(dep.curb.z+1.7))-1.7)<0.1,'Foundry unloading stands in a travelling lane, clear of the footpath');}
const foundry=life.place('foundry');
assert.equal(foundry.side,'south');
const exterior=[{x0:foundry.x-7,x1:foundry.x+7,z0:FIELD_Z0,z1:FIELD_Z0+10}];
const pose=civicExitPose(foundry,exterior);
assert(pose,'Foundry needs a safe exit');
assert(pose.z<FIELD_Z0-1,'Foundry exit must be to the street, not into its walls');
assert.equal(pose.yaw,0,'south-side Foundry exit should face -z, away from its door');
assert(!new CollisionWorld(exterior).hits(pose.x,pose.z,0.5),'Foundry exit has collision clearance');
assert(Math.abs(pose.z-foundry.door.z)>1.5,'exit is outside re-entry trigger');
const north=life.place('bakery');
const otherPose=civicExitPose(north,[{x0:north.x-6,x1:north.x+6,z0:north.door.z-9,z1:north.door.z-0.5}]);
assert(otherPose?.z>north.door.z,'north buildings exit towards positive z');
assert.equal(otherPose.yaw,Math.PI,'north-side Bakery exit should face +z, away from its door');
assert.equal(civicExitPose(foundry,[{x0:-1e6,x1:1e6,z0:-1e6,z1:1e6}]),null,'unresolvable exits must fail safe');
const world=new CollisionWorld([]);
world.dynamic=()=>[{x0:-1,x1:1,z0:-2,z1:2}];
assert(world.hits(0,0,.4),'moving vehicle collides with player');
world.dynamic=()=>[];
assert(!world.hits(0,0,.4),'moving vehicle leaves no stale collider');
console.log('PASS: three off-road parking bays, truck following/opposing traffic, Foundry south exit, dynamic collision');
