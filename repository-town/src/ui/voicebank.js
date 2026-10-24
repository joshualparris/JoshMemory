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
  game300Module?.stopGame300();
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

 
// Opt-in Game300 gallery. A real recording is never labelled as device speech.
let game300Module=null;
void import(VOICEBANK_ORIGIN+'/src/game300.js').then(module=>{game300Module=module}).catch(()=>{});

const CONTEXT_RECORDING_ACTORS=new Set(['rowan','pip','circuit','wren','sol','sage','spark','lyra','nova','kit']);
// A contextual, opt-in *extra* spoken line. The caption is the recording's real
// transcript, not the AI chat bubble, so we never misrepresent what was spoken.
// Keep factual answers and true game/quest state separate from bonus flavour.
export function makeTownContextCue(npcId,event,root=document) {
  if(!CONTEXT_RECORDING_ACTORS.has(npcId)||!['greeting','help'].includes(event))return null;
  const span=root.createElement('span');span.className='npc-recorded-cue';
  const button=root.createElement('button');button.type='button';
  button.className='town-voice-button npc-recorded-cue-button';
  button.dataset.voiceSource='elevenlabs';
  const label=event==='greeting'?'greeting':'tip';
  button.textContent='🎙 Hear recorded '+label;
  button.setAttribute('aria-label','Hear '+npcId+'\'s recorded '+label);
  button.setAttribute('aria-pressed','false');
  const caption=root.createElement('span');
  caption.className='npc-activity-label npc-recorded-caption';
  caption.setAttribute('role','status');
  caption.hidden=true;
  let counter=0,playing=false;
  button.addEventListener('click',()=>{
    if(playing){
      counter++;stopTownVoice();playing=false;
      button.textContent='🎙 Hear recorded '+label;
      button.setAttribute('aria-pressed','false');
      caption.textContent='Stopped';caption.hidden=false;return;
    }
    stopTownVoice();
    const request=++counter,currentRevision=revision;
    button.disabled=true;button.textContent='⏳ Loading recorded '+label;
    caption.hidden=false;caption.textContent='Loading recorded '+label+'…';
    void import(VOICEBANK_ORIGIN+'/src/game300.js')
      .then(async module=>{
        if(request!==counter||currentRevision!==revision)return null;
        return module.playGame300('repo_town',npcId,event,{
          onEnd:()=>{
            if(request===counter){
              playing=false;button.textContent='🎙 Hear recorded '+label;
              button.setAttribute('aria-pressed','false');
            }
          }
        });
      })
      .then(result=>{
        if(request!==counter||currentRevision!==revision)return;
        button.disabled=false;
        if(result?.status==='playing'){
          playing=true;caption.textContent=result.text;
          button.textContent='■ Stop recorded '+label;
          button.setAttribute('aria-pressed','true');
        }else{
          playing=false;caption.textContent='Recording unavailable; the chat text is still here.';
          button.textContent='🎙 Hear recorded '+label;
        }
      })
      .catch(()=>{
        if(request!==counter||currentRevision!==revision)return;
        button.disabled=false;playing=false;button.textContent='🎙 Hear recorded '+label;
        caption.textContent='Recording unavailable; the chat text is still here.';
      });
  });
  span.append(button,caption);
  return span;
}

export function makeTownRecordedLines(npcId,root=document){
  const supported=new Set(['rowan','pip','circuit','wren','sol','sage','spark','lyra','nova','kit']);
  const details=root.createElement('details');
  details.className='npc-game300';
  if(!supported.has(npcId))return details;
  const summary=root.createElement('summary');summary.textContent='🎙️ Recorded character lines (10)';
  details.appendChild(summary);
  const buttons=root.createElement('div');buttons.className='npc-prompt-row';
  const hear=root.createElement('button');hear.type='button';hear.className='npc-suggestion';hear.textContent='▶ Listen';
  const next=root.createElement('button');next.type='button';next.className='npc-suggestion';next.textContent='↻ Next line';
  const stop=root.createElement('button');stop.type='button';stop.className='npc-suggestion';stop.textContent='■ Stop';
  const caption=root.createElement('p');caption.className='npc-activity-label';caption.setAttribute('role','status');
  caption.textContent='Ten original recorded lines. Nothing plays automatically.';
  let index=0,token=0;
  const events=['greeting','help','quest','success','retry','ambient','explore','choice','farewell','surprise'];
  const play=()=>{
    if(!game300Module){caption.textContent='Recorded player is loading. Tap Listen again.';return;}
    const mine=++token,event=events[index];
    stopTownVoice();
    caption.textContent='Loading '+event+' recording…';
    hear.disabled=true;
    void game300Module.playGame300('repo_town',npcId,event,{
      onEnd:()=>{if(mine===token){hear.disabled=false;caption.textContent+=' ✓';}}
    }).then(result=>{
      if(mine!==token)return;
      hear.disabled=false;
      caption.textContent=result.status==='playing'?result.text:'Recording unavailable ('+result.status+').';
    }).catch(()=>{if(mine===token){hear.disabled=false;caption.textContent='Recording unavailable.';}});
  };
  hear.addEventListener('click',play);
  next.addEventListener('click',()=>{index=(index+1)%events.length;play();});
  stop.addEventListener('click',()=>{token++;game300Module?.stopGame300();hear.disabled=false;caption.textContent='Stopped';});
  details.addEventListener('toggle',()=>{if(!details.open){token++;game300Module?.stopGame300();hear.disabled=false;}});
  buttons.append(hear,next,stop);details.append(buttons,caption);
  return details;
}
