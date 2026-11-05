import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {AERODROME,runwayVector,runwayEnd,runwayLocal,isRunway,aircraftParking} from '../src/world/narromine-airfield-data.js';
import {FLIGHT_TYPES,initialFlight,advanceFlight} from '../src/world/flight-dynamics.js';

const near=(actual,expected,tol=0.01)=>assert.ok(Math.abs(actual-expected)<=tol,
  'Expected '+actual+' within '+tol+' of '+expected);
assert.equal(AERODROME.icao,'YNRM');
assert.equal(AERODROME.runways.length,2);
assert.deepEqual(AERODROME.runways.map(({id,length,width})=>[id,length,width]),
  [['11/29',1521,30],['04/22',1100,30]]);
assert.equal(AERODROME.grassStrips.length,3);
assert.equal(AERODROME.positionSource.includes('not a surveyed'),true,
  'Approximate threshold placement must never be asserted as surveyed');
assert.equal(aircraftParking().length,2);
assert.notEqual(aircraftParking()[0].id,aircraftParking()[1].id);

for(const runway of AERODROME.runways) {
  assert.equal(isRunway(runway.x,runway.z),true);
  const v=runwayVector(runway);
  near(Math.hypot(v.x,v.z),1);
  for(const start of [true,false]) {
    const e=runwayEnd(runway,start),local=runwayLocal(runway,e.x,e.z);
    near(Math.abs(local.along),runway.length/2);
    near(local.cross,0);
  }
  const outside=runwayEnd(runway,false);
  assert.equal(isRunway(outside.x+v.x*1000,outside.z+v.z*1000),false);
}
assert.equal(isRunway(AERODROME.entry.x,AERODROME.entry.z),false,
  'Boarding location must not lie on an active runway');
assert.equal(isRunway(-9999,-9999),false);

for(const [id,model] of Object.entries(FLIGHT_TYPES)) {
  const runway=AERODROME.runways[0];
  const v=runwayVector(runway),threshold=runwayEnd(runway,true);
  const s=initialFlight(id,{x:threshold.x+v.x*75,z:threshold.z+v.z*75,headingDeg:runway.headingDeg});
  assert.equal(s.onGround,true);
  assert.equal(s.airspeed,0);
  let airborneAt=-1;
  for(let i=0;i<800;i++){
    advanceFlight(s,{throttle:1,pitch:1,roll:0},0.05,isRunway);
    if(!s.onGround&&airborneAt<0)airborneAt=i*0.05;
  }
  assert.ok(airborneAt>2&&airborneAt<18,id+' should lift off within the runway length');
  assert.ok(s.altitude>20,id+' should climb above 20 m');
  assert.ok(s.airspeed>=model.takeoffSpeed,id+' should reach takeoff speed');
  assert.ok(s.totalDistance>200,id+' travelled');
  const initialHeading=s.heading;
  for(let i=0;i<300;i++)advanceFlight(s,{throttle:0,roll:1,pitch:0},0.05,isRunway);
  assert.ok(Math.abs(s.heading-initialHeading)>0.2,id+' should turn with bank input');
  assert.ok(s.totalDistance>400,id+' should continue through open air');
  assert.ok(Number.isFinite(s.x)&&Number.isFinite(s.z)&&Number.isFinite(s.altitude));
  // Stall deceleration should eventually bring the aeroplane down, without NaN or teleport.
  for(let i=0;i<1500;i++)advanceFlight(s,{throttle:-1,roll:0,pitch:0},0.05,isRunway);
  assert.ok(s.altitude>=0&&s.altitude<1000,id+' altitude stays finite and bounded');
  assert.ok(s.airspeed<=model.maxSpeed);
}

const apron=initialFlight('trainer',aircraftParking()[0]);
for(let i=0;i<350;i++)advanceFlight(apron,{throttle:1,pitch:1,roll:0},0.05,()=>false);
assert.equal(apron.onGround,true,'Aircraft cannot take off on an arbitrary paved parking apron');
assert.equal(apron.altitude,0);

const forced=initialFlight('trainer');
forced.onGround=false; forced.altitude=0.02;forced.verticalSpeed=-6;
forced.airspeed=19;
advanceFlight(forced,{throttle:0,pitch:-1,roll:0},0.15,isRunway);
assert.equal(forced.onGround,true,'Descent reaches ground and returns to taxi state');
assert.equal(forced.landed,true);
assert.equal(forced.altitude,0);

const code=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const narromine=readFileSync(new URL('../src/world/narromine.js',import.meta.url),'utf8');
const aircraft=readFileSync(new URL('../src/world/player-flight.js',import.meta.url),'utf8');
const airfield=readFileSync(new URL('../src/world/narromine-airfield.js',import.meta.url),'utf8');
for(const token of [
  "createPlayerFlight({parent:narromine.root","flight.board(","flight.update(dt)",
  "flight.flying","AERODROME.entry.x","'Narromine Aerodrome · YNRM'",
  "camera.far=far","airport:()=>","flight:()=>",
])assert.ok(code.includes(token),'Missing flight main integration: '+token);
assert.ok(narromine.includes("buildNarromineAirfield(town)"));
assert.ok(aircraft.includes('setPointerCapture'),'Touch pilots need press-and-hold controls');
assert.ok(aircraft.includes('flight-instruments'),'Accessible HUD needed');
assert.ok(airfield.includes('runwayText('),'Runway designations must be modelled');
console.log('PASS Narromine aerodrome and piloted-aircraft geometry, dynamics, integration contracts');
