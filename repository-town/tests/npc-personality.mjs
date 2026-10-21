// Every Living Town villager needs more than the generic "town neighbour" fallback.
import assert from 'node:assert/strict';
import { villagerProfile } from '../src/ui/npc.js';
import { VILLAGER_NAMES, ROSTER_SIZE } from '../src/world/life.js';

assert.equal(VILLAGER_NAMES.length,ROSTER_SIZE,'every employed town resident needs a distinct identity');
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
console.log('PASS: all '+ROSTER_SIZE+' villagers have meaningful personalities, distinct hobbies and accurate job overrides.');
