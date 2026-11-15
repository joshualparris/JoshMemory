// Local adapter for the exact Node.js function used in the Vercel deployment.
// Intended for UI testing only; not a production server or security boundary.
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../site');
const functions = {
  '/api/translate': require('../site/api/translate.js'),
  '/api/audit': require('../site/api/audit.js'),
  '/api/health': require('../site/api/health.js'),
};
const types = { '.html':'text/html', '.css':'text/css', '.js':'text/javascript', '.json':'application/json' };
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  res.status = code => { res.statusCode = code; return res; };
  res.json = data => { res.setHeader('Content-Type','application/json'); res.end(JSON.stringify(data)); return res; };
  if (functions[url.pathname]) {
    let input = '';
    for await (const chunk of req) { input += chunk.toString(); if (input.length > 2048) return res.status(413).json({ error: 'Too large' }); }
    try { req.body = input ? JSON.parse(input) : {}; }
    catch { return res.status(400).json({ error: 'Bad JSON' }); }
    await functions[url.pathname](req, res);
    return;
  }
  const resource = url.pathname === '/' ? 'index.html' : url.pathname.replace(/^\//,'');
  const target = path.resolve(root, resource);
  if (!target.startsWith(root + path.sep)) return res.status(403).end();
  try { const body = await fs.readFile(target); res.setHeader('Content-Type',types[path.extname(target)]||'application/octet-stream'); res.end(body); }
  catch { res.statusCode=404; res.end('Not found'); }
});
const port = Number(process.env.PORT || 8181);
server.listen(port, '127.0.0.1', () => console.log(`Hosted preview on http://127.0.0.1:${port}`));
