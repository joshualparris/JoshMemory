#!/usr/bin/env node
// Same-origin HTTP server for the Narromine Real-World Photo Matching & Live Street View
// Comparison Workspace. Serves:
//   - /photo-compare/ (and /photo-compare/report.html) -> Interactive Comparison Workspace
//   - /docs/narromine/* -> Verified local NSW Spatial Services CC BY 4.0 orthophoto crops
//   - /* -> Repository Town dist/public (so the live 3D game iframe shares the exact same origin)
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {
  NARROMINE_PHOTO_LOCATIONS,
  REPO_TOWN_ROOT,
} from './geo-sync.mjs';
import { auditPhotoProvenance } from './photo-provenance.mjs';
import { buildPrioritisedFidelityBacklog } from './discrepancy-register.mjs';
import { generatePhotoCompareWorkspaceHtml } from './workspace-report.mjs';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.glb': 'model/gltf-binary',
  '.mp3': 'audio/mpeg',
  '.woff2': 'font/woff2',
};

function safeResolve(baseDir, reqPath) {
  const target = path.resolve(baseDir, '.' + reqPath);
  if (!target.startsWith(path.resolve(baseDir))) return null;
  return target;
}

export function startPhotoCompareServer({
  port = Number(process.env.PORT || 8096),
  host = process.env.HOST || '0.0.0.0',
  repoTownRoot = REPO_TOWN_ROOT,
  reportDir = path.join(REPO_TOWN_ROOT, 'test-results', 'narromine-photo-compare'),
} = {}) {
  const distPublic = path.join(repoTownRoot, 'dist', 'public');
  const docsDir = path.join(repoTownRoot, 'docs');

  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try {
        const parsed = new URL(req.url || '/', 'http://localhost');
        let pathname = decodeURIComponent(parsed.pathname);

        if (pathname === '/photo-compare' || pathname === '/photo-compare/') {
          pathname = '/photo-compare/report.html';
        }

        if (pathname.startsWith('/photo-compare/')) {
          const subPath = pathname.slice('/photo-compare'.length);
          const candidate = safeResolve(reportDir, subPath);
          if (candidate && fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
            const ext = path.extname(candidate).toLowerCase();
            res.writeHead(200, {
              'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
              'Cache-Control': 'no-store',
            });
            fs.createReadStream(candidate).pipe(res);
            return;
          }
          if (subPath === '/report.html' || subPath === '/index.html') {
            const provenance = auditPhotoProvenance(repoTownRoot);
            const backlog = buildPrioritisedFidelityBacklog();
            const html = generatePhotoCompareWorkspaceHtml({
              manifest: { generatedAt: new Date().toISOString(), captures: [] },
              locations: NARROMINE_PHOTO_LOCATIONS,
              provenance,
              backlog,
              outDir: reportDir,
              liveGameUrl: '/index.html',
              embedLocalReferences: true,
            });
            res.writeHead(200, {
              'Content-Type': 'text/html; charset=utf-8',
              'Cache-Control': 'no-store',
            });
            res.end(html);
            return;
          }
        }

        if (pathname.startsWith('/docs/')) {
          const subPath = pathname.slice('/docs'.length);
          const candidate = safeResolve(docsDir, subPath);
          if (candidate && fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
            const ext = path.extname(candidate).toLowerCase();
            res.writeHead(200, {
              'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
              'Cache-Control': 'no-store',
            });
            fs.createReadStream(candidate).pipe(res);
            return;
          }
        }

        if (pathname === '/') pathname = '/index.html';
        const pubFile = safeResolve(distPublic, pathname);
        if (pubFile && fs.existsSync(pubFile) && fs.statSync(pubFile).isFile()) {
          const ext = path.extname(pubFile).toLowerCase();
          res.writeHead(200, {
            'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
            'Cache-Control': 'no-store',
          });
          fs.createReadStream(pubFile).pipe(res);
          return;
        }

        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not found');
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(String(err?.message || err));
      }
    });

    server.on('error', reject);
    server.listen(port, host, () => {
      const addr = server.address();
      const boundPort = typeof addr === 'object' && addr ? addr.port : port;
      resolve({
        server,
        port: boundPort,
        url: `http://127.0.0.1:${boundPort}/photo-compare/report.html`,
        close: () => new Promise((r) => server.close(r)),
      });
    });
  });
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) ===
    path.resolve(new URL(import.meta.url).pathname);

if (isMain) {
  const portArgIdx = process.argv.indexOf('--port');
  const port = portArgIdx !== -1 ? Number(process.argv[portArgIdx + 1]) : Number(process.env.PORT || 8096);
  startPhotoCompareServer({ port }).then(({ url, port: p }) => {
    console.log('══════════════════════════════════════════════════════════════════════');
    console.log('Narromine Photo-Matching & Live Street View Sync Server Running');
    console.log(`  Local Workspace Link:  ${url}`);
    console.log(`  Live 3D Game Root:     http://127.0.0.1:${p}/index.html`);
    console.log('══════════════════════════════════════════════════════════════════════');
  });
}
