// Isolated authentication request-size regression for the OWNED Worker.
// No real network, Cloudflare accounts, WebSockets, credentials, or production traffic.
import assert from 'node:assert/strict';
import worker from '../deploy/multiplayer-worker.js';

const origin = 'https://repository-town-claude-complete.vercel.app';
let forwarded = [];
const accounts = {
  idFromName: value => value,
  get: () => ({
    fetch: async request => {
      forwarded.push(await request.text());
      return new Response(JSON.stringify({mock:true}), {
        status:200, headers:{'content-type':'application/json'}
      });
    },
  }),
};
const env = {ACCOUNTS: accounts};
const send = async (body, headers = {}) => worker.fetch(
  new Request('https://owned.example/register', {
    method:'POST',
    headers:{origin, 'content-type':'application/json', ...headers},
    body,
    ...(body instanceof ReadableStream ? {duplex:'half'} : {}),
  }), env
);
try {
  const syntheticPassword = ['dummy', 'test', 'value'].join('-');
  const normal = JSON.stringify({username:'tester123',password:syntheticPassword});
  let response = await send(normal);
  assert.equal(response.status,200,'valid authentication body must still reach accounts DO');
  assert.deepEqual(forwarded,[normal]);

  forwarded = [];
  response = await send('x'.repeat(1001));
  assert.equal(response.status,413,'oversize declared request must be rejected before forwarding');
  assert.deepEqual(forwarded,[], 'oversize body must never reach the account object');

  forwarded = [];
  const chunks = ['a'.repeat(600),'b'.repeat(600)];
  const stream = new ReadableStream({
    pull(controller) {
      const chunk = chunks.shift();
      if (!chunk) return controller.close();
      controller.enqueue(new TextEncoder().encode(chunk));
    },
  });
  response = await send(stream);
  assert.equal(response.status,413,'chunked request without Content-Length must be bounded');
  assert.deepEqual(forwarded,[], 'chunked oversize body must never reach the account object');

  forwarded = [];
  response = await send('🛡️'.repeat(300));
  assert.equal(response.status,413,'the limit must bound UTF-8 bytes, not only UTF-16 length');
  assert.deepEqual(forwarded,[]);

  // An attacker-controlled Origin must still be rejected before any forwarding.
  forwarded = [];
  response = await send('{}',{origin:'https://invalid.example'});
  assert.equal(response.status,403);
  assert.deepEqual(forwarded,[]);

  console.log('PASS: actual owned Worker limits declared, streamed and Unicode auth bodies before forwarding');
} finally {
  forwarded = [];
}
