// Bicycle clearance must test front AND rear wheels, and use street-edge
// cycling lanes instead of running bicycles into lamp posts on the footpath.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {bicycleClear,cyclingRoute,BIKE_HALF_WHEELBASE} from '../src/world/bicycle-safety.js';
import {TownLife} from '../src/world/life.js';
const obstacle={hits:(x,z,r)=>Math.abs(x)<r+.11 && Math.abs(z-.6)<r+.11};
assert.equal(bicycleClear(obstacle,0,0,0,1),false,'front wheel intersects a lamp pole although rider centre clears');
assert.equal(bicycleClear(obstacle,0,0,0,-1),false,'rear wheel intersects a lamp pole');
assert.equal(bicycleClear(obstacle,-5,0,0,1),true,'clear cycle route stays rideable');
assert.equal(BIKE_HALF_WHEELBASE,.55,'wheels reflect the actual bicycle model');
const start={x:-30,z:6.6},end={x:30,z:10};
const route=cyclingRoute([{x:-30,z:6.6},{x:30,z:6.6},{x:30,z:10}],start,end,()=>0);
assert.equal(route[0].z,3.65,'cycle track lies road-side of lamp post line at z=6');
assert.equal(route[1].z,3.65);
assert(route[2].dismount && route[2].z===3.65,'rider must dismount at verge before shop entrance');
assert.equal(route.at(-1).z,10,'shop destination remains reachable on foot');
const midRoadLamp={hits:(x,z,r)=>Math.abs(x-9)<r+.25&&Math.abs(z-6)<r+.25};
assert(bicycleClear(midRoadLamp,9,3.65,1,0),'lamp post cannot intersect a bicycle in the marked road-edge track');
const homes=[];
for(let r=0;r<7;r++)for(let c=0;c<26;c+=2)homes.push({
  coordinate:String.fromCharCode(65+c)+(r+1),name:'Home',
  door:{x:(c-12.5)*26,z:r*46-161+4}
});
const life=new TownLife({homes,minute:8*60,seed:20261020});
const rider=life.villagers[0];rider.x=-245;rider.z=125;rider.inside=false;
life.goThen(rider,{x:240,z:126},{kind:'work',at:'store',until:16*60,activity:'commuting to shop'});
assert(rider.bike,'long commuter journey is by bike');
assert(rider.path.some(p=>p.dismount),'cycle trip must have a proper dismount waypoint');
assert(rider.path[0].z !== 125,'bike trip takes a designated route, not the doorstep centreline');
// If a fixed obstacle occupies the bicycle footprint, the rider must dismount
// before moving instead of letting a wheel clip through the obstacle.
const first=rider.path[0],dx=first.x-rider.x,dz=first.z-rider.z;
const mag=Math.hypot(dx,dz);
life.pedestrianWorld={hits:(x,z,r)=>Math.abs(x-(rider.x+dx/mag*.55))<r+.12&&Math.abs(z-(rider.z+dz/mag*.55))<r+.12};
life.liveVillager(rider,.02);
assert.equal(rider.bike,false,'bike automatically dismounts when lamp blocks wheel corridor');
const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
assert(main.includes("radius:p.v.bike&&p.v.path.length?1.16:.61"),'visual crowd spacing must respect bicycle, not pedestrian radius');
console.log('PASS: wheelbase, lamp-post clearance, cycle lanes, dismount points and visual collision footprint');
