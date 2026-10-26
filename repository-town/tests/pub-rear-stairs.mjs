import test from 'node:test';
import assert from 'node:assert/strict';
import {Builder} from '../src/world/builder.js';
import {buildPubFacade} from '../src/world/pub-envelope.js';
import {CollisionWorld} from '../src/engine/collision.js';
import {pubSecondaryExitPose} from '../src/world/pub-physical-plan-2026.js';
import {PUB_REAR_STAIRS,pubRearStairFoot,pubRearStairTop,pubRearStairHeight,pubRearStairAtUpperDoor} from '../src/world/pub-rear-stairs.js';

const site={id:'pub',x:0,originZ:0,side:'high-street'};
const s=PUB_REAR_STAIRS;
test('rear pub staircase has ground-accessible foot, consistent 28 treads and clear walking line',()=>{
  const b=new Builder();b.glass=[];
  const facade=buildPubFacade(b);
  const treads=facade.pieces.filter(p=>p.name==='escape-stair-tread');
  assert.equal(treads.length,28);
  assert.equal(facade.pieces.filter(p=>p.name==='escape-stair-upper-landing').length,1);
  assert.equal(facade.pieces.filter(p=>p.name==='escape-stair-foot-landing').length,1);
  assert.equal(treads[0].y>treads.at(-1).y,true);
  assert.equal(treads[0].z>treads.at(-1).z,true,
    'foot must face into the rear yard, not finish against the rear wall');
  const world=new CollisionWorld(b.solids);
  for(let i=0;i<29;i++){
    const z=s.firstTreadZ-i*s.going;
    assert.equal(world.hits(s.x,z,.35),null,'flight center must stay collision free at step '+i);
  }
  const foot=pubRearStairFoot(site),top=pubRearStairTop(site);
  assert.equal(world.hits(foot.x,foot.z,.35),null,'a walker can approach the bottom');
  assert.equal(world.hits(top.x,top.z,.35),null,'a walker can stand outside the upper rear door');
  assert.equal(pubRearStairHeight(site,foot.x,foot.z),0);
  assert(Math.abs(pubRearStairHeight(site,top.x,top.z)-4.8)<1e-9);
  const midpointZ=s.firstTreadZ-s.treadCount*s.going/2;
  assert(Math.abs(pubRearStairHeight(site,s.x,midpointZ)-2.4)<.01);
  assert.equal(pubRearStairHeight(site,s.x+2,midpointZ),0);
  assert.equal(pubRearStairAtUpperDoor(site,foot.x,foot.z),false);
  assert.equal(pubRearStairAtUpperDoor(site,top.x,top.z+.2),true);
  assert.deepEqual({x:pubSecondaryExitPose(site,b.solids)?.x,z:pubSecondaryExitPose(site,b.solids)?.z},top);
  for(const g of [...b.parts,...b.glass])g.dispose();
});

test('rear stair geometry remains mirrored at reversed sites and rejects invalid origins',()=>{
  const south={x:25,originZ:140,side:'south'},p=pubRearStairFoot(south);
  assert.deepEqual(p,{x:25-s.x,z:140-s.bottomLandingZ});
  const top=pubRearStairTop(south);
  assert(Math.abs(pubRearStairHeight(south,top.x,top.z)-4.8)<1e-9);
  assert.throws(()=>pubRearStairFoot({x:NaN,originZ:0}),TypeError);
});

test('pub rear stair player transitions and signage stay wired to real outdoor gameplay',async()=>{
  const fs=await import('node:fs/promises');
  const townlife=await fs.readFile(new URL('../src/world/townlife.js',import.meta.url),'utf8');
  const main=await fs.readFile(new URL('../src/main.js',import.meta.url),'utf8');
  assert.match(townlife,/rear-stair-foot/);
  assert.match(townlife,/pubRearStairFoot\(p\)/);
  assert.match(main,/nearPerson\.spot\.rearStairs/);
  assert.match(main,/pubRearStairHeight\(site,player\.pos\.x,player\.pos\.z\)/);
  assert.match(main,/pubRearStairAtUpperDoor\(site,player\.pos\.x,player\.pos\.z\)/);
  assert.match(main,/enterPubRearStairs\(\)/);
});

test('pub rear stair keeps clear lower yard route and never reintroduces the blocking dogleg',async()=>{
  const fs=await import('node:fs/promises');
  const facade=await fs.readFile(new URL('../src/world/pub-envelope.js',import.meta.url),'utf8');
  const services=await fs.readFile(new URL('../src/world/pub-plant.js',import.meta.url),'utf8');
  assert.equal(facade.includes('solid(3.4,5.5,5.2,-13.8)'),false);
  assert.equal(services.includes('20.55'),true);
  assert.equal(pubRearStairHeight(site,s.x,s.firstTreadZ-15*s.going)<4.8,true);
});
