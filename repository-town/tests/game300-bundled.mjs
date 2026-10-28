// RTD-042: the 100 Game300 ElevenLabs lines are bundled with the game. Every manifest entry has its
// MP3 in src/audio/town with a matching SHA-256 and an exact caption; all ten voiced residents have all
// ten events; and voicebank.js plays them from the bundle, keeping the VoiceBank site only as a fallback.
//   node tests/game300-bundled.mjs
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { GAME300_REPO_TOWN } from '../src/ui/game300-captions.js';

const dir = new URL('../src/audio/town/', import.meta.url);
const EVENTS = ['greeting', 'help', 'quest', 'success', 'retry', 'ambient', 'explore', 'choice', 'farewell', 'surprise'];
const CAST = ['rowan', 'pip', 'circuit', 'wren', 'sol', 'sage', 'spark', 'lyra', 'nova', 'kit'];

assert.equal(GAME300_REPO_TOWN.length, 100);
assert.equal(new Set(GAME300_REPO_TOWN.map((c) => c.id)).size, 100, 'unique clip IDs');
for (const speaker of CAST) for (const event of EVENTS) {
  const c = GAME300_REPO_TOWN.find((x) => x.speaker === speaker && x.event === event);
  assert(c, `${speaker} has a ${event} line`);
  assert.equal(c.id, `RT-${speaker.toUpperCase()}-${event.toUpperCase()}`);
  assert(c.text.length > 10 && !/\s{2,}/.test(c.text), `${c.id} has a caption`);
  const bytes = readFileSync(new URL(c.id + '.mp3', dir));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), c.sha256, `${c.id}.mp3 matches its approved recording`);
}
// No bundled RT- recording is left out of the manifest.
const files = readdirSync(dir).filter((f) => /^RT-.*\.mp3$/.test(f));
assert.equal(files.length, 100); for (const f of files) assert(GAME300_REPO_TOWN.some((c) => c.id + '.mp3' === f), f + ' is in the manifest');

const voicebank = readFileSync(new URL('../src/ui/voicebank.js', import.meta.url), 'utf8');
assert.match(voicebank, /import\('\.\/game300-local\.js'\)/, 'voicebank plays the bundled recordings');
assert.doesNotMatch(voicebank, /import\(VOICEBANK_ORIGIN\+'\/src\/game300\.js'\)/, 'no hard dependency on the VoiceBank site');
assert.match(readFileSync(new URL('../src/ui/game300-local.js', import.meta.url), 'utf8'), /Bundled recording checksum mismatch/);
console.log('PASS: 100 bundled Game300 lines, ten residents × ten events, exact captions, SHA-256 verified, played locally with VoiceBank fallback');
