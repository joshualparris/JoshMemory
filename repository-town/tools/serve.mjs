// Minimal static + API server for local play, Render deployments, and browser tests (no dependencies).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import npcChatHandler from '../api/npc-chat.js';

const root = path.resolve(process.argv[2] || 'dist/public');
const port = Number(process.argv[3] || process.env.PORT || 8080);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.png': 'image/png', '.wasm': 'application/wasm', '.pck': 'application/octet-stream' };
http.createServer((req, res) => {
  const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (url === '/api/npc-chat') {
    let raw = '';
    req.setEncoding('utf8');
    req.on('data', (c) => { if (raw.length < 32768) raw += c; });
    req.on('end', () => { req.body = raw; npcChatHandler(req, res); });
    return;
  }
  const file = path.join(root, url.endsWith('/') ? url + 'index.html' : url);
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end('not found'); return; }
  res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
  fs.createReadStream(file).pipe(res);
}).listen(port, () => console.log(`Serving ${root} on http://localhost:${port}`));
