// Every shared game door must offer all mapped tenants without moving the door.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createNarrominePopulation } from '../src/world/narromine-population.js';
import { createNarromineWorkplaceIndex, workplaceEntranceTargets } from '../src/world/narromine-workplaces.js';

const inventory = JSON.parse(fs.readFileSync(new URL('../audit/generic-buildings/2026-11-07-inventory.json', import.meta.url),'utf8'));
const expected = inventory.sharedEntrances;
assert.equal(expected.length,15,'audited shared-door group count must not silently change');
assert.equal(expected.reduce((n,g)=>n+g.length,0),43,'audited shared-door tenant count');
const ix = createNarromineWorkplaceIndex(createNarrominePopulation());
const lookup = new Map(ix.list.map(e=>[e.workplace.id,e]));
assert.equal(lookup.size,ix.list.length,'workplace save IDs must be unique');
for(const group of expected){
  const entries=group.map(item=>{
    const e=lookup.get(item.id);
    assert(e,'mapped workplace ID missing: '+item.id);
    assert.equal(e.workplace.name,item.name,'tenant name mismatched '+item.id);
    return e;
  });
  const anchor=entries[0].door;
  const offered=workplaceEntranceTargets(ix.list,{x:anchor.x,z:anchor.z});
  assert.deepEqual(offered.map(e=>e.workplace.id).sort(),
    entries.map(e=>e.workplace.id).sort(),'shared entrance must offer each tenant '+group.map(x=>x.name).join(', '));
  for(const entry of entries){
    assert(Number.isFinite(entry.door.x)&&Number.isFinite(entry.door.z));
    assert(entry.doors.length>0,'door candidate list retained');
    assert(entry.workplace.id,'stable save identifier');
  }
}
const standalone=ix.list.find(e=>workplaceEntranceTargets(ix.list,e.door).length===1);
assert(standalone,'at least one independently accessible workplace remains');
assert.equal(workplaceEntranceTargets(ix.list,standalone.door)[0],standalone);
assert.deepEqual(workplaceEntranceTargets(ix.list,{x:1e8,z:1e8}),[]);
assert.deepEqual(workplaceEntranceTargets(ix.list,{x:NaN,z:0}),[]);
// Distinct adjacent doors must not be coalesced just because the player
// simultaneously falls within the 1.4 m approach sensor.
const f=id=>({workplace:{id,name:id},door:{x:id==='a'?0:id==='b'?0.05:0.75,z:0}});
assert.deepEqual(workplaceEntranceTargets([f('a'),f('b'),f('c')],{x:0,z:0}).map(e=>e.workplace.id),['a','b']);
assert.deepEqual(workplaceEntranceTargets([f('a'),f('b'),f('c')],{x:0.75,z:0}).map(e=>e.workplace.id),['c']);
console.log('PASS #523: 15 shared game doors / 43 tenant records, deterministic named choices, safe standalone and distinct thresholds');
