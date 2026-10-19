// Run: node repository-town/tests/npc-location.mjs
// Regression: current NPC location ≠ home address or intended destination.
import assert from 'node:assert/strict';
import {locateVillager,isLocationQuestion,groundedLocationReply} from '../src/ui/npc-location.js';
import {residentPrompt} from '../deploy/npc-prompt.js';

const garden={id:'garden',name:'Market Garden',front:{x:100,z:100},curb:{x:100,z:90},field:{x0:90,x1:110,z0:112,z1:150}};
const cafe={id:'cafe',name:'Commit Café',front:{x:0,z:0},curb:{x:0,z:-2}};
const life={places:new Map([['garden',garden],['cafe',cafe]]),place(id){return this.places.get(id)}};
const arlo={name:'Arlo',home:{coordinate:'H1'},work:'garden',activity:'working the paddock at the Market Garden',x:103,z:122,inside:false,path:[],step:{at:'garden',kind:'work'}};
const here=locateVillager(life,arlo);
assert.equal(here.name,'Market Garden');
assert.equal(here.home,'H1');
assert.equal(here.workplace,'Market Garden');
assert.equal(here.status,'at-place');
const reply=groundedLocationReply(here,'Hello Arlo. Hope you find your home');
assert.match(reply,/Market Garden/);
assert.match(reply,/H1/);
assert.doesNotMatch(reply,/Arcade Avenue/);
assert.equal(isLocationQuestion('What gossip is there on this street?'),false);

const moving=locateVillager(life,{...arlo,path:[{x:110,z:100}],activity:'walking — working the paddock at the Market Garden'});
assert.equal(moving.status,'travelling');
assert.match(moving.name,/on the way to Market Garden/);
assert.doesNotMatch(groundedLocationReply(moving,'Where are you?'),/at Market Garden right now/);

const home=locateVillager(life,{...arlo,inside:true,step:{at:'home',kind:'sleep'},path:[],activity:'asleep at home'});
assert.equal(home.name,'home at H1');
const unknown=locateVillager(life,{...arlo,x:1000,z:1000,step:null});
assert.equal(unknown.status,'unknown');
assert.doesNotMatch(groundedLocationReply(unknown,'Where are you?'),/Arcade Avenue/);
const near=locateVillager(life,{...arlo,x:2,z:2,step:null});
assert.equal(near.name,'Commit Café');
assert.equal(near.status,'near-place');

const prompt=residentPrompt({name:'Arlo',role:'villager',coordinate:'H1',street:'Whispering-Wilds',houseName:'Whispering-Wilds',
 kind:'game',isPublic:true,currentLocation:here,workplace:here.workplace,currentActivity:here.activity,currentTime:'10:18'});
assert.match(prompt,/Current position from game state: Market Garden/);
assert.match(prompt,/This is HOME, NOT your current location/);
assert.match(prompt,/working the paddock/);
assert.doesNotMatch(prompt,/you are out walking around Repository Town/);
const noLocation=residentPrompt({name:'Arlo',role:'villager',coordinate:'H1'});
assert.match(noLocation,/current position has NOT been supplied/i);
console.log('PASS: Arlo current position, H1 home, moving, unknown position, landmarks, conversation and Cloudflare prompt');
