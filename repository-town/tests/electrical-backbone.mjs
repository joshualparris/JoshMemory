import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildTownElectricalBackbone,createElectricalServiceRegistry,
  validateTownElectricNetwork,traceElectricalService,ROAD_X,roadZ } from '../src/world/electrical-backbone.js';
const path='audit/electricity/';
const audit=JSON.parse(fs.readFileSync(path+'coverage.json','utf8'));
const design=JSON.parse(fs.readFileSync(path+'design-network-v1.json','utf8'));
const services=createElectricalServiceRegistry(audit.records);
assert.deepEqual(services,createElectricalServiceRegistry(audit.records),'stable source registry');
assert.deepEqual(design,buildTownElectricalBackbone(audit.records),'deterministic design snapshot');
const result=validateTownElectricNetwork(design,audit.records);
assert.equal(result.buildingSites,234);
assert.equal(result.connected,233);
assert.equal(result.notRequired,1);
assert.equal(design.services.filter(s=>s.kind==='repository-house').length,188);
assert.equal(design.services.filter(s=>s.id.startsWith('B:')).length,46);
assert.equal(design.services.filter(s=>s.id.startsWith('H:')&&!s.existingHouseholdModels).length,89);
assert(design.transformers.length>=30 && design.transformers.length<=48,'transformer density must be reviewable');
assert.equal(ROAD_X.length,6);
assert.equal(roadZ(8),177);
assert.equal(roadZ(1),-145);
assert.equal(design.intake.referenceSite,'B:power');
assert.deepEqual(design.intake,{x:-143,z:184.5,referenceSite:'B:power',status:'design_synthetic',
  externalSupplyKv:66,secondaryDistributionKv:22,mainTransformMva:5,
  justification:'B:power station H9-N, exact door x=-143 z=184.5; row-8 road centre z=177',
  designSource:'conceptual regional NSW bulk grid (not local generator capacity assertion)'});
assert.equal(design.services.find(s=>s.id==='B:pub').address,'N8-S');
assert.equal(design.services.find(s=>s.id==='B:pub').phase,'ABC');
assert.equal(design.services.find(s=>s.id==='B:square').status,'not_required');
assert.equal(design.nodes.filter(n=>n.type==='service_meter').length,233);
assert.equal(design.nodes.filter(n=>n.type==='switchboard').length,233);
assert.equal(design.nodes.filter(n=>n.type==='distribution_transformer').length,design.transformers.length);
const ids=new Set(design.services.map(s=>s.id));
assert.deepEqual(ids,new Set(audit.records.map(r=>r.id)),'no orphan, omitted or invented properties');
const nodeIds=new Set(design.nodes.map(n=>n.id));
assert.equal(nodeIds.size,design.nodes.length);
assert.equal(new Set(design.edges.map(e=>e.id)).size,design.edges.length);
for(const item of design.services.filter(s=>s.status==='design_connected')){
  const route=traceElectricalService(design,item.id);
  assert(route.connected,item.id+' must reach external-grid source');
  assert(route.edges.some(e=>e.startsWith('MV-')),'MV path '+item.id);
  assert(route.edges.some(e=>e.startsWith('TX-LV')),'transformer secondary '+item.id);
  assert(route.edges.includes('SERVICE:'+item.id),'service drop '+item.id);
  assert(route.edges.includes('MAIN-SWITCH:'+item.id),'meter/switchboard '+item.id);
  const outage=traceElectricalService(design,item.id,['MV-INTAKE']);
  assert.equal(outage.connected,false,'incoming outage must affect '+item.id);
}
const healthyPub=traceElectricalService(design,'B:pub');
const pubDrop=traceElectricalService(design,'B:pub',['SERVICE:B:pub']);
const healthyBakery=traceElectricalService(design,'B:bakery');
const bakeryDuringPub=traceElectricalService(design,'B:bakery',['SERVICE:B:pub']);
assert(healthyPub.connected&&healthyBakery.connected);
assert.equal(pubDrop.reason,'isolated');
assert(bakeryDuringPub.connected,'individual pub service fault must not black out another shop');
const pub=design.services.find(x=>x.id==='B:pub');
const other=design.services.find(x=>x.id.startsWith('H:')&&x.row<8);
const theirPath=traceElectricalService(design,other.id);
const pubTransformerEdge=healthyPub.edges.find(e=>e.startsWith('MV-TX-'));
assert(pubTransformerEdge);
assert.equal(traceElectricalService(design,'B:pub',[pubTransformerEdge]).connected,false);
assert(theirPath.connected);
assert(traceElectricalService(design,other.id,[pubTransformerEdge]).connected,
  'fault on pub transformer must not black out unrelated street');
const meter=design.nodes.find(n=>n.id==='MTR:B:pub');
assert(meter&&meter.position.x>0&&meter.position.z>160);
for(const bad of [
  [{...audit.records[0]}, audit.records[0]],
  [{...audit.records[0],door:{x:NaN,z:0}}],
  [{...audit.records[0],address:'J11-S'}]
]) assert.throws(()=>createElectricalServiceRegistry(bad),/RTU-ELECTRIC|duplicate/);
const duplicate=structuredClone(design);
duplicate.edges.push({...duplicate.edges[0]});
assert.throws(()=>validateTownElectricNetwork(duplicate,audit.records),/duplicate edge/);
const broken=structuredClone(design);
broken.edges[0].to='DOES-NOT-EXIST';
assert.throws(()=>validateTownElectricNetwork(broken,audit.records),/orphan edge/);
const discon=structuredClone(design);
discon.edges=discon.edges.filter(e=>e.id!=='MV-INTAKE');
assert.throws(()=>validateTownElectricNetwork(discon,audit.records),/unenergised source/);
const duplicatemeter=structuredClone(design);
duplicatemeter.services.find(s=>s.id==='B:pub').meterId='MTR:B:bakery';
assert.throws(()=>validateTownElectricNetwork(duplicatemeter,audit.records),/duplicate\/unassigned meter|missing meter/);
const nonexistent=structuredClone(design);
nonexistent.services[0].id='H:NOPE';
assert.throws(()=>validateTownElectricNetwork(nonexistent,audit.records),/orphan service/);
assert.throws(()=>traceElectricalService(design,'H:NOPE'),/unknown service/);
for(const transformer of design.transformers){
  assert(transformer.diversifiedKva * 1.2<=transformer.ratedKva+0.01,transformer.id+' has no headroom');
}
console.log('PASS: RTU-003/004/005 all 234 properties audited, 233 design connections, pub and independent breaker faults, source→LV radial topology, route/phase/meter and invalid fixture checks; no live grid falsely claimed.');
