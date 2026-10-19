// node tests/rug-layers.mjs
// Every ordinary repo-house rug uses this single shared model, including upper floors.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../src/world/props.js',import.meta.url),'utf8');
const line=source.split('\n').find(x=>x.startsWith("def('rug', 'Rug',"));
assert(line,'the shared rug model still exists');
let build,solid=true;
new Function('def','GOLD',line)((type,title,w,d,fn,opts)=>{build=fn;solid=opts.solid;},0xd9c07a);
assert.equal(solid,false,'decorative rugs should never block walkers');
const blocks=[];
build({block:(...args)=>blocks.push(args)},{});
assert.equal(blocks.length,3);
const tops=blocks.map(([color,w,h,d,x,y,z])=>y+h/2);
const bottoms=blocks.map(([color,w,h,d,x,y,z])=>y-h/2);
assert(bottoms[0]>=0,'rug base is above floor, not clipping the floor slab');
for(let i=1;i<3;i++){
  assert(tops[i]-tops[i-1]>=0.012,'nested rug surfaces must have >=12mm depth separation');
  assert(blocks[i][1]<blocks[i-1][1]&&blocks[i][3]<blocks[i-1][3],'each higher fabric stays inside the previous fabric');
  assert(bottoms[i]<=tops[i-1]+0.002,'layers remain physically touching, not floating above one another');
}
console.log('PASS: reusable rug layers spaced '+tops.map(x=>x.toFixed(3)).join(', ')+'m; decorative rugs are walk-through');
