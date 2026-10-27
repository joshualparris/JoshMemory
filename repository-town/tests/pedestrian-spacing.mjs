import assert from 'node:assert/strict';
import {separatePedestrians,steerPedestrians,PEDESTRIAN_GAP} from '../src/world/pedestrian-spacing.js';
import {TownLife} from '../src/world/life.js';
const distance=(a,b)=>Math.hypot(a.pos.x-b.pos.x,a.pos.z-b.pos.z);
const coverage=(list,min=.99)=>{
  for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++)
    assert(distance(list[i],list[j])>=min,
      list[i].id+' intersects '+list[j].id+': '+distance(list[i],list[j]).toFixed(2)+'m');
};
// Exact same point used to show two fused people and overlapping text labels.
const twins=[{id:'Hattie',pos:{x:0,z:0}},{id:'Gus',pos:{x:0,z:0}}];
assert(separatePedestrians(twins)>0);
coverage(twins,1.25);
assert(twins.every(x=>Number.isFinite(x.pos.x)&&Number.isFinite(x.pos.z)),'no NaN after identical spawn');

// Mixed systems: special character, shop customer, on-duty worker and player.
const crowd=[
  {id:'player',pos:{x:0,z:0},fixed:true},
  {id:'regular:Hattie',pos:{x:0,z:0}},
  {id:'regular:Gus',pos:{x:0,z:0}},
  {id:'named:Kit',pos:{x:0,z:0}},
  {id:'named:Arlo',pos:{x:0,z:0}}
];
for(let i=0;i<15;i++)separatePedestrians(crowd,{passes:8});
coverage(crowd,1.23);
assert.deepEqual(crowd[0].pos,{x:0,z:0},'player cannot be displaced by the crowd');

// People already comfortably apart should remain stationary without drift.
const far=[{id:1,pos:{x:0,z:0}},{id:2,pos:{x:7,z:0}}];
assert.equal(separatePedestrians(far),0);
assert.equal(far[0].pos.x,0);assert.equal(far[1].pos.x,7);

// Static walls and traffic must be respected during lateral avoidance.
const wall={hits:(x,z,r)=>x>1.0&&x<3&&z>-.4&&z<.4?{x0:1,x1:3,z0:-.4,z1:.4}:null};
const lined=[{id:'a',pos:{x:.1,z:0}},{id:'b',pos:{x:.1,z:0}}];
for(let i=0;i<6;i++)separatePedestrians(lined,{world:wall});
coverage(lined,1.23);
assert(lined.every(x=>!wall.hits(x.pos.x,x.pos.z,.61)),'no push through a wall');

// Every ordinary town resident must stay separate during daily routines,
// including queued bakery customers, staff, political rallies and lunch crowds.
const homes=[];
for(let r=0;r<7;r++)for(let c=0;c<26;c+=2)
  homes.push({coordinate:String.fromCharCode(65+c)+(r+1),name:'Home',door:{x:(c-12.5)*26,z:r*46-161+4}});
