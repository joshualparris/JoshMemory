// Optional player-triggered speech for Repository Town residents and conversations.
// Approved, hash-verified ElevenLabs audio is preferred only for exact lines.
// Other text is explicitly labelled device speech; a missing ElevenLabs file must
// NEVER silently substitute the system voice while claiming to play a recording.
export const VOICEBANK_ORIGIN = 'https://parris-voicebank.vercel.app';
export const VOICEBANK_MANIFEST = VOICEBANK_ORIGIN + '/packs/gentle-public/manifest.json';
export const ROWAN_MANIFEST = VOICEBANK_ORIGIN + '/packs/town-rowan/manifest.json';
export const ROWAN_GREETING = 'Welcome to Repository Town! Fancy a tour, a chat, or a recommendation?';

let bank=null, loading=null, rowanBank=null, rowanLoading=null, active=null, revision=0;
const canonical = text => String(text || '').normalize('NFKC').toLowerCase()
  .replace(/[’]/g, "'").replace(/[^\p{L}\p{N}']/gu, ' ').replace(/\s+/g, ' ').trim();

export function isRowanWelcome(text, npcId='') {
  return npcId === 'rowan' && canonical(text) === canonical(ROWAN_GREETING);
}

export function primeTownVoice(npcId='') {
  if (npcId === 'rowan') {
    if (!rowanLoading) rowanLoading=import(VOICEBANK_ORIGIN+'/src/browser.js')
      .then(({loadVoiceBank})=>loadVoiceBank(ROWAN_MANIFEST,{volume:0.85}))
      .then(v=>{rowanBank=v;return v;})
      .catch(()=>null);
    return rowanLoading;
  }
  if (!loading) loading=import(VOICEBANK_ORIGIN+'/src/browser.js')
    .then(({loadVoiceBank})=>loadVoiceBank(VOICEBANK_MANIFEST,{volume:0.85}))
    .then(v=>{bank=v;return v;})
    .catch(()=>null);
  return loading;
}

function resetButton(button) {
  if (!button) return;
  const recorded=button.dataset?.voiceSource==='elevenlabs';
  button.textContent=recorded?'🔊 ElevenLabs':'🔉 Device voice';
  button.setAttribute('aria-label',recorded?'Play ElevenLabs recording':'Read aloud using device speech');
  button.setAttribute('aria-pressed','false');
}
export function stopTownVoice() {
  revision++;
  bank?.stop();
  rowanBank?.stop();
  globalThis.speechSynthesis?.cancel?.();
  if (active) resetButton(active);
  active=null;
}

function speakOnDevice(text) {
  return new Promise(resolve=>{
    if (!globalThis.speechSynthesis || !globalThis.SpeechSynthesisUtterance) {
      resolve({status:'unavailable',source:'device'});return;
    }
    const utterance=new SpeechSynthesisUtterance(text);
    utterance.lang='en-AU'; utterance.rate=0.96; utterance.volume=0.85;
    utterance.onend=()=>resolve({status:'played',source:'device'});
    utterance.onerror=()=>resolve({status:'unavailable',source:'device'});
    speechSynthesis.speak(utterance);
  });
}

// Only a genuine user tap can start speech; there is no automatic NPC chatter.
export function toggleTownVoice(button,rawText,{npcId=''}={}) {
  if (active===button){stopTownVoice();return Promise.resolve({status:'cancelled'});}
  stopTownVoice();
  const text=String(rawText||'').trim().slice(0,2400);
  if (!text) return Promise.resolve({status:'missing'});
  const exactRowan=isRowanWelcome(text,npcId);
  if (exactRowan && button.disabled) return Promise.resolve({status:'unavailable',source:'elevenlabs'});
  const now=revision;
  active=button; button.textContent='■ Stop';
  button.setAttribute('aria-label','Stop speaking');
  button.setAttribute('aria-pressed','true');

  // A ready Rowan pack must play the *exact* approved MP3.
  // No system-TTS fallback is permitted for an ElevenLabs-labelled button.
  const speech=exactRowan
    ? (rowanBank?Promise.resolve(rowanBank):primeTownVoice('rowan')).then(async voice=>{
        if (now!==revision) return {status:'cancelled',source:'elevenlabs'};
        if (!voice || voice.plan(text).kind!=='recording') return {status:'unavailable',source:'elevenlabs'};
        const result=await voice.say(text);
        return {...result,source:'elevenlabs'};
      })
    : bank && text.length<=1000 && bank.plan(text).kind==='recording'
      ? bank.say(text).then(result=>({...result,source:'elevenlabs'}))
      : speakOnDevice(text);

  return Promise.resolve(speech).catch(()=>({status:'unavailable',source:exactRowan?'elevenlabs':'device'}))
    .then(result=>{
      if (now===revision && active===button) {
        resetButton(button);
        active=null;
        if(exactRowan && result.status!=='played'){
          button.textContent='⚠ Recording unavailable';
          button.setAttribute('title','ElevenLabs audio failed. Device speech was not substituted.');
        }
      }
      return result;
    });
}

export function makeTownListenButton(text,root=document,{npcId=''}={}) {
  const button=root.createElement('button');
  button.type='button'; button.className='town-voice-button';
  const exactRowan=isRowanWelcome(text,npcId);
  button.dataset.voiceSource=exactRowan?'elevenlabs':'device';
  resetButton(button);
  if (exactRowan) {
    button.disabled=true;
    button.textContent='⏳ Loading voice';
    void primeTownVoice('rowan').then(voice=>{
      if (voice && voice.plan(text).kind==='recording') {
        button.disabled=false;
        resetButton(button);
      } else {
        button.disabled=true;
        button.textContent='⚠ Recording unavailable';
        button.setAttribute('title','ElevenLabs recording could not be loaded; no automatic device fallback');
      }
    });
  }
  button.addEventListener('click',()=>{void toggleTownVoice(button,text,{npcId});});
  return button;
}
