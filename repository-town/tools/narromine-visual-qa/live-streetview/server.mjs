#!/usr/bin/env node
// Local development-only comparison viewer. Serves the built public game and
// an isolated official Google Street View JavaScript API panel, same origin.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { presetData } from './presets.mjs';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(DIR, '../../..');
const MIME = {
  '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8',
  '.mjs':'text/javascript; charset=utf-8', '.json':'application/json; charset=utf-8',
  '.css':'text/css; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png',
  '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp',
  '.wasm':'application/wasm', '.mp3':'audio/mpeg', '.ogg':'audio/ogg',
  '.woff2':'font/woff2', '.txt':'text/plain; charset=utf-8',
};
const send = (res, status, content, type = 'text/plain; charset=utf-8', head = false) => {
  const data = Buffer.isBuffer(content) ? content : Buffer.from(String(content));
  res.writeHead(status, { 'Content-Type':type, 'Content-Length':data.length,
    'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff',
    'Referrer-Policy':'strict-origin-when-cross-origin' });
  res.end(head ? undefined : data);
};
function safeFile(root, pathname) {
  // Reject dotfiles, directories, unrecognised paths, symlinks and traversal.
  const segments = pathname.split('/').filter(Boolean);
  if (!segments.length || segments.some(s => s.startsWith('.') || s === '..' || s.includes('\\'))) return null;
  const resolved = path.resolve(root, ...segments);
  if (!resolved.startsWith(path.resolve(root) + path.sep)) return null;
  try {
    const stat = fs.lstatSync(resolved);
    if (!stat.isFile() || stat.isSymbolicLink()) return null;
    return resolved;
  } catch { return null; }
}

export function createComparisonServer({ publicRoot = path.join(ROOT, 'dist/public'), presetProvider = presetData } = {}) {
  return http.createServer((req, res) => {
    const head = req.method === 'HEAD';
    if (req.method !== 'GET' && !head) return send(res,405,'Method not allowed');
    let uri;
    try { uri = new URL(req.url, 'http://localhost'); }
    catch { return send(res,400,'Invalid URL'); }
    let pathname;
    try { pathname = decodeURIComponent(uri.pathname); }
    catch { return send(res,400,'Invalid URL encoding'); }
    if (pathname === '/_streetview' || pathname === '/_streetview/') {
      res.writeHead(302,{Location:'/_streetview/index.html','Cache-Control':'no-store'});
      return res.end();
    }
    if (pathname === '/_streetview/api/presets') {
      return send(res,200,JSON.stringify(presetProvider()),'application/json; charset=utf-8',head);
    }
    let file;
    if (pathname.startsWith('/_streetview/')) {
      const name = pathname.slice('/_streetview/'.length);
      if (!['index.html','app.js','styles.css'].includes(name)) return send(res,404,'Not found');
      file = safeFile(DIR,'/'+name);
    } else {
      file = safeFile(publicRoot,pathname === '/' ? '/index.html' : pathname);
    }
    if (!file) return send(res,404,'Not found');
    try { return send(res,200,fs.readFileSync(file),MIME[path.extname(file).toLowerCase()]||'application/octet-stream',head); }
    catch { return send(res,500,'File read error'); }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const port = Number(process.env.PORT || 8092);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be 1–65535');
  const publicRoot = path.join(ROOT, 'dist/public');
  if (!fs.existsSync(path.join(publicRoot,'index.html')))
    throw new Error('Missing dist/public/index.html. Run node tools/build.mjs from repository-town first.');
  // Bind loopback only. Never expose a development API key entry form or game
  // inspection interfaces on a public address.
  createComparisonServer({ publicRoot }).listen(port,'127.0.0.1', () => {
    console.log(`Narromine Street View comparison: http://127.0.0.1:${port}/_streetview/`);
    console.log('Local-only; no Google API key is stored by this tool.');
  });
}