import assert from 'node:assert/strict';
import * as THREE from 'three';
import { appearanceFor, makeDistinctPerson } from '../src/world/npc-wardrobe.js';
import { createShopVisitors } from '../src/world/shop-visitors.js';

// The same simulated resident always looks the same after returning to the room.
const identities=Array.from({length:60},(_,i)=>'villager:'+i+':Resident '+i+':job '+(i%11));
const looks=identities.map(appearanceFor);
assert.deepEqual(looks[17],appearanceFor(identities[17]),'appearance is stable by actor identity');
assert.equal(new Set(looks.map(x=>[x.shirt,x.hairStyle,x.clothing,x.trousers,x.build].join('/'))).size,60,
  'none of the sampled residents are visually identical');
assert(new Set(looks.map(x=>x.hairStyle)).size>=6,'many distinct hair or hat silhouettes');
assert(new Set(looks.map(x=>x.clothing)).size>=5,'many distinct garment silhouettes');
for(const id of identities.slice(0,15)){
  const figure=makeDistinctPerson(id);
  assert.equal(figure.group.userData.residentAppearance.identity,id);
  assert(figure.group.children.some(x=>x.userData.isOutfit),'appearance includes visible clothing');
  assert(figure.group.scale.x>=.9&&figure.group.scale.x<1.11,'NPC fits standard walking clearance');
}

const site={id:'pub',name:'The Merged Branch'};
const interior={
  group:new THREE.Group(),colliders:[],
  bounds:{x0:-7,x1:7,z0:-10,z1:6},
  rooms:[{name:'Bar'}],seats:[],interactables:[]
};
const makeLabel=()=>new THREE.Sprite(new THREE.SpriteMaterial());
const resident=id=>({id,name:'Customer '+id,job:'local '+(id%5),inside:true,path:[],
  step:{at:'pub',kind:'buy',dur:50,activity:'at the bar'},activity:'visiting'});
const life={villagers:Array.from({length:9},(_,i)=>resident(i))};
const player={pos:new THREE.Vector3(0,0,5),seated:null};
const people=[];
const visitors=createShopVisitors(site,life,interior,makeLabel,people);
visitors.update(.05,0,player);
assert.equal(people.length,9,'revisiting a busy pub shows all real existing customers');
assert(people.every(p=>p.group.userData.residentAppearance),'every patron has personal appearance');
function assertSeparate(){
  for(let i=0;i<people.length;i++){
    const a=people[i];
    assert(a.pos.x>interior.bounds.x0+.4&&a.pos.x<interior.bounds.x1-.4);
    assert(a.pos.z>interior.bounds.z0+.4&&a.pos.z<interior.bounds.z1-.4);
    assert(Math.hypot(a.pos.x-player.pos.x,a.pos.z-player.pos.z)>.82,'patron must not merge with player');
    for(let j=i+1;j<people.length;j++){
      const b=people[j],d=Math.hypot(a.pos.x-b.pos.x,a.pos.z-b.pos.z);
      assert(d>=.84,'patrons '+a.name+' and '+b.name+' overlap at '+d);
    }
  }
}
assertSeparate();
// Simultaneous arrivals must have distinct entry points, not the same world coordinates.
// Test each movement frame to catch transient crossings missed by final-position checks.
life.villagers.push(resident(10),resident(11),resident(12));
for(let frame=0;frame<500;frame++){
  visitors.update(.05,frame*.05,player);
  assertSeparate();
}
assert.equal(people.length,12,'additional visitors eventually find physical entry space');
assert.equal(new Set(people.map(p=>p.key)).size,12,'no duplicate actors');
assert.equal(new Set(people.map(p=>p.group.userData.residentAppearance.identity)).size,12,
  'unique identities survive busy-room movement');
console.log('PASS: stable distinct NPC silhouettes and 500-frame indoor player/visitor collision regression');
