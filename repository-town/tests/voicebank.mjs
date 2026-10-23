import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {makeTownListenButton, toggleTownVoice, stopTownVoice, VOICEBANK_MANIFEST} from '../src/ui/voicebank.js';

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
assert.equal(button.textContent, '🔊 Listen', 'must initialise button before DOM attachment');
assert.equal(button.getAttribute('aria-label'), 'Read this line aloud');
assert.equal(button.type, 'button');
const playing = toggleTownVoice(button, 'Hello from Repository Town.');
assert.equal(speakCalls.length, 1);
assert.equal(speakCalls[0].text, 'Hello from Repository Town.');
assert.equal(speakCalls[0].lang, 'en-AU');
assert.equal(button.getAttribute('aria-pressed'), 'true');
speakCalls[0].onend();
assert.equal((await playing).status, 'played');
assert.equal(button.textContent, '🔊 Listen');
assert.equal(button.getAttribute('aria-pressed'), 'false');
const second = toggleTownVoice(button, 'Listen again.');
assert.equal(button.textContent, '■ Stop');
const cancelling = toggleTownVoice(button, 'Listen again.');
assert.equal((await cancelling).status, 'cancelled');
assert.equal(button.textContent, '🔊 Listen');
assert(cancelCalls.length > 0, 'stop must cancel any device speech');
speakCalls.at(-1).onend();
await second;
stopTownVoice();

for (const path of ['npc-chat.js','npc.js','yarns.js']) {
  const src=readFileSync(new URL('../src/ui/'+path,import.meta.url),'utf8');
  assert.match(src,/voicebank\.js/,path+' must use the shared engine');
  assert.match(src,/(makeTownListenButton|toggleTownVoice)/,path+' must expose listening');
}
console.log('Town VoiceBank: opt-in controls, device fallback, cancellation and integrations passed');
