import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=async (path)=>JSON.parse(await readFile(new URL(path,import.meta.url),'utf8'));
test('RTU 019–024 candidate service inventory exactly matches RTU 001 234 location keys',async()=>{
  const a=await read('../audit/water/building-service-inventory.json');
  const electricity=await read('../audit/electricity/coverage.json');
  assert.equal(a.records.length,234);
  const original=electricity.records.map(x=>x.id).sort();
  const potable=a.records.map(x=>x.id).sort();
  assert.deepEqual(potable,original);
  assert.equal(new Set(potable).size,234);
});
test('No unaudited water, sewer, recycled or storm assets have been reported as connected',async()=>{
  const a=await read('../audit/water/building-service-inventory.json');
  for(const x of a.records){
    assert.equal(x.water.status,'unknown');
    assert.equal(x.sanitary.status,'unknown');
    assert.equal(x.storm.status,'unknown');
    assert.equal(x.recycled.status,'unknown');
    assert.equal(x.water.meterId,null);
    assert.equal(x.sanitary.lateralId,null);
  }
  assert.equal(a.counts.waterConnectionsVerified,0);
  assert.equal(a.counts.sanitaryConnectionsVerified,0);
});
