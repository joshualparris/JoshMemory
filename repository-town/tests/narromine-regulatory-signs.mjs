import assert from 'node:assert/strict';
import * as THREE from 'three';
import { regulatorySignOutline, createRegulatorySignFace, REGULATORY_SIGN_TYPES } from '../src/world/narromine-regulatory-signs.js';
import { buildNarromineMapillaryObjects } from '../src/world/narromine-mapillary-objects.js';
import { NARROMINE_MAPILLARY_OBJECTS as objects } from '../src/world/narromine-mapillary-data.js';
const expected={stop:2,giveway:11,keepLeft:4,noEntry:2};
for(const type of REGULATORY_SIGN_TYPES) {
  assert.equal(objects.filter(o=>o.type===type).length,expected[type]);
  const face=createRegulatorySignFace(type);
  assert.equal(face.children.length,2,'one front and one plain rear');
  const [front,rear]=face.children;
  assert.equal(front.material.side,THREE.FrontSide);
  assert.equal(rear.material.side,THREE.BackSide,'reverse must not show mirrored instructions');
  assert(front.position.z>rear.position.z,'no coplanar surfaces');
  assert(rear.position.z>.04,'panel sits in front of pole radius; pole cannot obscure lettering');
  for(const mesh of face.children) for(const a of Object.values(mesh.geometry.attributes))
    assert([...a.array].every(Number.isFinite));
  const uv=front.geometry.getAttribute('uv'),cell=REGULATORY_SIGN_TYPES.indexOf(type);
  for(let j=0;j<uv.count;j++) {
    assert(uv.getX(j)>=(cell%2)/2-1e-6 && uv.getX(j)<=(cell%2+1)/2+1e-6);
    assert(uv.getY(j)>=(1-Math.floor(cell/2))/2-1e-6 && uv.getY(j)<=(2-Math.floor(cell/2))/2+1e-6);
  }
}
const octagon=regulatorySignOutline('stop');
assert.equal(octagon.length,8);
assert.equal(octagon.filter(p=>p[1]===.5).length,2,'STOP horizontal top edge');
assert.deepEqual(regulatorySignOutline('giveway'),[[-.5,.5],[0,-.5],[.5,.5]],'give way triangle points down');
assert.throws(()=>createRegulatorySignFace('warning'),RangeError,'unknown warning symbols must not be invented');
const target=new THREE.Group(),counts=buildNarromineMapillaryObjects(target);
assert.deepEqual(counts,objects.reduce((a,o)=>(a[o.type]=(a[o.type]||0)+1,a),{}),'all original source objects survive integration');
assert(target.children.every(o=>o.geometry.attributes.position.count>0));
console.log('PASS: 19 source signs, planar outlines, atlas coordinates, unmirrored backs, unchanged source counts');
