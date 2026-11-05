// Contract for fictional citizen ownership, mapped homes and destination-driven traffic.
// Run: node tests/narromine-citizens.mjs
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { STREETS } from '../src/world/narromine-layout.js';
import { createNarromineCitizens } from '../src/world/narromine-citizens.js';
import { createNarromineTraffic } from '../src/world/narromine-traffic.js';
import { townWeekday } from '../src/world/town-calendar.js';

const nodes=[],adj=new Map(),indices=new Map();
function add([x,z]){
  const key=Math.round(x*2)+','+Math.round(z*2);
  if(!indices.has(key)){indices.set(key,nodes.length);nodes.push({x,z});adj.set(nodes.length-1,[]);}
  return indices.get(key);
}
for(const street of STREETS){
  if(['track','service'].includes(street.kind)||street.pts.length<2)continue;
  let prev=add(street.pts[0]);
  for(const pt of street.pts.slice(1)){
    const next=add(pt);
    if(prev!==next){const len=Math.hypot(nodes[prev].x-nodes[next].x,nodes[prev].z-nodes[next].z);
      adj.get(prev).push({to:next,len});adj.get(next).push({to:prev,len});}
    prev=next;
  }
}
const town=createNarromineCitizens({nodes,adj});
assert.ok(town.households.length>100,'real mapped footprint sampling should yield many fictional households');
assert.ok(town.workplaces.length>=12,'mapped, routable workplaces available');
assert.ok(town.coles && /coles/i.test(town.coles.name),'Coles destination uses existing public POI');
assert.equal(town.households.length,town.citizens.length);
assert.equal(new Set(town.citizens.map(p=>p.id)).size,town.citizens.length,'stable unique citizen identities');
assert.equal(new Set(town.households.map(h=>h.vehicle.id)).size,town.households.length,'one unique household vehicle per home');
for(const [i,h] of town.households.entries()){
  assert.ok(h.home.footprintIndex>=0&&nodes[h.home.node],'mapped house footprint with reachable road');
  assert.equal(h.home.addressNumber,null,'must not fabricate a real residential house number');
  assert.equal(h.home.residenceVerified,false,'no claims about actual resident');
  assert.equal(h.interior.physicalInteriorBuilt,false,'furnishing specification not falsely claimed as built');
  for(const required of ['kitchen','bathroom','bedroom','laundry','dining']){
    assert.ok(h.interior.rooms.some(r=>r.type===required),'interior needs '+required);
  }
  assert.ok(h.interior.rooms.find(r=>r.type==='kitchen').fixtures.includes('fridge'),'fridge');
  assert.ok(h.interior.rooms.find(r=>r.type==='bathroom').fixtures.includes('toilet'),'toilet');
  assert.ok(h.interior.rooms.find(r=>r.type==='bedroom').fixtures.includes('bed'),'bed');
  const p=town.citizens[i];
  assert.equal(p.householdId,h.id);assert.equal(p.vehicle.id,h.vehicle.id);
  assert.ok(town.workplaces.some(w=>w.id===p.work.id),'person has a named mapped workplace');
  assert.ok(p.role&&p.fictional&&p.actualEmploymentUnknown);
}
const checkPath=(start,goal)=>{
  const path=town.route(start,goal);
  assert.ok(path&&path.length>=1&&path[0]===start&&path.at(-1)===goal,'routed path endpoints');
  for(let i=1;i<path.length;i++)assert.ok(adj.get(path[i-1]).some(e=>e.to===path[i]),'every route segment is mapped road');
};
for(const p of town.citizens.slice(0,150))checkPath(p.home.node,p.work.node);
for(const p of town.citizens.slice(0,150))checkPath(p.work.node,p.home.node);
for(let day=1;day<=7;day++){
  assert.ok(townWeekday(day)>=0&&townWeekday(day)<=6);
  for(const p of town.citizens.slice(0,35)){
    for(let minute=0;minute<1440;minute+=15){
      const state=town.stateAt(p,day,minute);
      assert.ok(['sleeping','breakfast','working','travelling','dinner','home'].includes(state.kind));
      if(state.kind==='travelling') {
        const trip=town.tripAt(p,day,minute);
        assert.ok(trip&&trip.from.node!==undefined&&trip.to.node!==undefined);
        assert.ok(trip.windowEnd>minute);
      }
    }
  }
}
for(const person of town.citizens.slice(0,100)){
  assert.equal(town.stateAt(person,1,180).kind,'sleeping','3 am sleep for day/evening workers');
  // An evening shift can legitimately end at 11 pm; the commute home must
  // not be hidden by an unrealistic blanket lights-out assertion.
  assert.ok(['sleeping','travelling'].includes(town.stateAt(person,1,1380).kind),
    '11 pm late-shift commute or sleep');
}
const selected=town.chooseTrip({day:1,minute:480,serial:3,fromNode:10});
assert.ok(selected?.citizen&&selected.route.length>1,'actual traveller selected during morning commute');
assert.equal(selected.route.at(-1),selected.trip.to.node);
assert.equal(town.chooseTrip({day:1,minute:480,serial:3,fromNode:10,activeIds:new Set([selected.citizen.id])})?.citizen.id===selected.citizen.id,false,
  'same driver cannot be assigned to two visible cars');

const traffic=createNarromineTraffic(new THREE.Group(),{models:false});
const player={x:-4805,z:-760};
for(let i=0;i<600;i++)traffic.update(.1,player,480,1);
assert.ok(traffic.count>5,'morning traffic still populated around central Narromine');
const ids=new Set();
for(const car of traffic.cars){
  assert.ok(car.vehicleId && car.vehicleOwner && car.citizenId && car.householdId,'every car has owner + driver');
  assert.ok(car.homeStreet && car.workplaceName && car.destinationId && car.journeyReason,'every trip has identifiable purpose');
  assert.ok(car.route.length>=1 && car.route[0]===car.to,'route must match current vehicle edge');
  assert.ok(!ids.has(car.citizenId),'one active vehicle per driver');
  ids.add(car.citizenId);
}
console.log('PASS Narromine citizen trips: '+town.households.length+' synthetic households, '+
  town.workplaces.length+' mapped workplaces, '+traffic.count+' owner-linked active cars and real connected road routes');
