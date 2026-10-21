// Run from repository-town: node tests/npc-realism-audit.mjs
// Regression-only: no Groq calls, credentials or graphical browser required.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { NPCS } from '../src/ui/npc-data.js';
import { VILLAGER_NAMES } from '../src/world/life.js';
import { villagerProfile } from '../src/ui/npc.js';
import { locateVillager, groundedLocationReply } from '../src/ui/npc-location.js';
import { residentPrompt } from '../src/ui/npc-prompt.js';

assert.equal(NPCS.length,32,'32 named characters');
assert.equal(new Set(NPCS.map(n=>n.id)).size,32);
assert.equal(new Set(NPCS.map(n=>n.coordinate)).size,32);
assert(NPCS.every(n=>n.welcome&&n.personality&&n.title&&n.coordinate),'every named character has a distinct persona and home lot');
assert.equal(NPCS.filter(n=>n.shape).length,20,'20 fantastical character models');
assert(NPCS.filter(n=>n.shape).every(n=>n.prompts?.length===3&&n.challenge?.choices?.length===3),'every fantasy character has prompts and a quiz');
assert.equal(VILLAGER_NAMES.length,61,'61 living-town villagers');
assert.equal(new Set(VILLAGER_NAMES).size,VILLAGER_NAMES.length);
const personas=VILLAGER_NAMES.map(name=>villagerProfile(name));
assert.equal(new Set(personas.map(x=>x[0])).size,VILLAGER_NAMES.length,'unique background personality for all villagers');
assert(personas.every(p=>p.length===3&&p.every(v=>typeof v==='string'&&v.length>8)));
assert.equal(villagerProfile('Arlo','farmer')[0],'farmer','actual job overrides hobby role');
const garden={id:'garden',name:'Market Garden',front:{x:100,z:190},field:{x0:89,x1:111,z0:194,z1:218}};
const life={place:id=>id==='garden'?garden:null,places:new Map([['garden',garden]])};
const arlo={name:'Arlo',home:{coordinate:'H1'},work:'garden',activity:'working in the paddock',path:[],inside:false,step:{kind:'work',at:'garden'},x:100,z:200};
const now=locateVillager(life,arlo);
assert.equal(now.name,'Market Garden');
assert.equal(now.home,'H1');
assert.equal(now.workplace,'Market Garden');
assert.match(groundedLocationReply(now,'Arlo, where are you?'),/Market Garden/);
assert.doesNotMatch(groundedLocationReply(now,'Where are you?'),/Arcade Avenue/);
const travelling=locateVillager(life,{...arlo,path:[{x:100,z:190}],step:{at:'garden',kind:'work'},x:0,z:0});
assert.equal(travelling.status,'travelling');
assert.doesNotMatch(groundedLocationReply(travelling,'Where are you?'),/at Market Garden right now/);
const prompt=residentPrompt({name:'Arlo',role:'villager',coordinate:'H1',street:'Arcade Avenue',houseName:'a home',isPublic:false,summary:'Private project',
  currentLocation:now,currentActivity:now.activity,workplace:now.workplace,currentTime:'11:00'});
assert(prompt.includes('Current place from the game simulation: Market Garden'));
assert(prompt.includes('HOME: house H1'));
assert(prompt.includes('This is HOME, not the current location'));
const npc=readFileSync(new URL('../src/ui/npc.js',import.meta.url),'utf8');
const panel=readFileSync(new URL('../src/ui/townpanels.js',import.meta.url),'utf8');
assert(npc.includes('groundedLocationReply(town?.location,text)'),'dialogue must prioritise simulation facts');
assert(npc.includes('currentLocation: town?.location'),'AI receives actual position');
assert(panel.includes('location: v ? locateVillager(life,v)'),'town context supplies whereabouts');
console.log('PASS: 32 named NPCs, 20 fantasy quests, 61 villagers with unique personas, live home/work/location separation and AI prompt parity.');
