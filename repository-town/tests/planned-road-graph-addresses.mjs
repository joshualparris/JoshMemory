import assert from 'node:assert/strict';
import {plannedRoadGraph} from '../src/world/planned-road-graph.js';
import {plannedParcelAddresses,validatePlannedAddress} from '../src/world/planned-addresses.js';
const graph=plannedRoadGraph();
assert.equal(graph.nodes.length,6);
assert(graph.nodes.every(n=>!n.driveable),'conceptual roads must never be represented as driveable');
assert(!graph.allDriveable);
assert(graph.components.length>=1);
const addresses=plannedParcelAddresses();
assert.equal(addresses.length,12);
assert.equal(new Set(addresses.map(a=>a.parcelId)).size,12);
for(const a of addresses){
 assert(validatePlannedAddress(a),a.parcelId+' invalid');
 assert.equal(a.streetNumber,null,'no fabricated house numbers');
 assert.equal(a.roadName,null,'no fabricated official road names');
 assert.equal(a.publicRoadAccessVerified,false,'no fabricated access');
 assert.equal(a.legacyPropertyKey,null,'legacy saves must remain separate');
}
console.log(JSON.stringify({roadComponents:graph.components,roadVisualJunctions:graph.edges.length,provisionalParcels:addresses.length},null,2));