const life=new TownLife({homes,minute:7*60,seed:20261020});
for(let hour=0;hour<24;hour++){
  for(let minute=0;minute<60;minute+=.5)life.tick(.5);
  const walkers=life.villagers.filter(v=>!v.inside).map(v=>({id:v.name,pos:v}));
  coverage(walkers,1.1);
}
// Two people approaching head-on take opposite sides instead of repeatedly
// walking into each other. A stationary visitor is also an obstacle.
const east={id:'east',pos:{x:-4,z:0},goal:{x:4,z:0},speed:1.5};
const west={id:'west',pos:{x:4,z:0},goal:{x:-4,z:0},speed:1.5};
const stationary={id:'spectator',pos:{x:0,z:3},fixed:true,radius:.61};
const passers=[east,west,stationary];
let sidesteps=0, worst=0;
for(let frame=0;frame<180;frame++){
  for(const p of [east,west]){
    const dx=p.goal.x-p.pos.x,dz=p.goal.z-p.pos.z,d=Math.hypot(dx,dz);
    if(d>0.05){const stride=Math.min(d,.075);p.pos.x+=dx/d*stride;p.pos.z+=dz/d*stride;}
  }
  sidesteps+=steerPedestrians(passers,{dt:.05});
  separatePedestrians(passers,{gap:1.3,passes:6});
  const distance=Math.hypot(east.pos.x-west.pos.x,east.pos.z-west.pos.z);
  worst=Math.min(worst||distance,distance);
  assert(distance>=1.25-1e-6,'oncoming walkers cannot fuse together');
}
assert(sidesteps>0,'anticipatory passing should intervene before impact');
assert(east.pos.x>3&&west.pos.x<-3,'oncoming pedestrians must make forward progress past each other');
assert.deepEqual(stationary.pos,{x:0,z:3},'stationary visitors must stay in place');
// A cyclist and walker coming together on a northern footpath must not be
// steered out into the road carriageway.
const cyclist={id:'bike',pos:{x:1,z:171.7},goal:{x:15,z:171.7},speed:4.5,radius:.72};
const walker={id:'walker',pos:{x:3,z:171.7},goal:{x:-8,z:171.7},speed:1.5,radius:.61};
for(let i=0;i<80;i++){
  for(const p of [cyclist,walker]){
    const dx=p.goal.x-p.pos.x,dz=p.goal.z-p.pos.z,d=Math.hypot(dx,dz);
    if(d>0.05){const dist=Math.min(d,(p.speed)*.04);p.pos.x+=dx/d*dist;p.pos.z+=dz/d*dist;}
  }
  steerPedestrians([cyclist,walker],{dt:.04});
  separatePedestrians([cyclist,walker],{gap:1.4,passes:6});
  assert(cyclist.pos.z<173.4 && walker.pos.z<173.4,'passing must not send cyclists into a traffic lane');
}
const wallSteering={hits:(x,z,r)=>z<-.1};
const wallRider={id:'wall-rider',pos:{x:-2,z:0},goal:{x:4,z:0},speed:4.5};
const blockedFriend={id:'blocking-friend',pos:{x:0,z:0},fixed:true};
for(let i=0;i<7;i++)steerPedestrians([wallRider,blockedFriend],{world:wallSteering,dt:.1});
assert(wallRider.pos.z>=-.1,'anticipatory steering must obey collision geometry');
// Regression: occupied shop counters belong INSIDE the businesses, not as
// identical stationary exterior figures in front of the doors for hours.
const serviceTown=new TownLife({homes,minute:8*60,seed:20261020});
const bakery=serviceTown.place('bakery');
const bakers=serviceTown.villagers.filter(v=>v.work==='bakery');
assert(bakers.length>=2,'the two bakery workers are represented');
for(const worker of bakers){
  Object.assign(worker,{x:worker.home.door.x,z:worker.home.door.z+2,inside:true,path:[]}); // setting off from home, not already on shift
  serviceTown.goThen(worker,bakery.front,{
    kind:'work',at:'bakery',until:14*60,activity:'baking at work'
  });
  assert.equal(worker.inside,false,'bakery staff remain visible while travelling to their job');
}
assert.notDeepEqual(bakers[0].step.target,bakers[1].step.target,
  'employees get separate front-door approach slots');
for(const worker of bakers){
  worker.path.length=0;worker.x=worker.step.target.x;worker.z=worker.step.target.z;
  serviceTown.arrive(worker);
  assert.equal(worker.inside,true,'on-shift bakers work indoors, not permanently on the pavement');
}
const customer=serviceTown.villagers.find(v=>v.work!=='bakery');
serviceTown.goThen(customer,bakery.front,{
  kind:'buy',at:'bakery',items:[],dur:5,activity:'shopping'
});
assert.equal(customer.inside,false,'customer approaches visibly from outside');
customer.path.length=0;customer.x=customer.step.target.x;customer.z=customer.step.target.z;
serviceTown.arrive(customer);
assert.equal(customer.inside,true,'customer visits the actual shop interior');
serviceTown.goThen(customer,{x:bakery.front.x+20,z:bakery.front.z},{
  kind:'idle',dur:3,activity:'walking away'
});
assert.equal(customer.inside,false,'customer reappears outside when leaving the shop');
const fieldHand=serviceTown.villagers.find(v=>v.work==='garden');
assert(fieldHand,'a farm worker exists');
serviceTown.goThen(fieldHand,serviceTown.place('garden').front,{
  kind:'work',at:'garden',until:15*60,activity:'tending crops'
});
fieldHand.path.length=0;serviceTown.arrive(fieldHand);
assert.equal(fieldHand.inside,false,'farm workers remain outdoors');
// The collision grid is consulted by simulation spacing, not only by the
// renderer. Residents must never be pushed through nearby shop walls.
const boundsWorld={hits:(x)=>x>0.70?{x0:0.7}:null};
const pushed=[{id:'worker-a',pos:{x:0,z:0}},{id:'worker-b',pos:{x:0,z:0}}];
for(let i=0;i<8;i++)separatePedestrians(pushed,{world:boundsWorld,passes:6});
assert(pushed.every(p=>p.pos.x<=0.70),'shop wall cannot be crossed by separating customers');
coverage(pushed,1.23);
console.log('PASS: Bakery workers, shopping customers, real colliders, and bicycle clearances');
console.log('PASS: Hattie/Gus and named crowds separate; head-on walkers and cyclists pass; sidewalks and wall geometry protected; town movement stable');
