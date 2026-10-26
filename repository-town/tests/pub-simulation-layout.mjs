import assert from 'node:assert/strict';
import * as THREE from 'three';
import {buildPubInterior} from '../src/world/pub-interior.js';
import {pubUtilities,tickPubUtilities} from '../src/world/pub-utilities.js';
import {pubVenue,reservePubDrink,drinkPubBeer,pubServiceEvent} from '../src/world/pub-venue.js';
import {pubStandards,pubStandardsAction} from '../src/world/pub-standards.js';
const room=buildPubInterior({id:'pub',name:'Merged Branch'},()=>new THREE.Sprite(new THREE.SpriteMaterial()));
assert.equal(room.seats.length,19);assert(room.colliders.some(c=>2.6>c.x0&&2.6<c.x1&&-5.6>c.z0&&-5.6<c.z1),'lowered counter must block bodies and staff routes');
for(const d of room.doors){const leaf=d.children[0],w=leaf.geometry.parameters.width;for(let deg=0;deg<=90;deg+=10){d.rotation.y=d.userData.swing*deg*Math.PI/180;room.group.updateMatrixWorld(true);for(let t=.06;t<w;t+=.12){const p=new THREE.Vector3(Math.sign(leaf.position.x)*t,1,0).applyMatrix4(d.matrixWorld);assert(!room.colliders.some(c=>p.x>c.x0-.035&&p.x<c.x1+.035&&p.z>c.z0-.035&&p.z<c.z1+.035),d.name+' sweep at '+deg)}}d.rotation.y=0;}
assert.equal(room.group.getObjectByName('pub:panic-hardware').parent.name,'pub:rear-fire-exit');
const life={day:1,minute:780,civic:{supply:{waterOk:true},player:{bag:{pub_beer:0}}},gridPowered:()=>true};const u=pubUtilities(life),ops=pubStandards(life),s=pubVenue(life);
const fan=room.group.getObjectByName('pub:ceiling-fan:0');room.utilityVisuals(life,1);assert(fan.rotation.y>0);const r=fan.rotation.y;life.gridPowered=()=>false;for(let i=0;i<20;i++)room.utilityVisuals(life,.1);const a=fan.rotation.y;for(let i=0;i<20;i++)room.utilityVisuals(life,.1);assert(fan.rotation.y-a<a-r,'fan coasts down without supply');life.gridPowered=()=>true;
assert(reservePubDrink(life,'pub_beer'));assert.equal(s.bar.cleanGlasses,39);assert.equal(s.bar.inUseGlasses,1);assert(Math.abs(s.bar.draftL+s.bar.pouredL-50)<1e-8);life.civic.player.bag.pub_beer=1;ops.verifiedAdult=true;drinkPubBeer(life,'pub_beer');assert.equal(s.bar.dirtyGlasses,1);assert.equal(s.bar.inUseGlasses,0);
pubStandardsAction(life,'fault:pub:water:water-isolator:dishwasher');tickPubUtilities(life,3);assert.equal(s.bar.dirtyGlasses,1,'isolated dishwasher cannot wash');pubStandardsAction(life,'fault:pub:water:water-isolator:dishwasher');tickPubUtilities(life,3);assert.equal(s.bar.dirtyGlasses,0);assert.equal(s.bar.cleanGlasses,40);
const person={v:{id:14,work:'pub',step:{kind:'work'}},pos:new THREE.Vector3(.8,0,-6.75),group:new THREE.Group()};room.group.add(person.group);room.attachPubStaff([person]);room.afterPeople(life);assert(person.group.getObjectByName('pub:staff-uniform'));assert(room.group.getObjectByName('pub:beer-pour-stream').visible);assert(room.group.getObjectByName('pub:served-drink').position.y-.075>1.165,'pouring glass clears bar top');life.minute+=5;room.afterPeople(life);assert(room.group.getObjectByName('pub:service-tray').visible);assert(Math.hypot(person.pos.x-.8,person.pos.z+6.75)>.1);for(let age=3;age<=12;age+=.25){life.minute=780+age;room.afterPeople(life);assert(!room.colliders.some(c=>person.pos.x>c.x0-.2&&person.pos.x<c.x1+.2&&person.pos.z>c.z0-.2&&person.pos.z<c.z1+.2),'staff carry route avoids fixed furniture');}
life.minute=800;room.afterPeople(life);assert(room.group.getObjectByName('pub:served-drink').position.y-.075>.805,'served glass clears table top');ops.alarm=true;room.afterPeople(life);assert.equal(room.group.getObjectByName('pub:service-tray').visible,false);ops.alarm=false;
pubServiceEvent(life,'meal');s.services[0].returned=true;room.afterPeople(life);assert(room.group.getObjectByName('pub:moving-dish').visible);
console.log('PASS pub layout/service: 19 ground seats, swept door clearance, moving panic hardware, powered/coasting fans, conserved beer/glassware, branch-gated washing, uniforms and physical service/emergency halt');
// RAF timestamps describe the beginning of a frame and may predate the click.
// A negative replay index used to pass undefined balls to the renderer on phones.
const {pubPoolPanel}=await import('../src/ui/pub-pool-panel.js');
const context=new Proxy({},{get:(o,k)=>o[k]||(()=>{}),set:(o,k,v)=>(o[k]=v,true)}),nodes={canvas:{getContext:()=>context,isConnected:true},'#pool-status':{},'#pool-shoot':{},'#pool-angle':{value:-90},'#pool-power':{value:50},'#pool-rack':{}};
const callbacks=[],oldRAF=globalThis.requestAnimationFrame;globalThis.requestAnimationFrame=fn=>callbacks.push(fn);
try{pubPoolPanel({civic:{}}).mount({querySelector:s=>nodes[s]});nodes['#pool-shoot'].onclick();assert(callbacks.length);assert.doesNotThrow(()=>callbacks.shift()(-100));assert.match(nodes['#pool-status'].textContent,/1 shots/);assert(callbacks.length,'replay continues after early timestamp');}finally{globalThis.requestAnimationFrame=oldRAF}
console.log('PASS pool replay: early RAF timestamp is clamped to first valid frame');
