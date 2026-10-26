import assert from 'node:assert/strict';
import * as THREE from 'three';
import { Player } from '../src/engine/player.js';
import { CollisionWorld } from '../src/engine/collision.js';
import {
 MOVEMENT_SPEED_DEFAULT, MOVEMENT_SPEED_KEY, normaliseMovementSpeed,
 loadMovementSpeed, saveMovementSpeed, movementSpeedFactor,
} from '../src/engine/movement-speed.js';

const db=new Map();
const storage={getItem:k=>db.get(k)??null,setItem:(k,v)=>db.set(k,v)};
assert.equal(loadMovementSpeed(storage),1,'fresh visitors retain familiar pace');
assert.equal(saveMovementSpeed(storage,'2.7'),2.7);
assert.equal(db.get(MOVEMENT_SPEED_KEY),'2.7');
assert.equal(loadMovementSpeed(storage),2.7,'reload persists the chosen speed');
assert.equal(normaliseMovementSpeed('999'),5);
assert.equal(normaliseMovementSpeed('-8'),0.1);
assert.equal(normaliseMovementSpeed('abc'),1);
assert.equal(normaliseMovementSpeed(Infinity),1);
assert.equal(normaliseMovementSpeed('2.75'),2.8);
assert.equal(movementSpeedFactor(1,90,85),0.45,'existing fatigue and hunger logic preserved');
assert.equal(movementSpeedFactor(5,90,85),2.25,'preference applies while tired');
assert.equal(movementSpeedFactor(0.1,0,0),0.1);
assert.equal(saveMovementSpeed(storage,1),MOVEMENT_SPEED_DEFAULT,'Normal reset');
assert.equal(loadMovementSpeed({getItem(){throw Error('storage blocked')}}),1);
assert.equal(saveMovementSpeed({setItem(){throw Error('storage blocked')}},3),3);

// Exercise the same player/physics classes that the actual main loop uses.
const runFor=(factor,running,world=new CollisionWorld())=>{
 const p=new Player(new THREE.PerspectiveCamera());
 p.place(0,0);
 p.speedFactor=movementSpeedFactor(factor);
 const input={takeLook:()=>({dx:0,dy:0}),movement:()=>({x:0,z:-1,running,crouching:false}),consume:()=>false};
 for(let frame=0;frame<120;frame++)p.update(1/60,input,world);
 return {p,distance:-p.pos.z};
};
const walk=runFor(1,false).distance,run=runFor(1,true).distance;
assert(run>walk*1.6,'Run must be markedly faster than walking');
assert(runFor(3,true).distance>run*2.8,'3x preference affects actual running');
assert(runFor(.2,true).distance<run*.3,'slow pace affects actual running');
// At 5x run speed, collision subdivision must still stop tunnelling through a thin wall.
const world=new CollisionWorld([{x0:-1,x1:1,z0:-8,z1:-7.85}]);
const fast=runFor(5,true,world);
assert(fast.p.pos.z>-7.85,'fast sprint never tunnels through thin physical wall');
console.log('PASS movement speed: storage, bounds, hunger/fatigue, walk/run and high-speed wall collision');
