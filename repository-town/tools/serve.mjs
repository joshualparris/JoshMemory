// Minimal static + API server for local play, Render deployments, and browser tests (no dependencies).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import npcChatHandler from '../api/npc-chat.js';

const root = path.resolve(process.argv[2] || 'dist/public');
const port = Number(process.argv[3] || process.env.PORT || 8080);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.png': 'image/png', '.wasm': 'application/wasm', '.pck': 'application/octet-stream' };
const withinRoot = (base, candidate) => {
  const rel = path.relative(base, candidate);
  return Boolean(rel && rel !== '..' && !rel.startsWith('..' + path.sep) && !path.isAbsolute(rel));
};
const missing = (res) => { res.writeHead(404); res.end('not found'); };

http.createServer((req, res) => {
  let url;
  try { url = decodeURIComponent(new URL(req.url, 'http://x').pathname); }
  catch { res.writeHead(400); res.end('invalid URL'); return; }
  if (url.includes('\0') || url.includes('\\')) {
    res.writeHead(400); res.end('invalid URL'); return;
  }
  if (url === '/api/npc-chat') {
    let raw = '';
    req.setEncoding('utf8');
    req.on('data', (c) => { if (raw.length < 32768) raw += c; });
    req.on('end', () => { req.body = raw; npcChatHandler(req, res); });
    return;
  }
  // A string prefix is not a directory boundary: public-backup is NOT public.
  // Realpath containment also prevents symlinks reaching outside the doc root.
  const relative = url.endsWith('/') ? url + 'index.html' : url;
  const file = path.resolve(root, '.' + relative);
  if (!withinRoot(root, file)) { missing(res); return; }
  let realFile;
  try {
    const realRoot = fs.realpathSync(root);
    realFile = fs.realpathSync(file);
    if (!withinRoot(realRoot, realFile) || !fs.statSync(realFile).isFile()) {
      missing(res); return;
    }
  } catch {
    missing(res); return;
  }
  const stream = fs.createReadStream(realFile);
  stream.on('error', () => {
    if (res.headersSent) res.destroy();
    else missing(res);
  });
  res.writeHead(200, { 'content-type': types[path.extname(realFile)] || 'application/octet-stream', 'cache-control': 'no-store' });
  stream.pipe(res);
}).listen(port, () => console.log(`Serving ${root} on http://localhost:${port}`));
