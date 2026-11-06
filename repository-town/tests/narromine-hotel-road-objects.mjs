// Recovery of #441: three publicly detected hotel-side objects have unsurveyed road positions.
import assert from 'node:assert/strict';
import {NARROMINE_MAPILLARY_OBJECTS as objects} from '../src/world/narromine-mapillary-data.js';
import {MISPLACED_HOTEL_ROAD_OBJECT_IDS as excluded} from '../src/world/narromine-mapillary-objects.js';
const ids=['222123616053691','1870715210337913','1870715420337892'];
assert.equal(excluded.size,3,'only the three independently documented positions are excluded');
for(const id of ids){
 assert(excluded.has(id),id+' must be excluded');
 assert.equal(objects.filter(o=>o.id===id).length,1,id+' must occur in the source observations');
}
const byId=new Map(objects.map(o=>[o.id,o]));
assert.notEqual(byId.get(ids[0]).type,'bikeRack','sign is separately classified');
assert(ids.slice(1).every(id=>byId.get(id).type==='bikeRack'),'remaining objects are bicycle racks');
assert(objects.some(o=>!excluded.has(o.id)),'all other Mapillary observations remain available');
console.log('narromine hotel road-object exclusion ok');
