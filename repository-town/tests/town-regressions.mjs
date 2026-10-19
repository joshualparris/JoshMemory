import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createTownSimulation} from '../src/simulation/town-system.js';
import {buildCivicDistrict} from '../src/simulation/civic-world.js';
import {CollisionWorld} from '../src/engine/collision.js';
const fixture = mutate => {const s=JSON.parse(createTownSimulation().serialize());mutate(s);return createTownSimulation({restored:s});};
test('wastewater gauge reports untreated stock after treatment',()=>{
 const t=createTownSimulation();t.advance(60);const s=t.snapshot();assert.equal(s.supply.wastewater,s.stores.sewage.wastewater);
});
test('sorting then processing counts each recyclable once',()=>{
 const t=fixture(s=>{s.minute=899;s.stores.homes.recyclables=2;});assert.ok(t.recycle(2).ok);t.advance(1);
 const s=t.snapshot();assert.equal(s.stats.recycled,2);assert.equal(s.stores.recycling.recyclables,0);assert.equal(s.stores.recycling.scrap,5);
});
test('households buy complete affordable meals only',()=>{
 for(const [bread,veg,cash,expected] of [[4,0,2000,0],[0,4,2000,0],[4,4,0,0],[4,4,15,1],[4,4,32,4]]){
  const t=fixture(s=>{s.minute=1079;s.stores.market.bread=bread;s.stores.market.vegetables=veg;s.householdCash=cash;});t.advance(1);const s=t.snapshot();
  assert.equal(s.stats.meals,expected);assert.equal(s.stores.market.bread,bread-expected);assert.equal(s.stores.market.vegetables,veg-expected);assert.equal(s.householdCash,cash-expected*8);
 }
});
test('manufacturing consumes scrap in pairs and preserves odd leftovers',()=>{
 const t=fixture(s=>{s.minute=599;s.stores.recycling.scrap=3;s.stores.factory.scrap=2;});t.advance(1);const s=t.snapshot();
 assert.equal(s.stores.factory.parts,18);assert.equal(s.stores.factory.scrap,1);assert.equal(s.stores.recycling.scrap,0);
});
test('invalid quantities are rejected without changing state',()=>{
 for(const value of [NaN,Infinity,-Infinity,undefined,null,0,-1,.5,'20'])for(const op of ['deposit','withdraw','buy','sell','recycle']){
  const t=createTownSimulation();const before=t.serialize();
  // Undefined uses the documented default for optional trading/sorting quantities.
  if(value===undefined&&['buy','sell','recycle'].includes(op))continue;
  const result=['buy','sell'].includes(op)?t[op]('bread',value):t[op](value);
  assert.equal(result.ok,false,`${op} accepted ${String(value)}`);assert.equal(t.serialize(),before);
 }
});
test('civic park tree and farm shed block swept movement from both sides',()=>{
 const town={group:new THREE.Group(),lots:new Map(),colliders:[]};const district=buildCivicDistrict(town,()=>new THREE.Object3D());const world=new CollisionWorld(town.colliders);
 for(const [id,dx,dz,half] of [['park',0,0,.65],['farm',3,-3,1.5]]){
  const b=district.buildings.find(b=>b.id===id),x=b.position.x+dx,z=b.position.z+dz;
  assert.ok(world.hits(x,z,.35),`${id} lacks collider`);
  for(const dir of [-1,1]){const p={x,z:z+dir*4};world.move(p,0,-dir*8,.35);assert.ok((p.z-z)*dir>=half+.3,`${id} walked through`);}
  assert.equal(world.hits(b.position.x,b.position.z+7,.35),null,'front interaction remains accessible');
 }
});
test('90-day run retains finite nonnegative stocks and cash',()=>{
 const t=createTownSimulation();for(let day=0;day<90;day++){
  t.advance(1440);const s=t.snapshot();
  for(const items of Object.values(s.stores))for(const v of Object.values(items))assert.ok(Number.isFinite(v)&&v>=0);
  for(const key of ['wallet','bankBalance','householdCash','shopBalance','treasury'])assert.ok(Number.isFinite(s[key])&&s[key]>=0);
  assert.equal(s.supply.wastewater,s.stores.sewage.wastewater);
 }
 assert.deepEqual(createTownSimulation({restored:JSON.parse(t.serialize())}).snapshot(),t.snapshot());
});
