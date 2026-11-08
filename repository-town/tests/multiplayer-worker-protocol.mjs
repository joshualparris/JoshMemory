// In-memory protocol test for the multiplayer worker v2 social layer (chat, emotes,
// roster, distance filtering, whisper, rate limits, profanity mask). No network,
// no Cloudflare credentials: the Durable Object and WebSocketPair are mocked.
// Run: node tests/multiplayer-worker-protocol.mjs
import assert from 'node:assert/strict';
import {World} from '../deploy/multiplayer-worker.js';

class FakeSocket {
  constructor() { this.attachment = {}; this.sent = []; this.closed = null; }
  send(raw) { this.sent.push(JSON.parse(raw)); }
  close(code, reason) { this.closed = { code, reason }; }
  serializeAttachment(value) { this.attachment = value; }
  deserializeAttachment() { return this.attachment; }
}
const sockets = [];
const ctx = {
  getWebSockets: () => sockets,
  acceptWebSocket: socket => { if (!sockets.includes(socket)) sockets.push(socket); }
};
const users = {
  'token-alice': { id: 'acc-a', username: 'alice', expiresAt: Date.now() + 60000 },
  'token-bob': { id: 'acc-b', username: 'bob', expiresAt: Date.now() + 60000 }
};
const accountsDO = {
  // The worker calls this DO as fetch(url, {headers}) with a plain init object.
  fetch: async (url, init = {}) => {
    const headers = init.headers || {};
    const token = String(headers.authorization || '').replace('Bearer ', '');
    const user = users[token];
    if (!user) return new Response(JSON.stringify({ error: 'Session expired' }), { status: 401 });
    return new Response(JSON.stringify(user), { status: 200, headers: { 'content-type': 'application/json' } });
  }
};
const env = { ACCOUNTS: { get: () => accountsDO, idFromName: () => ({}) } };
globalThis.WebSocketPair = class {
  constructor() { const server = new FakeSocket(); this[0] = { close() {} }; this[1] = server; this.server = server; }
};
const world = new World(ctx, env);
const json = request => new Response(JSON.stringify(request), { headers: { 'content-type': 'application/json' } });

async function connect(token) {
  // Node cannot construct the Cloudflare-only 101 Switching Protocols response,
  // so the test accepts the socket the way ctx.acceptWebSocket does after fetch.
  const socket = new FakeSocket();
  ctx.acceptWebSocket(socket);
  await world.webSocketMessage(socket, JSON.stringify({ type: 'hello', token }));
  const welcome = socket.sent.find(m => m.type === 'welcome');
  assert(welcome, 'hello must produce a welcome');
  return socket;
}
const state = async (socket, x, zone = 'town') => {
  // The worker throttles position updates to 8/second; space the moves out.
  await new Promise(resolve => setTimeout(resolve, 150));
  world.webSocketMessage(socket, JSON.stringify({ type: 'state', zone, x, y: 0, z: 9, yaw: 0 }));
};
const chat = (socket, fields) =>
  world.webSocketMessage(socket, JSON.stringify({ type: 'chat', ...fields }));
const last = (socket, type) => [...socket.sent].reverse().find(m => m.type === type);

// 1. Global chat reaches everyone, including the sender.
const alice = await connect('token-alice');
const bob = await connect('token-bob');
await state(alice, 5);
await state(bob, 5.2);
chat(alice, { channel: 'global', text: 'Gday from the shed' });
assert.deepEqual(last(bob, 'chat'), { type: 'chat', id: last(alice, 'welcome').id, name: 'alice',
  channel: 'global', text: 'Gday from the shed', zone: 'town', x: 5, z: 9 },
  'global chat must reach the other player with sender identity and position');
assert(last(alice, 'chat'), 'global chat echoes to the sender');

