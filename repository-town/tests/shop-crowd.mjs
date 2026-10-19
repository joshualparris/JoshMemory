// Regression for the screenshot outside General Store at 20:17.
// Many customers must not converge on one shopfront slot or one cycling lane.
import assert from 'node:assert/strict';
import {TownLife,walkRoute,LOT_X,LOT_Z} from '../src/world/life.js';
import {readFileSync} from 'node:fs';
const homes=[];
for(let r=0;r<7;r++)for(let c=0;c<26;c+=2)homes.push({
  coordinate:String.fromCharCode(65+c)+(r+1),name:'House',
  door:{x:(c-12.5)*LOT_X,z:r*LOT_Z-3.5*LOT_Z+4}
});
const t=new TownLife({homes,minute:7*60,seed:20261020});
const store=t.place('store');
const east=walkRoute({id:1,x:store.front.x-45,z:store.front.z},{x:store.front.x+45,z:store.front.z});
const west=walkRoute({id:2,x:store.front.x+45,z:store.front.z},{x:store.front.x-45,z:store.front.z});
assert(Math.abs(east[0].z-west[0].z)>1.8,
  'opposing cyclists must travel on different footpath lanes');
const aisle=t.villagers.slice(0,22);
for(const v of aisle)t.goThen(v,store.front,{kind:'buy',at:'store',dur:8,activity:'shopping'});
const pts=aisle.map(v=>({x:v.step.target.x,z:v.step.target.z}));
for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++)
  assert(Math.hypot(pts[i].x-pts[j].x,pts[i].z-pts[j].z)>=1.75,
    'two shoppers must not be assigned the same or adjacent overlapping parking spot');
assert(pts.some(p=>Math.abs(p.x-store.front.x)>=6),
  'shop queues must extend along the pavement instead of forming an impenetrable knot');
const imageRule=readFileSync(new URL('../src/world/townlife.js',import.meta.url),'utf8');
assert(!imageRule.includes('talkingTo === p || d < 2.8'),
  'mere proximity to the player must not freeze villagers permanently');
assert(imageRule.includes('talkingTo === p'),'actual conversations can still stop a villager');

// Restore a fresh town and simulate to the screenshot's 20:17 timestamp.
// Look for collisions specifically among moving cyclists around the shops.
const day=new TownLife({homes,minute:7*60,seed:20261020});
let worst=Infinity,neighbourCount=0;
for(let step=0;step<1594;step++){
  day.tick(0.5);
  if(step%12!==0)continue;
  const people=day.villagers.filter(v=>!v.inside);
  for(let i=0;i<people.length;i++)for(let j=i+1;j<people.length;j++){
    const a=people[i],b=people[j],dist=Math.hypot(a.x-b.x,a.z-b.z);
    const limit=(a.bike&&a.path.length?1.16:.59)+(b.bike&&b.path.length?1.16:.59)+.05;
    if(dist<limit-.2){
      worst=Math.min(worst,dist);
      neighbourCount++;
    }
  }
}
assert.equal(neighbourCount,0,
  'town simulation still has '+neighbourCount+' unresolved bike/person overlaps (minimum '+worst.toFixed(2)+'m) near evening');
console.log('PASS: store queue spreads along pavement, opposing cycling lanes stay apart, nearby player cannot trap villagers and evening simulation has no merged bodies');
