import test from 'node:test';
import assert from 'node:assert/strict';
import { LANTERN_POINT, LANTERN_ROAD, LANTERN_MAP_DESTINATION, onLanternRoad } from '../src/world/lantern-point-layout.js';

test('Lantern Point is south of fixed Repository Town and is comparable to Narromine game access', () => {
  assert.equal(LANTERN_POINT.x,0);
  assert.ok(LANTERN_POINT.z > 2500 && LANTERN_POINT.z < 3300);
  assert.equal(LANTERN_POINT.gameDistanceMetres,LANTERN_POINT.z);
  assert.equal(LANTERN_POINT.representedDistanceMetres,16500);
  assert.ok(LANTERN_POINT.latitude < -32.2736);
  assert.equal(LANTERN_POINT.longitude,148.4084);
  assert.equal(LANTERN_MAP_DESTINATION.z,LANTERN_POINT.z);
  assert.equal(LANTERN_POINT.fictional,true);
});
test('southern road is a bounded connected carriageway with two local intersections',()=>{
  assert.equal(LANTERN_ROAD.startZ,235);
  for(const z of [235,367,558,640])assert.equal(onLanternRoad(338,z),true,'eastern avenue open at '+z);
  for(const x of [0,100,170,250,338])assert.equal(onLanternRoad(x,650),true,'connecting bend open at '+x);
  for(const z of [650,800,1500,2500,2870,3160])assert.equal(onLanternRoad(0,z),true,'southern road open at '+z);
  assert.equal(onLanternRoad(0,560),false,'no road carved through existing homes');
  assert.equal(onLanternRoad(0,3161),false);
  assert.equal(onLanternRoad(20,1500),false);
  assert.equal(onLanternRoad(-160,2760),true);
  assert.equal(onLanternRoad(160,2990),true);
  assert.equal(onLanternRoad(160,3010),false);
  assert.equal(onLanternRoad(NaN,2750),false);
});
test('Lantern village module remains importable with the pinned three runtime',async()=>{
  const { buildLanternPoint }=await import('../src/world/lantern-point.js');
  assert.equal(typeof buildLanternPoint,'function');
});
