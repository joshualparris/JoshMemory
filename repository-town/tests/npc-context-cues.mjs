import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {makeTownContextCue} from '../src/ui/voicebank.js';
function rootStub(){
  return {createElement(tag){
    return {tag,dataset:{},attrs:{},children:[],hidden:false,
      setAttribute(key,val){this.attrs[key]=val;},
      addEventListener(key,fn){this[key]=fn;},
      append(...nodes){this.children.push(...nodes);}};
  }};
}
for(const speaker of ['rowan','pip','circuit','wren','sol','sage','spark','lyra','nova','kit']){
  for(const event of ['greeting','help']){
    const cue=makeTownContextCue(speaker,event,rootStub());
    assert.equal(cue.className,'npc-recorded-cue');
    const [button,caption]=cue.children;
    assert.equal(button.dataset.voiceSource,'elevenlabs');
    assert.equal(button.type,'button');
    assert.equal(button.attrs['aria-pressed'],'false');
    assert.match(button.textContent,/recorded/);
    assert.equal(caption.attrs.role,'status');
    assert.equal(caption.hidden,true,'no unsolicited audio or caption');
  }
}
assert.equal(makeTownContextCue('ember','greeting',rootStub()),null,'unused speakers should not invent recordings');
assert.equal(makeTownContextCue('rowan','success',rootStub()),null,'completion recordings must not appear outside a real event');
assert.equal(makeTownContextCue('rowan','quest',rootStub()),null,'quest recordings must not fabricate progress');
const chat=readFileSync(new URL('../src/ui/npc-chat.js',import.meta.url),'utf8');
assert.match(chat,/makeTownContextCue\(npcId,recordedEvent,root\)/,'chat selects recorded cue with active NPC ID');
assert.match(chat,/if\(cue\)row.appendChild\(cue\);\s*else row.appendChild\(makeTownListenButton/,'no duplicate default TTS Listen button where recorded clip is available');
assert.match(chat,/index===0\?'greeting'/,'the original resident welcome gets an opt-in recorded alternative');
assert.match(chat,/requestedHelpCue\(question\)/,'only visitor-requested help gets the optional recorded tip');
assert.match(chat,/const recordedEvent=requestedHelpCue\(question\)/,'only explicit user requests may choose extra help audio');
assert.doesNotMatch(chat,/const recordedEvent\s*=\s*['\"](?:success|quest|retry)['\"]/,'never infer quest outcomes from generic AI replies');
console.log('PASS: 20 possible user-initiated greeting/help cues; no invented quest or success events.');
