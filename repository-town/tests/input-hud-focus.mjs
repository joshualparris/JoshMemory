import assert from 'node:assert/strict';
import { Input } from '../src/engine/input.js';
const listeners = {};
globalThis.addEventListener = (type,fn) => { listeners[type]=fn; };
globalThis.document = {pointerLockElement:null};
const input = {keys:new Set(),pressed:new Set(),canvas:{},reset(){}};
Input.prototype.bindKeyboard.call(input);
const target = type => ({closest:selector=>type==='button' ? selector.includes('button') :
  type==='input' ? selector.includes('input') : false});
const key = (k,type) => listeners.keydown({key:k,target:target(type),preventDefault(){}});
key('w','button'); assert(input.keys.has('w'),'WASD resumes after HUD button click');
listeners.keyup({key:'w'}); assert(!input.keys.has('w'));
key('ArrowUp','button'); assert(input.keys.has('arrowup'));
key('e','button'); assert(!input.pressed.has('use'),'do not trigger game action from focused control');
key(' ','button'); assert(!input.pressed.has('jump'));
key('w','input'); assert(!input.keys.has('w'),'search typing never moves player');
key('Escape','button'); assert(input.pressed.has('back'));
console.log('PASS focused HUD movement, editable-field isolation and native button activation');
