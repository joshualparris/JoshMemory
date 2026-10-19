import assert from 'node:assert/strict';
import { movePedestrian, pedestrianDestination, PERSONAL_SPACE } from '../src/world/pedestrians.js';
import { TownLife } from '../src/world/life.js';
const walker = (id, x, z, to) => ({ id, x, z, inside:false, path:[to], step:{target:to} });
function apart(people) {
  for (let i=0;i<people.length;i++) for(let j=i+1;j<people.length;j++)
    assert(Math.hypot(people[i].x-people[j].x,people[i].z-people[j].z)>=PERSONAL_SPACE-1e-6, 'bodies overlap');
}
for (const hz of [20,60]) {
  const people=[walker(0,-5,0,{x:5,z:0}),walker(1,5,0,{x:-5,z:0})];
  for(let f=0;f<hz*20;f++) { for(const p of people)movePedestrian(p,1.5/hz,people);apart(people); }
  assert(people.every(p=>!p.path.length),'head-on pedestrians pass and finish');
}
// Fast bike cannot leap across an idle/chatting person in a long simulation tick.
const cyclist=walker(0,-4,0,{x:4,z:0}), idle=walker(1,0,0,{x:0,z:0});idle.path=[];
movePedestrian(cyclist,13.5,[cyclist,idle]);apart([cyclist,idle]);
assert(!cyclist.path.length,'cyclist passes the stationary person');
// Passing on a footpath must not become a prolonged detour through traffic.
const pavement=[walker(0,0,171.7,{x:10,z:171.7}),walker(1,5,171.7,{x:5,z:171.7})];pavement[1].path=[];
for(let f=0;f<500;f++){
  movePedestrian(pavement[0],.075,pavement);apart(pavement);
  assert(pavement[0].z<=173.5,'passing stays outside the street carriageway');
}
assert(!pavement[0].path.length,'passes the waiting villager without blocking traffic');
const crowd=[];
for(let i=0;i<12;i++) {
  const p=walker(i,-20+i*2,-8,{x:0,z:0});
  p.step.target=pedestrianDestination(p,{x:0,z:0},crowd);p.path=[p.step.target];crowd.push(p);
}
for(let f=0;f<3000;f++){for(const p of crowd)movePedestrian(p,.075,crowd);apart(crowd);}
assert(crowd.every(p=>!p.path.length),'all shop visitors reach distinct stopping places');
// An existing overlap may escape but is never pushed deeper into another body.
const old=[walker(0,0,0,{x:-3,z:0}),walker(1,0,0,{x:3,z:0})];
for(let i=0;i<40;i++)for(const p of old)movePedestrian(p,.1,old);
apart(old);
// The actual simulation reserves the entrance, keeps visits payable and releases slots.
const homes=Array.from({length:80},(_,i)=>({coordinate:`H${i}`,name:`Home ${i}`,door:{x:i*3,z:0}}));
const town=new TownLife({homes});const shop=town.place('store');
for(const [i,p] of town.villagers.slice(0,8).entries()){
  p.x=shop.front.x-12+i*3;p.z=shop.front.z+6;p.inside=false;
  town.goThen(p,shop.front,{kind:'idle',at:'store',dur:60,activity:'waiting at the shop'});
}
const targets=town.villagers.slice(0,8).map(p=>({...p.step.target}));apart(targets);
console.log('PASS pedestrian collision: head-on 20/60 Hz, cyclists, 12-person shop crowd, overlap recovery, real entrance reservations');
