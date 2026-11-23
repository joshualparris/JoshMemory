import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LANTERN_POINT,LANTERN_ROAD,LANTERN_ROAD_CENTRELINE as PATH,LANTERN_CIVIC_GREEN,
  LANTERN_MAP_DESTINATION,onLanternRoad,distanceToLanternRoad,
} from '../src/world/lantern-point-layout.js';

test('Lantern Point keeps the fixed shared-world geography south of Repository Town',()=>{
  assert.equal(LANTERN_POINT.x,0);
  assert.equal(LANTERN_POINT.z,2870);
  assert.equal(LANTERN_POINT.gameDistanceMetres,LANTERN_POINT.z);
  assert.equal(LANTERN_POINT.representedDistanceMetres,16500);
  assert.ok(LANTERN_POINT.latitude < -32.2736);
  assert.equal(LANTERN_POINT.longitude,148.4084);
  assert.equal(LANTERN_MAP_DESTINATION.z,LANTERN_POINT.z);
  assert.equal(LANTERN_POINT.fictional,true);
});
test('curved rural road begins on the existing eastern avenue, not through homes',()=>{
  assert.equal(LANTERN_ROAD.entranceX,338);
  assert.equal(PATH[0].x,338);
  assert.equal(PATH[0].z,LANTERN_ROAD.startZ);
  assert.deepEqual(PATH.at(-1),{x:0,z:LANTERN_ROAD.endZ});
  assert.equal(onLanternRoad(0,560),false,'no square shortcut through the built southern homes');
  for(const z of [235,360,500,580])assert.equal(onLanternRoad(338,z),true,'eastern road at '+z);
  assert.equal(onLanternRoad(170,665),true,'westward tangent at the turn');
  for(const z of [750,800,1500,2500,2870,3160])assert.equal(onLanternRoad(0,z),true,'south road at '+z);
  assert.equal(onLanternRoad(0,650),false,'no abrupt square junction near the old bend');
  assert.equal(onLanternRoad(0,3161),true,'the end cap is still part of the carriageway');
  assert.equal(onLanternRoad(0,3166),false,'the road must end beyond the cap');
  for(const x of [-160,0,160])for(const z of LANTERN_ROAD.crossStreets)
    assert.equal(onLanternRoad(x,z),true,'connected village cross street');
  assert.equal(onLanternRoad(NaN,2750),false);
});
test('one curved 3D/mapping/driving centreline is continuous with no sharp vertex',()=>{
  assert.ok(PATH.length>380,'road rendered at close enough intervals for smooth geometry');
  let length=0,largestTurn=0,prev=null;
  for(let i=1;i<PATH.length;i++){
    const a=PATH[i-1],b=PATH[i],dx=b.x-a.x,dz=b.z-a.z,d=Math.hypot(dx,dz);
    assert.ok(d>0&&d<8.5,'no missing road segments, segment '+i);
    assert.ok(onLanternRoad(a.x,a.z),'drivable centreline point '+i);
    assert.ok(distanceToLanternRoad(a.x,a.z)<.00001,'geometry and physics remain aligned');
    length+=d;
    const heading=Math.atan2(dx,dz);
    if(prev!==null){
      let delta=Math.atan2(Math.sin(heading-prev),Math.cos(heading-prev));
      largestTurn=Math.max(largestTurn,Math.abs(delta));
    }
    prev=heading;
  }
  assert.ok(length>3000&&length<3600,'realistic connected route length '+length);
  assert.ok(largestTurn<.07,'no square 90-degree bends, maximum turn '+largestTurn);
  assert.equal(onLanternRoad(35,2500),false,'shoulders are not infinitely wide');
});
test('road uses a documented slower in-game bend advisory',()=>{
  assert.equal(LANTERN_ROAD.curveRadius,85);
  assert.equal(LANTERN_ROAD.advisoryBendKmh,40);
});
test('3D village, road renderer, detailed citizens and houses import together',async()=>{
  const [{buildLanternPoint},{buildLanternRoadView},{createLanternCitizens},{drawLanternHome}]=await Promise.all([
    import('../src/world/lantern-point.js'),
    import('../src/world/lantern-road-view.js'),
    import('../src/world/lantern-citizens.js'),
    import('../src/world/lantern-architecture.js'),
  ]);
  for(const f of [buildLanternPoint,buildLanternRoadView,createLanternCitizens,drawLanternHome])
    assert.equal(typeof f,'function');
});

test('civic green does not conceal the sealed main road',()=>{
  const edge=LANTERN_CIVIC_GREEN.x+LANTERN_CIVIC_GREEN.w/2;
  assert.ok(edge < -(LANTERN_ROAD.halfWidth+LANTERN_ROAD.shoulderWidth+3),
    'the plaza must remain west of the carriageway and gravel shoulder');
  assert.ok(LANTERN_CIVIC_GREEN.z>2600&&LANTERN_CIVIC_GREEN.z<3100);
});
