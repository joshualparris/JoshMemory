import './npc-context-cues.mjs';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {makeTownListenButton, toggleTownVoice, stopTownVoice, VOICEBANK_MANIFEST, ROWAN_MANIFEST, ROWAN_GREETING, isRowanWelcome} from '../src/ui/voicebank.js';

// The remote VoiceBank is optional; no API keys, paid generation or synthetic
// voice calls happen in CI. Device speech is stubbed, not actually played.
function element() {
  const handlers = new Map();
  const attrs = new Map();
  return {
    isConnected: false, textContent: '', dataset: {},
    addEventListener: (event, fn) => handlers.set(event, fn),
    setAttribute: (name, value) => attrs.set(name, value),
    getAttribute: name => attrs.get(name),
    click: () => handlers.get('click')?.(),
  };
}
const root = {createElement: () => element()};
const speakCalls = [], cancelCalls = [];
class Utterance {
  constructor(text) { this.text=text; }
}
globalThis.SpeechSynthesisUtterance = Utterance;
globalThis.speechSynthesis = {
  speak: utterance => speakCalls.push(utterance),
  cancel: () => cancelCalls.push('cancel'),
};
assert.match(VOICEBANK_MANIFEST, /^https:\/\/parris-voicebank\.vercel\.app\/packs\/gentle-public\/manifest\.json$/);
const button = makeTownListenButton('Hello from Repository Town.', root);
assert.equal(button.textContent, '🔉 Device voice', 'must initialise button before DOM attachment');
assert.equal(button.getAttribute('aria-label'), 'Read aloud using device speech');
assert.equal(button.type, 'button');
const playing = toggleTownVoice(button, 'Hello from Repository Town.');
assert.equal(speakCalls.length, 1);
assert.equal(speakCalls[0].text, 'Hello from Repository Town.');
assert.equal(speakCalls[0].lang, 'en-AU');
assert.equal(button.getAttribute('aria-pressed'), 'true');
speakCalls[0].onend();
assert.equal((await playing).status, 'played');
assert.equal(button.textContent, '🔉 Device voice');
assert.equal(button.getAttribute('aria-pressed'), 'false');
const second = toggleTownVoice(button, 'Listen again.');
assert.equal(button.textContent, '■ Stop');
const cancelling = toggleTownVoice(button, 'Listen again.');
assert.equal((await cancelling).status, 'cancelled');
assert.equal(button.textContent, '🔉 Device voice');
assert(cancelCalls.length > 0, 'stop must cancel any device speech');
speakCalls.at(-1).onend();
await second;
stopTownVoice();

// The original reported bug: a Rowan welcome tap MUST use a true approved
// ElevenLabs recording; no hidden device speech substitute is acceptable.
assert.match(ROWAN_MANIFEST, /\/packs\/town-rowan\/manifest\.json$/);
assert(isRowanWelcome(ROWAN_GREETING, 'rowan'));
assert(!isRowanWelcome(ROWAN_GREETING, 'pip'));
const callsBefore=speakCalls.length;
const rowan=makeTownListenButton(ROWAN_GREETING,root,{npcId:'rowan'});
assert.equal(rowan.dataset.voiceSource,'elevenlabs');
assert.equal(rowan.disabled,true,'button must not offer recording before pack verification');
assert.equal(rowan.textContent,'⏳ Loading voice');
const unavailable=await toggleTownVoice(rowan,ROWAN_GREETING,{npcId:'rowan'});
assert.equal(unavailable.source,'elevenlabs');
assert.equal(unavailable.status,'unavailable');
assert.equal(speakCalls.length,callsBefore,'unavailable ElevenLabs must NEVER call speechSynthesis');

for (const path of ['npc-chat.js','npc.js','yarns.js']) {
  const src=readFileSync(new URL('../src/ui/'+path,import.meta.url),'utf8');
  assert.match(src,/voicebank\.js/,path+' must use the shared engine');
  assert.match(src,/(makeTownListenButton|toggleTownVoice)/,path+' must expose listening');
}
console.log('Town VoiceBank: opt-in controls, device fallback, cancellation and integrations passed');