// 2. Profanity is masked; long text is truncated; junk is ignored.
chat(alice, { channel: 'global', text: '  what a shit   day  ' });
assert.equal(last(alice, 'chat').text, 'what a **** day', 'profanity is masked, whitespace collapsed');
chat(alice, { channel: 'global', text: 'x'.repeat(300) });
assert.equal(last(alice, 'chat').text.length, 200, 'oversize chat is truncated to 200 characters');
const before = alice.sent.length;
chat(alice, { channel: 'global', text: '   ' });
chat(alice, { channel: 'global', text: 42 });
assert.equal(alice.sent.length, before, 'empty or non-string chat is ignored');

// 3. Local chat is distance-filtered server-side using last known positions.
chat(alice, { channel: 'local', text: 'can you hear me' });
assert.equal(last(bob, 'chat').text, 'can you hear me', 'nearby player receives local chat');
await state(bob, 5000);
chat(alice, { channel: 'local', text: 'too far away now' });
assert.notEqual(last(bob, 'chat')?.text, 'too far away now', 'far player must not receive local chat');
assert.equal(last(alice, 'chat').text, 'too far away now', 'sender still sees own local message');
await state(bob, 5.2);

// 4. Whisper routes to the named player only, with a delivery receipt.
chat(alice, { to: 'bob', text: 'secret hello' });
const bobWhisper = last(bob, 'chat');
assert.equal(bobWhisper.channel, 'whisper') && assert.equal(bobWhisper.from, 'alice');
assert.equal(bobWhisper.text, 'secret hello');
assert.equal(bobWhisper.to, 'bob');
const echo = last(alice, 'chat');
assert.equal(echo.delivered, true, 'sender is told the whisper was delivered');
// Sent from bob's socket: alice's per-socket chat budget is nearly used up.
chat(bob, { to: 'nobody_here', text: 'anyone?' });
assert.equal(last(bob, 'chat').delivered, false, 'unknown whisper target reports not delivered');

// 5. Emotes broadcast with an allowlist.
await world.webSocketMessage(alice, JSON.stringify({ type: 'emote', name: 'wave' }));
assert.equal(last(bob, 'emote')?.emote, 'wave', 'emote reaches the other player');
await world.webSocketMessage(alice, JSON.stringify({ type: 'emote', name: 'backflip' }));
assert.notEqual(last(bob, 'emote')?.emote, 'backflip', 'unknown emotes are rejected');

// 6. Roster updates on join and leave.
const rosterAfterJoin = last(bob, 'players');
assert.equal(rosterAfterJoin.players.length, 2, 'roster lists every ready player');
assert(rosterAfterJoin.players.some(p => p.name === 'alice'), 'roster includes alice');
// The runtime removes a closed socket from getWebSockets() before webSocketClose fires.
sockets.splice(sockets.indexOf(bob), 1);
world.webSocketClose(bob);
const rosterAfterLeave = last(alice, 'players');
assert.equal(rosterAfterLeave.players.length, 1, 'leaving shrinks the roster');
assert.equal(last(alice, 'leave')?.id, last(bob, 'welcome').id, 'leave is broadcast');

// 7. Chat rate limit: a burst beyond the window budget is refused with chaterr.
const carol = await connect('token-alice'); // fresh socket, fresh budget
await state(carol, 5);
for (let i = 0; i < 6; i++) chat(carol, { channel: 'global', text: 'msg ' + i });
assert.equal(last(carol, 'chat').text, 'msg 5', 'six messages inside the window are accepted');
chat(carol, { channel: 'global', text: 'one too many' });
assert.equal(last(carol, 'chaterr')?.error, 'You are chatting too quickly. Wait a moment.',
  'seventh message inside the window is refused');

// 8. Global chat history is replayed to a new joiner.
const dave = await connect('token-bob');
await state(dave, 5);
const history = last(dave, 'history');
assert(history.messages.some(m => m.text === 'msg 5'), 'recent global chat is replayed on join');
assert.ok(history.messages.length <= 25, 'history stays bounded');

console.log('PASS: multiplayer worker v2 chat, whisper, emotes, roster, distance filter, rate limit, profanity mask, history');
