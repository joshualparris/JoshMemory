// Regression: sprint + cheat jump clears finite building walls, lands on roofs,
// and does NOT pass through them at normal ground height.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { readFileSync } from 'node:fs';
import { CollisionWorld } from '../src/engine/collision.js';
import { Player } from '../src/engine/player.js';
import { Builder } from '../src/world/builder.js';
import { civicRoofTop } from '../src/world/civic-roof-height.js';
import { exteriorColliders } from '../src/world/exterior-collision.js';

const root = new URL('../', import.meta.url);
const file = name => readFileSync(new URL(name, root), 'utf8');
const master = file('src/world/masterplan-built.js');
const town = file('src/world/townlife.js');
const narromine = file('src/world/narromine.js');
assert(master.includes('...ext'), 'masterplan must preserve authored top when rotating homes');
assert(town.includes('civicRoofTop(b.parts, southBlock)'), 'south-side civic tops must be from real meshes');
assert(town.includes('civicRoofTop(b.parts, northBlock)'), 'north-side civic tops must be from real meshes');
assert(town.includes('civicRoofTop(b.parts, coreBlock)'), 'core civic tops must be from real meshes');
assert(narromine.includes("top: wall + roofH"), 'LiDAR/estimated footprint roof top required');
assert(narromine.includes("top: h, source: 'osm-building'"), 'OSM extruded roof top required');
assert(narromine.includes('top: roofTop'), 'detailed building and Coles roof top required');

const b = new Builder();
b.box(0x555555, 14, 5, 10, 120, 2.5, -36);
b.box(0x777777, 14.4, .3, 10.4, 120, 5.15, -36);
b.box(0x666666, .3, 6, .3, 125, 8, -36); // antenna must not turn into a 11m rooftop
const fp = { x0: 113, x1: 127, z0: -41, z1: -31 };
const top = civicRoofTop(b.parts, fp);
assert(top > 5.29 && top < 5.34, 'roof derived from solid roof mesh, not antenna: ' + top);
assert.equal(civicRoofTop(b.parts, {x0:999,x1:1010,z0:999,z1:1010}), null,
  'not allowed to fabricate heights without a spatial match');
assert.equal(civicRoofTop([], fp), null);

const loft = { x0: 2, x1: 16, z0: -1, z1: 11, top: 5.4 };
const unboundedWall = { x0: 28, x1: 28.25, z0: -3, z1: 13 };
const poly = [[22,0],[26,0],[22,4]]; // bounding rect has one empty triangle corner
const pitchedRoof = { x0:22,x1:26,z0:0,z1:4, poly, top:6.3 };
const world = new CollisionWorld([loft, unboundedWall, pitchedRoof]);
assert(world.hits(2.2, 4, .35, 0), 'at street level the building remains solid');
assert.equal(world.hits(2.2, 4, .35, 5.6), null, 'at roof height building no longer infinitely blocks');
assert.equal(world.hits(28, 2, .35, 50), unboundedWall, 'unbounded real boundary remains solid at any altitude');
assert.equal(world.groundAt(25.5, 3.5, .35, 9), 0, 'no phantom rooftop outside real polygon');
assert.equal(world.groundAt(22.5, .5, .35, 9), pitchedRoof.top, 'real polygon roof supports landing');

const noLook = () => ({dx:0,dy:0});
function inputFor() {
  const st = { forwards: false, running: false, jump: false };
  return { st, takeLook:noLook, movement:()=>({x:0,z:st.forwards?-1:0,running:st.running,crouching:false}),
    consume:key=>{if(key!=='jump'||!st.jump)return false;st.jump=false;return true;} };
}
const advance = (p,input,steps)=>{let maxY=0;for(let i=0;i<steps;i++){p.update(1/60,input,world); maxY=Math.max(maxY,p.y);}return maxY;};
const cam = new THREE.PerspectiveCamera();
const ordinary = new Player(cam); ordinary.place(9,-3,Math.PI);
let action = inputFor(); action.st.forwards=true;action.st.running=true;
advance(ordinary,action,70);
assert(ordinary.pos.z < -1 && ordinary.pos.z > -2, 'running at ground level remains stopped by building wall: '+ordinary.pos.z);

const leaper = new Player(new THREE.PerspectiveCamera());
leaper.place(9,-4,Math.PI); leaper.jumpSpeed=Math.sqrt(2*22*12);
action = inputFor();action.st.forwards=true;action.st.running=true;action.st.jump=true;
const high=advance(leaper,action,135);
assert(high > 11, 'super jump should reach over 11m height: '+high);
assert(leaper.pos.z < -3 || leaper.pos.z > 11, 'long jump eventually exits the building footprint');
assert(leaper.pos.z > 11, 'sprinting super-jump clears roof and reaches far side: '+leaper.pos.z);

const lander = new Player(new THREE.PerspectiveCamera());
lander.place(9,-3.1,Math.PI); lander.jumpSpeed=Math.sqrt(2*22*8);
action = inputFor(); action.st.forwards=true;action.st.jump=true;
advance(lander,action,50);
action.st.forwards=false;
advance(lander,action,110);
assert(Math.abs(lander.y - loft.top)<.03, 'landing from above settles on 5.4m roof: '+lander.y);
assert(lander.pos.z>=loft.z0, 'landed within roof footprint, not at a wall: '+lander.pos.z);

const base = {w:12,d:10,h:8,front:5,door:{x:0,w:2}};
const split = exteriorColliders(base,0,0);
assert(split.every(c=>c.top===6), 'ordinary estate building uses finite authored roof top');
assert(split.every(c=>!world.hits(999,999,.35,0)));
console.log('PASS superjump buildings: ground blockers, sprint+12m clearance, 8m rooftop landing, lidar/source contracts, exact polygon footprint, uncapped world walls');
