// RTD-047/049/078: inventory-only assurance. This test NEVER contacts ElevenLabs.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const at = p => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
const catalog = at('../voice-lines/roster.json');
const population = at('../docs/NPC_POPULATION_INVENTORY_2026-10-24.json');
assert.equal(catalog.schemaVersion, 1);
const scripts = catalog.missingAudioScripts;
assert.equal(scripts.length, 309);
const named = scripts.filter(x => x.kind === 'named_street_actor');
const workers = scripts.filter(x => x.kind === 'worker');
const homes = scripts.filter(x => x.kind === 'unassigned_house_resident_alias');
const assigned = scripts.filter(x => x.kind === 'assigned_house_resident_alias');
assert.deepEqual([named.length,workers.length,homes.length,assigned.length],[22,99,89,99]);
assert.equal(catalog.existingApprovedNamedCast.length,10);
const unique = a => new Set(a).size === a.length;
assert(unique(scripts.map(x=>x.actorKey)),'every actorKey must be distinct');
assert(unique(scripts.map(x=>x.clipId)),'every clipId must be distinct');
assert(unique(named.map(x=>x.voiceId)),'each named actor needs a different voice ID');
assert(new Set(scripts.map(x=>x.voiceId)).size >= 22,'wide voice choice');
assert(unique(scripts.map(x=>x.text)),'all greetings must be distinct');
assert(scripts.every(x=>x.recordingStatus==='scripted_not_generated'),'never mislabel scripts as audio');
assert(scripts.every(x=>typeof x.text==='string' && x.text.length >= 20 && x.text.length <= 320));
assert(scripts.every(x=>typeof x.voiceId==='string' && /^[a-zA-Z0-9]{20}$/.test(x.voiceId)));
assert(scripts.every(x=>typeof x.clipId==='string' && /^RT-[A-Z0-9-]+-INTRO$/.test(x.clipId)));
assert(scripts.every(x=>typeof x.direction==='string' && x.direction.length >= 5));
const expectedNamed=population.namedStreetActors.filter(x=>!x.voicedGame300);
assert.deepEqual(named.map(x=>x.actorKey).sort(),expectedNamed.map(x=>x.key).sort());
for (const row of named) {
 const source=expectedNamed.find(x=>x.key===row.actorKey);
 assert.equal(row.name,source.name); assert.equal(row.role,source.title);
}
assert.deepEqual(workers.map(x=>x.actorKey).sort(),population.livingTownWorkers.map(x=>x.key).sort());
for (const row of workers) {
 const source=population.livingTownWorkers.find(x=>x.key===row.actorKey);
 assert.equal(row.name,source.name);assert.equal(row.homeCoordinate,source.homeCoordinate);assert.equal(row.role,source.role);
}
const unassigned=population.projectHouseResidentSlots.filter(x=>x.assignedWorkerId===null);
assert.deepEqual(homes.map(x=>x.actorKey).sort(),unassigned.map(x=>x.key).sort());
for (const row of homes) {
 const source=unassigned.find(x=>x.key===row.actorKey);
 assert.equal(row.name,source.name);assert.equal(row.homeCoordinate,source.coordinate);
}
const assignedSource=population.projectHouseResidentSlots.filter(x=>x.assignedWorkerId!==null);
assert.deepEqual(assigned.map(x=>x.actorKey).sort(),assignedSource.map(x=>x.key).sort());
for(const row of assigned){
 const source=assignedSource.find(x=>x.key===row.actorKey);
 const assignedWorker=workers.find(x=>x.actorKey==='worker:'+source.assignedWorkerId);
 assert.equal(row.name,source.name);assert.equal(row.homeCoordinate,source.coordinate);
 assert.equal(row.assignedWorkerId,source.assignedWorkerId);assert.equal(row.voiceId,assignedWorker.voiceId);
}
assert.deepEqual([...assigned,...homes].map(x=>x.actorKey).sort(), population.projectHouseResidentSlots.map(x=>x.key).sort());
const recorded=population.namedStreetActors.filter(x=>x.voicedGame300);
assert.deepEqual(catalog.existingApprovedNamedCast.map(x=>x.actorKey).sort(),recorded.map(x=>x.key).sort());
assert(!catalog.existingApprovedNamedCast.some(x=>scripts.some(y=>y.actorKey===x.actorKey)));
assert.equal(catalog.summary.total,scripts.length);
assert.equal(catalog.summary.houseAlias,188);
assert.equal(catalog.summary.assignedHouseAlias,99);
assert.equal(catalog.summary.uniqueNamedVoices,new Set(named.map(x=>x.voiceId)).size);
assert.equal(catalog.summary.uniqueClips,new Set(scripts.map(x=>x.clipId)).size);
const characters=scripts.reduce((n,x)=>n+x.text.length,0);
console.log('PASS RTD voice-line inventory: '+named.length+' named, '+workers.length+' workers, '+(homes.length+assigned.length)+' house aliases; '+new Set(scripts.map(x=>x.voiceId)).size+' unique voice IDs; '+characters+' proposed TTS characters; zero audio generation.');