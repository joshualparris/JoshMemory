// Optional, explicitly requested speech for NPCs and overheard conversations.
// Approved MP3s come from the public ParrisVoiceBank deployment; anything not
// recorded is spoken by the player's device, not sent for paid synthesis.
export const VOICEBANK_ORIGIN = 'https://parris-voicebank.vercel.app';
export const VOICEBANK_MANIFEST = VOICEBANK_ORIGIN + '/packs/gentle-public/manifest.json';
let bank = null;
let loading = null;
let active = null;
let revision = 0;

export function primeTownVoice() {
  if (!loading) loading = import(VOICEBANK_ORIGIN + '/src/browser.js')
    .then(({loadVoiceBank, deviceSpeechFallback}) =>
      loadVoiceBank(VOICEBANK_MANIFEST, {fallback: deviceSpeechFallback, volume: 0.85}))
    .then(voice => { bank = voice; return voice; })
    .catch(() => null); // Town remains fully playable when the bank is offline.
  return loading;
}

function resetButton(button) {
  if (!button) return;
  button.textContent = '🔊 Listen';
  button.setAttribute('aria-label', 'Read this line aloud');
  button.setAttribute('aria-pressed', 'false');
}

export function stopTownVoice() {
  revision++;
  bank?.stop();
  globalThis.speechSynthesis?.cancel?.();
  if (active) resetButton(active);
  active = null;
}

function speakOnDevice(text) {
  return new Promise(resolve => {
    if (!globalThis.speechSynthesis || !globalThis.SpeechSynthesisUtterance) {
      resolve({status:'unavailable',source:'device'}); return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-AU';
    utterance.rate = 0.96;
    utterance.volume = 0.85;
    utterance.onend = () => resolve({status:'played',source:'device'});
    utterance.onerror = () => resolve({status:'unavailable',source:'device'});
    speechSynthesis.speak(utterance);
  });
}

// Only a click on the speaker button starts playback. No automatic chatter.
export function toggleTownVoice(button, rawText) {
  if (active === button) { stopTownVoice(); return Promise.resolve({status:'cancelled'}); }
  stopTownVoice();
  const text = String(rawText || '').trim().slice(0, 1200);
  if (!text) return Promise.resolve({status:'missing'});
  const now = revision;
  active = button;
  button.textContent = '■ Stop';
  button.setAttribute('aria-label', 'Stop speaking');
  button.setAttribute('aria-pressed', 'true');
  // Prime in the background. The device fallback starts within the original
  // user gesture if the network module isn't ready yet.
  if (!loading) void primeTownVoice();
  const speech = bank
    ? bank.say(text).then(result =>
        result.status === 'error' || result.status === 'missing' ? speakOnDevice(text) : result)
    : speakOnDevice(text);
  return Promise.resolve(speech).catch(() => ({status:'unavailable'})).then(result => {
    if (now === revision && active === button) {
      resetButton(button); active = null;
    }
    return result;
  });
}

export function makeTownListenButton(text, root=document) {
  const button = root.createElement('button');
  button.type = 'button';
  button.className = 'town-voice-button';
  resetButton(button);
  button.addEventListener('click', () => { void toggleTownVoice(button, text); });
  return button;
}
