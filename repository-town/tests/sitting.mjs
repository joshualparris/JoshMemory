import assert from 'node:assert/strict';
import * as THREE from 'three';
import { Player } from '../src/engine/player.js';
import { makeSeat,seatForProp,nearestSeat,isSeatType } from '../src/world/seats.js';
import { furniturePanel } from '../src/ui/furniture.js';
import { buildCafeInterior } from '../src/world/cafe-interior.js';
import { buildPubInterior } from '../src/world/pub-interior.js';
import { buildFarmhouseInterior } from '../src/world/farmhouse-interior.js';
import { advanceNeeds } from '../src/world/needs.js';

for(const name of ['chair','stool','sofa','bench','pews','throne','armchair'])
  assert(isSeatType(name),name+' must be sittable');
assert(!isSeatType('table'),'tables are not seats');
const chair=seatForProp('chair',{x:3,z:2,rot:Math.PI/2},'test-seat');
assert(chair && Math.abs(chair.yaw-(3*Math.PI/2))<.001);
assert.equal(seatForProp('table',{x:3,z:2},'not-a-seat'),null);
const pick=nearestSeat([chair,makeSeat('other','bench',30,30)],{x:4,z:2},{x:-1,z:0});
assert.equal(pick.key,'test-seat');
const view=new THREE.PerspectiveCamera();
const player=new Player(view),free={hits:()=>false,move:()=>false};
player.place(3,3.4,0);
assert(player.sit(chair,free));
assert.equal(player.seated.key,'test-seat');
const m={x:0,z:0,running:false,crouching:false};
const input={takeLook:()=>({dx:0,dy:0}),movement:()=>m,consume:()=>false};
player.update(.1,input,free);
assert(player.eye<1.65,'sitting lowers eye height');
assert.equal(player.pos.z,2);
assert(player.stand(free));
assert.equal(player.seated,null);
assert.equal(player.pos.z,3.4,'standing restores previous safe location');
assert(!player.sit(makeSeat('far','chair',200,200),free),'cannot sit from across a room');
const blocked={hits:(x,z)=>x===3&&z===3.4,move:()=>false};
player.place(3,3.4);
assert(!player.sit(chair,blocked),'do not seat someone starting inside a collider');
assert.match(furniturePanel({label:'Books',type:'bookshelf'}).body,/books/);

const label=()=>new THREE.Sprite(new THREE.SpriteMaterial());
for(const [id,build,min] of [
  ['cafe',buildCafeInterior,34],['pub',buildPubInterior,19],['farmhouse',buildFarmhouseInterior,9]
]){
  const room=build({id,name:id},label);
  assert(room.seats?.length>=min,id+' registered real places to sit: '+room.seats?.length);
  const unique=new Set(room.seats.map(s=>s.key));
  assert.equal(unique.size,room.seats.length,'unique seat keys for '+id);
  assert(room.seats.every(s=>Number.isFinite(s.pos.x+s.pos.z+s.yaw+s.eyeHeight)),
    id+' seats have valid view poses');
  const living=room.seats.some(s=>/sofa|bench|chair|stool|armchair/.test(s.type));
  assert(living,id+' has usable furniture');
  room.group.traverse(o=>{o.geometry?.dispose?.();o.material?.dispose?.();});
}
const town={civic:{player:{wallet:40,bag:{},hunger:30,fatigue:60}},villagers:[],playerSeated:true};
advanceNeeds(town,10);
assert(town.civic.player.fatigue<60,'sitting lowers fatigue gradually');
town.playerSeated=false;const prev=town.civic.player.fatigue;
advanceNeeds(town,10);
assert(town.civic.player.fatigue>prev,'standing permits normal fatigue progression');
console.log('PASS: seat poses, approach safety, first-person sitting/standing, furniture, pub/cafe/farmhouse furniture, resting');
