import assert from 'node:assert/strict';
import {TownLife} from '../src/world/life.js';
import {pedestrianDetour,activeConversation,blockersOnSegment,canFinishNearOccupiedDoor} from '../src/world/pedestrian-navigation.js';
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
assert(!activeConversation(false,0,1),'walking near somebody never causes a chat');
assert(activeConversation(true,3,2),'actual interaction can briefly pause a resident');
assert(!activeConversation(true,16,2),'even an open conversation ends after 15 seconds');
assert(!activeConversation(true,1,9),'faraway residents carry on');
const start={x:-4,z:0},goal={x:7,z:0},blocker={x:0,z:0,radius:.75};
const world={hits:(x,z)=> x>-1&&x<1&&z<-2.0&&z>-3.5?{x0:-1,x1:1,z0:-3.5,z1:-2}:null};
const route=pedestrianDetour(start,goal,[blocker],world);
assert(route?.length>=3,'A* must create intermediate pedestrian waypoints');
assert(route.some(p=>Math.abs(p.z)>1.25),'route goes around obstruction rather than through it');
assert(route.every(p=>dist(p,blocker)>1.33&&!world.hits(p.x,p.z,.45)),'waypoints avoid people and building obstacles');
assert(route.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.z)),'waypoints are real finite positions');
assert.equal(pedestrianDetour({x:-8,z:0},goal,[blocker],world),null,'far pedestrians need no expensive A*');
assert.equal(blockersOnSegment(start,goal,[{x:0,z:8}]).length,0);
assert(canFinishNearOccupiedDoor({x:0,z:1.7},{x:0,z:0},[blocker]),'safe queueing near an occupied destination');
// End-to-end: the visitor stands still on the middle of a busy walkway all
// morning, and a worker must still pass, reach work, and resume the day's tasks.
const homes=[];
for(let row=1;row<=7;row++)for(let col=0;col<26;col+=2)
 homes.push({coordinate:String.fromCharCode(65+col)+row,name:'Test house',
  door:{x:(col-12.5)*26,z:(row-1)*46-161+4}});
const town=new TownLife({homes,minute:9*60,seed:20261020});
for(const v of town.villagers){v.path=[];v.step={kind:'sleep',at:'home',until:12*60};v.inside=true;}
const walker=town.villagers[3];
walker.x=-5;walker.z=0;walker.inside=false;walker.bike=false;walker.engaged=false;
walker.path=[{x:6,z:0}];walker.step={kind:'idle',at:'bakery',dur:45,activity:'collecting breakfast'};
town.obstacles=[{x:0,z:0}];
town.pedestrianWorld={hits:(x,z,r)=>world.hits(x,z,r)};
let closest=Infinity,reached=false,detours=0;
for(let i=0;i<120;i++){
 town.tick(.5);
 closest=Math.min(closest,dist(walker,town.obstacles[0]));
 if(walker.path.some(p=>p.detour))detours++;
 if(walker.path.length===0&&walker.x>3){reached=true;break;}
}
assert(detours>0,'worker actually followed a detour');
assert(closest>1.25,'no walking through an immobile player');
assert(reached,'worker must reach their destination instead of starving on the path');
assert.equal(walker.activity,'collecting breakfast');
assert(walker.hunger<100,'walker survives the route');
const saved=JSON.parse(JSON.stringify(town.snapshot()));
const restored=new TownLife({homes,minute:600,seed:20261020});
restored.restore(saved);
assert(Math.abs(restored.villagers[3].x-walker.x)<.01,'real route progress survives save');
assert(restored.villagers[3].step?.activity==='collecting breakfast');
const source=(await import('node:fs')).readFileSync(new URL('../src/world/townlife.js',import.meta.url),'utf8');
assert(!source.includes('(talkingTo === p || d < 2.8)'),'passive player proximity must never freeze ordinary residents');
assert(source.includes('conversationElapsed<15'),'town conversation must have an expiry');
const named=(await import('node:fs')).readFileSync(new URL('../src/world/npcs.js',import.meta.url),'utf8');
assert(named.includes('entry.chatElapsed<15'),'named street NPCs must also resume activity');
console.log('PASS: A* safely detours around static visitor, simulated villager completes work journey, persisted route, time-boxed conversations without passive stopping');

// A walker someone has stepped up beside (inside personal space) must still find a way on,
// not freeze next to them for the rest of the day (a villager stuck beside Spark on the footpath).
{
  const detour = pedestrianDetour;
  const bystander = { x: -35.99, z: -11.48, radius: .66 };
  const way = detour({ x: -36.1, z: -10.7 }, { x: 94, z: -10.7 }, [bystander], null);
  assert(Array.isArray(way) && way.length > 0, 'a walker beside a standing person gets a detour, not a dead end');
  assert(way.every((p) => Math.hypot(p.x - bystander.x, p.z - bystander.z) >= .75), 'the detour never moves closer to them');
}
console.log('PASS: walker beside a standing person escapes');
