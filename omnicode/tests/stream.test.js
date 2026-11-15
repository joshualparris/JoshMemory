'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { once } = require('node:events');
const translateHandler = require('../site/api/translate');

test('real HTTP streaming emits 50 source programs with three execution proofs', async () => {
  const server = http.createServer(async (req, res) => {
    let raw = '';
    for await (const chunk of req) raw += chunk;
    req.body = JSON.parse(raw);
    res.status = code => { res.statusCode = code; return res; };
    res.json = obj => res.end(JSON.stringify(obj));
    await translateHandler(req, res);
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    const { port } = server.address();
    const response = await fetch(`http://127.0.0.1:${port}`, {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({value:'alex@example.com'}), signal: AbortSignal.timeout(10000),
    });
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type'), /x-ndjson/);
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffered = '', messages = [], sawEarlyChunk = false;
    for (;;) {
      const {done, value} = await reader.read();
      if (done) break;
      buffered += decoder.decode(value, {stream:true});
      let newline;
      while ((newline=buffered.indexOf('\n'))>=0) {
        const line = buffered.slice(0,newline); buffered = buffered.slice(newline+1);
        if (line.trim()) messages.push(JSON.parse(line));
      }
      if (messages.length > 0 && messages.length < 51) sawEarlyChunk = true;
    }
    assert.ok(sawEarlyChunk, 'first progress events must arrive before completion');
    assert.equal(messages.length, 52);
    assert.equal(messages[0].type, 'start');
    assert.equal(messages.at(-1).type, 'done');
    assert.equal(messages.filter(x=>x.type==='stage').length, 50);
    assert.deepEqual(messages.filter(x=>x.status==='executed').map(x=>x.language), ['JavaScript','Brainfuck','Befunge-98']);
    for (const item of messages.filter(x=>x.status==='executed')) assert.equal(item.expectedOutput, item.actualOutput);
  } finally { server.close(); }
});
