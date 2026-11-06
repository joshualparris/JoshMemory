import assert from 'node:assert/strict';
import {LIVE_STATIONS,createLiveRadio} from '../src/ui/car-radio.js';
for(const s of LIVE_STATIONS){assert(s.urls.length);for(const u of s.urls)assert.equal(new URL(u).protocol,'https:');}
assert(LIVE_STATIONS.find(s=>s.name==='Triple M Sydney').urls[0].includes('2mmm_128'));
assert(LIVE_STATIONS.find(s=>s.name.startsWith('Zoo FM 92.7')));
class AudioStub extends EventTarget {
 volume=0;src='';paused=true;canPlayType(){return '';}
 play(){this.paused=false;return Promise.resolve();}
 pause(){this.paused=true;}removeAttribute(){this.src='';}load(){}
}
const audios=[],statuses=[];
const radio=createLiveRadio({makeAudio:()=>{const a=new AudioStub();audios.push(a);return a;},onStatus:s=>statuses.push(s),timeoutMs:20});
const test={urls:['https://one.example/a','https://two.example/b']};
radio.start(test);audios[0].dispatchEvent(new Event('error'));
assert.equal(audios[0].paused,true);assert.equal(audios[1].src,test.urls[1]);
assert.equal(statuses.at(-1),'tuning…','play promise alone must not claim LIVE');
audios[1].dispatchEvent(new Event('playing'));assert.equal(statuses.at(-1),'LIVE');
radio.setVolume(.6);assert.equal(audios[1].volume,.6);
radio.start(test);const old=audios[2];radio.start(test);const count=audios.length;
old.dispatchEvent(new Event('error'));assert.equal(audios.length,count,'old station cannot restart');
radio.stop();await new Promise(r=>setTimeout(r,30));assert.equal(audios.length,count,'stop cancels timeouts');
radio.start({urls:['https://timeout.example/a']});await new Promise(r=>setTimeout(r,35));
assert.match(statuses.at(-1),/unavailable/);
radio.stop();
let resolveHls,attached=false;
const pending=createLiveRadio({makeAudio:()=>new AudioStub(),onStatus:()=>{},loadHls:()=>new Promise(r=>resolveHls=r)});
pending.start({urls:['https://one.example/a.m3u8']});pending.stop();
resolveHls({default:class {static isSupported(){attached=true;return true;}}});await Promise.resolve();
assert.equal(attached,false,'cancelled HLS import cannot start playback');
console.log('PASS: HTTPS station catalogue, real playing status, stream failover, timeout, volume, stale-event and HLS cancellation');
