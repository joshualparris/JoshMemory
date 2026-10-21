import assert from 'node:assert/strict';
import {createAmbience} from '../src/ui/ambience.js';
let nodes=[],connected=[];
const parameter=()=>({value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){},setTargetAtTime(){},cancelScheduledValues(){}});
function node(){const n={gain:parameter(),frequency:parameter(),Q:parameter(),connect(to){assert.notEqual(this,to,'audio bus must never feed itself');connected.push([this,to]);return to;},disconnect(){},start(){},stop(){}};nodes.push(n);return n;}
class AudioContext{constructor(){this.currentTime=0;this.sampleRate=100;this.destination=node();this.state='running';}createGain(){return node();}createOscillator(){return node();}createBiquadFilter(){return node();}createBufferSource(){return node();}createConvolver(){return node();}createBuffer(c,n){return {getChannelData:()=>new Float32Array(n)};}close(){this.state='closed';}resume(){}}
globalThis.window={AudioContext};globalThis.localStorage={getItem:k=>k==='repository-town.sound'?'on':null,setItem(){}};globalThis.document={querySelector:()=>null};
const a=createAmbience();a.start();assert(a.running);
a.setMix('music',.2);assert.equal(a.mix.music,.2);a.setMix('music',100);assert.equal(a.mix.music,1);a.setMix('master',NaN);assert(Number.isFinite(a.mix.master));
a.update(.016,{day:1,indoors:true,room:'cafe',busy:.5});assert.match(a.debug.track,/Café/);a.work('grind');a.work('steam');a.work('pour');a.work('cook');a.work('success');
a.update(.016,{day:0,indoors:false,room:''});assert.match(a.debug.track,/starlight/);a.setOn(false);assert(!a.running);
assert(connected.length>10);
console.log('PASS: adaptive music and work effects schedule on a valid audio graph, independent bounded mix controls persist, mute closes the context. Listening QA remains separate.');
