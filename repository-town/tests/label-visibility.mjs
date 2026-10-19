import assert from 'node:assert/strict';
import { labelVisible } from '../src/world/interior.js';

const eye={x:-2,y:1.6,z:0},target={x:2,y:1.6,z:0};
const wall={x0:-.1,x1:.1,y0:0,y1:3,z0:-2,z1:2};
assert.equal(labelVisible(eye,target,[]),true);
assert.equal(labelVisible(eye,target,[wall]),false,'solid wall occludes label');
assert.equal(labelVisible(eye,target,[{...wall,y0:2.5,y1:3.5}]),true,'overhead lintel outside sightline');
assert.equal(labelVisible(eye,target,[{...wall,x0:4,x1:5}]),true,'wall behind target is ignored');
const door={userData:{open:0}};
assert.equal(labelVisible(eye,target,[{...wall,door}]),false,'closed doorway occludes');
door.userData.open=1;
assert.equal(labelVisible(eye,target,[{...wall,door}]),true,'open door permits labels');
assert.equal(labelVisible(eye,{x:-1,y:1.6,z:0},[wall]),true,'same-side label remains visible');
console.log('Interior label line-of-sight unit tests passed');
