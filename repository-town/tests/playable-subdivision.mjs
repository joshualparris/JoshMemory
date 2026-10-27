import assert from 'node:assert/strict';
import {Builder} from '../src/world/builder.js';
import {CollisionWorld} from '../src/engine/collision.js';
import {roadAllows} from '../src/world/player-driving.js';
import {
 SUBDIVISION_ROADS,SUBDIVISION_PARCELS,SUBDIVISION_START,
 subdivisionRoadAllows,ensureSubdivisionTitles,drawPlayableSubdivision
} from '../src/world/playable-subdivision.js';
import {CHEAT_PASSWORD,cheatClaimDeed,cheatAddFunds,cheatSpawnCar} from '../src/world/cheat-actions.js';
assert.equal(CHEAT_PASSWORD,'CHEAT123');
assert.equal(SUBDIVISION_ROADS.length,5,'street-8 approach, Kurrajong, Bottlebrush, Wattle and Banksia');
assert.equal(SUBDIVISION_PARCELS.length,12);
assert.equal(new Set(SUBDIVISION_PARCELS.map(x=>x.address)).size,12);
assert.equal(SUBDIVISION_PARCELS.find(x=>x.address==='2 Wattle Street').area,560);
const b=new Builder();b.glass=[];
drawPlayableSubdivision(b);
assert(b.parts.length>100,'road markings, footpaths, residential pads, trees and signage');
assert(!b.solids.length,'empty unserviced plots have no phantom solid house collisions');
const roads=[
 [-338,177],[-400,177],[-536,180],[-536,220],[-500,220],[-416,220],[-416,260],[-416,309],[-470,309],[-536,309]
];
for(const [x,z] of roads)assert(roadAllows(x,z),'driveable continuous junction '+x+','+z);
assert(!subdivisionRoadAllows(-470,260),'do not allow driving across houses and lawns');
assert(!roadAllows(-470,260),'car cannot cut across a vacant parcel');
assert(roadAllows(SUBDIVISION_START.x,SUBDIVISION_START.z));
assert(!SUBDIVISION_ROADS.some(r=>r.x1>-337),'do not pave over original established houses');
const life={
 day:2,civic:{motor:{next:100,owned:[],journal:[]},
  player:{bank:3,wallet:10},property:{parcels:{
   'H:A1':{id:'H:A1',address:'A1-S',name:'First House',kind:'house',
    owner:'original',tenant:'Existing tenant',protected:false,listed:true}
  },journal:[],liens:{'H:A1':{balance:120}}}},
 trucks:[],villagers:[],
};
assert.equal(ensureSubdivisionTitles(life),12);
assert.equal(ensureSubdivisionTitles(life),12,'reload must not reset parcel owners');
assert.equal(life.civic.property.parcels['SUB:0:0'].address,'2 Wattle Street');
assert.equal(life.civic.property.parcels['SUB:0:0'].listed,false,'not sold as serviced real titles');
assert.match(cheatClaimDeed(life,'H:A1'),/Claimed/);
assert.equal(life.civic.property.parcels['H:A1'].tenant,'Existing tenant','existing tenant remains');
assert.equal(life.civic.property.liens['H:A1'],undefined,'debug claim is mortgage-free');
assert.match(cheatClaimDeed(life,'SUB:0:0'),/2 Wattle Street/);
assert.equal(life.civic.property.parcels['SUB:0:0'].owner,'visitor');
assert.equal(ensureSubdivisionTitles(life),12);
assert.equal(life.civic.property.parcels['SUB:0:0'].owner,'visitor','save upgrade cannot undo ownership');
assert.match(cheatAddFunds(life),/10000/);
assert.equal(life.civic.player.bank,10003);
const world=new CollisionWorld();
let spawn=cheatSpawnCar(life,SUBDIVISION_START.x,SUBDIVISION_START.z,world,'hatch');
assert(spawn.ok,spawn.message);assert.equal(spawn.vehicle.owner,'visitor');
assert.equal(spawn.vehicle.roadworthy,true);assert.equal(spawn.vehicle.fuel,90);
assert(roadAllows(spawn.vehicle.x,spawn.vehicle.z));
assert(!world.hits(spawn.vehicle.x,spawn.vehicle.z,1.05));
assert.equal(cheatSpawnCar(life,9000,9000,world).ok,false,'must never place a vehicle off-road');
assert.equal(cheatSpawnCar(life,-500,220,world,'spaceship').ok,false,'cannot create invalid motor model');
console.log('PASS RTMAP: Wattle/Banksia road connectivity, twelve 560m2 plots, cheat ownership, car summoning and off-road limits');
