// Isolated tests for the real NPC API handler. No network or secrets.
import assert from 'node:assert/strict';
import handler from '../api/npc-chat.js';

const pin = 'LOCAL_SYNTHETIC_PIN_NOT_REAL';
process.env.GROQ_API_KEY = 'LOCAL_SYNTHETIC_KEY_NOT_REAL';
process.env.TOWN_NPC_PIN = pin;
const realFetch = globalThis.fetch;
const requests = [];
globalThis.fetch = async (url) => {
  assert.equal(url, 'https://api.groq.com/openai/v1/chat/completions');
  requests.push(url);
  return { ok: true, status: 200,
    json: async () => ({ choices: [{ message: { content: 'Synthetic NPC response' } }] }) };
};
const request = (body, code=pin) => ({
  method: 'POST',
  headers: { host: 'localhost', 'x-npc-code': code, 'x-forwarded-for': 'test-npc-failclosed' },
  body: { messages: [{ role: 'user', content: 'Hello' }], ...body },
});
const response = () => ({
  statusCode: 200,
  headers: {},
  setHeader(name, value) { this.headers[name.toLowerCase()] = value; },
  end(payload) { this.body = JSON.parse(payload); this.ended = true; },
});
async function send(req) { const res = response(); await handler(req, res); assert(res.ended); return res; }
try {
  const npc = await send(request({ npcId: 'rowan' }));
  assert.equal(npc.statusCode, 200);
  assert.equal(npc.body.reply, 'Synthetic NPC response');

  const resident = await send(request({ npcId: 'unlisted', resident: { name: 'Test Resident' } }));
  assert.equal(resident.statusCode, 200);
  assert.equal(requests.length, 2, 'two valid requests should reach mocked upstream');

  const malformed = await send(request({
    npcId: 'unlisted', resident: { name: { toString: 'not-callable' } },
  }));
  assert.equal(malformed.statusCode, 400, 'malformed resident must fail closed');
  assert.equal(malformed.body.error, 'Invalid resident data.');
  assert.equal(requests.length, 2, 'malformed request must never reach upstream');

  const invalidPin = await send(request({ npcId: 'rowan' }, 'incorrect'));
  assert.equal(invalidPin.statusCode, 401);
  assert.equal(requests.length, 2);
  console.log('PASS: real NPC API accepts valid requests, rejects malformed residents, blocks invalid PINs; zero network calls');
} finally {
  globalThis.fetch = realFetch;
}
