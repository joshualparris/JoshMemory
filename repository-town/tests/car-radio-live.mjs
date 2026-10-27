// Live car radio: stream lookup tries each directory mirror, uses only HTTPS streams (the site is
// HTTPS, so http streams would be blocked as mixed content) and reports "none" instead of throwing.
//   node tests/car-radio-live.mjs
import assert from 'node:assert/strict';
globalThis.document ??= undefined;
const { resolveLiveStream } = await import('../src/ui/driving-dashboard.js');
const calls = [];
const flaky = async (url) => { calls.push(url); if (calls.length === 1) throw new Error('mirror down'); return { ok: true, json: async () => [{ url_resolved: 'http://insecure.example/stream' }, { url_resolved: 'https://live.example/abc.mp3' }] }; };
assert.equal(await resolveLiveStream({ q: 'ABC Western Plains', cc: 'AU' }, flaky), 'https://live.example/abc.mp3', 'falls back to the next mirror and skips http streams');
assert.equal(calls.length, 2);
assert.match(calls[1], /name=ABC%20Western%20Plains&countrycode=AU/);
assert.equal(await resolveLiveStream({ q: 'ABC Western Plains', cc: 'AU' }, async () => { throw new Error('should be cached'); }), 'https://live.example/abc.mp3', 'cached after first lookup');
assert.equal(await resolveLiveStream({ q: 'Nowhere FM', cc: 'AU' }, async () => ({ ok: true, json: async () => [] })), null, 'no match is null, not an error');
assert.equal(await resolveLiveStream({ q: 'Offline FM', cc: 'AU' }, async () => { throw new Error('offline'); }), null, 'offline is null, not an error');
console.log('PASS: live radio lookup fails over, HTTPS only, cached, offline-safe');
