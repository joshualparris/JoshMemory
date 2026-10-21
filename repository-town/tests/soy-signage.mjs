// Regression: new businesses must have permanent facade signage, not
// proximity-limited floating sprites (which vanish on a phone).
import assert from 'node:assert/strict';
import {FIELD_Z0, PLACE_DEFS} from '../src/world/life.js';
import {SIGN_AT} from '../src/world/townlife.js';
import {buildSignBoards} from '../src/world/shop-signs.js';

const sites=['soyfarm','soyplant'];
const authored=sites.map(id=>{
 const p=PLACE_DEFS.find(x=>x.id===id);
 assert(p&&p.side==='south',id+' must be a real south-side business');
 const sign=SIGN_AT[id];
 assert(sign,id+' requires permanent mesh signage (floating labels are insufficient)');
 const [x,y,z,w,h,bg,fg]=sign;
 assert([x,y,z,w,h].every(Number.isFinite)&&w>=6&&h>=.6,
   id+': text board needs a legible wide printed surface');
 assert.notEqual(bg,fg,id+': contrasting sign colours');
 assert(y>=3.5&&y<=5.0&&z>=7.08&&z<=7.18,
   id+': board must sit on the existing shopfront fascia');
 return {text:p.name,x:(p.col.charCodeAt(0)-65-12.5)*26-x,
   y,z:FIELD_Z0+7-z,w,h,rotY:Math.PI,bg,fg};
});
// Provide a minimal in-memory canvas to test atlas construction without
// needing a GPU; browser WebGL tests separately verify runtime rendering.
const prev=globalThis.document;
globalThis.document={createElement:()=>({
 width:0,height:0,
 getContext:()=>({
   measureText:text=>({width:text.length*26}),
   fillRect(){},strokeRect(){},fillText(){}
 })
})};
try{
 const mesh=buildSignBoards(authored);
 assert(mesh?.isMesh&&mesh.geometry.attributes.position.count>0,
   'both signs must create real geometry, not just sprites');
 assert.equal(mesh.name,'shop signs');
 const n=mesh.geometry.getAttribute('normal');
 assert(n.getZ(0)<-.9,'south-side sign must face the player on the road');
 assert.equal(mesh.material.map.image.height,96*sites.length,
   'both names must be painted into the texture atlas');
 mesh.geometry.dispose();mesh.material.map.dispose();mesh.material.dispose();
}finally{globalThis.document=prev;}
console.log('PASS: both soy sites have contrasting physical nameplates on the correct outward-facing building fascia');
