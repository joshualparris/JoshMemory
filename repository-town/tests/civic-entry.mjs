import assert from 'node:assert/strict';
import { TownLife, FIELD_Z0 } from '../src/world/life.js';
import { civicEntranceZone, atCivicEntrance, closedCivicDoorPose } from '../src/world/civic-entrance.js';
import { facilityAccess } from '../src/world/facility-access.js';

const homes=Array.from({length:188},(_,i)=>({
 coordinate:String.fromCharCode(65+i%26)+(1+Math.floor(i/26)),
 name:'Home '+i,door:{x:(i%26-12.5)*26,z:Math.floor(i/26)*46-161+4}
}));
const life=new TownLife({homes,minute:724});
const bank=life.place('bank'),region=civicEntranceZone(bank);
assert.equal(bank.side,'south');
assert(region.z0<FIELD_Z0-1.0);
assert(region.z1>FIELD_Z0-.35);
assert(region.z1-region.z0>1.6);
assert(atCivicEntrance(bank,{x:bank.x,z:FIELD_Z0-1.25}));
assert(!atCivicEntrance(bank,{x:bank.x+4,z:FIELD_Z0-1.25}));
const outside=closedCivicDoorPose(bank,{x:bank.x,z:FIELD_Z0-1});
assert(!atCivicEntrance(bank,outside));
assert(outside.z<FIELD_Z0-.35);
assert.equal(facilityAccess(life,bank).reason,'unstaffed');
const teller=life.villagers.find(v=>v.work==='bank');
assert(teller);
teller.step={kind:'work',at:'bank'};teller.path=[];
assert.equal(facilityAccess(life,bank).allowed,true);
life.minute=1020;
assert.equal(facilityAccess(life,bank).reason,'closed');
const bakery=life.place('bakery');
assert.equal(civicEntranceZone(bakery).z0,bakery.door.z-.12);
assert(atCivicEntrance(bakery,{x:bakery.x,z:bakery.door.z+.5}));
console.log('PASS: bank sensor meets walkway, honours staff hours, north doors unchanged');
