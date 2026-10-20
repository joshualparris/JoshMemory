// node tests/labels-geometry.mjs
// Regression: labels may never render through solid geometry or overlap a room
// boundary simply because their centre was within it.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {makeLabel,containLabel} from '../src/ui/labels.js';

const read = path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
// The Three.js CanvasTexture needs only a drawable canvas, not a browser.
globalThis.document = {createElement:()=>({
  width:0,height:0,
  getContext:()=>({
    font:'',fillStyle:'',strokeStyle:'',lineWidth:1,textBaseline:'',
    measureText:t=>({width:t.length*24}),
    beginPath(){},roundRect(){},fill(){},stroke(){},fillText(){},
  }),
})};
const bounds={x0:-7,x1:7,z0:-12,z1:6,y0:0,y1:4.6};
for(const kind of ['house','street','room','interactive','prop']){
  const s=makeLabel('A long descriptive label '+kind+' visible from afar',kind);
  assert.equal(s.material.depthTest,true,kind+' must be occluded by actual walls');
  assert.equal(s.material.depthWrite,false,kind+' should not paint opaque rectangles into the depth buffer');
  assert(s.scale.x<=6.0001,kind+' sign must have bounded width');
  s.position.set(6.75,4.4,5.75);
  containLabel(s,bounds);
  const margin=s.scale.x/2+0.24;
  assert(s.position.x+margin<=bounds.x1+1e-7,kind+' billboard overlaps side wall');
  assert(s.position.z+margin<=bounds.z1+1e-7,kind+' billboard overlaps front wall');
  assert(s.position.x-margin>=bounds.x0-1e-7,kind+' billboard overlaps other wall');
  assert(s.position.z-margin>=bounds.z0-1e-7,kind+' billboard overlaps rear wall');
  assert(s.position.y+s.scale.y/2<=bounds.y1-0.1,kind+' sign clips ceiling');
  s.material.map.dispose();s.material.dispose();
}
// Small home rooms should shrink their labels instead of passing into the next.
const small=makeLabel('Extremely long name of the back bedroom','room');
const tiny={x0:0,x1:2.6,z0:0,z1:3.2,y0:0,y1:3.3};
small.position.set(2.5,3.2,3.1);containLabel(small,tiny);
assert(small.scale.x<=2.6-.48+1e-7);
assert(small.position.x+small.scale.x/2+.24<=tiny.x1+1e-7);
assert(small.position.z+small.scale.x/2+.24<=tiny.z1+1e-7);
small.material.map.dispose();small.material.dispose();
for(const path of ['src/world/interior.js','src/world/interior-kit.js','src/world/shop-interior.js']){
  const file=read(path);
  assert(file.includes('containLabel('),path+' must constrain every static label');
  assert(!/material\.depthTest\s*=\s*false/.test(file),path+' must not override depth occlusion');
  assert(!/renderOrder\s*=\s*(?:10|12)/.test(file),path+' must not force floating signs over walls');
}
const town=read('src/world/townlife.js');
assert(town.includes('FIELD_Z0 - 4.6'),'bank and southern business labels must sit beyond the colonnade');
assert(town.includes('LOT8_Z + (kind === \'square\' ? 11 : 12.4)'),
  'Town Hall and High Street signs should clear rooflines');
console.log('PASS: label depth testing, capped size, wall/ceiling-safe footprints and front-of-building signage');
