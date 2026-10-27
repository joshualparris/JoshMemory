// Build the actual merged meshes and collider set: regression for the
// October streetlight/track overlap, gates and line-side fences.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import {loadBriefs,loadInventory,toHouse,sanitise} from '../tools/lib.mjs';
import {mergeDiscovery} from '../tools/merge-discovery.mjs';
import {buildTown} from '../src/world/town.js';
import {createTownLife} from '../src/world/townlife.js';
import {CollisionWorld} from '../src/engine/collision.js';
import {RAIL_Z,RAIL_CROSSINGS,RAIL_STRUCTURE_HALF_WIDTH,
 railGateBoxes} from '../src/world/rail-corridor.js';
const noop=()=>{};
const ctx2d=new Proxy({},{get:(_,k)=>
 k==='measureText'?()=>({width:0}):
 k==='createLinearGradient'||k==='createRadialGradient'?()=>({addColorStop:noop}):noop,set:()=>true});
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>ctx2d,style:{}})};
globalThis.localStorage={getItem:()=>null,setItem:noop};
const inventory=loadInventory(),briefs=loadBriefs(),games=new Map();
for(const g of JSON.parse(fs.readFileSync(new URL('../data/games.json',import.meta.url))).games){
 if(!games.has(g.repo))games.set(g.repo,[]);
 games.get(g.repo).push(g);
}
const houses=inventory.projects.map(row=>
 mergeDiscovery(sanitise(toHouse(briefs.get(row.repo),row,inventory.grid.streetNames,{},games))));
const scene=new THREE.Scene(),town=buildTown(scene,houses,inventory.grid.streetNames);
const sim=createTownLife({scene,town,makeLabel:()=>new THREE.Object3D(),
 sky:new THREE.Color(),hemi:new THREE.HemisphereLight(),
 sun:new THREE.DirectionalLight(),fog:new THREE.Fog(0,1,2)});
const problems=sim.railClearanceConflicts;
assert.equal(problems.length,0,'real rail side buildings, sheds and fixtures intersect reserved structure outline: '+JSON.stringify(problems.slice(0,10)));
const world=new CollisionWorld([...town.colliders,...sim.colliders]);
assert(!world.hits(0,RAIL_Z,0.40),'the track may not contain an unmarked static obstruction');
const between=(RAIL_CROSSINGS[2].x+RAIL_CROSSINGS[3].x)/2;
for(const side of [-1,1]){
 assert(world.hits(between,RAIL_Z+side*4.15,0.4),'continuous fence missing');
 for(const crossing of RAIL_CROSSINGS){
  assert(!world.hits(crossing.x+3.6,RAIL_Z+side*4.15,0.35),
   'legal avenue crossing must remain physically open when boom is up: '+crossing.x);
 }
}
sim.life.minute=406;
const barrier=sim.railBarrierColliders(315.6,RAIL_Z-12);
assert(barrier.length>0,'active crossing must protect a waiting player');
sim.life.minute=490;
assert.equal(sim.railBarrierColliders(315.6,RAIL_Z-12).length,0,
 'gate collider must disappear with passing train');
// A person already between booms at the start of a closure gets an exit.
sim.life.minute=406;
const escapeBoxes=sim.railBarrierColliders(315.6,RAIL_Z-2);
assert(!escapeBoxes.some(b=>b.z1>RAIL_Z+2),
 'a person already between booms must be able to exit');
sim.life.minute=490;
sim.railBarrierColliders(315.6,RAIL_Z-12);
sim.life.setRailFault(true);
assert.equal(sim.railBarrierColliders(315.6,RAIL_Z-12).length,2*RAIL_CROSSINGS.length,
 'fault closes all approaches without corrupting permanent collision grid');
console.log('PASS: real-town collider envelope, six open crossing walkways, solid 2-sided fences, player stop/escape and fail-closed gates.');
