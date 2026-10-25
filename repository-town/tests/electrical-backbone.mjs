import assert from 'node:assert/strict';
import fs from 'node:fs';
import { validateUtilityGraph } from '../src/world/utility-network-schema.js';
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
  assert(route.edges.some(e=>e.startsWith('TX-LV')||e.startsWith('TX-DED-LV')),'transformer secondary '+item.id);
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
// Essential services and heavy facilities receive their own transformer,
 // so an industrial fault cannot de-energise the clinic, pub or neighbouring shop.
 const dedicatedNames=['B:clinic','B:waterworks','B:sewage','B:foundry','B:soyplant','B:mill','B:university'];
 for(const id of dedicatedNames){
   const s=design.services.find(q=>q.id===id);
   assert(s&&s.transformerId.startsWith('DIST-DED-'),id+' requires dedicated transformer');
   const tx=design.transformers.find(x=>x.id===s.transformerId);
   assert(tx.ratedKva>=1.2*tx.rawKva-0.01,id+' dedicated transformer must cover full connected peak with reserve');
   const fault=traceElectricalService(design,id,['MV-DED-TX-'+id.replace(/[^a-zA-Z0-9]/g,'-').toUpperCase()]);
   assert.equal(fault.connected,false,id+' transformer fault');
   assert(traceElectricalService(design,'B:pub',['MV-DED-TX-'+id.replace(/[^a-zA-Z0-9]/g,'-').toUpperCase()]).connected,'pub isolated from critical transformer fault');
 }
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
assert.throws(()=>validateTownElectricNetwork(broken,audit.records),/orphan/);
const discon=structuredClone(design);
discon.edges=discon.edges.filter(e=>e.id!=='MV-INTAKE');
assert.throws(()=>validateTownElectricNetwork(discon,audit.records),/unenergised source/);
const duplicatemeter=structuredClone(design);
duplicatemeter.services.find(s=>s.id==='B:pub').meterId='MTR:B:bakery';
assert.throws(()=>validateTownElectricNetwork(duplicatemeter,audit.records),/duplicate meter|duplicate\/unassigned meter|missing meter/);
const nonexistent=structuredClone(design);
nonexistent.services[0].id='H:NOPE';
assert.throws(()=>validateTownElectricNetwork(nonexistent,audit.records),/orphan service/);
assert.throws(()=>traceElectricalService(design,'H:NOPE'),/unknown service/);
const opened=structuredClone(design);
const breaker=opened.edges.find(e=>e.id==='SERVICE:B:pub');
breaker.isolationState='open';
assert.equal(traceElectricalService(opened,'B:pub').connected,false);
assert.equal(traceElectricalService(opened,'B:bakery').connected,true);
assert.throws(()=>validateTownElectricNetwork(opened,audit.records),/unenergised source/);
for(const transformer of design.transformers){
  assert(transformer.diversifiedKva * 1.2<=transformer.ratedKva+0.01,transformer.id+' has no headroom');
}
// The same physical graph contract handles other utility media without
// pretending the full water/sewer/gas physics exist in this task.
const waterFixture={
  schemaVersion:1,utility:'water',units:{coordinate:'game_m',flow:'L/s'},
  nodes:[{id:'TANK',type:'storage',condition:'design_available',position:{x:0,z:0}},
         {id:'W-METER',type:'water_meter',condition:'design_available',position:{x:5,z:0}}],
  edges:[{id:'PIPE',from:'TANK',to:'W-METER',type:'pressure_main',
    route:[{x:0,z:0},{x:5,z:0}],capacity:{value:8,unit:'L/s'},
    condition:'design_available',isolationState:'closed'}],
  services:[{id:'H:A1',status:'design_connected',meterId:'W-METER'}]
};
assert.equal(validateUtilityGraph(waterFixture).meters,1);
const waterBad=structuredClone(waterFixture);waterBad.edges[0].capacity.unit='bananas';
assert.throws(()=>validateUtilityGraph(waterBad),/unsupported capacity units/);
const waterCycle=structuredClone(waterFixture);
waterCycle.edges.push({id:'BACK',from:'W-METER',to:'TANK',type:'bad_backflow',
  route:[{x:5,z:0},{x:0,z:0}],capacity:{value:8,unit:'L/s'},
  condition:'design_available',isolationState:'closed'});
assert.throws(()=>validateUtilityGraph(waterCycle),/cycle/);
console.log('PASS: RTU-003/004/005 all 234 properties audited, 233 design connections, pub and independent breaker faults, source→LV radial topology, route/phase/meter and invalid fixture checks; no live grid falsely claimed.');
