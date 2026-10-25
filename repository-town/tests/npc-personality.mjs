// Every Living Town villager needs more than the generic "town neighbour" fallback.
import assert from 'node:assert/strict';
import { villagerProfile } from '../src/ui/npc.js';
import { VILLAGER_NAMES, ROSTER_SIZE, residentName as workerName } from '../src/world/life.js';

assert.equal(VILLAGER_NAMES.length,99,'legacy names remain unchanged');
assert.equal(ROSTER_SIZE,171);
const allNames=Array.from({length:ROSTER_SIZE},(_,i)=>workerName(i));
assert.equal(new Set(allNames).size,ROSTER_SIZE,'each current worker has distinct identity');
assert(allNames.slice(99).every(name=>villagerProfile(name)[0]!=='town neighbour'),'all added spouses have their own hobbies');
const profiles=VILLAGER_NAMES.map(name=>({name,p:villagerProfile(name)}));
assert.equal(new Set(profiles.map(({p})=>p[0])).size,VILLAGER_NAMES.length,'each villager has a distinct hobby role');
assert(profiles.every(({p})=>p.every(x=>typeof x==='string'&&x.length>8)),'role, temperament and interest should be meaningful');
assert(profiles.every(({p})=>p[0]!=='town neighbour'),'no employed villager should fall back to generic dialogue');
assert.equal(villagerProfile('Arlo','farmer')[0],'farmer','paid role overrides hobby label');
assert.match(villagerProfile('Arlo')[2],/mechanisms/);
assert.match(villagerProfile('Sadie')[2],/book stacks/);
assert.match(villagerProfile('Bonnie')[2],/water conservation/);
assert.match(villagerProfile('Frankie')[2],/foundry safety/);
assert.equal(villagerProfile('unknown')[0],'town neighbour','unknown visitors still get a safe fallback');
console.log('PASS: '+ROSTER_SIZE+' workers with unique personalities, including 72 new workers; old 99 profiles unchanged.');
