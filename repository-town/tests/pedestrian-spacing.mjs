import assert from 'node:assert/strict';
import {separatePedestrians,PEDESTRIAN_GAP} from '../src/world/pedestrian-spacing.js';
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
console.log('PASS: Hattie and Gus do not merge, mixed named and regular crowds separate around the player, walls respected, 24-hour shop movement is overlap-free');
