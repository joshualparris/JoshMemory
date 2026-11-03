// Compass orientation, camera alignment and persistence are pure Node regressions.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { compassHeading, compassCardinal, compassVisiblePreference, COMPASS_STORAGE_KEY, createCompass } from '../src/ui/compass.js';

const near=(a,b)=>Math.abs(a-b)<0.001;
for(const [x,z,heading,cardinal] of [
  [0,-1,0,'N'],[1,0,90,'E'],[0,1,180,'S'],[-1,0,270,'W'],
  [1,-1,45,'NE'],[1,1,135,'SE'],[-1,1,225,'SW'],[-1,-1,315,'NW'],
]){
  assert(near(compassHeading(x,z),heading),'forward '+x+','+z+' = '+heading+' degrees');
  assert.equal(compassCardinal(heading),cardinal);
}
assert.equal(compassHeading(0,0),0,'zero horizontal projection safe');
assert.equal(compassHeading(NaN,0),0,'invalid vector safe');
assert.equal(compassCardinal(360),'N');
assert.equal(compassCardinal(-90),'W');
const data=new Map();
const storage={getItem:key=>data.get(key)??null,setItem:(k,v)=>data.set(k,v)};
assert(compassVisiblePreference(storage),'enabled on first visit');
const listeners=new Map();
const checkbox={checked:false,setAttribute(k,v){this[k]=v;},addEventListener(k,cb){listeners.set(k,cb);},dispatchEvent(e){listeners.get(e.type)?.(e);}};
const rose={style:{}},reading={textContent:''},classes=new Set();
const element={
  hidden:false,dataset:{},setAttribute(k,v){this[k]=v;},
  querySelector(k){return k==='.compass-rose'?rose:k==='.compass-reading'?reading:null;},
  ownerDocument:{body:{classList:{toggle(k,value){if(value)classes.add(k);else classes.delete(k);}}}},
};
const camera=new THREE.PerspectiveCamera(),updateFacing=(yaw)=>{
  camera.rotation.set(0,yaw,0,'YXZ');camera.updateMatrixWorld(true);
};
let view=null,postal=false;
const compass=createCompass({element,checkbox,camera,storage,getView:()=>view,getPostalInterior:()=>postal});
assert(compass.enabled&&checkbox.checked&&!element.hidden&&classes.has('compass-on'),'default visible');
for(const [yaw,cardinal,heading] of [[0,'N',0],[-Math.PI/2,'E',90],[Math.PI,'S',180],[Math.PI/2,'W',270]]){
  updateFacing(yaw);compass.update();
  assert.equal(element.dataset.direction,cardinal,'camera yaw '+yaw+' should face '+cardinal);
  assert.equal(Number(element.dataset.heading),heading);
  assert(reading.textContent.startsWith(cardinal+' · '));
  assert(rose.style.transform.includes('rotate('));
}
view={point(x,z){return{x:-x,z:-z}}};
updateFacing(0);compass.update();
assert.equal(element.dataset.direction,'S','an interior rotated 180 degrees uses outdoor heading');
view=null;postal=true;compass.update();
assert.equal(element.dataset.direction,'S','north-facing Narromine Post Office interior corrected to outdoor heading');
postal=false;
compass.setEnabled(false);
assert(!compass.enabled&&element.hidden&&!checkbox.checked&&!classes.has('compass-on'));
assert.equal(data.get(COMPASS_STORAGE_KEY),'false');
const restored=createCompass({element,checkbox,camera,storage});
assert(!restored.enabled&&element.hidden,'preferences restored after reload');
restored.setEnabled(true);
assert.equal(data.get(COMPASS_STORAGE_KEY),'true','toggling back on persists');
const blocked={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}};
assert(compassVisiblePreference(blocked),'blocked localStorage keeps visible default');
const alt=createCompass({element,checkbox,camera,storage:blocked});
alt.setEnabled(false);assert(element.hidden,'setting works even without local storage');
console.log('PASS compass: N/NE/E/SE/S/SW/W/NW, camera yaw, indoor orientation, Settings toggle and local persistence');
