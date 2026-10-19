// Run: node tests/npc-location.mjs
// Reproduces Arlo's reported mistake without an AI provider, browser or key.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../ui/npc-location.js',import.meta.url),'utf8');
const {locateVillager,groundedLocationReply,isLocationQuestion}=
  await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));

const garden={id:'garden',name:'Market Garden',
  front:{x:100,z:190},curb:{x:100,z:194},
  field:{x0:90,x1:110,z0:195,z1:215}};
const life={place:id=>id==='garden'?garden:null,places:new Map([['garden',garden]])};
const arlo={name:'Arlo',job:'farmer',home:{coordinate:'H1',name:'Whispering Wilds'},
  work:'garden',activity:'working the paddock at the Market Garden',
  x:99,z:203,inside:false,path:[],step:{kind:'work',at:'garden'}};
let loc=locateVillager(life,arlo);
assert.equal(loc.name,'Market Garden');
assert.equal(loc.status,'at-place');
assert.equal(loc.home,'H1');
assert.equal(loc.workplace,'Market Garden');
assert.equal(loc.activity,'working the paddock at the Market Garden');
for(const question of [
  'Where are you, Arlo?', 'Where exactly are you now?',
  'I hope you find your home', 'You seem lost', 'Do you know where you are?']) {
  assert(isLocationQuestion(question),question);
  const answer=groundedLocationReply(loc,question);
  assert.match(answer,/Market Garden/,question);
  assert.match(answer,/H1/,question);
  assert.doesNotMatch(answer,/Arcade Avenue/,question);
}
assert.equal(isLocationQuestion('Hello Arlo, lovely weather.'),false);
assert.equal(groundedLocationReply(loc,'Hello Arlo, lovely weather.'),null);

const enRoute={...arlo,x:40,z:40,path:[{x:100,z:190}],activity:'walking — working the paddock at the Market Garden'};
const travelling=locateVillager(life,enRoute);
assert.equal(travelling.status,'travelling');
assert.match(travelling.name,/on the way to Market Garden/);
assert.doesNotMatch(groundedLocationReply(travelling,'Where are you?'),/at Market Garden right now/);
const atHome=locateVillager(life,{...arlo,inside:true,path:[],step:{kind:'sleep',at:'home'}});
assert.equal(atHome.status,'home');
assert.match(atHome.name,/H1/);
const byCoordinates=locateVillager(life,{...arlo,step:null,x:98,z:204});
assert.equal(byCoordinates.name,'Market Garden');
assert.equal(byCoordinates.status,'near-place');
const unknown=locateVillager(life,{...arlo,step:null,x:800,z:800});
assert.equal(unknown.status,'unknown');
assert.doesNotMatch(unknown.name,/Market Garden/);
assert.equal(locateVillager(life,null),null);
console.log('PASS: Arlo live location, home/work separation, travelled/unknown/nearby, user dialogue and no Arcade Avenue guess');
