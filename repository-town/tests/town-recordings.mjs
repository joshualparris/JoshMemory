import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {TOWN_RECORDINGS,RECORDED_ACTORS,recordedTopicsFor,recordedQuestion,recordedReply,townRecordingFor} from '../src/ui/town-recordings.js';
import {makeTownListenButton,toggleTownVoice,stopTownVoice} from '../src/ui/voicebank.js';
assert.equal(TOWN_RECORDINGS.length,20);
assert.equal(new Set(TOWN_RECORDINGS.map(c=>c.id)).size,20);
const used=new Set();
for(const id of Object.keys(RECORDED_ACTORS))for(const clip of recordedTopicsFor({id})){used.add(clip.id);assert.equal(recordedReply({id},recordedQuestion(clip)),clip.text);}
assert.equal(used.size,20,'every recording has a character dialogue topic');
let spoken=0,audio=null;
globalThis.speechSynthesis={cancel(){},speak(){spoken++;}};
globalThis.Audio=class{constructor(url){this.src=url;audio=this;}play(){return Promise.resolve();}pause(){}};
const root={createElement:()=>({dataset:{},textContent:'',setAttribute(){},addEventListener(){}})};
for(const clip of TOWN_RECORDINGS){
 const original=readFileSync(new URL('../'+clip.id+'.mp3',import.meta.url));
 const shipped=readFileSync(new URL('../src/audio/town/'+clip.id+'.mp3',import.meta.url));
 const hash=b=>createHash('sha256').update(b).digest('hex');
 assert.equal(hash(shipped),hash(original));
 assert.equal(townRecordingFor(clip.text).id,clip.id);
 const button=makeTownListenButton(clip.text,root);
 assert.equal(button.dataset.voiceSource,'elevenlabs');
 const playing=toggleTownVoice(button,clip.text);
 assert(audio.src.endsWith('/audio/town/'+clip.id+'.mp3'));
 audio.onended();assert.equal((await playing).status,'played');
}
const button=makeTownListenButton(TOWN_RECORDINGS[0].text,root);
const failed=toggleTownVoice(button,TOWN_RECORDINGS[0].text);audio.onerror();
assert.equal((await failed).status,'unavailable');assert.equal(spoken,0,'missing recording never silently substitutes device speech');
const pending=toggleTownVoice(button,TOWN_RECORDINGS[0].text);stopTownVoice();assert.equal((await pending).status,'cancelled');
console.log('PASS: all 20 captions, dialogue topics, original audio hashes, playback, cancellation and missing-file behavior');
