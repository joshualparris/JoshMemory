// Actual HTTP regression for the local/Render static server. No external host is touched.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const TOWN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SERVER = path.join(TOWN, 'tools/serve.mjs');
const base = fs.mkdtempSync(path.join(os.tmpdir(), 'repotown-static-security-'));
const publicRoot = path.join(base, 'public');
const sibling = path.join(base, 'public-backup');
fs.mkdirSync(publicRoot);
fs.mkdirSync(sibling);
fs.writeFileSync(path.join(publicRoot, 'index.html'), '<h1>TEST_PUBLIC_INDEX</h1>');
fs.writeFileSync(path.join(publicRoot, 'data.json'), '{"ok":true}');
fs.writeFileSync(path.join(sibling, 'secret.txt'), 'PRIVATE_TEST_SENTINEL_DO_NOT_SERVE');
fs.symlinkSync(path.join(sibling, 'secret.txt'), path.join(publicRoot, 'outbound.txt'));

const allocator = net.createServer();
await new Promise((resolve, reject) => {
  allocator.once('error', reject);
  allocator.listen(0, '127.0.0.1', resolve);
});
const port = allocator.address().port;
await new Promise((resolve) => allocator.close(resolve));

let stderr = '';
const server = spawn(process.execPath, [SERVER, publicRoot, String(port)], {
  cwd: TOWN, stdio: ['ignore', 'ignore', 'pipe'],
  env: { GROQ_API_KEY: 'LOCAL_SYNTHETIC_KEY_NOT_REAL', TOWN_NPC_PIN: 'LOCAL_SYNTHETIC_PIN_NOT_REAL' },
});
server.stderr.on('data', chunk => { stderr = (stderr + chunk.toString()).slice(-2500); });

function request(requestPath, method = 'GET', body = '') {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1', port, method, path: requestPath, timeout: 1200,
      headers: method === 'POST' ? { 'content-type': 'application/json', 'x-npc-code': 'LOCAL_SYNTHETIC_PIN_NOT_REAL' } : undefined,
      agent: false,
    }, res => {
      let body = '';
      res.on('data', chunk => { body += chunk.toString(); });
      res.on('end', () => resolve({ status: res.statusCode, body }));
      res.on('error', reject);
    });
    req.on('timeout', () => req.destroy(new Error('local HTTP request timed out')));
    req.on('error', reject);
    req.end(body);
  });
}
async function ready() {
  for (let i = 0; i < 90; i++) {
    if (server.exitCode !== null) throw new Error('server exited during startup: ' + stderr);
    try {
      if ((await request('/')).status === 200) return;
    } catch { /* transient startup */ }
    await new Promise(resolve => setTimeout(resolve, 35));
  }
  throw new Error('server failed to start: ' + stderr);
}
try {
  await ready();
  assert.equal((await request('/')).status, 200);
  assert.match((await request('/')).body, /TEST_PUBLIC_INDEX/);
  assert.equal((await request('/data.json')).body, '{"ok":true}');

  // Encoded slash keeps ".." hidden from URL dot-segment normalisation.
  // In the old server path.join() escaped into public-backup and startsWith()
  // incorrectly accepted that sibling as if it were within public.
  const escape = await request('/%2e%2e%2fpublic-backup/secret.txt');
  assert.equal(escape.status, 404, 'encoded traversal must not escape document root');
  assert.doesNotMatch(escape.body, /PRIVATE_TEST_SENTINEL/);
  const symlink = await request('/outbound.txt');
  assert.equal(symlink.status, 404, 'document-root symlink must not expose sibling file');
  assert.doesNotMatch(symlink.body, /PRIVATE_TEST_SENTINEL/);
  assert.equal((await request('/%2e%2e%5cpublic-backup%5csecret.txt')).status, 400,
    'encoded backslash is rejected, not treated as a filesystem separator');

  // Previous decodeURIComponent() threw from the HTTP callback and killed Node.
  const malformed = await request('/%E0%A4%A');
  assert.equal(malformed.status, 400, 'invalid encoding must return HTTP 400, not crash');
  assert.equal((await request('/')).status, 200, 'server must survive a malformed URL');
  assert.equal((await request('/missing.txt')).status, 404);
  const invalidResident = JSON.stringify({npcId: 'unknown', resident: {name: {toString: 'not-callable'}}, messages: [{role: 'user', content: 'Hi'}]});
  const failedClosed = await request('/api/npc-chat', 'POST', invalidResident);
  assert.equal(failedClosed.status, 400, 'malformed resident metadata must be rejected, not crash the server');
  assert.equal((await request('/')).status, 200, 'server remains healthy after malformed NPC request');
  console.log('PASS: real localhost HTTP server blocked sibling traversal, symlink escape, malformed URL crash; ordinary assets served');
} finally {
  server.kill('SIGTERM');
  await new Promise(resolve => {
    if (server.exitCode !== null || server.signalCode !== null) resolve();
    else server.once('exit', resolve);
  });
  fs.rmSync(base, { recursive: true, force: true });
}
